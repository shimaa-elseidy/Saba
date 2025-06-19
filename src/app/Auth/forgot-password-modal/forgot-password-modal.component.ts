import { Component, inject, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/Auth/auth.service';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-forgot-password-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './forgot-password-modal.component.html',
  styleUrls: ['./forgot-password-modal.component.scss'],
  animations: [
    // Fade animation for modal overlay
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    
    // Form animation based on validity
    trigger('formAnimation', [
      state('valid', style({
        transform: 'translateY(0)'
      })),
      state('invalid', style({
        transform: 'translateY(0)'
      })),
      transition('invalid => valid', [
        animate('300ms ease-out', style({ transform: 'translateY(-5px)' })),
        animate('200ms ease-in', style({ transform: 'translateY(0)' }))
      ])
    ]),
    
    // Input field animation
    trigger('inputAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    
    // Error message animation
    trigger('errorAnimation', [
      transition(':enter', [
        style({ opacity: 0, height: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, height: '*', transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, height: 0, transform: 'translateY(-10px)' }))
      ])
    ]),
    
    // Button animation
    trigger('buttonAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('400ms 100ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    
    // Alert message animation
    trigger('messageAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(15px)' }))
      ])
    ])
  ]
})
export class ForgotPasswordModalComponent implements OnInit {
  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() openResetModalEvent = new EventEmitter<string>(); // Emit email for reset modal

  forgotPasswordForm: FormGroup;
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  emailPattern: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  constructor() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [
        Validators.required, 
        Validators.email,
        Validators.pattern(this.emailPattern)
      ]]
    });
  }

  ngOnInit(): void {
    // Focus on email input when modal opens
    setTimeout(() => {
      const emailInput = document.getElementById('email') as HTMLInputElement;
      if (emailInput) {
        emailInput.focus();
      }
    }, 300);
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const email = this.forgotPasswordForm.get('email')?.value.trim();

    // First check if the email exists in the system
    this.authService.getEmails().subscribe({
      next: (emails: string[]) => {
        const emailExists = emails.some(apiEmail => apiEmail.toLowerCase() === email.toLowerCase());
        
        if (!emailExists) {
          this.isLoading = false;
          this.errorMessage = 'Email not found. Please check your email and try again.';
          this.shakeInputField('email');
          return;
        }

        // If email exists, send the forgot password request
        this.authService.forgotPassword(email).subscribe({
          next: (response) => {
            this.isLoading = false;
            this.successMessage = 'Verification code sent to your email successfully!';
            
            // Wait a moment before opening the reset modal
            setTimeout(() => {
              this.openResetModalEvent.emit(email);
            }, 2000);
          },
          error: (err) => {
            this.isLoading = false;
            console.error('Forgot password error:', err);
            
            if (err.error?.message) {
              this.errorMessage = err.error.message;
            } else {
              this.errorMessage = 'Failed to send verification code. Please try again.';
            }
            this.shakeInputField('email');
          }
        });
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Email validation error:', err);
        this.errorMessage = 'Failed to validate email. Please try again.';
      }
    });
  }

  /**
   * Apply a shake animation to an input field to indicate error
   */
  private shakeInputField(inputId: string): void {
    const inputElement = document.getElementById(inputId) as HTMLInputElement;
    if (inputElement) {
      inputElement.classList.add('input-error');
      // Remove the class after animation completes
      setTimeout(() => {
        inputElement.classList.remove('input-error');
      }, 500);
    }
  }

  closeModal(): void {
    this.closeModalEvent.emit();
  }
}