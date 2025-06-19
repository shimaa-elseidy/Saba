import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  getBookings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/TourBooking/get-bookings`);
  }
  

  // bookTour(bookingData: any): Observable<any> {
  //   const token = localStorage.getItem('token');
  //   const headers = new HttpHeaders({
  //     'Authorization': `Bearer ${token}`
  //   });

  //   // هنا نقوم بإرسال البيانات مع معلومات الحجز بالعربون
  //   return this.http.post(`${this.apiUrl}/TourBooking/book`, bookingData, { headers });
  // }
}
