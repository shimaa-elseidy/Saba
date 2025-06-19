// loading.interceptor.ts - Updated version
import { HttpHandlerFn, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from '../services/loading.service';
import { HttpRequest, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize, tap, delay } from 'rxjs/operators';

export const loadingInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const loadingService = inject(LoadingService);

  // Skip loading for certain requests
  if (
    request.headers.get('skip-loading') === 'true' || 
    request.url.includes('assets/') || 
    (request.method === 'GET' && request.url.includes('static')) ||
    (request.url.includes('/api/Chat/send') || request.url.includes('/api/Chat/send-with-image'))
  ) {
    return next(request);
  }

  // Create unique request ID
  const requestId = `${request.method}-${request.url}-${Date.now()}`;
  
  // Show loading
  loadingService.show(requestId);

  return next(request).pipe(
    tap(
      (event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          console.log('HTTP Request completed successfully');
        }
      },
      (error: HttpErrorResponse) => {
        console.error('HTTP Error:', error);
      }
    ),
    finalize(() => {
      // Hide loading with delay to prevent flashing
      setTimeout(() => {
        loadingService.hide(requestId);
      }, 200); // 200ms delay before hiding loading
    })
  );
};