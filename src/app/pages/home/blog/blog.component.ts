import { NgFor } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environment/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [NgFor],
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {

  blogPosts: any[] = [];
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadBlogs();
    this.setupIntersectionObserver();
  }

  loadBlogs() {
    this.http.get<any[]>(`${this.baseUrl}/blog/Get_All_Blogs_User`)
      .subscribe(data => {
        this.blogPosts = data.slice(0, 3).map(post => ({
          title: post.title,
          image: post.mainImage || 'assets/default-image.jpg',
          text: post.description,
          date: new Date(post.createdAt).toLocaleDateString(),
          views: post.viewCount,
          category: post.category
        }));
      });
  }
  
  navigateToBlog() {
    this.router.navigate(['/blogPosts']);
  }
  
  navigateToChat() {
    this.router.navigate(['/chat']);
  }

  // Add intersection observer for scroll animations
  setupIntersectionObserver(): void {
    setTimeout(() => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      
      document.querySelectorAll('.blog-card, .blog-title, .blog-subtitle, .blog-button').forEach(el => {
        observer.observe(el);
      });
    }, 100);
  }
}