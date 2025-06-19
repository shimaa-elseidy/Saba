import { NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CommentsService } from '../../services/comment/comments.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatSelectionService } from '../../services/chat-selection.service';

@Component({
    selector: 'app-comments',
    standalone: true,
    imports: [NgFor, NgIf, FormsModule],
    templateUrl: './comments.component.html',
    styleUrl: './comments.component.scss'
})
export class CommentsComponent {

  commentsService = inject(CommentsService);
  toastr = inject(ToastrService);
  router = inject(Router);
  chatService = inject(ChatSelectionService);
  comments = [];
  
  // Reply functionality properties
  replyingToCommentId: number | null = null;
  replyContent: string = '';

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments() {
    this.commentsService.getAllCommentsForTours().subscribe({
      next: (data) => {
        this.comments = data;
      },
      error: (err) => {
        console.error('Error loading comments:', err);
      }
    });
  }

  deleteComment(id: number): void {
    this.commentsService.deleteCommentById(id).subscribe({
      next: () => {
        this.comments = this.comments.filter(comment => comment.id !== id);
        this.toastr.success('Comment deleted successfully!', 'Deleted');
      },
      error: (err) => {
        this.toastr.error('Failed to delete comment.', 'Error');
      }
    });
  }

  // Reply functionality methods
  startReply(commentId: number): void {
    this.replyingToCommentId = commentId;
    this.replyContent = '';
  }

  cancelReply(): void {
    this.replyingToCommentId = null;
    this.replyContent = '';
  }

  submitReply(parentCommentId: number): void {
    if (!this.replyContent.trim()) {
      this.toastr.warning('Please enter a reply message.', 'Warning');
      return;
    }

    this.commentsService.replyToComment(parentCommentId, this.replyContent).subscribe({
      next: (response) => {
        this.toastr.success('Reply sent successfully!', 'Success');
        this.cancelReply();
        // Reload comments to show the new reply
        this.loadComments();
      },
      error: (err) => {
        console.error('Error sending reply:', err);
        this.toastr.error('Failed to send reply.', 'Error');
      }
    });
  }
  
  openChat(comment: any): void {
    if (comment && comment.user && comment.user.userID) {
      this.chatService.setSelectedUserId(comment.user.userID);
      this.router.navigate(['/dashboard/chat']);
    } else {
      this.toastr.error('User ID is missing or invalid.');
    }
  }
}