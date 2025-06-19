import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { CommentsService } from '../../services/comment/comments.service';

@Component({
  selector: 'app-about-us',
  standalone:true,
  imports: [NgFor],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.scss'
})
export class AboutUsComponent {
  slides: any[][] = [];
  currentSlide = 0;
  private slideInterval: any;

  constructor(private commentsService: CommentsService) {}

  ngOnInit(): void {
    this.fetchComments();
    this.startSlider();
    this.ensureVideoIsMuted();
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
        console.log('لا يمكن الوصول إلى مسارات الصوت:', e);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  fetchComments(): void {
    this.commentsService.getAllCommentsForTours().subscribe({
      next: (comments) => {
        console.log(comments);
        
        // خلط التعليقات بشكل عشوائي
        const shuffledComments = this.shuffleArray(comments);
        // اختيار أول 12 تعليقًا فقط (لأن 4 شرائح × 3 تعليقات = 12)
        const selectedComments = shuffledComments.slice(0, 12);
        // تقسيم التعليقات إلى 4 مجموعات
        this.slides = this.groupComments(selectedComments, 3);
      },
      error: (error) => {
        console.error('Error fetching comments:', error);
        const mockComments = [
          { id: 1, text: "I've used this travel booking site multiple times and have never been disappointed. The search filters are great for narrowing down options, and the prices are always competitive.", user: "Annette Black", location: "New York, USA" },
          { id: 2, text: "This travel site is my go-to for booking adventures. The range of tour options is fantastic, and I appreciate the detailed descriptions that help me make informed decisions.", user: "Jane Cooper", location: "New York, USA" },
          { id: 3, text: "Amazing experience! The booking process was seamless, and the customer service was top-notch. Highly recommend this site for anyone looking to travel.", user: "John Doe", location: "California, USA" },
          { id: 4, text: "A fantastic platform for travel planning. The variety of destinations and activities is impressive, and the support team is always helpful.", user: "Sarah Smith", location: "Texas, USA" },
          { id: 5, text: "I had an unforgettable trip thanks to this site. The itinerary was well-organized, and everything went smoothly from start to finish.", user: "Michael Brown", location: "Florida, USA" },
          { id: 6, text: "Great service and easy-to-use website. I found the perfect tour for my family, and we had an amazing time exploring new places.", user: "Emily Johnson", location: "Chicago, USA" }
        ];
        // خلط التعليقات بشكل عشوائي
        const shuffledComments = this.shuffleArray(mockComments);
        // اختيار أول 12 تعليقًا فقط
        const selectedComments = shuffledComments.slice(0, 12);
        // تقسيم التعليقات إلى 4 مجموعات
        this.slides = this.groupComments(selectedComments, 3);
      }
    });
  }

  shuffleArray(array: any[]): any[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  groupComments(comments: any[], groupSize: number): any[][] {
    const groups: any[][] = [];
    for (let i = 0; i < comments.length; i += groupSize) {
      groups.push(comments.slice(i, i + groupSize));
    }
    return groups;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    this.resetSliderInterval();
  }

  startSlider(): void {
    this.slideInterval = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    }, 5000); // Change slide every 5 seconds
  }

  resetSliderInterval(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
    this.startSlider();
  }
  
}
