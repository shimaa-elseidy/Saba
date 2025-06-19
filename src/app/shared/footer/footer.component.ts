import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router, Event, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements AfterViewInit {
  email: string = 'info@sabatours.com'
  phoneNumber: string = '201000676285';
  locationUrl: string = 'https://www.google.com/maps/dir//X5V4%2B3GC+Oula+Al+Haram+El+Omraniya+Giza+Governorate/@29.9926875,31.1562656,15z/data=!4m8!4m7!1m0!1m5!1m1!1s0x145845da31b56e5d:0x9a9e3763d784b8f6!2m2!1d31.1562656!2d29.9926875?entry=ttu&g_ep=EgoyMDI1MDQyMS4wIKXMDSoASAFQAw%3D%3D';
  showNavBarFooter: boolean = true;

  constructor(private router: Router) {
    // Check if footer should be shown
    this.router.events.subscribe(() => {
      const url = this.router.url;
      this.showNavBarFooter = !(
        url.startsWith('/dashboard') ||
        url.startsWith('/login') ||
        url.startsWith('/register')
      );
    });

    // Subscribe to router events to scroll to top after navigation
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(() => {
      window.scrollTo(0, 0);
    });
  }

  ngAfterViewInit() {
    // Add click handlers to all footer links
    setTimeout(() => {
      const links = document.querySelectorAll('.footer-links a, .legal-links a');
      links.forEach(link => {
        link.addEventListener('click', () => {
          setTimeout(() => {
            window.scrollTo(0, 0);
          }, 100);
        });
      });
    }, 1000);
  }

  callPhone() {
    window.location.href = `tel:${this.phoneNumber}`;
  }

  sendEmail() {
    window.location.href = `mailto:${this.email}`;
  }

  openLocationMobile() {
    this.openLocation();
  }
  
  openLocation() {
    window.open(this.locationUrl, '_blank');
  }
}