import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, throwError } from 'rxjs';
import { environment } from '../../../environment/environment';

export interface Tour {
  id: number;
  title: string;
  mainImageUrl: string;
  location: string;
  peopleCount: number;
  tourDay: number;
  tourNight: number;
  price: number;
  rating: number;
  category: string;
}

export interface TravelRequest {
  id: number;
  yourName: string;
  emailAddress: string;
  preferredDestination: string;
  startDate: string;
  endDate: string;
  numberOfChildren: number;
  numberOfAdults: number;
  numberOfInfants: number;
  hotelType: string;
  desiredActivities: string;
  specialRequests: string;
  messages: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class TourService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Existing methods (unchanged)
  bookTour(bookData: any): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      return throwError(() => new Error('Token not found'));
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post<any>(`${this.apiUrl}/TourBooking/book`, bookData, { headers });
  }

  submitTourData(tourData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Tour`, tourData);
  }

  updateTour(tourId: number, payload: any): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      return throwError(() => new Error('Token not found'));
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    return this.http.put(`${this.apiUrl}/Tour/${tourId}`, payload, { headers });
  }

  submitBooking(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/AdminBooking/create-booking`, data);
  }

  getTours(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/AdminBooking/tours`);
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/AdminBooking/users`);
  }

  getTourById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Tour/details_Tour/${id}`);
  }

  getLatestTour(): Observable<any> {
    return this.http.get(`${this.apiUrl}/Tour/latest`);
  }

  getCategory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Tour/categories`);
  }

  getAllTours(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Tour`);
  }

  getDeletedTours(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Tour/deleted`);
  }

  deleteTour(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Tour/${id}SoftDeleteTour`);
  }

  restoreTour(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/Tour/restore/${id}`, {});
  }

  deletePermanently(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Tour/DeleteTour/${id}`);
  }

  getAllToursWithComments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Tour/all-tours-with-comments`);
  }

  getTopTags(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Tour/TopTags`);
  }

  getRecentComment(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Tour/RecentComments`);
  }

  getTourDetails(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Tour/details_Tour/${id}`);
  }

  addComment(commentData: any): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      return throwError(() => new Error('Token not found'));
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<any>(`${this.apiUrl}/comments`, commentData, { headers });
  }

  getAllToursGuide(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Tour/GuideOfEgypt`);
  }

  getAllToursDay(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Tour/Day_oF_Trip`);
  }
  
  getAllToursClassic(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Tour/ClassicalTours`);
  }

  getAllToursTurkey(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Tour/Turkey_Trips`);
  }

  getUniquePlaces(): Observable<string[]> {
    return this.getAllToursWithComments().pipe(
      map(tours => [...new Set(tours.flatMap(tour => tour.places || []))].filter(place => place))
    );
  }

  getUniqueTourTypes(): Observable<string[]> {
    return this.getAllToursWithComments().pipe(
      map(tours => [...new Set(tours.map(tour => tour.tourCategory))].filter(type => type))
    );
  }

  getFavoriteTours(): Observable<Tour[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      return throwError(() => new Error('Token not found'));
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Tour[]>('https://subatoursapi.premiumasp.net/api/Favorite/my-favorites', { headers });
  }

  isTourFavorite(tourId: number): Observable<boolean> {
    const token = localStorage.getItem('token');
    if (!token) {
      return throwError(() => new Error('Token not found'));
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<boolean>(`https://subatoursapi.premiumasp.net/api/Favorite/is-favorite/${tourId}`, { headers });
  }

  addTourToFavorites(tourId: number): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      return throwError(() => new Error('Token not found'));
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post(`https://subatoursapi.premiumasp.net/api/Favorite/add/${tourId}`, {}, { headers });
  }

  removeTourFromFavorites(tourId: number): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      return throwError(() => new Error('Token not found'));
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete(`https://subatoursapi.premiumasp.net/api/Favorite/remove/${tourId}`, { headers });
  }

  getAdminFavoriteTours(): Observable<Tour[]> {
    return this.http.get<Tour[]>('https://subatoursapi.premiumasp.net/api/Favorite/admin-favorites');
  }

  // New method for submitting travel request
  submitTravelRequest(travelRequest: TravelRequest): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      return throwError(() => new Error('Token not found'));
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': '*/*'
    });
    return this.http.post('https://subatoursapi.premiumasp.net/api/TravelRequests', travelRequest, { headers });
  }

  getTravelRequests(): Observable<TravelRequest[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      return throwError(() => new Error('Token not found'));
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
    return this.http.get<TravelRequest[]>('https://subatoursapi.premiumasp.net/api/TravelRequests', { headers });
  }
}