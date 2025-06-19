import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-helper',
  standalone:true,
  imports: [NgIf],
  templateUrl: './helper.component.html',
  styleUrl: './helper.component.scss'
})
export class HelperComponent implements OnInit {
  mainDescription: string = ''; // Initialize with default value

  showModal: boolean = false;
  videoUrl: string = 'https://www.youtube.com/embed/tqj6FxH8JLE';
  safeVideoUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.videoUrl);
  }
  ngOnInit(): void {
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
  openVideoModal(): void {
    this.showModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal(event: Event): void {
    if (event.target === event.currentTarget || (event.target as HTMLElement).classList.contains('close-btn')) {
      this.showModal = false;
      document.body.style.overflow = 'auto';
    }
  }

}
