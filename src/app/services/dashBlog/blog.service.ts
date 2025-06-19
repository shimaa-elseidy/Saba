import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private readonly baseUrl = environment.apiUrl;


  constructor(private http: HttpClient) {}

  
  getAllBlogs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/blog/all`);
  }

  addBlog(blogData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/blog`, blogData);
  }

  getBlogById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/blog/details/${id}`);
  }
  
  updateBlog(id: number, blogData: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/blog/${id}`, blogData);
  }
  
  deleteBlog(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/blog/${id}`);
  }


}
