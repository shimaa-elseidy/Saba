import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  private readonly ACTIVE_TAB_KEY = 'activeTab';
  private readonly PROFILE_IMAGE_KEY = 'profileImage';
  

  private profileImageSubject = new BehaviorSubject<string>(
    localStorage.getItem(this.PROFILE_IMAGE_KEY) || 'https://randomuser.me/api/portraits/women/44.jpg'
  );

  profileImage$ = this.profileImageSubject.asObservable();

  getProfileImage(): string {
    return this.profileImageSubject.value;
  }

  setProfileImage(image: string) {
    this.profileImageSubject.next(image);
    localStorage.setItem(this.PROFILE_IMAGE_KEY, image);
  }

  getActiveTab(): string {
    return localStorage.getItem(this.ACTIVE_TAB_KEY) || 'Edit Profile';
  }

  setActiveTab(tab: string) {
    localStorage.setItem(this.ACTIVE_TAB_KEY, tab);
  }

  
}
