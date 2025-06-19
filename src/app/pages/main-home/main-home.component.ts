import { Component } from '@angular/core';
import { TourService } from '../../services/Tours/tour.service';
import { Router, RouterModule } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BlogComponent } from '../home/blog/blog.component';
import { TourssComponent } from '../home/tourss/tourss.component';
import { FormatCategoryPipe } from '../../pipes/format-category.pipe';

@Component({
  selector: 'app-main-home',
  standalone:true,
  imports: [  RouterModule,
      ReactiveFormsModule,
      FormsModule,
      CommonModule,
     
      FormatCategoryPipe,
      ],
  templateUrl: './main-home.component.html',
  styleUrl: './main-home.component.scss'
})
export class MainHomeComponent {
  searchCriteria = {
    place: '',
    tourType: '',
    people: '',
    dateControl: new FormControl(),
    priceMin: 1000,
    priceMax: 70000,
    selectedTags: [] as string[]
  };

  uniquePlaces: string[] = [];
  uniqueTourTypes: string[] = [];
  topTags: any[] = [];
  showFilters = false;


  
  constructor(private router: Router, private tourService: TourService) {}

  ngOnInit(): void {
    this.fetchUniquePlaces();
    this.fetchUniqueTourTypes();
    this.fetchTopTags();
    this.ensureVideoIsMuted();

  }

  ensureVideoIsMuted() {
    // الحصول على عنصر الفيديو
    const video = document.querySelector('.video-background video') as HTMLVideoElement;
    
    if (video) {
      // تعيين خاصية muted بشكل برمجي
      video.muted = true;
      
      // تعيين مستوى الصوت إلى صفر للتأكيد المزدوج
      video.volume = 0;
      
      // إضافة مستمع للتحميل للتأكد من الكتم عند بدء التشغيل
      video.addEventListener('loadedmetadata', () => {
        video.muted = true;
        video.volume = 0;
      });
      
      // منع إلغاء كتم الصوت بواسطة المستخدم
      video.addEventListener('volumechange', () => {
        if (!video.muted || video.volume > 0) {
          video.muted = true;
          video.volume = 0;
        }
      });
      
      // حل بديل: إزالة المسار الصوتي بالكامل
      try {
        const videoElement = video as any;
        if (videoElement.audioTracks && videoElement.audioTracks.length > 0) {
          for (let i = 0; i < videoElement.audioTracks.length; i++) {
            videoElement.audioTracks[i].enabled = false;
          }
        }
      } catch (e) {
        console.log('لا يمكن الوصول إلى مسارات الصوت:', e);
      }
    }
  }

  fetchUniquePlaces(): void {
    this.tourService.getUniquePlaces().subscribe({
      next: (places) => {
        this.uniquePlaces = places;
      },
      error: (err) => {
        console.error('Error fetching unique places:', err);
      }
    });
  }

  fetchUniqueTourTypes(): void {
    this.tourService.getUniqueTourTypes().subscribe({
      next: (types) => {
        this.uniqueTourTypes = types;
        console.log(this.uniqueTourTypes);
        
      },
      error: (err) => {
        console.error('Error fetching unique tour types:', err);
      }
    });
  }

  fetchTopTags(): void {
    this.tourService.getTopTags().subscribe({
      next: (data) => {
        this.topTags = data.map((tag: any) => ({ ...tag, selected: false }));
      },
      error: (err) => {
        console.error('Error fetching top tags:', err);
      }
    });
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  onSearch(): void {
    const selectedDate = this.searchCriteria.dateControl.value
      ? this.formatDate(new Date(this.searchCriteria.dateControl.value))
      : '';

    this.router.navigate(['/listingTours'], {
      queryParams: {
        place: this.searchCriteria.place,
        tourType: this.searchCriteria.tourType,
        people: this.searchCriteria.people,
        date: selectedDate,
        priceMin: this.searchCriteria.priceMin,
        priceMax: this.searchCriteria.priceMax,
        selectedTags: JSON.stringify(this.searchCriteria.selectedTags)
      },
      queryParamsHandling: 'merge'
    });
  }

  onTagFilterChange(tag: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.searchCriteria.selectedTags.push(tag);
    } else {
      this.searchCriteria.selectedTags = this.searchCriteria.selectedTags.filter(t => t !== tag);
    }
  }

  updateTrack(): void {
    if (this.searchCriteria.priceMin > this.searchCriteria.priceMax) {
      [this.searchCriteria.priceMin, this.searchCriteria.priceMax] = [this.searchCriteria.priceMax, this.searchCriteria.priceMin];
    }

    const min = 1000;
    const max = 70000;
    const minPercent = ((this.searchCriteria.priceMin - min) / (max - min)) * 100;
    const maxPercent = ((this.searchCriteria.priceMax - min) / (max - min)) * 100;

    const track = document.querySelector('.slider-track') as HTMLElement;
    if (track) {
      track.style.left = `${minPercent}%`;
      track.style.width = `${maxPercent - minPercent}%`;
    }
  }

  formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  }


}
