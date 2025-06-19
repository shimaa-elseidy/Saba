import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { TourService, TravelRequest } from '../../services/Tours/tour.service';

@Component({
  selector: 'app-design-your-trip',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './design-your-trip.component.html',
  styleUrls: ['./design-your-trip.component.scss'],
  providers: [ToastrService]
})
export class DesignYourTripComponent implements OnInit {
  travelRequestForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private tourService: TourService,
    private toastr: ToastrService
  ) {
    this.travelRequestForm = this.fb.group({
      yourName: ['', Validators.required],
      emailAddress: ['', [Validators.required, Validators.email]],
      preferredDestination: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      numberOfAdults: [0, [Validators.required, Validators.min(0)]],
      numberOfChildren: [0, Validators.min(0)],
      numberOfInfants: [0, Validators.min(0)],
      hotelType: ['', Validators.required],
      desiredActivities: [''],
      specialRequests: [''],
      messages: [''],
      id: [0],
      createdAt: [new Date().toISOString()]
    });
  }

  ngOnInit(): void {
    this.ensureVideoIsMuted();
  }

  ensureVideoIsMuted(): void {
    const video = document.querySelector('.video-background video') as HTMLVideoElement;
    if (video) {
      video.muted = true;
      video.volume = 0;
      video.addEventListener('loadedmetadata', () => {
        video.muted = true;
        video.volume = 0;
      });
      video.addEventListener('volumechange', () => {
        if (!video.muted || video.volume > 0) {
          video.muted = true;
          video.volume = 0;
        }
      });
      try {
        const videoElement = video as any;
        if (videoElement.audioTracks && videoElement.audioTracks.length > 0) {
          for (let i = 0; i < videoElement.audioTracks.length; i++) {
            videoElement.audioTracks[i].enabled = false;
          }
        }
      } catch (e) {
        console.log('Cannot access audio tracks:', e);
      }
    }
  }

  onSubmit(): void {
    if (this.travelRequestForm.invalid) {
      this.travelRequestForm.markAllAsTouched();
      this.toastr.error('Please fill out all required fields correctly.', 'Error');
      return;
    }

    this.isSubmitting = true;
    const formData: TravelRequest = this.travelRequestForm.value;
    formData.startDate = new Date(formData.startDate).toISOString();
    formData.endDate = new Date(formData.endDate).toISOString();
    formData.createdAt = new Date().toISOString();

    this.tourService.submitTravelRequest(formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toastr.success('Travel request submitted successfully!', 'Success');
        this.travelRequestForm.reset({
          yourName: '',
          emailAddress: '',
          preferredDestination: '',
          startDate: '',
          endDate: '',
          numberOfAdults: 0,
          numberOfChildren: 0,
          numberOfInfants: 0,
          hotelType: '',
          desiredActivities: '',
          specialRequests: '',
          messages: '',
          id: 0,
          createdAt: new Date().toISOString()
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error submitting travel request:', err);
        if (err.message === 'Token not found') {
          this.toastr.error('Please log in to submit a travel request.', 'Unauthorized');
        } else {
          this.toastr.error('Failed to submit travel request.', 'Error');
        }
      }
    });
  }
}