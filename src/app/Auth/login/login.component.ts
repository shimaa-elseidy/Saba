import { AuthService } from './../../services/Auth/auth.service';
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ForgotPasswordModalComponent } from '../forgot-password-modal/forgot-password-modal.component';
import { MatDialog } from '@angular/material/dialog'; // Ensure Angular Material is installed
import { ResetPasswordModalComponent } from '../reset-password-modal/reset-password-modal.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, RouterLink, ForgotPasswordModalComponent, ResetPasswordModalComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  errMsg: string = '';
  SuccessMsg: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;
  emailsFromAPI: string[] = [];
  
  isForgotModalVisible = false; // Controls Forgot Password Modal visibility
  isResetModalVisible = false; // Controls Reset Password Modal visibility
  emailForReset = ''; // Stores email for Reset Password Modal

  private readonly fb = inject(FormBuilder);
  private readonly _authService = inject(AuthService);
  private readonly _Router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef); // إضافة Change Detector
  private readonly dialog = inject(MatDialog);

  // تصحيح الـ email validation - المفروض يسمح بالـ emails الموجودة في الـ API
  emailValidation = (control: AbstractControl): ValidationErrors | null => {
    const email = (control.value || '').toLowerCase().trim();
    
    // إذا مفيش email أو الـ API emails لسه مجتش
    if (!email || this.emailsFromAPI.length === 0) {
      return null;
    }
    
    // تحقق إذا الـ email موجود في الـ API (للـ login لازم يكون موجود)
    const exists = this.emailsFromAPI.some(apiEmail => apiEmail.toLowerCase() === email);
    
    // إذا مش موجود، يبقى في مشكلة
    if (!exists) {
      return { emailNotFound: true };
    }
    
    return null;
  }

  // Form initialization - بدون email validation للـ login
  LogInForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]], // basic validation بس
    password: ['', [Validators.required]], // basic validation بس
  });

  ngOnInit(): void {
    // جلب الـ emails من الـ API
    this._authService.getEmails().subscribe({
      next: (res: string[]) => {
        this.emailsFromAPI = res.map(email => email.toLowerCase());
        console.log('Emails loaded:', this.emailsFromAPI.length);
        
        // إعادة validation للـ email field بعد جلب البيانات
        const emailControl = this.LogInForm.get('email');
        if (emailControl?.value) {
          emailControl.updateValueAndValidity();
        }
        
        // تحديث الـ UI
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading emails:', error);
        // في حالة فشل جلب الـ emails، نشيل الـ validation
        const emailControl = this.LogInForm.get('email');
        emailControl?.setValidators([Validators.required, Validators.email]);
        emailControl?.updateValueAndValidity();
      }
    });

    // Check if user is already logged in
    if (this._authService.isLoggedIn()) {
      this.navigateBasedOnRole();
      return;
    }

    // Add animations
    setTimeout(() => {
      const elements = document.querySelectorAll('.fade-in, .slide-up');
      elements.forEach(el => el.classList.add('animate'));
    }, 100);

    // إضافة listeners للـ form changes
    this.setupFormListeners();
  }

  // إعداد listeners للـ form
  private setupFormListeners(): void {
    // Listen لتغييرات الـ form
    this.LogInForm.valueChanges.subscribe(() => {
      // مسح الرسائل عند تغيير القيم
      if (this.errMsg) {
        this.errMsg = '';
      }
      this.cdr.detectChanges();
    });

    // Listen لتغييرات الـ status
    this.LogInForm.statusChanges.subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  // Toggle password visibility
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Form submission
  onSubmit(): void {
    this.errMsg = '';
    this.SuccessMsg = '';

    if (this.LogInForm.invalid) {
      this.LogInForm.markAllAsTouched();
      this.errMsg = 'Please fill in all required fields correctly.';
      this.hideMessageAfterDelay('error');
      return;
    }

    this.isLoading = true;
    this.showLoadingSpinner(true);

    const loginData = {
      email: this.LogInForm.get('email')?.value?.trim(),
      password: this.LogInForm.get('password')?.value
    };

    // Check if user just reset their password
    const passwordReset = localStorage.getItem('passwordReset') === 'true';
    if (passwordReset) {
      localStorage.removeItem('passwordReset');
    }

    // Debug logs for login payload
    console.log('--- LOGIN DEBUG ---');
    console.log('Email sent to backend: [' + loginData.email + ']');
    console.log('Password sent to backend: [' + loginData.password + ']');
    console.log('Emails from API:', this.emailsFromAPI);
    console.log('Password Reset:', passwordReset);
    console.log('-------------------');

    this._authService.login(loginData.email, loginData.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.showLoadingSpinner(false);
        console.log('Login successful:', response);
        if (response?.token) {
        this.SuccessMsg = response.message || 'Login successful! Welcome back.';
        setTimeout(() => {
          this.SuccessMsg = '';
          this.navigateBasedOnRole();
        }, 1500);
      } else {
        this.errMsg = response?.message || 'Login failed. Please try again.';
        this.hideMessageAfterDelay('error');
      }
      },
      error: (error) => {
        this.isLoading = false;
        this.showLoadingSpinner(false);
        
        // Debug logs for backend error
        console.error('--- LOGIN ERROR DEBUG ---');
        console.error('Error object:', error);
        if (error.error) {
          console.error('Error.error:', error.error);
        }
        if (error.status) {
          console.error('Error.status:', error.status);
        }
        if (error.statusText) {
          console.error('Error.statusText:', error.statusText);
        }
        if (error.message) {
          console.error('Error.message:', error.message);
        }
        console.error('-------------------------');
        
        // Check if this is a "verify email" error after password reset
        if (error.error?.message === "Please verify your email before logging in!" && 
            localStorage.getItem('passwordReset') === 'true') {
          // If user just reset password, try to auto-verify
          this.verifyAfterReset(this.LogInForm.get('email')?.value?.trim());
          return;
        }
        
        // تحسين رسالة الخطأ
        if (error.status === 401 || error.status === 400) {
          this.errMsg = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.error?.message) {
          this.errMsg = error.error.message;
        } else {
          this.errMsg = error.message || 'Login failed. Please try again.';
        }
        
        this.hideMessageAfterDelay('error');
      }
    });
  }

  private navigateBasedOnRole(): void {
    const userRole = this._authService.getUserRole();
    
    console.log('Navigating based on role:', userRole);
    
    switch (userRole) {
    case 1: // Admin
    case 2: // Employee
    case 4: // Super Admin
      this._Router.navigate(['/dashboard']);
      break;
    case 3: // User
      this._Router.navigate(['/home']);
      break;
    default:
      this._Router.navigate(['/home']);
      break;
    }
  }

  private showLoadingSpinner(show: boolean): void {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
      if (show) {
        spinner.classList.remove('hidden');
        spinner.style.display = 'block';
      } else {
        spinner.classList.add('hidden');
        spinner.style.display = 'none';
      }
    }
  }

  private hideMessageAfterDelay(type: 'error' | 'success'): void {
    const delay = type === 'error' ? 5000 : 3000;
    setTimeout(() => {
      if (type === 'error') {
        this.errMsg = '';
      } else {
        this.SuccessMsg = '';
      }
      this.cdr.detectChanges();
    }, delay);
  }

  resetForm(): void {
    this.LogInForm.reset();
    this.errMsg = '';
    this.SuccessMsg = '';
    this.showPassword = false;
  }

  // تحديث error messages - بدون emailNotFound
  getFieldError(fieldName: string): string {
    const field = this.LogInForm.get(fieldName);
    if (field?.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be less than ${field.errors['maxlength'].requiredLength} characters`;
      }
      if (field.errors['pattern']) {
        if (fieldName === 'password') {
          return 'Password must contain at least 1 uppercase letter, 1 number, and 1 special character';
        }
        return 'Invalid format';
      }
    }
    return '';
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.LogInForm.get(fieldName);
    return !!(field?.errors && (field.dirty || field.touched));
  }

  // Method لفحص إذا الـ form valid
  get isFormValid(): boolean {
    return this.LogInForm.valid;
  }

  loginWithGoogle(): void {
    console.log('Google login clicked - implement OAuth flow');
    this.errMsg = 'Google login is not implemented yet.';
    this.hideMessageAfterDelay('error');
  }

  loginWithFacebook(): void {
    console.log('Facebook login clicked - implement OAuth flow');
    this.errMsg = 'Facebook login is not implemented yet.';
    this.hideMessageAfterDelay('error');
  }

  navigateToSignup(): void {
    this._Router.navigate(['/register']);
  }

  navigateToForgotPassword(): void {
    this.isForgotModalVisible = true;
  }

  openResetModal(email: string): void {
    this.emailForReset = email;
    this.isForgotModalVisible = false;
    this.isResetModalVisible = true;
  }

  closeForgotModal(): void {
    this.isForgotModalVisible = false;
  }

  closeResetModal(): void {
    this.isResetModalVisible = false;
  }
  
  // Helper method to handle verification after password reset
  verifyAfterReset(email: string): void {
    if (!email) return;
    
    this.isLoading = true;
    this.showLoadingSpinner(true);
    
    // Clear the password reset flag
    localStorage.removeItem('passwordReset');
    
    // Get the most recent OTP from localStorage (saved during reset)
    const resetOtp = localStorage.getItem('resetOtp');
    if (!resetOtp) {
      this.errMsg = 'Please verify your email before logging in.';
      this.isLoading = false;
      this.showLoadingSpinner(false);
      return;
    }
    
    // Try to verify the email with the OTP
    this._authService.verifyOtp(email, resetOtp).subscribe({
      next: () => {
        // After verification, try logging in again
        const password = this.LogInForm.get('password')?.value;
        this._authService.login(email, password).subscribe({
          next: (response) => {
            this.isLoading = false;
            this.showLoadingSpinner(false);
            if (response?.token) {
              this.SuccessMsg = 'Login successful! Welcome back.';
              setTimeout(() => {
                this.SuccessMsg = '';
                this.navigateBasedOnRole();
              }, 1500);
            }
          },
          error: () => {
            this.isLoading = false;
            this.showLoadingSpinner(false);
            this.errMsg = 'Login failed after verification. Please try again.';
            this.hideMessageAfterDelay('error');
          }
        });
      },
      error: () => {
        this.isLoading = false;
        this.showLoadingSpinner(false);
        this.errMsg = 'Please verify your email before logging in.';
        this.hideMessageAfterDelay('error');
      }
    });
  }
}