import { NgFor } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environment/environment';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [NgFor, RouterLink],
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {

  blogPosts: any[] = [];  // تخزين بيانات المدونات
  private readonly baseUrl = environment.apiUrl;  // استخدام الـ URL للـ API

  constructor(private http: HttpClient,private router : Router) {}

  ngOnInit(): void {
    this.loadBlogs();  // تحميل المدونات عند تحميل المكون
  }

  loadBlogs() {
    // جلب البيانات من الـ API
    this.http.get<any[]>(`${this.baseUrl}/blog/Get_All_Blogs_User`) // API URL
      .subscribe(data => {
        // أخذ أول 3 عناصر فقط
        this.blogPosts = data.slice(0, 3).map(post => ({
          title: post.title,
          image: post.mainImage || 'assets/default-image.jpg',  // استخدام صورة افتراضية إذا لم توجد صورة
          text: post.description,
          date: new Date(post.createdAt).toLocaleDateString(),  // تحويل التاريخ
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
}
