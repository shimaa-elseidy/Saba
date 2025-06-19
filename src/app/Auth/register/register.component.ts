import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  FormsModule,
} from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/Auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterLink } from '@angular/router';



@Component({
  selector: 'app-register',
  providers: [HttpClient],
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, FormsModule , CommonModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent  implements OnInit {
// Form properties
  imagePreview!: string;
  registerForm: FormGroup;
  showOtpModal: boolean = false;
  otp: string = '';
  selectedFile: File | null = null;
  loading: boolean = false;
  errorMessage: string | null = null;
  emailsFromAPI: string[] = [];

  // Dependency injection
  private fb = inject(FormBuilder);
  showPassword = false;
  showConfirmPassword = false;
  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
  ) {
    this.initializeForm();
  }

  ngOnInit(): void 
  {
    this.authService.getEmails().subscribe({
      next:(res:string[])=>{
        this.emailsFromAPI = res;
        this.emailsFromAPI = res.map(email => email.toLowerCase());
      }
    })
  }

  emailValidation(control: AbstractControl): ValidationErrors | null {
    const email = (control.value || '').toLowerCase();
    
  const exists = this.emailsFromAPI.some(apiEmail => apiEmail.toLowerCase() === email);
      if (exists) {
    return { emailExists: true };
  }
  return null;
}
  /**
   * Initialize the reactive form with validation rules
   */
  
  private initializeForm(): void {
    this.registerForm = this.fb.group(
      {
        userID: [''],
        name: ['', [Validators.required, Validators.minLength(3)]],
        lastName: ['', [Validators.required, Validators.minLength(3)]],
        username: ['', [Validators.required, Validators.minLength(3) , this.firstLetterCapital , this.usernamePatternValidator]],
        gender: ['', Validators.required],
        birthDate: ['', [Validators.required]],
        phone: [
          '',
          [
            Validators.required,
            Validators.pattern(/^\+?(\d{1,3})?[-.\s]?(\(?\d{1,4}\)?[-.\s]?)?[\d\-.\s]{7,15}$/),
          ],
        ],
        country: ['', [ Validators.required , Validators.minLength(3) , Validators.pattern(/^[a-zA-Z\u0600-\u06FF\s]+$/)] ],
        location: ['', [ Validators.required , Validators.minLength(3) , Validators.pattern(/^[a-zA-Z\u0600-\u06FF\s]+$/)]],
        email: ['', [Validators.required, Validators.email , this.emailValidation.bind(this)]],// ! async validator 
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.pattern(
              /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
            ),
          ],
        ],
        confirmPassword: ['', Validators.required],
        profilePicture: [null],
      },
      { validators: this.passwordMatchValidator }
    );
  }


togglePassword() {
  this.showPassword = !this.showPassword;
}
usernamePatternValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  // Pattern: letters, numbers, and symbols . _ - only
  const pattern = /^[a-zA-Z0-9._-]+$/;
  
  if (!pattern.test(value)) {
    return { invalidUsernamePattern: true };
  }

  return null;
}
toggleConfirmPassword() {
  this.showConfirmPassword = !this.showConfirmPassword;
}
  get f() {
    return this.registerForm.controls;
  }

  /**
   * Custom validator to check if passwords match
   */
// Custom validator function
passwordMatchValidator(formGroup: AbstractControl): ValidationErrors | null {
  const password = formGroup.get('password')?.value;
  const confirmPassword = formGroup.get('confirmPassword')?.value;
  
  if (password !== confirmPassword) {
    // Set error on confirmPassword control
    formGroup.get('confirmPassword')?.setErrors({ mismatch: true });
    return { mismatch: true };
  } else {
    // Clear mismatch error if passwords match
    const confirmPasswordControl = formGroup.get('confirmPassword');
    if (confirmPasswordControl?.errors?.['mismatch']) {
      delete confirmPasswordControl.errors['mismatch'];
      if (Object.keys(confirmPasswordControl.errors).length === 0) {
        confirmPasswordControl.setErrors(null);
      }
    }
    return null;
  }
}

