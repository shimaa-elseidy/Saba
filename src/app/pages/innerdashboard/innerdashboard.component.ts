import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { curveBasis } from 'd3-shape';
import { DashboardService, DayStats } from '../../services/dashboard.service';
import { catchError, of, take, tap, Subject, takeUntil, forkJoin } from 'rxjs';
import { NgxChartsModule, LegendPosition } from '@swimlane/ngx-charts';
import { trigger, transition, style, animate, stagger, query, keyframes } from '@angular/animations';

// Interfaces
interface DashboardCounts {
  tourCount: number;
  bookingCount: number;
  commentCount: number;
  paymentCount?: number;
  totalRevenue?: number;
  totalPayments?: number;
}

interface ChartSeries {
  name: string;
  series: { name: string; value: number }[];
}

interface PieChartData {
  name: string;
  value: number;
  color: string;
}

interface Activity {
  id: string;
  description: string;
  date: string;
  type: string;
}

type TimeframeType = 'Week' | 'Month' | 'Year';

@Component({
  selector: 'app-innerdashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxChartsModule],
  templateUrl: './innerdashboard.component.html',
  styleUrls: ['./innerdashboard.component.scss'],
  animations: [
    trigger('cardAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'scale(0.8) translateY(30px)' }),
          stagger(100, [
            animate('0.8s cubic-bezier(0.34, 1.56, 0.64, 1)', 
              keyframes([
                style({ opacity: 0, transform: 'scale(0.8) translateY(30px)', offset: 0 }),
                style({ opacity: 1, transform: 'scale(1.08) translateY(-10px)', offset: 0.6 }),
                style({ transform: 'scale(0.95) translateY(5px)', offset: 0.8 }),
                style({ opacity: 1, transform: 'scale(1) translateY(0)', offset: 1.0 })
              ])
            )
          ])
        ], { optional: true })
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s cubic-bezier(0.34, 1.56, 0.64, 1)', 
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.3s ease-in', style({ opacity: 1 }))
      ])
    ]),
    trigger('activityAnimation', [
      transition(':enter', [
        style({ opacity: 0, height: 0, transform: 'translateX(-10px)' }),
        animate('0.4s cubic-bezier(0.34, 1.56, 0.64, 1)', 
          style({ opacity: 1, height: '*', transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('0.3s ease-out', 
          style({ opacity: 0, height: 0, transform: 'translateX(-10px)' }))
      ])
    ])
  ]
})
export class InnerdashboardComponent implements OnInit, OnDestroy {
  readonly legendPosition = LegendPosition.Below;

  private destroy$ = new Subject<void>();
  
  // User role
  userRole: number | null = null;

  // Dashboard data
  dashboardCounts: DashboardCounts = {
    tourCount: 0,
    bookingCount: 0,
    commentCount: 0,
    paymentCount: 0,
    totalRevenue: 0,
    totalPayments: 0
  };

  // Computed properties for template
  get toursCount(): number { return this.dashboardCounts.tourCount; }
  get bookingsCount(): number { return this.dashboardCounts.bookingCount; }
  get commentCounts(): number { return this.dashboardCounts.commentCount; }
  get paymentCount(): number { return this.dashboardCounts.paymentCount || 0; }
  get totalRevenue(): number { return this.dashboardCounts.totalRevenue || 0; }
  get totalPayments(): number { return this.dashboardCounts.totalPayments || 0; }

  // Chart configurations
  readonly lineChartColorScheme = 'cool';
  readonly pieChartColorScheme = 'cool';

  readonly curve = curveBasis;
  readonly showLabels = true;
  readonly animations = true;

  // Chart data - now will be populated from API
  lineChartData: ChartSeries[] = [];
  pieChartData: PieChartData[] = [];

  // API data storage
  private monthlyApiData: DayStats[] = [];
  private yearlyApiData: DayStats[] = [];

  // Timeframe management
  readonly timeframes: TimeframeType[] = ['Month', 'Year'];
  selectedTimeframe: TimeframeType = 'Month';

  // Activities
  recentActivities: Activity[] = [];
  displayedActivities: Activity[] = [];
  private maxDisplayedActivities = 5;
  showAllActivities = false;

