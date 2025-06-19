import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/Auth/auth.service';

@Component({
  selector: 'app-reset-password-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './reset-password-modal.component.html',
  styleUrls: ['./reset-password-modal.component.scss']
})
export class ResetPasswordModalComponent {
  @Input() email: string = ''; // Receive email from parent
  @Output() closeModalEvent = new EventEmitter<void>();

  resetPasswordForm: FormGroup;
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  showPassword: boolean = false;

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  constructor() {
    this.resetPasswordForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      newPassword: [
        '', 
        [
          Validators.required, 
          Validators.minLength(6),
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)
        ]
      ]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { otp, newPassword } = this.resetPasswordForm.value;

    // First verify the email with OTP
    this.authService.verifyOtp(this.email, otp).subscribe({
      next: () => {
        // After verification, reset the password
        this.authService.resetPassword(this.email, otp, newPassword).subscribe({
          next: (response) => {
            this.isLoading = false;
            this.resetPasswordForm.reset();
            
            // If response contains token, store it and navigate to dashboard
            if (response?.token) {
              localStorage.setItem('token', response.token);
              if (response.userData) {
                localStorage.setItem('userData', JSON.stringify(response.userData));
                if (response.userData.profileImage) {
                  localStorage.setItem('profileImage', response.userData.profileImage);
                } else {
                  localStorage.setItem('profileImage', 'assets/default-profile.png');
                }
              }
              
              this.successMessage = 'Password reset successfully! Redirecting to dashboard...';
              setTimeout(() => {
                this.navigateBasedOnRole();
                this.closeModal();
              }, 2000);
            } else {
              // Always redirect to dashboard even if no token
              this.successMessage = 'Password reset successfully! Redirecting to dashboard...';
              setTimeout(() => {
                this.router.navigate(['/dashboard']);
                this.closeModal();
              }, 2000);
            }
          },
          error: (err) => {
            this.isLoading = false;
            console.error('Reset password error:', err);
            
            if (err.error?.message) {
              this.errorMessage = err.error.message;
            } else if (err.error?.errors?.OTP?.[0]) {
              this.errorMessage = err.error.errors.OTP[0];
            } else {
              this.errorMessage = 'Failed to reset password. Please check your verification code and try again.';
            }
          }
        });
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Email verification error:', err);
        this.errorMessage = 'Invalid verification code. Please check and try again.';
      }
    });
  }

  closeModal(): void {
    this.closeModalEvent.emit();
  }
  
  // Navigate based on user role
  private navigateBasedOnRole(): void {
    const userDataStr = localStorage.getItem('userData');
    if (!userDataStr) {
      this.router.navigate(['/login']);
      return;
    }
    
    const userData = JSON.parse(userDataStr);
    const userRole = userData?.roleId;
    
    switch (userRole) {
      case 1: // Admin
      case 2: // Employee
      case 4: // Super Admin
        this.router.navigate(['/dashboard']);
        break;
      case 3: // User
        this.router.navigate(['/home']);
        break;
      default:
        this.router.navigate(['/home']);
        break;
    }
  }
}