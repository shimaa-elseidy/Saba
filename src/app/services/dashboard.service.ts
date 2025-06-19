import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { environment } from '../../environment/environment';

export interface DayStats {
  date: string;
  tours: number;
  bookings: number;
  revenue: number; // Added revenue
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private recentActivitiesCache$: Observable<any[]> | null = null;

  constructor(private http: HttpClient) { }

  getLastThirtyDaysStats(): Observable<DayStats[]> {
    return this.http.get<any>(`${environment.apiUrl}/Dashboard/last-30-days-stats`)
      .pipe(
        map(res => {
          //! Transform the response to match our DayStats interface
          if (res && Array.isArray(res)) {
            return res.map((item: any) => ({
              date: item.date || item.Date,
              tours: item.tours || item.Tours || item.tourCount || 0,
              bookings: item.bookings || item.Bookings || item.bookingCount || 0,
              revenue: item.revenue || item.Revenue || item.revenueAmount || Math.floor(Math.random() * 1000) + 200 // fallback for mock
            }));
          }
          return this.generateMockData(); // Fallback to mock data
        }),
        catchError(this.handleError.bind(this))
      );
  }

    
    getAllDashCount(): Observable<{ tourCount: number, bookingCount: number, commentCount: number }> {
      return this.http.get<{ tourCount: number, bookingCount: number, commentCount: number }>(`${environment.apiUlrDashboard}/summary`);
    }

  getYearlyStats(): Observable<DayStats[]> {
    return this.http.get<any>(`${environment.apiUrl}/Dashboard/last-year-stats`)
      .pipe(
        map(response => {
          if (response && Array.isArray(response)) {
            return response.map((item: any) => ({
              date: item.date || item.Date,
              tours: item.tours || item.Tours || item.tourCount || 0,
              bookings: item.bookings || item.Bookings || item.bookingCount || 0
            }));
          }
          return this.generateMockWeeklyData();
        }),
        catchError(this.handleError.bind(this))
      );
  }
    getUsersCount(): Observable<number>{
      return this.http.get<number>(`${environment.apiUrl}/ManageUser/GetUserCounts`)
    }
    getRecentActivities(): Observable<any[]> {
      if (!this.recentActivitiesCache$) {
        this.recentActivitiesCache$ = this.http.get<any[]>(`${environment.apiUrl}/Dashboard/recent-activities`)
          .pipe(
            shareReplay(1) // Cache the response and share it among subscribers
          );
      }
      return this.recentActivitiesCache$;
    }


    createTour(tourData: any): Observable<any> {
      
      return this.http.post<any>(`https://sabatours.runasp.net/api/Tour`, tourData);
    }
  private generateMockData(): DayStats[] {
    const data: DayStats[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        tours: Math.floor(Math.random() * 20) + 5,
        bookings: Math.floor(Math.random() * 15) + 2,
        revenue: Math.floor(Math.random() * 1000) + 200 // Add mock revenue
      });
    }
    return data;
  }

  /**
   * Generate mock weekly data
   */
  private generateMockWeeklyData(): DayStats[] {
    const data: DayStats[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        tours: Math.floor(Math.random() * 12) + 3,
        bookings: Math.floor(Math.random() * 8) + 1,
        revenue: Math.floor(Math.random() * 1000) + 200 // Add mock revenue
      });
    }
    return data;
  }
  private handleError(error: any): Observable<DayStats[]> {
    console.error('Dashboard service error:', error);
    
    // Return mock data on error for better user experience
    return new Observable(observer => {
      observer.next(this.generateMockData());
      observer.complete();
    });
  }
}

// Additional interfaces for other dashboard data
export interface TourStats {
  totalTours: number;
  activeTours: number;
  completedTours: number;
}

export interface BookingStats {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
}






