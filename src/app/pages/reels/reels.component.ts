import { NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { AuthService } from '../../services/Auth/auth.service';

interface Reel {
  id: number;
  videoUrl: string;
  username: string;
  description: string;
  likes: number;
  liked: boolean;
}

@Component({
  selector: 'app-reels',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './reels.component.html',
  styleUrls: ['./reels.component.scss']
})
export class ReelsComponent implements OnInit {
  reels: Reel[] = [];
  currentReelIndex = 0;
  isUploading = false;
  newReelFile: File | null = null;
  newReelDescription = '';
  isAdmin: boolean = false;



  constructor(private http: HttpClient,private authService: AuthService) {}

  ngOnInit(): void {
    this.fetchReels().subscribe(data => {
      this.isAdmin = this.authService.getUserRole() === 1;

      this.reels = data;
      window.scrollTo(0, 0); // إعادة التمرير لأعلى الصفحة

    });
  }

  fetchReels(): Observable<Reel[]> {
    // Replace this with your actual API call
    return of([
      {
    id: 1,
    videoUrl: '../../../assets/SampleVideo_1280x720_1mb.mp4',
    username: 'naturelover',
    description: 'Check out this animated bunny 🐰🌳',
    likes: 421,
    liked: false
  },
  {
    id: 2,
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_5mb.mp4',
    username: 'john_doe',
    description: 'Epic video clip from Big Buck Bunny! 🎥',
    likes: 899,
    liked: false
  },
  {
    id: 3,
    videoUrl: 'https://sample-videos.com/video123/mp4/720/sample-mp4-video.mp4',
    username: 'videoFan',
    description: 'A classic sample MP4 video 🎬',
    likes: 134,
    liked: false
  }
    ]);
  }

  previousReel(): void {
    if (this.currentReelIndex > 0) {
      this.currentReelIndex--;
      this.pauseAllVideos();
      this.playCurrentVideo();
    }
  }

  nextReel(): void {
    if (this.currentReelIndex < this.reels.length - 1) {
      this.currentReelIndex++;
      this.pauseAllVideos();
      this.playCurrentVideo();
    }
  }

  // Helper method to pause all videos
  pauseAllVideos(): void {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      video.pause();
    });
  }
  removeFile(): void {
    this.newReelFile = null;
    // يمكنك أيضاً إعادة تعيين input الملف إذا لزم الأمر
    const fileInput = document.getElementById('video-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Helper method to play current video
  playCurrentVideo(): void {
    setTimeout(() => {
      const currentVideo = document.querySelector('.reel-video') as HTMLVideoElement;
      if (currentVideo) {
        currentVideo.play().catch(error => {
          console.log('Autoplay prevented:', error);
        });
      }
    }, 100);
  }

  toggleLike(reel: Reel): void {
    reel.liked = !reel.liked;
    reel.likes += reel.liked ? 1 : -1;
    
    // In a real app, send like/unlike request to server
    // this.http.post(`/api/reels/${reel.id}/like`, { liked: reel.liked }).subscribe();
  }

  toggleUpload(): void {
    this.isUploading = !this.isUploading;
    
    if (this.isUploading) {
      // Pause the current video when opening upload form
      this.pauseAllVideos();
    } else {
      // Reset upload form when closing
      this.newReelFile = null;
      this.newReelDescription = '';
      
      // Play the current video again when closing upload form
      this.playCurrentVideo();
    }
  }
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.includes('video/')) {
      this.newReelFile = file;
      // console.log('Selected file:', file.name, file.size, file.type);
    } else {
      alert('Please select a valid video file');
      this.newReelFile = null;
    }
  }

  uploadReel(): void {
    if (!this.newReelFile) {
      alert('Please select a video file');
      return;
    }

    // In a real app, upload the file to your server
    const formData = new FormData();
    formData.append('video', this.newReelFile);
    formData.append('description', this.newReelDescription);

    
    // this.http.post('/api/reels', formData).subscribe(response => {
    //   this.toggleUpload();
    //   this.fetchReels().subscribe(data => {
    //     this.reels = data;
    //   });
    // });

    // For demo, simulate the upload
    const newReel: Reel = {
      id: this.reels.length + 1,
      videoUrl: URL.createObjectURL(this.newReelFile),
      username: 'currentUser', // In a real app, get from auth service
      description: this.newReelDescription,
      likes: 0,
      liked: false
    };

    this.reels.unshift(newReel);
    this.toggleUpload();
    this.currentReelIndex = 0;
    
    // Play the new video
    setTimeout(() => {
      this.playCurrentVideo();
    }, 300);
    // console.log(formData);

  }
  
}