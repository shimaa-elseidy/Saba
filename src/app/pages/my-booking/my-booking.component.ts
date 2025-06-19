import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BookingService } from '../../services/Booking/booking.service';

@Component({
    selector: 'app-my-booking',
    standalone:true,
    imports: [NgClass,NgIf, NgStyle, NgFor, RouterModule],
    templateUrl: './my-booking.component.html',
    styleUrl: './my-booking.component.scss'
})
export class MyBookingComponent implements OnInit {

  private bookingService = inject(BookingService);

  filters: string[] = ['Paid', 'Canceled', 'Deleted', 'Pending'];  // إضافة Pending في الفلاتر

  booking: any[] = [];
  filteredBooking: any[] = [];  // متغير لتخزين الحجوزات بعد الفلترة
  currentFilter: string = 'Paid';  // متغير لتخزين الفلتر الحالي

  ngOnInit(): void {
    this.loadBookings();  
  }

  loadBookings(): void {
    this.bookingService.getBookings().subscribe({
      next: (data: any[]) => {
        this.booking = data; 

        this.filter(this.currentFilter);   
      },
      error: (error) => {
      }
    });
  }

  // تحديث طريقة الفلترة لتعمل بشكل ديناميكي  // تحديث طريقة الفلترة لتعمل بشكل ديناميكي
  filter(type: string): void {
    this.currentFilter = type;  // تحديث الفلتر الحالي
    if (type === 'All') {
      this.filteredBooking = this.booking;  // عرض جميع الحجوزات
    } else {
      this.filteredBooking = this.booking.filter(book => book.status === type);
    }
  }
  acceptTour(tour: any): void {
    console.log('Tour Accepted:', tour);
  }

  cancelTour(tour: any): void {
    console.log('Tour Canceled:', tour);
  }

  deleteTour(tour: any): void {
    console.log('Tour Deleted:', tour);
  }

  getCount(status: string): number {
    return this.booking.filter(book => book.status === status).length;
  }
}
