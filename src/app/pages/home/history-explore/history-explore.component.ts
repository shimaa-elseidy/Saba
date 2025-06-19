import { Component, ElementRef, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { HomeService } from '../../../services/Home/home.service';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-history-explore',
  imports: [NgFor],
  templateUrl: './history-explore.component.html',
  styleUrls: ['./history-explore.component.scss'],
  standalone: true
})
export class HistoryExploreComponent implements OnInit {
  homeService = inject(HomeService);
  data: any = { items: [] };
  @ViewChild('slider') slider!: ElementRef;
  currentIndex = 0;
  isTransitioning = false;
  autoplayInterval: any;
  autoplayDelay = 3000; // 3 seconds per slide

  ngOnInit(): void {
    this.getHomeData();
    this.startAutoplay();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  getHomeData() {
    this.homeService.getHomeData().subscribe({
      next: (response) => {
        this.data = response;
        this.shuffleItems();
        setTimeout(() => this.updateSlider(), 0);
      },
      error: (err) => {
        console.error('Error fetching data:', err);
      }
    });
  }

  shuffleItems() {
    this.data.items = this.data.items
      .map((item: any) => ({ item, sort: Math.random() }))
      .sort((a: any, b: any) => a.sort - b.sort)
      .map(({ item }: any) => item);
  }

  prevSlide() {
    if (this.isTransitioning) return;
    
    this.isTransitioning = true;
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      // Loop back to the end
      this.currentIndex = Math.max(0, this.data.items.length - this.getItemsToShow());
    }
    this.updateSlider();
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 500); // Match transition duration in CSS
  }

  nextSlide() {
    if (this.isTransitioning) return;
    
    this.isTransitioning = true;
    const itemsToShow = this.getItemsToShow();
    const maxIndex = Math.max(0, this.data.items.length - itemsToShow);
    
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
    if (this.isTransitioning || this.currentIndex === index) return;
    
    this.isTransitioning = true;
    const itemsToShow = this.getItemsToShow();
    const maxIndex = Math.max(0, this.data.items.length - itemsToShow);
    
    if (index >= 0 && index <= maxIndex) {
      this.currentIndex = index;
      this.updateSlider();
    }
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 500); // Match transition duration in CSS
  }

  updateSlider() {
    if (!this.slider || !this.slider.nativeElement) return;

    const sliderElement = this.slider.nativeElement;
    const card = sliderElement.querySelector('.item-card');
    if (!card) return;

    const cardWidth = card.offsetWidth;
    const gap = 16;
    const translateX = -this.currentIndex * (cardWidth + gap);
    
    sliderElement.style.transition = 'transform 0.5s ease-in-out';
    sliderElement.style.transform = `translateX(${translateX}px)`;
  }

  getItemsToShow(): number {
    const width = window.innerWidth;
    if (width <= 480) return 1;
    if (width <= 768) return 2;
    return 3;
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
    this.currentIndex = Math.min(this.currentIndex, Math.max(0, this.data.items.length - this.getItemsToShow()));
    this.updateSlider();
  }
  
  // Helper method to check if we're at the last slide
  isLastSlide(): boolean {
    return this.currentIndex >= this.data.items.length - this.getItemsToShow();
  }

  // Helper method to check if we're at the first slide
  isFirstSlide(): boolean {
    return this.currentIndex === 0;
  }
}