import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {

 
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAllUsers(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ManageUser/GetAllUsers`);
  }

  createUser(payload: any): Observable<any> {
    const url = `${this.apiUrl}/ManageUser/CreateUser`;
    return this.http.post(url, payload, { responseType: 'text' }); // تعيين responseType إلى 'text'
  }

  getUserById(id: number): Observable<any> {
    const url = `${this.apiUrl}/ManageUser/GetUserById/${id}`;
    return this.http.get<any>(url);
  }
  
  deleteUserById(userId: number): Observable<any> {
    const url = `${this.apiUrl}/ManageUser/SoftDeleteUser/${userId}`;
    return this.http.post<any>(url, {}).pipe(
      catchError(error => {
        return of(null);  // يمكنك إعادة null أو رسالة خطأ حسب الحالة
      })
    );
  }

  sendContactMessage(payload: any): Observable<any> {
    return this.http.post(this.apiUrl, payload, { responseType: 'text' }).pipe(
      catchError(error => {
        console.error('Error sending contact message:', error);
        return of(null); // إرجاع null في حالة الخطأ
      })
    );
  }


  

  

}
