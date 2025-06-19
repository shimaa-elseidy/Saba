import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TourService, TravelRequest } from '../../services/Tours/tour.service';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-designtrips',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './designtrips.component.html',
  styleUrls: ['./designtrips.component.scss'],
  providers: [ToastrService, DatePipe]
})
export class DesigntripsComponent implements OnInit {
  travelRequests: TravelRequest[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  currentPage = 1;
  itemsPerPage = 10;
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  private _searchTerm = '';

  constructor(
    private tourService: TourService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.ensureVideoIsMuted();
    this.loadTravelRequests();
    this.setupAnimations();
  }
  
  setupAnimations(): void {
    // Add animation classes to elements when they come into view
    setTimeout(() => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      
      document.querySelectorAll('.stat-card, .content-card, .data-table tr').forEach(el => {
        observer.observe(el);
      });
    }, 100);
  }

  ensureVideoIsMuted(): void {
    const video = document.querySelector('.video-background video') as HTMLVideoElement;
    if (video) {
      video.muted = true;
      video.volume = 0;
      video.addEventListener('loadedmetadata', () => {
        video.muted = true;
        video.volume = 0;
      });
      video.addEventListener('volumechange', () => {
        if (!video.muted || video.volume > 0) {
          video.muted = true;
          video.volume = 0;
        }
      });
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

  loadTravelRequests(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.tourService.getTravelRequests().subscribe({
      next: (requests) => {
        this.travelRequests = requests;
        this.isLoading = false;
        if (requests.length === 0) {
          this.toastr.info('No travel requests found.', 'Info');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching travel requests:', err);
        if (err.message === 'Token not found') {
          this.errorMessage = 'Please log in to view travel requests.';
          this.toastr.error(this.errorMessage, 'Unauthorized');
        } else if (err.status === 401) {
          this.errorMessage = 'Your session has expired. Please log in again.';
          this.toastr.error(this.errorMessage, 'Unauthorized');
        } else {
          this.errorMessage = 'Failed to load travel requests. Please try again later.';
          this.toastr.error(this.errorMessage, 'Error');
        }
      }
    });
  }

  get filteredRequests(): TravelRequest[] {
    let filtered = this.travelRequests;
    
    if (this.searchTerm) {
      filtered = filtered.filter(request => 
        request.yourName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        request.emailAddress?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        request.preferredDestination?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.sortColumn) {
      filtered = filtered.sort((a, b) => {
        const aVal = (a as any)[this.sortColumn];
        const bVal = (b as any)[this.sortColumn];
        const compare = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return this.sortDirection === 'asc' ? compare : -compare;
      });
    }

    return filtered;
  }

  get paginatedRequests(): TravelRequest[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRequests.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredRequests.length / this.itemsPerPage);
  }

  sort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  // The searchTerm is now automatically updated via ngModel
  // We'll add a setter to reset the page when the search term changes
  set searchTerm(value: string) {
    this._searchTerm = value;
    this.currentPage = 1;
  }
  
  get searchTerm(): string {
    return this._searchTerm;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getStatusBadgeClass(request: TravelRequest): string {
    // Add logic based on your status field if available
    return 'status-pending';
  }

  refresh(): void {
    this.loadTravelRequests();
  }

  trackByFn(index: number, item: TravelRequest): any {
    return item.id || index;
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    const half = Math.floor(maxVisiblePages / 2);
    
    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, start + maxVisiblePages - 1);
    
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // Utility method for template
  Math = Math;
}