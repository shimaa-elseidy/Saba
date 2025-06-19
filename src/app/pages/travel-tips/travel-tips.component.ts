import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-travel-tips',
  imports: [],
  templateUrl: './travel-tips.component.html',
  styleUrl: './travel-tips.component.scss'
})
export class TravelTipsComponent implements OnInit {
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

  

}