  // Math reference for template
  readonly Math = Math;

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeComponent(): void {
    this.getUserRole();
    this.loadAllData();
  }

  private getUserRole(): void {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsed = JSON.parse(userData);
        this.userRole = Number(parsed.roleId) || null;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      this.userRole = null;
    }
  }

  private loadAllData(): void {
    // Load all data concurrently
    forkJoin({
      dashboardCounts: this.dashboardService.getAllDashCount().pipe(
        catchError(error => {
          console.error('Error fetching dashboard counts:', error);
          return of(this.getDefaultDashboardCounts());
        })
      ),
      monthlyStats: this.dashboardService.getLastThirtyDaysStats().pipe(
        catchError(error => {
          console.error('Error fetching monthly stats:', error);
          return of([]);
        })
      ),
      yearlyStats: this.dashboardService.getYearlyStats().pipe(
        catchError(error => {
          console.error('Error fetching yearly stats:', error);
          return of([]);
        })
      ),
      recentActivities: this.dashboardService.getRecentActivities().pipe(
        catchError(error => {
          console.error('Error fetching recent activities:', error);
          return of([]);
        })
      )
    }).pipe(
      take(1),
      takeUntil(this.destroy$)
    ).subscribe(({ dashboardCounts, monthlyStats, yearlyStats, recentActivities }) => {
      // Update dashboard counts
      this.dashboardCounts = { ...dashboardCounts };
      
      // Store API data
      this.monthlyApiData = monthlyStats;
      this.yearlyApiData = yearlyStats;
      
      // Update recent activities
      this.recentActivities = recentActivities || [];
      this.updateDisplayedActivities();
      
      // Set initial chart data based on selected timeframe
      this.updateChartData();
      this.updatePieChartData();
      
      this.cdr.detectChanges();
    });
  }

  private getDefaultDashboardCounts(): DashboardCounts {
    return {
      tourCount: 0,
      bookingCount: 0,
      commentCount: 0,
      paymentCount: 0,
      totalRevenue: 0,
      totalPayments: 0
    };
  }

  private updateChartData(): void {
    switch (this.selectedTimeframe) {
      case 'Month':
        this.lineChartData = this.convertApiDataToChartData(this.monthlyApiData, 'month');
        break;
      case 'Year':
        this.lineChartData = this.convertApiDataToChartData(this.yearlyApiData, 'year');
        break;
    }
  }

  private convertApiDataToChartData(apiData: DayStats[], type: 'month' | 'year'): ChartSeries[] {
    if (!apiData || apiData.length === 0) {
      return type === 'month' ? this.generateMonthlyData() : this.generateYearlyData();
    }

    // Sort data by date to ensure correct order
    const sortedData = [...apiData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const chartSeries: ChartSeries[] = [
      {
        name: 'Tours',
        series: []
      },
      {
        name: 'Bookings',
        series: []
      }
    ];

    // Add Revenue series if available
    if (sortedData.some(item => item.revenue !== undefined && item.revenue > 0)) {
      chartSeries.push({
        name: 'Revenue',
        series: []
      });
    }

    sortedData.forEach(item => {
      const dateLabel = this.formatDateLabel(item.date, type);
      
      // Add tours data
      chartSeries[0].series.push({
        name: dateLabel,
        value: item.tours || 0
      });

      // Add bookings data  
      chartSeries[1].series.push({
        name: dateLabel,
        value: item.bookings || 0
      });

      // Add revenue data if available
      if (chartSeries.length > 2 && item.revenue !== undefined) {
        chartSeries[2].series.push({
          name: dateLabel,
          value: Math.round(item.revenue / 10) || 0 // Scale down revenue for better chart visualization
        });
      }
    });

    return chartSeries;
  }

  private formatDateLabel(dateString: string, type: 'month' | 'year'): string {
    const date = new Date(dateString);

    if (type === 'month') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (type === 'year') {
      return date.toLocaleDateString('en-US', { month: 'short' });
    }

    return dateString; // Fallback
  }

  private generateYearlyData(): ChartSeries[] {
    return [
      {
        name: 'Tours',
        series: [
          { name: 'Jan', value: 120 },
          { name: 'Feb', value: 150 },
          { name: 'Mar', value: 200 },
          { name: 'Apr', value: 180 },
          { name: 'May', value: 220 },
          { name: 'Jun', value: 250 },
          { name: 'Jul', value: 300 },
          { name: 'Aug', value: 270 },
          { name: 'Sep', value: 230 },
          { name: 'Oct', value: 280 },
          { name: 'Nov', value: 260 },
          { name: 'Dec', value: 310 }
        ]
      },
      {
        name: 'Bookings',
        series: [
          { name: 'Jan', value: 80 },
          { name: 'Feb', value: 100 },
          { name: 'Mar', value: 120 },
          { name: 'Apr', value: 110 },
          { name: 'May', value: 130 },
          { name: 'Jun', value: 140 },
          { name: 'Jul', value: 160 },
          { name: 'Aug', value: 150 },
          { name: 'Sep', value: 140 },
          { name: 'Oct', value: 150 },
          { name: 'Nov', value: 140 },
          { name: 'Dec', value: 160 }
        ]
      }
    ];
  }

  private generateMonthlyData(): ChartSeries[] {
    return [
      {
        name: 'Tours',
        series: [
          { name: 'May 1', value: 20 },
          { name: 'May 2', value: 30 },
          { name: 'May 3', value: 40 },
          { name: 'May 4', value: 50 },
          { name: 'May 5', value: 60 },
          { name: 'May 6', value: 70 },
          { name: 'May 7', value: 80 },
          { name: 'May 8', value: 90 },
          { name: 'May 9', value: 100 },
          { name: 'May 10', value: 110 }
        ]
      },
      {
        name: 'Bookings',
        series: [
          { name: 'May 1', value: 10 },
          { name: 'May 2', value: 15 },
          { name: 'May 3', value: 20 },
          { name: 'May 4', value: 25 },
          { name: 'May 5', value: 30 },
          { name: 'May 6', value: 35 },
          { name: 'May 7', value: 40 },
          { name: 'May 8', value: 45 },
          { name: 'May 9', value: 50 },
          { name: 'May 10', value: 55 }
        ]
      }
    ];
  }


  // Update X-axis label helper method
  getXAxisLabel(): string {
    const labels = {
      Month: 'Days of Month',
      Year: 'Months of Year'
    };
    return labels[this.selectedTimeframe];
  }

  private generatePieChartData(): PieChartData[] {
    return [
      { name: 'Tours', value: this.toursCount || 25, color: '#4a6fa5' },
      { name: 'Bookings', value: this.bookingsCount || 35, color: '#6b8e23' },
      { name: 'Comments', value: this.commentCounts || 20, color: '#9370db' },
      { name: 'Payments', value: this.paymentCount || 15, color: '#cd5c5c' }
    ];
  }

  private updatePieChartData(): void {
    this.pieChartData = this.generatePieChartData();
  }

  // Event handlers
  onTimeframeChange(timeframe: TimeframeType): void {
    this.selectedTimeframe = timeframe;
    this.updateChartData();
  }

  // Utility methods for template
  getTotalMetrics(): number {
    return this.pieChartData.reduce((total, item) => total + item.value, 0);
  }

  formatActivityTime(date: string): string {
    try {
      const activityDate = new Date(date);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60));

      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
      
      const diffInWeeks = Math.floor(diffInDays / 7);
      return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
    } catch (error) {
      console.error('Error formatting activity time:', error);
      return 'Unknown time';
    }
  }

  // Template helper methods
  getPendingBookings(): number {
    return Math.floor(this.bookingsCount * 0.3);
  }

  getTodaysRevenue(): number {
    return Math.floor(this.totalRevenue * 0.1);
  }

  getAverageRating(): string {
    return '4.8';
  }

  private updateDisplayedActivities(): void {
    this.displayedActivities = this.recentActivities.slice(0, this.maxDisplayedActivities);
  }

  toggleActivities(): void {
    this.showAllActivities = !this.showAllActivities;
    if (this.showAllActivities) {
      this.displayedActivities = [...this.recentActivities];
    } else {
      this.updateDisplayedActivities();
    }
  }
}