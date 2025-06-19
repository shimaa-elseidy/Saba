
// blog-post-side-bar.component.ts
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { BlogHomeService } from '../../services/blogHome/blog-home.service';
import { CommonModule, NgFor } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-blog-post-side-bar',
  standalone: true,
  imports: [CommonModule, NgFor],
  templateUrl: './blog-post-side-bar.component.html',
  styleUrls: ['./blog-post-side-bar.component.scss']
})
export class BlogPostSideBarComponent implements OnInit {
  
  // جميع البيانات
  blogs: any[] = [];
  categories: any[] = [];
  tags: any[] = [];
  youMayLikeList: any[] = [];
  
  // بيانات عشوائية للعرض
  randomBlogs: any[] = [];
  randomCategories: any[] = [];
  randomTags: any[] = [];

  constructor(
    private blogService: BlogHomeService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.getBlogs();
    this.getCategories();
    this.getTags();
    this.getTourCards();
  }

  // وظيفة لاختيار عناصر عشوائية من مصفوفة
  getRandomItems(array: any[], count: number): any[] {
    // نسخة من المصفوفة الأصلية لتجنب تعديلها
    const shuffled = [...array];
    
    // خلط المصفوفة بشكل عشوائي (خوارزمية Fisher-Yates)
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // إرجاع العدد المطلوب من العناصر
    return shuffled.slice(0, count);
  }

  getBlogs() {
    this.blogService.getBlogs().subscribe({
      next: (data) => {
        this.blogs = data;
        // اختيار 6 مدونات عشوائية للعرض في الشريط الجانبي
        this.randomBlogs = this.getRandomItems(this.blogs, 6);
      },
      error: (err) => {
        console.error('Error fetching blogs:', err);
      }
    });
  }
  
  getCategories() {
    this.blogService.getBlogsCategoryHome().subscribe({
      next: (data) => {
        this.categories = data;
        // اختيار فئات عشوائية
        this.randomCategories = this.getRandomItems(this.categories, 6);
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
      },
    });
  }

  getTags() {
    this.blogService.getBlogsTagsHome().subscribe({
      next: (data) => {
        this.tags = data;
        // اختيار 6 تاجات عشوائية فقط
        this.randomTags = this.getRandomItems(this.tags, 6);
      },
      error: (err) => {
        console.error('Error fetching tags:', err);
      },
    });
  }

  getTourCards() {
    this.blogService.getBlogsTourCardsHome().subscribe({
      next: (data) => {
        this.youMayLikeList = data.map((tour) => ({
          ...tour,
          reviews: tour.reviews || 0,
          description: tour.description || '',
          duration: `${tour.tourDay}Day/${tour.tourNight}Night`
        }));
      },
      error: (err) => {
        console.error('Error fetching tour cards:', err);
      }
    });
  }

  // وظيفة للتنقل إلى مدونة (بديلة عن routerLink)
  navigateToBlog(blogId: number) {
    // التنقل برمجياً إلى صفحة المدونة المطلوبة
    window.scrollTo(0, 0); // التمرير إلى أعلى الصفحة
    this.router.navigate(['/blog', blogId]);
  }

  // TrackBy function for better performance
  trackByFn(index: number, item: any): number {
    return item.id;
  }
}