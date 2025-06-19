import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatSelectionService {

  private selectedUserIdSubject = new BehaviorSubject<string | null>(null);
  selectedUserId$ = this.selectedUserIdSubject.asObservable();

  setSelectedUserId(userId: string) {
    this.selectedUserIdSubject.next(userId);
  }

  clearSelectedUserId() {
    this.selectedUserIdSubject.next(null);
  }}
