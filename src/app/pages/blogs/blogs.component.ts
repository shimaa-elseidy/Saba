import { Component, OnInit } from '@angular/core';
import { Blogs } from '../../Intrerfaces/Blogs';
import { CommonModule, NgFor } from '@angular/common';
import { Observable, of } from 'rxjs';
import { FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { CommentsBlogs } from '../../Intrerfaces/CommentsBlogs';
import { RouterModule } from '@angular/router';
import { BlogService } from '../../services/dashBlog/blog.service';
import { CommentsService } from '../../services/comment/comments.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-blogs',
  imports: [NgFor, FormsModule, RouterModule, CommonModule],
  templateUrl: './blogs.component.html',
  styleUrls: ['./blogs.component.scss']
})
export class BlogsComponent implements OnInit {
  searchTerm: string = '';
  selectedCategory: string = 'all';

  blogs: any[] = [];
  commentsBlogs: any[] = [];
  
  constructor(
    private blogService: BlogService, 
    private commentService: CommentsService,
    private toastr: ToastrService
  ) {}
  
  ngOnInit(): void {
    // Load blogs with animation delay
    this.blogService.getAllBlogs().subscribe({
      next: (data) => {
        this.blogs = data;
      },
      error: (err) => {
        console.error("Error loading blogs", err);
        this.toastr.error('Error loading blogs');
      }
    });

    // Load comments with animation delay
    this.commentService.getAllCommentsBlogs().subscribe({
      next: (data) => {
        this.commentsBlogs = data;
      },
      error: (err) => {
        console.error("Error loading comments", err);
        this.toastr.error('Error loading comments');
      }
    });
  }

  deleteBlog(id: number) {
    this.blogService.deleteBlog(id).subscribe({
      next: (res) => {
        this.blogs = this.blogs.filter(blog => blog.id !== id);
        this.toastr.success('Blog deleted successfully');
      },
      error: (err) => {
        console.error("Error deleting blog", err);
        this.toastr.error('Error deleting blog');
      }
    });
  }

  deleteComment(id: number) {
    this.commentService.deleteCommentById(id).subscribe({
      next: (res) => {
        this.commentsBlogs = this.commentsBlogs.filter(comment => comment.id !== id);
        this.toastr.success(res.message);
      },
      error: (err) => {
        console.error("Error deleting comment", err);
        this.toastr.error('Error deleting comment');
      }
    });
  }

  get filteredBlogs() {
    return this.blogs.filter(blog => {
      const search = this.searchTerm.toLowerCase();
      const matchesSearch =
        blog.title.toLowerCase().includes(search) ||
        blog.category.toLowerCase().includes(search);

      const matchesCategory =
        this.selectedCategory === 'all' || blog.category === this.selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }

  filterBlogs(category: string) {
    this.selectedCategory = category;
  }
}
