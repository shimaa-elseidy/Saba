import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { environment } from '../../../../environment/environment';
import { FormatCategoryPipe } from '../../../pipes/format-category.pipe';

@Component({
  selector: 'app-featured',
  standalone: true,
  imports: [NgFor, NgClass, NgIf, FormatCategoryPipe],
  templateUrl: './featured.component.html',
  styleUrls: ['./featured.component.scss']
})
export class FeaturedComponent {
  private readonly baseUrl = environment.apiUrl;

  showAll: boolean = false;
  activeCategory: string = 'all';
  filteredTours: any[] = [];
  tours: any[] = [];
  categories: string[] = [];
  noDataMessage: string = '';
  displayLimit: number = 8;
  totalTours: number = 0;

  constructor(private http: HttpClient, private router: Router) {
    this.loadTours();
  }

  loadTours() {
    this.http.get<any[]>(`${this.baseUrl}/Tour/featured-cards`).subscribe(data => {
      this.tours = data;
      this.totalTours = data.length;
      
      this.categories = Array.from(new Set(data.map(tour => tour.category)));
      this.filterTours(this.activeCategory);
    });
  }

  filterTours(category: string = 'all') {
    this.activeCategory = category;
    this.showAll = false;
    this.noDataMessage = '';

    if (category === 'all') {
      this.filteredTours = [...this.tours].slice(0, this.displayLimit);
      this.showAll = true;
    } else {
      const filtered = this.tours.filter(tour => tour.category === category);
      this.filteredTours = filtered.slice(0, this.displayLimit);
      if (filtered.length === 0) {
        this.noDataMessage = `No tours found for ${category}.`;
      }
    }
  }

  showAllTours() {
    this.filterTours('all');
  }

  seeMore() {
    this.router.navigate(['/tours'], { queryParams: { category: this.activeCategory } });
  }

  viewTourDetails(tourId: string) {
    this.router.navigate(['/tours', tourId]);
    window.scrollTo(0, 0); // Scroll to top after navigation

  }
}