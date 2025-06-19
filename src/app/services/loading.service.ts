// loading.service.ts - Updated for Navigation
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private activeRequests = 0;
  private navigationLoading = false;

  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  // For HTTP requests
  show(requestId?: string): void {
    this.activeRequests++;
    console.log('LoadingService.show() called, activeRequests:', this.activeRequests);
    
    // Delay showing loading to prevent flashing for quick requests
    if (this.activeRequests === 1) {
      setTimeout(() => {
        if (this.activeRequests > 0) {
          this.updateLoadingState();
        }
      }, 200); // 200ms delay قبل إظهار اللودينج
    } else {
      this.updateLoadingState();
    }
    
    // Optional timeout for specific requests
    if (requestId) {
      setTimeout(() => {
        if (this.activeRequests > 0) {
          console.warn(`Request ${requestId} taking too long, but not forcing hide`);
        }
      }, 10000);
    }
  }

  hide(requestId?: string): void {
    this.activeRequests--;
    console.log('LoadingService.hide() called, activeRequests:', this.activeRequests);
    if (this.activeRequests <= 0) {
      this.activeRequests = 0;
    }
    this.updateLoadingState();
  }

  // For Navigation
  showNavigation(): void {
    this.navigationLoading = true;
    console.log('Navigation loading started');
    this.updateLoadingState();
  }

  hideNavigation(): void {
    this.navigationLoading = false;
    console.log('Navigation loading ended');
    // Add small delay before hiding to ensure smooth transition
    setTimeout(() => {
      this.updateLoadingState();
    }, 100);
  }

  private updateLoadingState(): void {
    const shouldShow = this.activeRequests > 0 || this.navigationLoading;
    this.loadingSubject.next(shouldShow);
  }

  forceHide(): void {
    this.activeRequests = 0;
    this.navigationLoading = false;
    this.loadingSubject.next(false);
  }
}