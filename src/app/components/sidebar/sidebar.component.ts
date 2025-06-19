import { Component, EventEmitter, HostListener, Output, OnInit, Input } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/Auth/auth.service';
import { SettingService } from '../../services/setting/setting.service';
import { DashboardService } from '../../services/dashboard.service';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { catchError, take, tap } from 'rxjs/operators';
import { of } from 'rxjs';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles?: number[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, NgFor],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @Output() titleChange = new EventEmitter<string>();
  @Output() collapseSidebar = new EventEmitter<void>();

  @Input() collapsed: boolean = false;

  isCollapsed = window.innerWidth <= 768;
  isOpen = false;
  userRole: number | null = null; // for permission logic
  userRoleName: string = ''; // for display
  
  // Define all menu items with role restrictions
  allMenuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'bi-speedometer2', route: '/dashboard'  , roles: [1] },
    { label: 'User Management', icon: 'bi-person', route: '/dashboard/user-management', roles: [1] }, // Admin only
    { label: 'All Tours', icon: 'bi-list-ul', route: '/dashboard/myToors', roles: [1] },
    { label: 'All Booking', icon: 'bi-calendar-check', route: '/dashboard/myBooking', roles: [1] },
    { label: 'My Booking', icon: 'bi-calendar-check', route: '/dashboard/myBookingUser', roles: [3] },
    { label: 'All Comments', icon: 'bi-chat-left-text', route: '/dashboard/comments', roles: [1] },
    { label: 'My Comments', icon: 'bi-chat-left-text', route: '/dashboard/myComments', roles: [3] },
    { label: 'All Wallet', icon: 'bi-wallet2', route: '/dashboard/withdrawals', roles: [1] },
    { label: 'My Wallet', icon: 'bi-wallet2', route: '/dashboard/userWithdrawal', roles: [1] },
    { 
      label: 'Invoices', 
      icon: 'bi-receipt', 
      route: '/dashboard/invoices',
      roles: [1] // للمدير فقط
    },
    { 
      label: 'My Invoices', 
      icon: 'bi-receipt', 
      route: '/dashboard/userInvoice',
      roles: [2, 3] // للمستخدمين العاديين والموظفين
    },
    { label: 'Blogs', icon: 'bi-journal-richtext', route: '/dashboard/blogs', roles: [1] },
    { label: 'Ads Manager', icon: 'bi-megaphone', route: '/dashboard/adsManager', roles: [1] }, // Admin only
    { label: 'Design trips', icon: 'bi-megaphone', route: '/dashboard/design-trips', roles: [1] }, // Admin only
    // { label: 'Settings', icon: 'bi-gear', route: '/dashboard/settings' },
    { label: 'Chat', icon: 'bi-chat', route: '/dashboard/chat'},
  ];
  
  // Map for special route titles
  specialRouteTitles: { [key: string]: string } = {
    '/dashboard/add-new-blog': 'Add New Blog',
    '/dashboard/add-new-tour': 'Add New Tour',
    '/dashboard/create-new-user': 'Create New User',
    '/dashboard/add-new-booking': 'Add New Booking',
    '/dashboard/add-new-invoice': 'Add New Invoice'
  };
  
  // This will hold the filtered menu items based on user role
  menuItems: MenuItem[] = [];

  profileImage!: string;
  userName: string = '';
  isDropdownOpen: boolean = false;
  isNotificationOpen: boolean = false;
  recentActivities: { description: string; date: string; type?: string }[] = [];
  unreadNotificationsCount: number = 0;
  showNotifications: boolean = false;
  private DEFAULT_PROFILE_IMAGE = 'assets/WhatsApp Image 2025-04-24 at 14.52.36_a522ea2e.jpg';
  private subscription: Subscription = new Subscription();
  showUserMenu: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private settingService: SettingService,
    private dashboardService: DashboardService
  ) {
    const userData = this.authService.getUserData?.();
    if (userData) {
      this.userName = userData.name || 'User';
      this.profileImage = this.getSafeImageUrl(userData.profilePicture);
      this.userRole = Number(userData.roleId);
      this.userRoleName = userData.roleName ? String(userData.roleName) : (userData.roleId === 1 ? 'Admin' : userData.roleId === 2 ? 'User' : '');
      if (this.userRole === 1) {
        this.showNotifications = true;
      } else if (this.userRole === 2) {
        this.showNotifications = false;
      } else {
        this.showNotifications = ['manager', 'admin', 'supervisor'].some((role) =>
          this.userRoleName.toLowerCase().includes(role),
        );
      }
    } else {
      this.profileImage = this.DEFAULT_PROFILE_IMAGE;
    }
    this.subscription.add(
      this.settingService.profileImage$?.subscribe((image: string) => {
        this.profileImage = this.getSafeImageUrl(image);
        localStorage.setItem('profileImage', image);
      })
    );
  }

  ngOnInit(): void {
    this.isCollapsed = true;
    const savedImage = localStorage.getItem('profileImage');
    this.profileImage = this.getSafeImageUrl(savedImage);
    this.userRole = this.authService.getUserRole();
    this.filterMenuItems();

    // Only emit Dashboard title if user is super admin (role 1)
    if (this.userRole === 1) {
      this.setTitleFromCurrentRoute();
    }
    // Listen for route changes to update the title
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.userRole === 1) {
        this.setTitleFromCurrentRoute();
      }
    });
    if (this.showNotifications) {
      this.fetchRecentActivities();
    }
  }
  
  // Set the title based on the current route
  setTitleFromCurrentRoute(): void {
    const currentUrl = this.router.url;
    
    // Check if it's a special route with a dynamic ID (like edit blog)
    if (currentUrl.includes('/dashboard/add-new-blog/')) {
      this.titleChange.emit('Edit Blog');
      return;
    }
    
    // Check if it's one of our special routes
    for (const route in this.specialRouteTitles) {
      if (currentUrl.startsWith(route)) {
        this.titleChange.emit(this.specialRouteTitles[route]);
        return;
      }
    }
    
    // Check if it matches a menu item
    for (const item of this.allMenuItems) {
      if (currentUrl === item.route) {
        this.titleChange.emit(item.label);
        return;
      }
    }
    
    // Default case - extract from URL
    const urlParts = currentUrl.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    
    if (lastPart) {
      // Format the title (capitalize first letter of each word, replace hyphens with spaces)
      const formattedTitle = lastPart
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      this.titleChange.emit(formattedTitle);
    } else {
      // If we're at /dashboard, set the title to Dashboard
      this.titleChange.emit('Dashboard');
    }
  }
  
  // Filter menu items based on user role
  filterMenuItems(): void {
    this.menuItems = this.allMenuItems.filter(item => {
      if (!item.roles) {
        return true;
      }
      return item.roles.includes(this.userRole || 0);
    });
  }

  // Updated method to send title and handle sidebar state for mobile
  setActiveMenuAndTitle(item: MenuItem): void {
    this.titleChange.emit(item.label);
    
    // Close sidebar on mobile after selection
    if (window.innerWidth <= 768) {
      this.isOpen = false;
    }
  }

  // Original method for backward compatibility
  sendTitle(title: string) {
    this.titleChange.emit(title);
  }

  toggleSidebar() {
    if (window.innerWidth <= 768) {
      this.isOpen = !this.isOpen; // فتح السايدبار في الشاشات الصغيرة
    } else {
      this.isCollapsed = !this.isCollapsed; // تصغير السايدبار في الشاشات الكبيرة
    }
  }

  // Add this method
  collapseSidebarBtn() {
    this.collapseSidebar.emit();
  }

  isActive(route: string): boolean {
    // For the dashboard route specifically, we need an exact match
    if (route === '/dashboard') {
      return this.router.url === '/dashboard';
    }
    
    // For other routes, we can check if the URL starts with that route
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }

  // تحديث حالة الـ Sidebar عند تغيير حجم الشاشة
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isCollapsed = window.innerWidth <= 768; // تصغير السايدبار في الشاشات الصغيرة
    this.isOpen = false; // إغلاق الـ Sidebar إذا كان مفتوحًا
  }

  goHome() {
    window.location.href = '/';
  }

  getSafeImageUrl(image: string | null | undefined): string {
    if (!image) {
      return this.DEFAULT_PROFILE_IMAGE;
    }
    if (/^[a-zA-Z0-9+/=]{100,}$/.test(image)) {
      return `data:image/png;base64,${image}`;
    }
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    return this.DEFAULT_PROFILE_IMAGE;
  }

  resetToDefaultImage(): void {
    this.profileImage = this.DEFAULT_PROFILE_IMAGE;
    localStorage.removeItem('profileImage');
  }

  fetchRecentActivities(): void {
    this.dashboardService
      .getRecentActivities()
      .pipe(
        take(1),
        tap((response) => {
          console.log('Fetching recent activities...' , response);
          
            // this.recentActivities = response || [];
            // this.unreadNotificationsCount = this.recentActivities.length;
          // console.log('Recent Activities:', response);
        }),
        catchError((err) => {
          // this.recentActivities = [];
          // this.unreadNotificationsCount = 0;
          // console.error('Error fetching recent activities:', err);
          return of([]);
        }),
      )
      .subscribe((activities: any[]) => {
        this.recentActivities = activities
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 4);
        this.unreadNotificationsCount = this.recentActivities.length;
      });
  }

  toggleNotifications(): void {
    if (this.showNotifications) {
      this.isNotificationOpen = !this.isNotificationOpen;
      if (this.isNotificationOpen) {
        this.unreadNotificationsCount = 0;
      }
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  logOut(): void {
    this.authService.logout();
  }

  handleImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = this.DEFAULT_PROFILE_IMAGE;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}