import { Component, ElementRef, HostListener, ViewChild, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment/environment';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-tourss',
  standalone: true,
  imports: [NgFor],
  templateUrl: './tourss.component.html',
  styleUrl: './tourss.component.scss',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(-30px)', opacity: 0 }),
        animate('500ms 300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class TourssComponent implements OnInit {
  private readonly baseUrl = environment.apiUrl;
  destinations: any[] = [];
  @ViewChild('slider') slider!: ElementRef;
  currentIndex = 0;
  isTransitioning = false;
  autoplayInterval: any;
  autoplayDelay = 4000; // 4 seconds per slide
  isLoaded = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadTours();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  loadTours() {
    this.http.get<any[]>(`${this.baseUrl}/Tour/cities-with-tour-count`)
      .subscribe(data => {
        const shuffled = data.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 6);
        this.destinations = selected.map(tour => ({
          name: tour.cityName,
          tours: tour.tourCount,
          image: 'assets/giza-pyramids-sphinx-evening-egypt-e1669109796704.jpg'
        }));
        setTimeout(() => {
          this.isLoaded = true;
          this.updateSlider();
          this.startAutoplay();
        }, 300);
      });
  }

  prevSlide() {
    if (this.isTransitioning || this.destinations.length === 0) return;
    
    this.isTransitioning = true;
    const maxIndex = Math.max(0, Math.ceil(this.destinations.length / this.getItemsPerSlide()) - 1);
    
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      // Loop back to the end
      this.currentIndex = maxIndex;
    }
    
    this.updateSlider();
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 500); // Match transition duration in CSS
  }

  nextSlide() {
    if (this.isTransitioning || this.destinations.length === 0) return;
    
    this.isTransitioning = true;
    const maxIndex = Math.max(0, Math.ceil(this.destinations.length / this.getItemsPerSlide()) - 1);
    
    if (this.currentIndex < maxIndex) {
      this.currentIndex++;
    } else {
      // Loop back to the beginning
      this.currentIndex = 0;
    }
    
    this.updateSlider();
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 500); // Match transition duration in CSS
  }

  setSlide(index: number) {
    if (this.isTransitioning || this.currentIndex === index || this.destinations.length === 0) return;
    
    this.isTransitioning = true;
    const maxIndex = Math.max(0, Math.ceil(this.destinations.length / this.getItemsPerSlide()) - 1);
    
    if (index >= 0 && index <= maxIndex) {
      this.currentIndex = index;
      this.updateSlider();
    }
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 500); // Match transition duration in CSS
  }

  updateSlider() {
    if (!this.slider || !this.slider.nativeElement || this.destinations.length === 0) return;

    const sliderElement = this.slider.nativeElement;
    const card = sliderElement.querySelector('.destination-card');
    if (!card) return;

    const cardWidth = card.offsetWidth;
    const gap = parseFloat(getComputedStyle(sliderElement).gap) || 16;
    const itemsPerSlide = this.getItemsPerSlide();
    const translateX = -this.currentIndex * (cardWidth * itemsPerSlide + gap * itemsPerSlide);
    
    sliderElement.style.transition = 'transform 0.5s ease-in-out';
    sliderElement.style.transform = `translateX(${translateX}px)`;
  }

  getItemsPerSlide(): number {
    const width = window.innerWidth;
    // For large screens, we don't use slider at all (grid view)
    if (width >= 768) return 2; // On tablets, show 2 cards per slide
    return 1; // On mobile, show 1 card per slide
  }

  getSlides(): number[] {
    const itemsPerSlide = this.getItemsPerSlide();
    return Array(Math.ceil(this.destinations.length / itemsPerSlide)).fill(0).map((_, i) => i);
  }

  startAutoplay() {
    this.stopAutoplay(); // Clear any existing interval
    this.autoplayInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoplayDelay);
  }

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    this.stopAutoplay();
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.startAutoplay();
  }

  @HostListener('window:resize')
  onResize() {
    const itemsPerSlide = this.getItemsPerSlide();
    const maxIndex = Math.max(0, Math.ceil(this.destinations.length / itemsPerSlide) - 1);
    this.currentIndex = Math.min(this.currentIndex, maxIndex);
    
    // Update the view after resize
    setTimeout(() => {
      this.updateSlider();
    }, 100);
  }
}