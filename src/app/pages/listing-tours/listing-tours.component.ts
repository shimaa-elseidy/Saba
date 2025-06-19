import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { TourService } from '../../services/Tours/tour.service';
import { FormatCategoryPipe } from '../../pipes/format-category.pipe';

@Component({
  selector: 'app-listing-tours',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, RouterLink, NgClass, FormatCategoryPipe],
  templateUrl: './listing-tours.component.html',
  styleUrls: ['./listing-tours.component.scss']
})
export class ListingToursComponent implements OnInit {
  searchCriteria = {
    place: '',
    tourType: '',
    people: '',
    date: '',
    priceMin: 500,
    priceMax: 1000,
    minRating: '',
    selectedTags: [] as string[],
    selectedUsers: [] as string[]
  };

  peopleOptions = ['1', '2', '3', '4', '5', '6+'];
  allTours: any[] = [];
  filteredTours: any[] = [];
  paginatedTours: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 6;
  topTags: any[] = [];
  recentComments: any[] = [];
  sortOption: string = 'default';
  toursPerRow: string = '3';
  latestTour: any = null;

  constructor(
    private tourService: TourService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Read queryParams from HomeComponent
    this.route.queryParams.subscribe(params => {
      this.searchCriteria.place = params['place'] || '';
      this.searchCriteria.tourType = params['tourType'] || '';
      this.searchCriteria.people = params['people'] || '';
      this.searchCriteria.date = params['date'] || '';
      this.searchCriteria.priceMin = params['priceMin'] ? parseInt(params['priceMin']) : 500;
      this.searchCriteria.priceMax = params['priceMax'] ? parseInt(params['priceMax']) : 1000;
      this.searchCriteria.selectedTags = params['selectedTags'] ? JSON.parse(params['selectedTags']) : [];
      this.applyFilters();
    });

    this.getAllToursWithComments();
    this.getTopTags();
    this.getRecentComment();
    this.getLatestTour();
    this.ensureVideoIsMuted()
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


  getAllToursWithComments(): void {
    this.tourService.getAllToursWithComments().subscribe({
      next: (data) => {
        this.allTours = data;
        this.filteredTours = [...this.allTours];
        // Update topTags to reflect selected tags from queryParams
        this.topTags = this.topTags.map(tag => ({
          ...tag,
          selected: this.searchCriteria.selectedTags.includes(tag.tagName)
        }));
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error fetching tours with comments:', err);
      }
    });
  }

  getTopTags(): void {
    this.tourService.getTopTags().subscribe({
      next: (data) => {
        this.topTags = data.map((tag: any) => ({
          ...tag,
          selected: this.searchCriteria.selectedTags.includes(tag.tagName)
        }));
      },
      error: (err) => {
        console.error('Error fetching top tags:', err);
      }
    });
  }

  getRecentComment(): void {
    this.tourService.getRecentComment().subscribe({
      next: (data) => {
        const uniqueUsers = Array.from(new Set(data.map((c: any) => c.userName)));
        this.recentComments = uniqueUsers;
      },
      error: (err) => {
        console.error('Error fetching recent comments:', err);
      }
    });
  }

  getLatestTour(): void {
    // إذا كان لديك API محدد للحصول على آخر رحلة
    this.tourService.getLatestTour().subscribe({
      next: (data) => {
        this.latestTour = data;
      },
      error: (err) => {
        console.error('Error fetching latest tour:', err);
        // كبديل، استخدم أول رحلة من القائمة إذا فشل الطلب
        if (this.allTours && this.allTours.length > 0) {
          this.latestTour = this.allTours[0];
        }
      }
    });
  }

  formatDateForLatestTour(date: string): string {
    if (!date) return 'Nov, 10 - 15'; // قيمة افتراضية
    
    const tourDate = new Date(date);
    const month = tourDate.toLocaleString('en-US', { month: 'short' });
    const day = tourDate.getDate();
    
    // أضف عدد أيام الرحلة
    const endDay = new Date(tourDate);
    endDay.setDate(endDay.getDate() + (this.latestTour?.tourDay || 5));
    
    return `${month}, ${day} - ${endDay.getDate()}`;
  }

  getLocationForLatestTour(): string {
    if (this.latestTour?.places && this.latestTour.places.length > 0) {
      return this.latestTour.places.join(', ');
    }
    return this.latestTour?.location || 'Cairo, Luxor, Aswan';
  }

  removeLatestTour(event: Event): void {
    event.stopPropagation();
    this.latestTour = null;
  }

  get uniquePlaces(): string[] {
    return [...new Set(this.allTours.flatMap(tour => tour.places || []))].filter(place => place);
  }

  get uniqueTourTypes(): string[] {
    return [...new Set(this.allTours.map(tour => tour.tourCategory))].filter(type => type);
  }

  get totalPages(): number[] {
    return Array.from({ length: Math.ceil(this.filteredTours.length / this.itemsPerPage) }, (_, i) => i + 1);
  }

  applyFilters(): void {
    this.filteredTours = this.allTours.filter(tour => {
      const matchesPlace = this.searchCriteria.place
        ? tour.places && tour.places.some((place: string) => place === this.searchCriteria.place)
        : true;

      const matchesType = this.searchCriteria.tourType
        ? tour.tourCategory === this.searchCriteria.tourType
        : true;

      let matchesDate = true;
      if (this.searchCriteria.date) {
        const selectedDate = new Date(this.searchCriteria.date);
        const tourDate = tour.tourDate
          ? new Date(tour.tourDate)
          : tour.availableDates?.length
          ? new Date(tour.availableDates[0].date)
          : null;
        matchesDate = tourDate && !isNaN(tourDate.getTime()) && tourDate >= selectedDate;
      }

      let matchesPeople = true;
      if (this.searchCriteria.people) {
        const peopleCount = this.searchCriteria.people === '6+' ? 6 : parseInt(this.searchCriteria.people);
        const tourCapacity = tour.capacity || tour.guestsCapabilityAdult || 0;
        matchesPeople = tourCapacity >= peopleCount;
      }

      const matchesPrice =
        tour.tourPrice >= this.searchCriteria.priceMin &&
        tour.tourPrice <= this.searchCriteria.priceMax;

      const matchesTags =
        this.searchCriteria.selectedTags.length > 0
          ? tour.tourTags &&
            Array.isArray(tour.tourTags) &&
            this.searchCriteria.selectedTags.some((tag: string) => tour.tourTags.includes(tag))
          : true;

      const matchesUsers =
        this.searchCriteria.selectedUsers.length > 0
          ? tour.comments?.content &&
            Array.isArray(tour.comments.content) &&
            tour.comments.content.some((comment: any) =>
              this.searchCriteria.selectedUsers.includes(comment.userName)
            )
          : true;

      return matchesPlace && matchesType && matchesDate && matchesPeople && matchesPrice && matchesTags && matchesUsers;
    });

    this.currentPage = 1;
    this.applySort();
    this.updatePagination();
  }

  applySort(): void {
    if (this.sortOption === 'price-asc') {
      this.filteredTours.sort((a, b) => a.tourPrice - b.tourPrice);
    } else if (this.sortOption === 'price-desc') {
      this.filteredTours.sort((a, b) => b.tourPrice - a.tourPrice);
    } else if (this.sortOption === 'rating-desc') {
      this.filteredTours.sort((a, b) => b.rating - a.rating);
    }
    this.updatePagination();
  }

  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedTours = this.filteredTours.slice(startIndex, endIndex);
  }

