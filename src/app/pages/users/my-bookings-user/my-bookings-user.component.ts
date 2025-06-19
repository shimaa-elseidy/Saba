import { Component } from '@angular/core';
import { AuthService } from '../../../services/Auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-my-bookings-user',
  standalone:true,
  imports: [NgClass,NgIf,NgFor,NgStyle,RouterModule],
  templateUrl: './my-bookings-user.component.html',
  styleUrl: './my-bookings-user.component.scss'
})
export class MyBookingsUserComponent {

  bookings: any[] = [];
  isLoading = true;
  filters: string[] = ['Paid', 'Canceled', 'Deleted', 'Pending'];  // إضافة Pending في الفلاتر
  filteredBooking: any[] = [];  // متغير لتخزين الحجوزات بعد الفلترة
  currentFilter: string = 'Paid';  // متغير لتخزين الفلتر الحالي

    constructor(
      private authService: AuthService,
      private toastr: ToastrService
    ) {}
  ngOnInit(): void {
    this.loadBookings();  

  
  }

  loadBookings():void{
    this.authService.fetchBooking().subscribe({
      next: (data) => {
        this.bookings = data; // Assuming `data` is the list of wallets
        console.log(this.bookings);


        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error('Error fetching Wallet', 'Error');
        this.isLoading = false;
      },
    });
  }

  filter(type: string): void {
    this.currentFilter = type;  // تحديث الفلتر الحالي
    if (type === 'All') {
      this.filteredBooking = this.bookings;  // عرض جميع الحجوزات
    } else {
      this.filteredBooking = this.bookings.filter(book => book.status === type);
    }
  }
  
  getCount(status: string): number {
    return this.bookings.filter(book => book.status === status).length;
  }

}
