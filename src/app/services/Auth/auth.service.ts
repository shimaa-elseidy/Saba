import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, tap, throwError, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environment/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = environment.apiUrl;
  private readonly baseUrlDash = environment.apiUlrDashboard;

  constructor(private http: HttpClient, private router: Router) {}

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  fetchInvoices(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('User is not authenticated.'));
    }
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    return this.http.get<any>(`${this.baseUrl}/Invoice/my-invoices`, { headers })
      .pipe(catchError(this.handleError));
  }

  fetchWallet(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('User is not authenticated.'));
    }
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    return this.http.get<any>(`${this.baseUrl}/Wallet/my-wallet`, { headers })
      .pipe(catchError(this.handleError));
  }
  
  fetchBooking(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('User is not authenticated.'));
    }
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    return this.http.get<any>(`${this.baseUrl}/TourBooking/my-bookings`, { headers })
      .pipe(catchError(this.handleError));
  }

  fetchComments(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('User is not authenticated.'));
    }
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    return this.http.get<any>(`${this.baseUrl}/comments/my-comments`, { headers })
      .pipe(catchError(this.handleError));
  }

  deleteCommentById(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/comments/delete-my-comment/${id}`);
  }

  register(userData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    return this.http.post<any>(`${this.baseUrl}/Auth/register`, userData, { headers })
      .pipe(
        tap((res: any) => {
          if (res?.token) {
            localStorage.setItem('token', res.token);
            if (res.userData) {
              localStorage.setItem('userData', JSON.stringify(res.userData));
              if (res.userData.profileImage) {
                localStorage.setItem('profileImage', res.userData.profileImage);
              } else {
                localStorage.setItem('profileImage', 'assets/default-profile.png');
              }
            }
          }
        }),
        catchError(this.handleError)
      );
  }

  login(email: string, password: string): Observable<any> {
    const formData = new FormData();
    formData.append('Email', email);
    formData.append('Password', password);
    
    return this.http.post(`${this.baseUrl}/Auth/login`, formData)
      .pipe(
        tap((res: any) => {
          if (res?.token) {
            localStorage.setItem('token', res.token);
            if (res.userData) {
              localStorage.setItem('userData', JSON.stringify(res.userData));
              if (res.userData.profileImage) {
                localStorage.setItem('profileImage', res.userData.profileImage);
              } else {
                localStorage.setItem('profileImage', 'assets/default-profile.png');
              }
            }
          }
        }),
        catchError(this.handleError)
      );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserRole(): number | null {
    const userData = this.getUserData();
    return userData ? userData.roleId : null;
  }

  getUserData(): any {
    const userDataStr = localStorage.getItem('userData');
    return userDataStr ? JSON.parse(userDataStr) : null;
  }

  isAdmin(): boolean {
    return this.getUserRole() === 1;
  }

  isUser(): boolean {
    return this.getUserRole() === 3;
  }

  isEmployee(): boolean {
    return this.getUserRole() === 2;
  }

  isSuperAdmin(): boolean {
    return this.getUserRole() === 4;
  }
  
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('profileImage');
    this.router.navigate(['/login']);
  }

  private handleError(error: HttpErrorResponse) {
    console.error('❌ Error:', error);
    return throwError(() => new Error( ' Please Try Again Later '));
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    const formData = new FormData();
    formData.append('Email', email);
    formData.append('Otp', otp);

    return this.http.post(`${this.baseUrl}/Auth/verify-otp`, formData)
      .pipe(catchError(this.handleError));
  }

  resendOtp(email: string): Observable<any> {
    const formData = new FormData();
    formData.append('Email', email);

    return this.http.post(`${this.baseUrl}/Auth/resend-otp`, formData)
      .pipe(catchError(this.handleError));
  }

  updateProfile(userData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    });
    return this.http.put(`${this.baseUrl}/Auth/update-profile`, userData, { headers })
      .pipe(
        tap((res: any) => {
          if (res?.userData?.profileImage) {
            localStorage.setItem('profileImage', res.userData.profileImage);
          }
        }),
        catchError(this.handleError)
      );
  }

  changePassword(OldPassword: string, NewPassword: string, ConfirmNewPassword: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
    const formData = new FormData();
    formData.append('OldPassword', OldPassword);
    formData.append('NewPassword', NewPassword);
    formData.append('ConfirmNewPassword', ConfirmNewPassword);

    return this.http.put(`${this.baseUrl}/Auth/change-password`, formData, { headers });
  }

  getEmails(): Observable<any> {  
    return this.http.get<any>(`${this.baseUrl}/Auth/All-Emails`, )
  }

  forgotPassword(email: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const payload = { email };

    return this.http.post(`${this.baseUrl}/Auth/forgot-password`, payload, { headers })
      .pipe(catchError(this.handleError));
  }

  resetPassword(email: string, otp: string, newPassword: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const payload = { email, otp, newPassword };

    return this.http.post(`${this.baseUrl}/Auth/reset-password`, payload, { headers })
      .pipe(catchError(this.handleError));
  }
}