import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor() { }
  getHomeData(): Observable<any> {
    // هذه بيانات وهمية (ستستبدل بطلب HTTP الحقيقي لاحقًا)
    const mockData = {
      mainTitle: 'Explore The History',
      subTitle: 'Guide Of Egypt',
      items: [
      
        { 
          title: 'Day Trips', 
          imageUrl: '../../../assets/151.jpg' 
        },
        { 
          title: 'Guide Of Egypt', 
          imageUrl: '../../../assets/151.jpg' 
        },
        { 
          title: 'Turkey Trips', 
          imageUrl: '../../../assets/744.jpg' 
        },

        { 
          title: 'Classical Trips', 
          imageUrl: '../../../assets/744.jpg' 
        },
       
      ]
    };
    return of(mockData); // محاكاة لـ Observable
  }
}
