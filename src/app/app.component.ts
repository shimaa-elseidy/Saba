import { Component, ChangeDetectorRef, HostListener, OnInit } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterLink, RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./shared/navbar/navbar.component";
import { FooterComponent } from "./shared/footer/footer.component";
import { NgClass, NgIf } from '@angular/common';
import { LoadingComponent } from "./components/loading/loading.component";
import { LoadingService } from './services/loading.service';
import { filter, Subscription } from 'rxjs';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, NavbarComponent, FooterComponent, NgIf, NgClass, LoadingComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  isLoading = false;
  title = 'SabaTours';
  showNavBarFooter: boolean = true;
  showBackToTop = false;
  
  private subscriptions: Subscription[] = [];

  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Lower threshold to make button appear sooner
    this.showBackToTop = window.scrollY > 200;
  }

  constructor(
    private router: Router, 
    private loadingService: LoadingService, 
    private cdr: ChangeDetectorRef
  ) {
    this.setupRouterSubscription();
    this.setupNavigationLoading();
  }

  ngOnInit(): void {
    // Subscribe to loading state changes
    const loadingSub = this.loadingService.loading$.subscribe((loading) => {
      if (this.isLoading !== loading) {
        this.isLoading = loading;
        this.cdr.detectChanges();
      }
    });
    this.subscriptions.push(loadingSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private setupRouterSubscription(): void {
    const routerSub = this.router.events.subscribe(() => {
      const url = this.router.url;
      this.showNavBarFooter = !(
        url.startsWith('/dashboard') ||
        url.startsWith('/login') ||
        url.startsWith('/register')
      );
    });
    this.subscriptions.push(routerSub);
  }

  private setupNavigationLoading(): void {
    const navigationSub = this.router.events.pipe(
      filter(event => 
        event instanceof NavigationStart || 
        event instanceof NavigationEnd || 
        event instanceof NavigationCancel || 
        event instanceof NavigationError
      )
    ).subscribe(event => {
      if (event instanceof NavigationStart) {
        // Start loading when navigation begins
        this.loadingService.showNavigation();
      } else if (
        event instanceof NavigationEnd || 
        event instanceof NavigationCancel || 
        event instanceof NavigationError
      ) {
        // Stop loading when navigation ends (success, cancel, or error)
        setTimeout(() => {
          this.loadingService.hideNavigation();
        }, 500); 
      }
    });
    this.subscriptions.push(navigationSub);
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}