  onSortChange(): void {
    this.applySort();
  }

  onToursPerRowChange(): void {
    this.updatePagination();
  }

  onTagFilterChange(tag: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.searchCriteria.selectedTags.push(tag);
    } else {
      this.searchCriteria.selectedTags = this.searchCriteria.selectedTags.filter(t => t !== tag);
    }
    this.applyFilters();
  }

  onUserToggle(userName: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.searchCriteria.selectedUsers.push(userName);
    } else {
      this.searchCriteria.selectedUsers = this.searchCriteria.selectedUsers.filter(user => user !== userName);
    }
    this.applyFilters();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages.length) return;
    this.currentPage = page;
    this.updatePagination();
  }

  viewTourDetails(tourId: string): void {
    this.router.navigate(['/tours', tourId]);
  }

  updatePriceMin(event: Event): void {
    this.searchCriteria.priceMin = parseInt((event.target as HTMLInputElement).value);
    if (this.searchCriteria.priceMin > this.searchCriteria.priceMax) {
      this.searchCriteria.priceMin = this.searchCriteria.priceMax;
    }
    this.applyFilters();
  }

  updatePriceMax(event: Event): void {
    this.searchCriteria.priceMax = parseInt((event.target as HTMLInputElement).value);
    if (this.searchCriteria.priceMax < this.searchCriteria.priceMin) {
      this.searchCriteria.priceMax = this.searchCriteria.priceMin;
    }
    this.applyFilters();
  }

  onPlaceChange(event: Event): void {
    this.searchCriteria.place = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }

  onTourTypeChange(event: Event): void {
    this.searchCriteria.tourType = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }

  onDateChange(event: Event): void {
    this.searchCriteria.date = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  onPeopleChange(event: Event): void {
    this.searchCriteria.people = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }
}