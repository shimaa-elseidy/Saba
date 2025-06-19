import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TourService } from '../../services/Tours/tour.service';
import { ToastrService } from 'ngx-toastr';
export interface Tour {
  id: number;
  title: string;
  mainImageUrl: string;
  location: string;
  peopleCount: number;
  tourDay: number;
  tourNight: number;
  price: number;
  rating: number;
  category: string;
}

interface UserData {
  roleName: string;
  [key: string]: any;
}
@Component({
  selector: 'app-favourites-user',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './favourites-user.component.html',
  styleUrls: ['./favourites-user.component.scss'],
  providers: [ToastrService]

})
export class FavouritesUserComponent implements OnInit {
  
  favoriteTours: Tour[] = [];
  favoriteTourIds: Set<number> = new Set();
  isUser: boolean = false;

  constructor(
    private tourService: TourService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.checkUserRole();
    if (this.isUser) {
      this.loadFavoriteTours();
    }
  }

  checkUserRole(): void {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedData: UserData = JSON.parse(userData);
        this.isUser = parsedData.roleName === 'User';
      } catch (e) {
        console.error('Error parsing userData:', e);
      }
    }
  }

  loadFavoriteTours(): void {
    this.tourService.getFavoriteTours().subscribe({
      next: (favorites: Tour[]) => {
        this.favoriteTours = favorites;
        this.favoriteTourIds = new Set(favorites.map(tour => tour.id));
      },
      error: (err) => {
        console.error('Error fetching favorite tours:', err);
        if (err.message === 'Token not found') {
          this.toastr.error('Please log in to view favorites.', 'Unauthorized');
        } else {
          this.toastr.error('Failed to load favorite tours.', 'Error');
        }
      }
    });
  }

  isFavorite(tourId: number): boolean {
    return this.favoriteTourIds.has(tourId);
  }

  toggleFavorite(tourId: number, event: Event): void {
    event.stopPropagation();
    this.tourService.isTourFavorite(tourId).subscribe({
      next: (isFavorite) => {
        if (isFavorite) {
          this.tourService.removeTourFromFavorites(tourId).subscribe({
            next: () => {
              this.favoriteTourIds.delete(tourId);
              this.favoriteTours = this.favoriteTours.filter(tour => tour.id !== tourId);
              this.toastr.success('Tour removed from favorites.', 'Success');
            },
            error: (err) => {
              console.error('Error removing from favorites:', err);
              this.toastr.error('Failed to remove tour from favorites.', 'Error');
            }
          });
        } else {
          this.tourService.addTourToFavorites(tourId).subscribe({
            next: () => {
              this.favoriteTourIds.add(tourId);
              this.loadFavoriteTours(); // Reload to refresh the list
              this.toastr.success('Tour added to favorites successfully!', 'Success');
            },
            error: (err) => {
              console.error('Error adding to favorites:', err);
              this.toastr.error('Failed to add tour to favorites.', 'Error');
            }
          });
        }
      },
      error: (err) => {
        console.error('Error checking favorite status:', err);
        if (err.message === 'Token not found') {
          this.toastr.error('Please log in to add to favorites.', 'Unauthorized');
        } else {
          this.toastr.error('Failed to check favorite status.', 'Error');
        }
      }
    });
  }

  viewTourDetails(tourId: number): void {
    this.router.navigate(['/tours', tourId]);
  }

  goToTours(): void {
    this.router.navigate(['/tours']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}

