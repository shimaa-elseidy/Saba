import { NgFor } from '@angular/common';
import { Component, ElementRef, ViewChild, OnInit, OnDestroy, HostListener, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-home-cara',
  imports: [NgFor],
  templateUrl: './home-cara.component.html',
  styleUrls: ['./home-cara.component.scss']
})
export class HomeCaraComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('slider', { static: false }) slider!: ElementRef;

  activeIndex = 1;
  private autoSlideInterval: any;
  private isPaused = false;
  private isMobile = false;
  private isScrolling = false;
  private cardWidths: number[] = [];
  private resizeTimeout: any;

  tours = [
    { title: "Beach", count: 35, icon: "bi bi-water", description: "Sun, Sand, Waves, Relaxation, Coastal" },
    { title: "Technologies", count: 15, icon: "bi bi-cpu", description: "Innovation, Digital, Modern, Gadgets, Future" },
    { title: "Antediluvian", count: 8, icon: "bi bi-fossil", description: "Ancient, Prehistoric, Fossils, Relics, Archaeology" },
    { title: "Classic", count: 20, icon: "bi bi-columns", description: "Timeless, Elegant, Vintage, Traditional, Refined" },
    { title: "Nile Cruise", count: 25, icon: "bi bi-water", description: "River, Scenic, Luxury, Temples, Serenity" },
    { title: "History", count: 30, icon: "bi bi-book", description: "Heritage, Artifacts, Chronicles, Monuments, Legacy" },
    { title: "Mount Sinai", count: 10, icon: "bi bi-signpost", description: "Spiritual, Sacred, Mountain, Pilgrimage, Divine" },
    { title: "Stargate", count: 5, icon: "bi bi-rocket", description: "Mystical, Portal, Cosmic, Sci-Fi, Adventure" },
    { title: "Turkey", count: 18, icon: "bi bi-globe-europe-africa", description: "Bazaars, Mosques, Culture, Landscapes, History" },
    { title: "Holy Family", count: 12, icon: "bi bi-cross", description: "Religious, Journey, Sacred, Faith, Blessings" } ];
  constructor() {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
    // Debounce resize to prevent multiple scroll calls
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.resetCardWidths();
      this.calculateCardWidths();
      this.scrollToCard();
    }, 200);
  }

  ngOnInit(): void {
    this.startAutoSlide();
  }

  ngAfterViewInit(): void {
    this.calculateCardWidths();
    setTimeout(() => {
      this.scrollToCard();
      this.animateCardsEntrance();
    }, 100);
  }
  
  private animateCardsEntrance(): void {
    if (!this.slider) return;
    
    const sliderElement = this.slider.nativeElement;
    const cards = sliderElement.children;
    
    // Add staggered entrance animation
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i] as HTMLElement;
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 100 + (i * 100)); // Stagger the animations
    }
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
    clearTimeout(this.resizeTimeout);
  }

  private calculateCardWidths(): void {
    if (!this.slider) return;

    const sliderElement = this.slider.nativeElement;
    const cards = sliderElement.children;
    this.cardWidths = [];

    for (let i = 0; i < cards.length; i++) {
      this.cardWidths[i] = cards[i].offsetWidth;
    }
  }

  private resetCardWidths(): void {
    this.cardWidths = [];
  }

  startAutoSlide(): void {
    this.autoSlideInterval = setInterval(() => {
      if (!this.isPaused && !this.isScrolling) {
        this.moveSlide(1);
      }
    }, 5000); // Increased to 5s for smoother pacing
  }

  stopAutoSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  setActiveIndex(index: number): void {
    if (this.activeIndex === index || this.isScrolling) return;
    
    this.activeIndex = index;
    this.scrollToCard();
    
    this.pauseAutoSlide();
  }

  moveSlide(step: number): void {
    if (this.isScrolling) return;
    
    const maxIndex = this.tours.length - 1;
    let newIndex = this.activeIndex + step;
    
    if (newIndex < 0) {
      newIndex = maxIndex;
    } else if (newIndex > maxIndex) {
      newIndex = 0;
    }
    
    this.activeIndex = newIndex;
    this.scrollToCard();
    this.pauseAutoSlide();
  }

  private scrollToCard(): void {
    if (!this.slider) return;
    
    const sliderElement = this.slider.nativeElement;
    const cards = sliderElement.children;
    
    if (!cards || !cards[this.activeIndex]) return;

    this.isScrolling = true;
    
    // Use requestAnimationFrame for smoother updates
    requestAnimationFrame(() => {
      let scrollPosition = 0;
      
      if (this.cardWidths.length === cards.length) {
        for (let i = 0; i < this.activeIndex; i++) {
          scrollPosition += this.cardWidths[i] + 15; // Width + gap
        }
        scrollPosition -= (sliderElement.offsetWidth / 2) - (this.cardWidths[this.activeIndex] / 2);
      } else {
        const activeCard = cards[this.activeIndex] as HTMLElement;
        scrollPosition = activeCard.offsetLeft - (sliderElement.offsetWidth / 2) + (activeCard.offsetWidth / 2);
      }
      
      sliderElement.scrollTo({
        left: Math.max(0, scrollPosition),
        behavior: 'smooth'
      });
      
      // Reset scrolling flag after animation
      setTimeout(() => {
        this.isScrolling = false;
      }, 600); // Match CSS scroll duration
    });
  }

  private pauseAutoSlide(): void {
    this.isPaused = true;
    setTimeout(() => {
      this.isPaused = false;
    }, 3000);
  }
}