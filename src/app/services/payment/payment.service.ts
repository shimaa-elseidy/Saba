import { Injectable } from '@angular/core';
import { environment } from '../../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllPayments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Payments/get-payments`);
  }

  getAllDashStats(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Payments/dashboard-stats`);
  }
}
