import { NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserManagementService } from '../../../services/userManagement/user-management.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-new-user',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './create-new-user.component.html',
  styleUrl: './create-new-user.component.scss'
})
export class CreateNewUserComponent {
  userForm: FormGroup;
  profilePicture: string = '../../../assets/avatar.jpg';
  serverErrors: any = {}; // Store server validation errors
  isSubmitting: boolean = false; // Track submission state
  
  // Options for dropdowns
  roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'user', label: 'User' }
  ];
  
  genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' }
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserManagementService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      // Required fields - Changed 'name' to 'username'
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      birthDate: ['', Validators.required],
      location: ['', Validators.required],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(\+\d{1,4})?[ -]?\d{1,15}$/), // Accepts international phone numbers with optional country code
        ],
      ],
      role: ['', Validators.required],
      gender: ['', Validators.required],
      
      // Optional fields
      firstName: [''],
      lastName: [''],
      city: [''],
      presentAddress: [''],
      
      // Boolean fields
      isEmailConfirmed: [false],
      memberStatus: [false],
      sendEmail: [false],
      
      // Profile picture
      profilePicture: [null]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onImageChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        this.toastr.error('Please select a valid image file (JPEG, PNG, or GIF)', 'Invalid File Type');
        return;
      }

      // Validate file size (max 2MB)
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        this.toastr.error('File size must be less than 2MB', 'File Too Large');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.profilePicture = reader.result as string;
        this.userForm.patchValue({
          profilePicture: this.profilePicture
        });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    // Clear previous server errors
    this.serverErrors = {};
    
    if (this.userForm.valid) {
      this.isSubmitting = true;
      const formValue = this.userForm.value;
      
      // Prepare payload with required fields - Changed 'name' to 'username'
      const payload = {
        username: formValue.username.trim(),
        email: formValue.email.trim().toLowerCase(),
        password: formValue.password,
        confirmPassword: formValue.confirmPassword,
        birthDate: new Date(formValue.birthDate).toISOString(),
        location: formValue.location.trim(),
        isEmailConfirmed: formValue.isEmailConfirmed,
        profilePicture: formValue.profilePicture,
        phone: formValue.phone.trim(),
        role: formValue.role,
        
        // Optional fields (only include if they have values)
        ...(formValue.firstName && { firstName: formValue.firstName.trim() }),
        ...(formValue.lastName && { lastName: formValue.lastName.trim() }),
        ...(formValue.gender && { gender: formValue.gender }),
        ...(formValue.city && { city: formValue.city.trim() }),
        ...(formValue.presentAddress && { presentAddress: formValue.presentAddress.trim() }),
        
        // Boolean flags
        memberStatus: formValue.memberStatus,
        sendEmail: formValue.sendEmail
      };

      this.userService.createUser(payload).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.toastr.success('User created successfully', 'Success!');
          this.onClose();
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error creating user:', error);
          this.handleServerErrors(error);
        }
      });
    } else {
      this.markFormGroupTouched();
      this.toastr.warning('Please fill in all required fields correctly.', 'Form Invalid');
    }
  }

  private handleServerErrors(error: any): void {
    if (error.status === 400 && error.error) {
      try {
        // Parse the error response
        let errorData = error.error;
        
        // If it's a string, try to parse it as JSON
        if (typeof errorData === 'string') {
          errorData = JSON.parse(errorData);
        }
        
        // Handle different error response formats
        if (errorData.errors) {
          // Handle validation errors format: { errors: { "Username": ["The Username field is required."] } }
          this.serverErrors = errorData.errors;
          
          // Show first error for each field
          Object.keys(this.serverErrors).forEach(field => {
            const fieldErrors = this.serverErrors[field];
            if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
              this.toastr.error(fieldErrors[0], `${field} Error`);
            }
          });
        } else if (errorData.title && errorData.status === 400) {
          // Handle general validation error
          this.toastr.error(errorData.title, 'Validation Error');
        } else {
          // Handle other error formats
          const errorMessage = errorData.message || errorData.title || 'Failed to create user';
          this.toastr.error(errorMessage, 'Error!');
        }
      } catch (parseError) {
        // If parsing fails, show generic error
        this.toastr.error('An error occurred while creating the user', 'Error!');
      }
    } else {
      // Handle other HTTP errors
      const errorMessage = error.error?.message || error.message || 'Failed to create user';
      this.toastr.error(errorMessage, 'Error!');
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
    });
  }

  onClose(): void {
    this.userForm.reset();
    this.profilePicture = '../../../assets/avatar.jpg';
    this.serverErrors = {}; // Clear server errors
    this.isSubmitting = false;
    this.router.navigate(['/dashboard/user-management']);
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched)) || this.hasServerError(fieldName);
  }

  hasServerError(fieldName: string): boolean {
    // Map form field names to potential server field names - Updated mappings
    const fieldMappings: { [key: string]: string[] } = {
      'username': ['Username', 'username', 'Name'], // Updated mapping
      'email': ['Email', 'EmailAddress', 'Email Address'],
      'password': ['Password'],
      'confirmPassword': ['ConfirmPassword', 'Confirm Password'],
      'phone': ['Phone', 'PhoneNumber', 'Phone Number'],
      'birthDate': ['BirthDate', 'Date of Birth', 'DateOfBirth'],
      'location': ['Location', 'Country'],
      'role': ['Role'],
      'gender': ['Gender'],
      'firstName': ['FirstName', 'First Name'],
      'lastName': ['LastName', 'Last Name'],
      'city': ['City'],
      'presentAddress': ['PresentAddress', 'Present Address', 'Address']
    };

    const possibleServerFields = fieldMappings[fieldName] || [fieldName];
    return possibleServerFields.some(serverField => this.serverErrors[serverField]);
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    
    // Check for server errors first - Updated mappings
    const fieldMappings: { [key: string]: string[] } = {
      'username': ['Username', 'username', 'Name'], // Updated mapping
      'email': ['Email', 'EmailAddress', 'Email Address'],
      'password': ['Password'],
      'confirmPassword': ['ConfirmPassword', 'Confirm Password'],
      'phone': ['Phone', 'PhoneNumber', 'Phone Number'],
      'birthDate': ['BirthDate', 'Date of Birth', 'DateOfBirth'],
      'location': ['Location', 'Country'],
      'role': ['Role'],
      'gender': ['Gender'],
      'firstName': ['FirstName', 'First Name'],
      'lastName': ['LastName', 'Last Name'],
      'city': ['City'],
      'presentAddress': ['PresentAddress', 'Present Address', 'Address']
    };

    const possibleServerFields = fieldMappings[fieldName] || [fieldName];
    for (const serverField of possibleServerFields) {
      if (this.serverErrors[serverField] && Array.isArray(this.serverErrors[serverField])) {
        return this.serverErrors[serverField][0]; // Return first server error
      }
    }
    
    // If no server errors, check client-side validation
    if (field?.errors) {
      if (field.errors['required']) return `${this.getFieldDisplayName(fieldName)} is required`;
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['minlength']) return `${this.getFieldDisplayName(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['pattern']) return 'Please enter a valid phone number (country code optional)';
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      'username': 'Username', // Updated from 'name'
      'email': 'Email',
      'password': 'Password',
      'confirmPassword': 'Confirm Password',
      'phone': 'Phone Number',
      'birthDate': 'Date of Birth',
      'location': 'Country',
      'role': 'Role',
      'gender': 'Gender',
      'firstName': 'First Name',
      'lastName': 'Last Name',
      'city': 'City',
      'presentAddress': 'Present Address'
    };
    return displayNames[fieldName] || fieldName;
  }

  getMaxDate(): string {
    // Set max date to 18 years ago for minimum age requirement
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return maxDate.toISOString().split('T')[0];
  }
}