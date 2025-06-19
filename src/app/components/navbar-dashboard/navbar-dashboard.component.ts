import { Component, OnInit, OnDestroy, Input, HostListener } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { SettingService } from '../../services/setting/setting.service';
import { DashboardService } from '../../services/dashboard.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/Auth/auth.service';
import { catchError, take, tap } from 'rxjs/operators';
import { of } from 'rxjs';

interface RecentActivity {
  description: string;
  date: string;
  type?: string;
}

@Component({
  selector: 'app-navbar-dashboard',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor],
  templateUrl: './navbar-dashboard.component.html',
  styleUrl: './navbar-dashboard.component.scss',
})
export class NavbarDashboardComponent implements OnInit, OnDestroy {
  @Input() pageTitle: string = 'Overview';
  private DEFAULT_PROFILE_IMAGE = 'assets/WhatsApp Image 2025-04-24 at 14.52.36_a522ea2e.jpg';

  profileImage!: string;
  userName: string = '';
  userRole: string = '';
  isDropdownOpen = false;
  isNotificationOpen = false;
  recentActivities: RecentActivity[] = [];
  unreadNotificationsCount: number = 0;
  showNotifications: boolean = false;
  today = new Date();

  private subscription: Subscription = new Subscription();

  constructor(
    private settingService: SettingService,
    private authService: AuthService,
    private dashboardService: DashboardService,
  ) {
    // جلب بيانات المستخدم من localStorage
    const userData = this.authService.getUserData();
    if (userData) {
      this.userName = userData.name || 'User';
      // معالجة profilePicture
      this.profileImage = this.getSafeImageUrl(userData.profilePicture);
      if (userData.roleId === 1) {
        this.userRole = 'Admin';
        this.showNotifications = true;
      } else if (userData.roleId === 2) {
        this.userRole = 'User';
        this.showNotifications = false;
      } else {
        this.userRole = userData.roleName || '';
        this.showNotifications = ['manager', 'admin', 'supervisor'].some((role) =>
          this.userRole.toLowerCase().includes(role),
        );
      }
    } else {
      this.profileImage = this.DEFAULT_PROFILE_IMAGE;
    }

    // الاشتراك في تغييرات صورة الملف الشخصي
    this.subscription.add(
      this.settingService.profileImage$.subscribe((image) => {
        this.profileImage = this.getSafeImageUrl(image);
        localStorage.setItem('profileImage', image);
      }),
    );
  }

  ngOnInit(): void {
    // تحميل صورة الملف الشخصي من localStorage
    const savedImage = localStorage.getItem('profileImage');
    this.profileImage = this.getSafeImageUrl(savedImage);

    // جلب الأنشطة الأخيرة إذا كانت الإشعارات مفعلة
    if (this.showNotifications) {
      this.fetchRecentActivities();
    }

    // لإزالة المستمع عند تدمير الكمبوننت
    document.addEventListener('click', this.handleDocumentClick, true);
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.handleDocumentClick, true);
    this.subscription.unsubscribe();
  }

  handleDocumentClick = (event: MouseEvent) => {
    const dropdown = document.querySelector('.user-profile');
    const notification = document.querySelector('.notifications-dropdown');
    if (
      this.isDropdownOpen &&
      dropdown &&
      !dropdown.contains(event.target as Node)
    ) {
      this.isDropdownOpen = false;
    }
    if (
      this.isNotificationOpen &&
      notification &&
      !notification.contains(event.target as Node) &&
      !(event.target as HTMLElement).classList.contains('notification-icon')
    ) {
      this.isNotificationOpen = false;
    }
  };

  // دالة لمعالجة صورة الملف الشخصي (Base64 أو URL)
  getSafeImageUrl(image: string | null | undefined): string {
    if (!image) {
      return this.DEFAULT_PROFILE_IMAGE;
    }
    // التحقق مما إذا كانت السلسلة Base64 صالحة
    if (/^[a-zA-Z0-9+/=]{100,}$/.test(image)) {
      // افتراض أن الصورة PNG (لأن البيانات تبدأ بـ iVBORw0KGgo)
      return `data:image/png;base64,${image}`;
    }
    // إذا كانت رابط URL (يبدأ بـ http أو https)، أرجعها كما هي
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    // إرجاع الصورة الافتراضية إذا لم تكن Base64 أو URL
    return this.DEFAULT_PROFILE_IMAGE;
  }

  // إعادة الصورة إلى الافتراضية
  resetToDefaultImage(): void {
    this.profileImage = this.DEFAULT_PROFILE_IMAGE;
    localStorage.removeItem('profileImage');
  }

  // جلب الأنشطة الأخيرة
  fetchRecentActivities(): void {
    this.dashboardService
      .getRecentActivities()
      .pipe(
        take(1),
        tap((response) => {
          console.log('Recent Activities:', response);
        }),
        catchError((err) => {
          console.error('Error fetching recent activities:', err);
          return of([]);
        }),
      )
      .subscribe((activities: RecentActivity[]) => {
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
    if (this.isDropdownOpen) {
      this.isNotificationOpen = false;
    }
  }

  logOut(): void {
    this.authService.logout();
  }

  // معالجة خطأ تحميل الصورة
  handleImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = this.DEFAULT_PROFILE_IMAGE;
  }
}