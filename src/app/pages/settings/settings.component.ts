import {
  CommonModule,
  NgFor,
  NgIf,
  NgSwitch,
  NgSwitchCase,
} from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { SettingService } from '../../services/setting/setting.service';
import { AuthService } from '../../services/Auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { tap } from 'rxjs';

@Component({
  selector: 'app-settings',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgFor,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    MatFormFieldModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  editProfileForm!: FormGroup;
  activeTab: string = localStorage.getItem('activeTab') || 'Edit Profile';

  user = {
    profileImage: localStorage.getItem('profileImage'),
    
  };
  selectedImage: string | null = null; // تخزين الصورة مؤقتًا عند التغيير

  currencies: string[] = ['USD', 'EUR', 'GBP', 'JPY', 'SAR', 'AED'];
  timeZones: string[] = [
    '(GMT-12:00) International Date Line West',
    '(GMT-11:00) Midway Island, Samoa',
    '(GMT-10:00) Hawaii',
    '(GMT-09:00) Alaska',
    '(GMT-08:00) Pacific Time (US & Canada)',
    '(GMT-07:00) Mountain Time (US & Canada)',
    '(GMT-06:00) Central Time (US & Canada)',
    '(GMT-05:00) Eastern Time (US & Canada)',
  ];

  formFields = [
    { key: 'name', label: 'Your Name', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'dateOfBirth', label: 'Date Of Birth', type: 'date' },
    { key: 'location', label: 'location', type: 'text' },
    { key: 'country', label: 'Country', type: 'text' },
  ];

  preferencesForm!: FormGroup;

  securityForm: FormGroup;

  sendReceiveCurrency!: boolean;
  notificationOptions = [
    { key: 'sendReceiveCurrency', label: 'I send or receive digital currency' },
    { key: 'merchantOrder', label: 'I receive merchant order' },
    {
      key: 'accountRecommendation',
      label: 'There are recommendations for my account',
    },
  ];

  constructor(
    private fb: FormBuilder,
    private settingService: SettingService,
    private authService: AuthService,
    private toostr: ToastrService
  ) {
    this.activeTab = this.settingService.getActiveTab();
    this.user.profileImage = this.settingService.getProfileImage();
    this.user.profileImage =
      localStorage.getItem('profileImage') ||
      this.settingService.getProfileImage();

    this.editProfileForm = this.fb.group({
      profileImage: [this.user.profileImage],

      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      dateOfBirth: ['', Validators.required],
      location: ['', Validators.required],
      country: ['', Validators.required],
    });

    this.preferencesForm = this.fb.group({
      currency: ['USD', Validators.required],
      timeZone: [
        '(GMT-12:00) International Date Line West',
        Validators.required,
      ],
      sendReceiveCurrency: [true],
      merchantOrder: [false],
      accountRecommendation: [true],
    });

    this.securityForm = this.fb.group({
      OldPassword: ['', [Validators.required, Validators.minLength(6)]],
      NewPassword: ['', [Validators.required, Validators.minLength(6)]],
      ConfirmNewPassword: ['', [Validators.required, Validators.minLength(6)]],
    },
  
    { validators: this.passwordsMatchValidator });
  }

   passwordsMatchValidator: ValidatorFn = (
      form: AbstractControl
    ): ValidationErrors | null => {
      const password = form.get('NewPassword')?.value;
      const confirmPassword = form.get('ConfirmNewPassword')?.value;
      return password && confirmPassword && password === confirmPassword
        ? null
        : { mismatch: true };
    };
  


  changeTab(tab: string) {
    this.activeTab = tab;
    this.settingService.setActiveTab(tab);
  }

  editProfileSetting() {
    if (this.editProfileForm.valid) {
      console.log('Form Data:', this.editProfileForm.value);
  
      // تحديث الصورة في الخدمة و localStorage
      if (this.selectedImage) {
        this.user.profileImage = this.selectedImage;
        this.settingService.setProfileImage(this.selectedImage);
        localStorage.setItem('profileImage', this.selectedImage);
      }
  
      // استدعاء دالة التحديث
      this.updateProfile();
    } else {
      console.log('Form is invalid');
    }
  }
  onProfileImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.selectedImage = e.target.result;
        this.editProfileForm.patchValue({ profileImage: this.selectedImage });

        console.log(this.editProfileForm.value);
      };

      reader.readAsDataURL(file);
    }
  }

  savePreferences() {
    if (this.preferencesForm.valid) {
      console.log('Preferences Saved:', this.preferencesForm.value);
    } else {
      console.log('Preferences form is invalid');
    }
  }

  saveSecuritySettings() {
    if (this.securityForm.valid) {
      const { OldPassword, NewPassword, ConfirmNewPassword } = this.securityForm.value;

      if (NewPassword !== ConfirmNewPassword) {
        this.toostr.error('New password and confirm password do not match!', 'Error');
        return;
      }
      console.log('Form Data:', this.securityForm.value);

      this.authService.changePassword(OldPassword, NewPassword, ConfirmNewPassword).subscribe({
        next: (response) => {
          this.toostr.success('Password changed successfully!', 'Success');
        },
        error: (error) => {
          this.toostr.error('Failed to change password!', 'Error');          
        },
      });
    }
  }

  updateProfile() {
    // Create an object that matches the expected API format
    const userData = {
      name: this.editProfileForm.get('name')?.value,
      birthDate: this.editProfileForm.get('dateOfBirth')?.value,
      phone: "", // Add this field if available in your form
      location: this.editProfileForm.get('location')?.value,
      email: this.editProfileForm.get('email')?.value,
      password: "", // Add if needed
      confirmPassword: "", // Add if needed
      profilePicture: this.selectedImage || this.user.profileImage
    };
  
    this.authService
      .updateProfile(userData)
      .pipe(
        tap({
          next: (response) => {
            this.toostr.success('Profile updated successfully!', 'Success');
            console.log(response);
          },
          error: (error) => {
            this.toostr.error('Error updating profile', 'Error');
            console.error('Update error:', error);
          },
        })
      )
      .subscribe();
  }
}
