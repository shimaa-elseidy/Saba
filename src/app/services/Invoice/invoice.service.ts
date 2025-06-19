import { Injectable } from '@angular/core';
import { environment } from '../../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice } from '../../Intrerfaces/Invoice';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.baseUrl}/Invoice`);
  }

  createInvoice(invoiceData: any): Observable<any> {
    return this.http.post(
      `https://http://subatoursapi.premiumasp.net/api/Invoice/create`,
      invoiceData
    );
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Invoice/users-emails`);
  }

  getStatuses(): Observable<{ id: number; name: string }[]> {
    return this.http.get<{ id: number; name: string }[]>(
      `${this.baseUrl}/Invoice/statuses`
    );
  }

  updateInvoiceStatus(
    invoiceIdentifier: string,
    statusText: string
  ): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.put(
      `${this.baseUrl}/Invoice/update-status/${invoiceIdentifier}`,
      JSON.stringify(statusText),
      { headers: headers }
    );
  }
}
