import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent {
  email: string = 'info@sabatours.com';
  phoneNumber: string = '201000676285';

  contactForm: FormGroup;
  apiUrl = 'https://sabatoursapi.runasp.net/api/ContactMessages';
  
  // Sources options for the dropdown
  sourcesOptions = [
    { value: '', label: 'How did you find us?' },
    { value: 'Google', label: 'Google Search' },
    { value: 'Social Media', label: 'Social Media' },
    { value: 'Friend', label: 'Friend Recommendation' },
    { value: 'Advertisement', label: 'Advertisement' },
    { value: 'Travel Agency', label: 'Travel Agency' },
    { value: 'Other', label: 'Other' }
  ];

  constructor(private fb: FormBuilder, private http: HttpClient, private toastr: ToastrService) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      country: ['', Validators.required],
      source: ['', Validators.required], // Will be a select dropdown now
      message: ['', Validators.required]
    });
  }

  callPhone() {
    window.location.href = `tel:${this.phoneNumber}`;
  }

  sendEmail() {
    window.location.href = `mailto:${this.email}`;
  }
  submitForm() {
    if (this.contactForm.valid) {
      // Prepare data for submission
      const formData = {
        name: this.contactForm.value.name,
        email: this.contactForm.value.email,
        phone: this.contactForm.value.phone,
        country: this.contactForm.value.country,
        howDidYouFindUs: this.contactForm.value.source,
        message: this.contactForm.value.message
      };

      // Send data to API
      this.http.post(this.apiUrl, formData).subscribe({
        next: (response) => {
          this.toastr.success('Your message has been sent successfully!', 'Thank you');
          this.contactForm.reset();
        },
        error: (error) => {
          this.toastr.error('Failed to send your message. Please try again later.', 'Error');
        }
      });
    } else {
      this.contactForm.markAllAsTouched();
      this.toastr.warning('Please fill all required fields correctly.', 'Form Validation');
    }
  }
}