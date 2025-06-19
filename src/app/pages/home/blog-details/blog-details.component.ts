// blog-details.component.ts
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BlogHomeService } from '../../../services/blogHome/blog-home.service';
import { BlogPostSideBarComponent } from '../../blog-post-side-bar/blog-post-side-bar.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from '../../../services/Auth/auth.interceptor';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

interface Comment {
  userName: string;
  profilePicture: string;
  content: string;
  createdAt: string;
}

interface BlogPost {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  createdBy: string;
  mainImage: string;
  headerImages: string[];
  category: string;
  places: any[];
  tags: string[];
  viewCount: number;
  comments?: Comment[];
}

@Component({
  selector: 'app-blog-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BlogPostSideBarComponent,
    DatePipe,
    HttpClientModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  templateUrl: './blog-details.component.html',
  styleUrl: './blog-details.component.scss',
})
export class BlogDetailsComponent implements OnInit, OnDestroy {
  selectedBlog: BlogPost | null = null;
  loading = true;
  showAllComments = false;
  blogs: any[] = [];
  filteredBlogs: any[] = []; // Para almacenar los blogs filtrados sin el actual
  private routeSubscription: Subscription | null = null;

  // نموذج التعليق الجديد
  newComment = {
    content: '',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogHomeService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // الاشتراك في تغييرات المسار
    this.routeSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const blogId = +this.route.snapshot.paramMap.get('id')!;
        this.loadBlogData(blogId);
      });

    // تحميل البيانات الأولية
    const blogId = +this.route.snapshot.paramMap.get('id')!;
    this.loadBlogData(blogId);
  }

  ngOnDestroy(): void {
    // إلغاء الاشتراك عند تدمير المكون
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  // دالة مساعدة لتحميل جميع بيانات المدونة
  loadBlogData(blogId: number): void {
    this.loading = true;
    this.getBlogDetails(blogId);
    this.getBlogs(blogId);
  }

  // Obtener y filtrar los blogs
  getBlogs(currentBlogId: number) {
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

        // Filtrar para excluir el blog actual
        this.filteredBlogs = this.blogs.filter(
          (blog) => blog.id !== currentBlogId
        );
        this.cdr.detectChanges(); // تحديث الواجهة بعد تعديل البيانات
      },
      error: (err) => {
        console.error('Error fetching blogs:', err);
      },
    });
  }
  
  get mergedHeaderImages(): string[] {
    const images: string[] = [];
    const arr = this.selectedBlog?.headerImages || [];

    for (let i = 0; i < arr.length; i += 2) {
      const merged = arr[i] + (arr[i + 1] || '');
      images.push(merged);
    }

    return images;
  }

  getBlogDetails(blogId: number) {
    this.blogService.getBlogDetails(blogId).subscribe({
      next: (data) => {
        // إضافة prefix لكل صورة
        if (data.mainImage && !data.mainImage.startsWith('data:image')) {
          data.mainImage = `data:image/jpeg;base64,${data.mainImage}`;
        }

        if (data.headerImages && data.headerImages.length > 0) {
          data.headerImages = data.headerImages.map((img: string) =>
            img.startsWith('data:image') ? img : `data:image/jpeg;base64,${img}`
          );
        }

        this.selectedBlog = data;
        this.loading = false;
        this.cdr.detectChanges(); // تحديث الواجهة بشكل صريح
      },
      error: (err) => {
        console.error('Error fetching blog details:', err);
        this.loading = false;
      },
    });
  }

  // Navegar a un blog al hacer clic
  navigateToBlog(blogId: number) {
    // التمرير إلى أعلى الصفحة
    window.scrollTo(0, 0);
    
    // التنقل إلى المدونة الجديدة
    this.router.navigate(['/blog', blogId]);
    // لا داعي لتحميل البيانات هنا، سيتم تنفيذ ذلك عبر مراقبة تغيير المسار
  }

  toggleComments() {
    this.showAllComments = !this.showAllComments;
  }

  submitComment() {
    if (!this.newComment.content.trim()) return;
  
    const token = localStorage.getItem('token');
    if (!token) {
      this.toastr.error('يرجى تسجيل الدخول لإضافة تعليق', 'خطأ في المصادقة');
      return;
    }
  
    if (!this.selectedBlog?.id) {
      console.error('Blog ID is missing');
      return;
    }
  
    const commentData = {
      content: this.newComment.content,
      blogId: this.selectedBlog.id,
    };
  
    this.blogService.addComment(commentData).subscribe({
      next: (response: any) => {
        // 1. إضافة معالجة أكثر تفصيلاً للبيانات المستلمة
        console.log('Comment response:', response);
        
        // 2. إنشاء كائن تعليق جديد مع مزيد من البيانات
        const newComment: Comment = {
          userName: response.userName || response.user?.name || 'Anonymous',
          profilePicture: response.profilePicture || response.user?.profilePicture || 'assets/images/default-avatar.png',
          content: response.content,
          createdAt: response.createdAt || new Date().toISOString(),
        };
  
        // 3. تحديث قائمة التعليقات بشكل أكثر وضوحاً
        if (this.selectedBlog) {
          // إنشاء نسخة جديدة من المدونة المختارة
          this.selectedBlog = {
            ...this.selectedBlog,
            comments: this.selectedBlog.comments 
              ? [newComment, ...this.selectedBlog.comments] 
              : [newComment]
          };
  
          // 4. إفراغ نموذج التعليق
          this.newComment.content = '';
          
          // 5. إظهار رسالة نجاح
          this.toastr.success('Comment Posted Successfully' , 'Success');
          
          // 6. إجبار تحديث الواجهة
          this.cdr.detectChanges();
          
          // 7. بدلاً من إعادة تحميل البيانات، نضمن أن التعليق الجديد قد تمت إضافته بشكل صحيح
          setTimeout(() => {
            // التمرير إلى قسم التعليقات
            const commentsSection = document.querySelector('.comments-section');
            if (commentsSection) {
              commentsSection.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
        }
      },
      error: (error) => {
        console.error('Error adding comment:', error);
        // 8. معالجة أفضل للأخطاء
        if (error.status === 401) {
          this.toastr.error('جلسة المستخدم منتهية. يرجى تسجيل الدخول مرة أخرى', 'خطأ في المصادقة');
        } else {
          this.toastr.error('حدث خطأ أثناء إضافة التعليق', 'خطأ');
        }
      },
    });
  }
}