//?
firstLetterCapital(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  const firstChar = value.charAt(0);
  if (firstChar !== firstChar.toUpperCase()) {
    return { firstLetterNotCapital: true };
  }

  return null;
}
  /**
   * Handle file selection for profile picture
   */
  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.toastr.error('Please select a valid image file', 'Invalid File');
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        this.toastr.error('File size should not exceed 5MB', 'File Too Large');
        return;
      }

      this.selectedFile = file;
      this.registerForm.patchValue({ profilePicture: file });

      // Create image preview
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
removeImage(): void {
  this.selectedFile = null;
  this.imagePreview = null;
  this.registerForm.patchValue({ profilePicture: null });
  
  // Reset the file input
  const fileInput = document.getElementById('profilePicture') as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';
  }
}
  /**
   * Handle form submission
   */
  onSubmit(): void {
    // Mark all fields as touched to show validation errors
    this.markFormGroupTouched(this.registerForm);

    if (this.registerForm.invalid) {
      this.toastr.error('Please fill in all required fields correctly', 'Validation Error');
      this.scrollToFirstError();
      return;
    }
    // this.loadingService.show();
    this.errorMessage = null;

    const userID = this.registerForm.get('userID')?.value || this.generateUUID();
    const birthDateValue = this.registerForm.get('birthDate')?.value;
    let formattedBirthDate = null;

    if (birthDateValue) {
      if (typeof birthDateValue === 'string' && birthDateValue.trim() !== '') {
        formattedBirthDate = birthDateValue; // Already in YYYY-MM-DD format
      }
    }

    const registrationData = {
      userID: userID,
      name: this.registerForm.get('name')?.value || '',
      lastName: this.registerForm.get('lastName')?.value || '',
      username: this.registerForm.get('username')?.value || '',
      gender: this.registerForm.get('gender')?.value || '',
      country: this.registerForm.get('country')?.value || '',
      birthDate: formattedBirthDate,
      phone: this.registerForm.get('phone')?.value || '',
      location: this.registerForm.get('location')?.value || '',
      email: this.registerForm.get('email')?.value || '',
      password: this.registerForm.get('password')?.value || '',
      confirmPassword: this.registerForm.get('confirmPassword')?.value || '',
      profilePicture: '',
      model: {}
    };

    console.log('Registration data to be sent:', registrationData);

    // Process registration with or without profile picture
    if (this.selectedFile) {
      this.processRegistrationWithImage(registrationData);
    } else {
      this.processRegistration(registrationData);
    }
  }

  /**
   * Process registration with profile image
   */
  private processRegistrationWithImage(registrationData: any): void {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const result = e.target?.result as string;
      registrationData.profilePicture = result.split(',')[1]; // Remove data:image/jpeg;base64, prefix
      this.processRegistration(registrationData);
    };
    reader.onerror = () => {
      this.toastr.error('Error reading profile picture', 'File Error');
      // this.loadingService.hide();
    };
    reader.readAsDataURL(this.selectedFile!);
  }

  /**
   * Process registration API call
   */
  private processRegistration(registrationData: any): void {
    // Store user data locally for potential use
    const localUserData = {
      name: registrationData.name,
      lastName: registrationData.lastName,
      username: registrationData.username,
      gender: registrationData.gender,
      country: registrationData.country,
      birthDate: registrationData.birthDate,
      phone: registrationData.phone,
      location: registrationData.location,
      email: registrationData.email
    };
    localStorage.setItem('userData', JSON.stringify(localUserData));

    this.authService.register(registrationData).subscribe({
      next: (response) => {
        this.toastr.success(response.message || 'Registration successful!', 'Success');
        // this.loadingService.hide();

        this.openOtpModal();
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.handleRegistrationError(error);
        // this.loadingService.hide();

      },
    });
  }

  /**
   * Handle registration errors
   */
  onReset() {
  // Reset the form
  this.registerForm.reset();
    // Reset all form controls to their pristine state
  Object.keys(this.registerForm.controls).forEach(key => {
    const control = this.registerForm.get(key);
    control?.markAsUntouched();
    control?.markAsPristine();
    control?.updateValueAndValidity();
  });

  // Reset the image preview and selected file
  this.imagePreview = null;
  this.selectedFile = null;
  
  // Reset password visibility
  this.showPassword = false;
  this.showConfirmPassword = false;

}
  private handleRegistrationError(error: any): void {
  console.error('Backend Error:', error); // Log the error for debugging

  // Extract the error message from the backend response
  const errorMessage = error.error?.message || 'Registration failed. Please try again.';

  // Display the error message in the red toaster
  this.toastr.error(errorMessage, 'Registration Error');
}

  /**
   * Generate UUID for user ID
   */
  generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Verify OTP
   */
  verifyOtp(): void {
    if (!this.otp || this.otp.trim().length === 0) {
      this.toastr.error('Please enter the OTP code', 'OTP Required');
      return;
    }

    if (this.otp.length !== 6) {
      this.toastr.error('OTP must be 6 digits', 'Invalid OTP');
      return;
    }

    const email = this.registerForm.get('email')?.value;
    
    this.authService.verifyOtp(email, this.otp).subscribe({
      next: (response) => {
        this.toastr.success('Email verified successfully!', 'Success');
        this.closeOtpModal();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('OTP verification error:', err);
        const errorMessage = err.error?.message || 'Invalid OTP. Please try again.';
        this.toastr.error(errorMessage, 'Verification Failed');
      },
    });
  }

  /**
   * Resend OTP
   */
  resendOtp(): void {
    const email = this.registerForm.get('email')?.value;
    
    if (!email) {
      this.toastr.error('Email is required to resend OTP', 'Email Missing');
      return;
    }

    this.authService.resendOtp(email).subscribe({
      next: (response) => {
        this.toastr.success('OTP resent successfully!', 'Success');
        this.toastr.info('We’ve sent you a new code – please check your inbox (and spam folder just in case) ', 'Check Email');
        this.otp = ''; // Clear existing OTP
      },
      error: (err) => {
        console.error('Resend OTP error:', err);
        const errorMessage = err.error?.message || 'Failed to resend OTP. Please try again.';
        this.toastr.error(errorMessage, 'Resend Failed');
      },
    });
  }

  /**
   * Open OTP modal
   */
  openOtpModal(): void {
    this.showOtpModal = true;
    this.otp = '';
    
    // Focus on OTP input after modal opens
    setTimeout(() => {
      const otpInput = document.querySelector('.otp-input') as HTMLInputElement;
      if (otpInput) {
        otpInput.focus();
      }
    }, 500);
  }

  /**
   * Close OTP modal
   */
  closeOtpModal(): void {
    this.showOtpModal = false;
    this.otp = '';
  }

  /**
   * Mark all form controls as touched to show validation errors
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Scroll to first error field
   */
  private scrollToFirstError(): void {
    setTimeout(() => {
      const firstError = document.querySelector('.form-input.error');
      if (firstError) {
        firstError.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 100);
  }

  /**
   * Handle keyboard events for better UX
   */
  onKeyDown(event: KeyboardEvent): void {
    // Handle Enter key in OTP input
    if (event.key === 'Enter' && this.showOtpModal) {
      this.verifyOtp();
    }

    // Handle Escape key to close modal
    if (event.key === 'Escape' && this.showOtpModal) {
      this.closeOtpModal();
    }
  }

  /**
   * Format phone number input (optional enhancement)
   */
  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove non-digits
    
    // Format based on length (simple example)
    if (value.length >= 6) {
      value = value.replace(/(\d{3})(\d{3})(\d+)/, '$1-$2-$3');
    } else if (value.length >= 3) {
      value = value.replace(/(\d{3})(\d+)/, '$1-$2');
    }
    
    input.value = value;
    this.registerForm.get('phone')?.setValue(value);
  }

  /**
   * Component cleanup
   */
  ngOnDestroy(): void {
    // Clean up any subscriptions or resources if needed
    if (this.selectedFile) {
      this.selectedFile = null;
    }
    
    if (this.imagePreview) {
      this.imagePreview = '';
    }
  }
}