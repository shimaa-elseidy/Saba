import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { CommentsService } from '../../../services/comment/comments.service';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [NgFor],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.scss'
})
export class TestimonialsComponent {
  testimonials: any[] = [];
  displayedTestimonials: any[] = []; // سيحتوي على 3 تعليقات عشوائية
  activeIndex = 0;

  constructor(private commentService: CommentsService) {}

  ngOnInit(): void {
    this.commentService.getAllComments().subscribe({
      next: (data) => {
        this.testimonials = data;
        this.selectRandomTestimonials(); // اختيار 3 تعليقات عشوائية
        console.log(this.displayedTestimonials);
      },
      error: (err) => {
        console.error("Error fetching comments:", err);
      }
    });
  }

  // دالة لاختيار 3 تعليقات عشوائية
  selectRandomTestimonials(): void {
    if (this.testimonials.length <= 3) {
      this.displayedTestimonials = [...this.testimonials];
    } else {
      const shuffled = [...this.testimonials].sort(() => 0.5 - Math.random());
      this.displayedTestimonials = shuffled.slice(0, 3);
    }
  }

  setActiveIndex(index: number): void {
    if (index !== this.activeIndex) {
      this.activeIndex = index;
    }
  }
}