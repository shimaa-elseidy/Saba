import { Component, ViewChild, ElementRef, Renderer2, OnInit } from '@angular/core';
import { RouterLink, RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/Auth/auth.service';
import { NgClass, NgIf } from '@angular/common';
import { SettingService } from '../../services/setting/setting.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, NgIf, NgClass],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss', './navbar-mobile.css']
})
export class NavbarComponent implements OnInit {
  email: string = 'info@sabatours.com';
  profileImage: string | null = null;
  private subscription: Subscription = new Subscription();
  @ViewChild('userDropdown') userDropdown: any;
  @ViewChild('categoryDropdown') categoryDropdown: ElementRef;
  @ViewChild('infoDropdown') infoDropdown: ElementRef;
  phoneNumber: string = '201000676285';
  isCategoryDropdownOpen: boolean = false;
  isInfoDropdownOpen: boolean = false;

  callPhone() {
    window.location.href = `tel:${this.phoneNumber}`;
  }

  sendEmail() {
    window.location.href = `mailto:${this.email}`;
  }
  
  toggleCategoryDropdown(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
    this.isInfoDropdownOpen = false;
  }
  
  toggleInfoDropdown(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.isInfoDropdownOpen = !this.isInfoDropdownOpen;
    this.isCategoryDropdownOpen = false;
  }
  userName: string = '';
  userRole: string = '';
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;

  constructor(
    private settingService: SettingService,
    private authService: AuthService,
    private renderer: Renderer2,
    private router: Router
  ) {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.initializeUserData();
    }

    this.subscription.add(
      this.settingService.profileImage$.subscribe(image => {
        if (image && image !== 'assets/default-profile.png') {
          this.profileImage = image;
          localStorage.setItem('profileImage', image);
        } else {
          this.profileImage = null;
          localStorage.removeItem('profileImage');
        }
      })
    );
  }
  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin(); // تحقق مما إذا كان المستخدم أدمن
    
    // Close dropdowns when clicking outside
    this.renderer.listen('document', 'click', (event: Event) => {
      const clickedInside = this.categoryDropdown?.nativeElement?.contains(event.target) || 
                           this.infoDropdown?.nativeElement?.contains(event.target);
      if (!clickedInside) {
        setTimeout(() => {
          this.isCategoryDropdownOpen = false;
          this.isInfoDropdownOpen = false;
        }, 100);
      }
    });
  }

  initializeUserData(): void {
    const userData = this.authService.getUserData();
    if (userData) {
      this.userName = userData.name || '';
      if (userData.roleId === 1) {
        this.userRole = 'Admin';
      } else if (userData.roleId === 2) {
        this.userRole = 'User';
      } else {
        this.userRole = userData.roleName || '';
      }
      
      if (userData.profilePicture && userData.profilePicture !== 'assets/default-profile.png') {
        this.profileImage = userData.profilePicture;
        localStorage.setItem('profileImage', this.profileImage);
      } else {
        const savedImage = localStorage.getItem('profileImage');
        this.profileImage = (savedImage && savedImage !== 'assets/default-profile.png') ? savedImage : null;
      }
    }
  }

  toggleDropdown(): void {
    this.userDropdown.nativeElement.classList.toggle('show');
  }

  logOut(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.userName = '';
    this.userRole = '';
    this.profileImage = null;
    localStorage.removeItem('profileImage');
    
    // Cerrar el menú móvil si está abierto
    const offcanvasElement = document.getElementById('mobileMenu');
    if (offcanvasElement) {
      const bsOffcanvas = (window as any).bootstrap?.Offcanvas?.getInstance(offcanvasElement);
      if (bsOffcanvas) {
        bsOffcanvas.hide();
      }
    }
    
    // Navegar a la página principal
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}