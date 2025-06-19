import { Router, RouterModule } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { TourssComponent } from './tourss/tourss.component';
import { FeaturedComponent } from './featured/featured.component';
import { WhySabaComponent } from './why-saba/why-saba.component';
import { TestimonialsComponent } from './testimonials/testimonials.component';
import { BlogComponent } from './blog/blog.component';
import { HomeCaraComponent } from './home-cara/home-cara.component';
import { HistoryExploreComponent } from './history-explore/history-explore.component';
import { TourService } from '../../services/Tours/tour.service';
import { FormatCategoryPipe } from '../../pipes/format-category.pipe';
import { MorePackagesComponent } from "../more-packages/more-packages.component";
import { MainHomeComponent } from "../main-home/main-home.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    BlogComponent,
    TourssComponent,
    FeaturedComponent,
    TestimonialsComponent,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    HomeCaraComponent,
    HistoryExploreComponent,
    MorePackagesComponent,
    MainHomeComponent
],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomeComponent implements OnInit,AfterViewInit {


  
  constructor(private router: Router, private tourService: TourService) {}

  ngOnInit(): void {
    
  }


  ngAfterViewInit(): void {
    this.ensureVideoIsMuted();
    this.setupLazyLoadVideo();
  }

  ensureVideoIsMuted(): void {
    const video = document.querySelector('.video-background') as HTMLVideoElement;

    if (video) {
      // Set muted property programmatically
      video.muted = true;
      video.volume = 0;

      // Ensure muted on metadata load
      video.addEventListener('loadedmetadata', () => {
        video.muted = true;
        video.volume = 0;
      });

      // Prevent unmuting by user
      video.addEventListener('volumechange', () => {
        if (!video.muted || video.volume > 0) {
          video.muted = true;
          video.volume = 0;
        }
      });

      // Disable audio tracks (if available)
      try {
        const videoElement = video as any;
        if (videoElement.audioTracks && videoElement.audioTracks.length > 0) {
          for (let i = 0; i < videoElement.audioTracks.length; i++) {
            videoElement.audioTracks[i].enabled = false;
          }
        }
      } catch (e) {
        console.log('Cannot access audio tracks:', e);
      }
    }
  }


  navigateToReels(): void {
    this.router.navigate(['/reels']);
  }

  setupLazyLoadVideo(): void {
    // استخدام Intersection Observer لتحميل الفيديو فقط عندما يكون مرئيًا
    if ('IntersectionObserver' in window) {
      const videoElement = document.getElementById('section-video') as HTMLVideoElement;
      if (!videoElement) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // تحميل الفيديو عندما يصبح مرئيًا
            const source = videoElement.querySelector('source');
            if (source && source.dataset['src']) {
              source.src = source.dataset['src'];
              videoElement.load();
              videoElement.play().catch(err => console.log('Auto-play prevented:', err));
              observer.unobserve(videoElement); // إيقاف المراقبة بعد التحميل
            }
          }
        });
      }, { threshold: 0.1 }); // تحميل عندما يكون 10% من الفيديو مرئيًا

      observer.observe(videoElement);
    } else {
      // للمتصفحات التي لا تدعم Intersection Observer
      setTimeout(() => {
        const videoElement = document.getElementById('section-video') as HTMLVideoElement;
        if (!videoElement) return;
        
        const source = videoElement.querySelector('source');
        if (source && source.dataset['src']) {
          source.src = source.dataset['src'];
          videoElement.load();
          videoElement.play().catch(err => console.log('Auto-play prevented:', err));
        }
      }, 1500); // تأخير أطول قليلاً لأن هذا الفيديو يظهر لاحقًا في الصفحة
    }
  }
}