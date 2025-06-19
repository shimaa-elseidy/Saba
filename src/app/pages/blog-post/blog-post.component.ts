import { Component, OnInit } from '@angular/core';
import { BlogPostSideBarComponent } from '../blog-post-side-bar/blog-post-side-bar.component';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BlogHomeService } from '../../services/blogHome/blog-home.service';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [BlogPostSideBarComponent, NgFor, RouterLink],
  templateUrl: './blog-post.component.html',
  styleUrl: './blog-post.component.scss',
})
export class BlogPostComponent implements OnInit {
  breadcrumbs = [
    { label: 'Home', url: '/' },
    { label: 'Blog Post', url: null },
  ];

  pageTitle = 'Blog Post';

  currentPage: number = 1;
  itemsPerPage: number = 10; // يجب أن يكون عدد زوجي (2 مدونة في الصف × عدد الصفوف)

  blogs: any[] = [];
  blogRows: any[][] = []; // لتخزين المدونات مصفوفة في صفوف

  constructor(private blogService: BlogHomeService) {}

  ngOnInit() {
    this.getBlogs();
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

  getBlogs() {
    this.blogService.getBlogs().subscribe({
      next: (data) => {
        this.blogs = data.map((blog) => {
          const formattedDate = blog.createdAtFormatted;
          const parts = formattedDate?.split(',')[1]?.trim().split(' ') ?? [];
          return {
            ...blog,
            month: parts[0] || '',
            date: parts[1] || '',
          };
        });
        this.updateBlogRows();
      },
      error: (err) => {
        console.error('Error fetching blogs:', err);
      },
    });
  }

  // تقسيم المدونات إلى صفوف كل صف يحتوي على مدونتين
  updateBlogRows() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const paginatedBlogs = this.blogs.slice(startIndex, startIndex + this.itemsPerPage);
    
    this.blogRows = [];
    for (let i = 0; i < paginatedBlogs.length; i += 2) {
      this.blogRows.push(paginatedBlogs.slice(i, i + 2));
    }
  }

  get totalPages(): number[] {
    return Array.from(
      { length: Math.ceil(this.blogs.length / this.itemsPerPage) },
      (_, i) => i + 1
    );
  }

  changePage(page: number) {
    this.currentPage = page;
    this.updateBlogRows();
  }
}