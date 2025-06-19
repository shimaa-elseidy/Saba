import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/Auth/auth.service';

// Guards
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.isAdmin()) {
    return true;
  }
  router.navigate(['/home']);
  return false;
};

export const userGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.isUser()) {
    return true;
  }
  router.navigate(['/home']);
  return false;
};

export const employeeGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.isEmployee()) {
    return true;
  }
  router.navigate(['/home']);
  return false;
};

export const superadminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.isSuperAdmin()) {
    return true;
  }
  router.navigate(['/home']);
  return false;
};

export const anyRoleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};

export const travelRequestsGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && (authService.isAdmin() || authService.isEmployee() || authService.isSuperAdmin())) {
    return true;
  }
  router.navigate(['/home']);
  return false;
};

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  { 
    path: 'home', 
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },

  // Authentication routes
  { 
    path: 'login', 
    loadComponent: () => import('./Auth/login/login.component').then(m => m.LoginComponent)
  },
  { 
    path: 'register', 
    loadComponent: () => import('./Auth/register/register.component').then(m => m.RegisterComponent)
  },

  // Dashboard with nested lazy-loaded routes
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [anyRoleGuard],
    children: [
      { 
        path: '', 
        loadComponent: () => import('./pages/innerdashboard/innerdashboard.component').then(m => m.InnerdashboardComponent)
      },
      
      // Admin and Superadmin only routes
      {
        path: 'user-management',
        loadComponent: () => import('./pages/user-management/user-management.component').then(m => m.UserManagementComponent),
        canActivate: [adminGuard],
      },
      {
        path: 'create-new-user',
        loadComponent: () => import('./pages/user-management/create-new-user/create-new-user.component').then(m => m.CreateNewUserComponent),
        canActivate: [adminGuard],
      },
      {
        path: 'adsManager',
        loadComponent: () => import('./pages/ads-manager/ads-manager.component').then(m => m.AdsManagerComponent),
        canActivate: [adminGuard],
      },
      {
        path: 'add-new-tour',
        loadComponent: () => import('./pages/add-new-tour/add-new-tour.component').then(m => m.AddNewTourComponent),
        canActivate: [adminGuard],
      },
      { 
        path: 'edit-tour/:id', 
        loadComponent: () => import('./pages/add-new-tour/add-new-tour.component').then(m => m.AddNewTourComponent), 
        canActivate: [adminGuard] 
      },
      {
        path: 'add-new-blog',
        loadComponent: () => import('./pages/add-new-blog/add-new-blog.component').then(m => m.AddNewBlogComponent),
        canActivate: [adminGuard],
      },
      {
        path: 'add-new-blog/:id',
        loadComponent: () => import('./pages/add-new-blog/add-new-blog.component').then(m => m.AddNewBlogComponent),
        canActivate: [adminGuard],
      },
      {
        path: 'myToors',
        loadComponent: () => import('./pages/my-toors/my-toors.component').then(m => m.MyToorsComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'myBooking',
        loadComponent: () => import('./pages/my-booking/my-booking.component').then(m => m.MyBookingComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'comments',
        loadComponent: () => import('./pages/comments/comments.component').then(m => m.CommentsComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'withdrawals',
        loadComponent: () => import('./pages/withdrawals/withdrawals.component').then(m => m.WithdrawalsComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'invoices',
        loadComponent: () => import('./pages/invoices/invoices.component').then(m => m.InvoicesComponent),
        canActivate: [adminGuard]
      },

      // User only routes
      {
        path: 'userInvoice',
        loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent),
        canActivate: [userGuard],
      },
      {
        path: 'userWithdrawal',
        loadComponent: () => import('./pages/users/my-wallet/my-wallet.component').then(m => m.MyWalletComponent),
        canActivate: [userGuard]
      },
      {
        path: 'myBookingUser',
        loadComponent: () => import('./pages/users/my-bookings-user/my-bookings-user.component').then(m => m.MyBookingsUserComponent),
        canActivate: [userGuard]
      },
      {
        path: 'myComments',
        loadComponent: () => import('./pages/users/my-comments-user/my-comments-user.component').then(m => m.MyCommentsUserComponent),
        canActivate: [userGuard]
      },

      // Common routes (accessible by multiple roles)
      { 
        path: 'chat', 
        loadComponent: () => import('./pages/chat/chat.component').then(m => m.ChatComponent)
      },
      { 
        path: 'design-trips', 
        loadComponent: () => import('./pages/designtrips/designtrips.component').then(m => m.DesigntripsComponent)
      },
      { 
        path: 'settings', 
        loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent)
      },
      { 
        path: 'add-new-booking', 
        loadComponent: () => import('./pages/add-new-booking/add-new-booking.component').then(m => m.AddNewBookingComponent)
      },
      { 
        path: 'add-new-invoice', 
        loadComponent: () => import('./pages/add-new-invoice/add-new-invoice.component').then(m => m.AddNewInvoiceComponent)
      },
      { 
        path: 'blogs', 
        loadComponent: () => import('./pages/blogs/blogs.component').then(m => m.BlogsComponent)
      },
    ],
  },

  // Public routes
  { 
    path: 'listingTours', 
    loadComponent: () => import('./pages/listing-tours/listing-tours.component').then(m => m.ListingToursComponent)
  },
  { 
    path: 'terms', 
    loadComponent: () => import('./terms/terms.component').then(m => m.TermsComponent)
  },
  { 
    path: 'privacy', 
    loadComponent: () => import('./privacy/privacy.component').then(m => m.PrivacyComponent)
  },
  { 
    path: 'design-your-trip', 
    loadComponent: () => import('./pages/design-your-trip/design-your-trip.component').then(m => m.DesignYourTripComponent)
  },
  { 
    path: 'help', 
    loadComponent: () => import('./helper/helper.component').then(m => m.HelperComponent)
  },
  { 
    path: 'travelTips', 
    loadComponent: () => import('./pages/travel-tips/travel-tips.component').then(m => m.TravelTipsComponent)
  },
  { 
    path: 'reels', 
    loadComponent: () => import('./pages/reels/reels.component').then(m => m.ReelsComponent)
  },
  { 
    path: 'classical', 
    loadComponent: () => import('./pages/classic-tour/classic-tour.component').then(m => m.ClassicTourComponent)
  },
  { 
    path: 'turkey', 
    loadComponent: () => import('./pages/turkey/turkey.component').then(m => m.TurkeyComponent)
  },
  { 
    path: 'favorite-user', 
    loadComponent: () => import('./pages/favourites-user/favourites-user.component').then(m => m.FavouritesUserComponent)
  },
  { 
    path: 'day', 
    loadComponent: () => import('./pages/day-tour/day-tour.component').then(m => m.DayTourComponent)
  },
  { 
    path: 'guide', 
    loadComponent: () => import('./pages/guide-tour/guide-tour.component').then(m => m.GuideTourComponent)
  },
  { 
    path: 'blogPosts', 
    loadComponent: () => import('./pages/blog-post/blog-post.component').then(m => m.BlogPostComponent)
  },
  { 
    path: 'blog/:id', 
    loadComponent: () => import('./pages/home/blog-details/blog-details.component').then(m => m.BlogDetailsComponent)
  },
  { 
    path: 'tours/:id', 
    loadComponent: () => import('./pages/tour-details/tour-details.component').then(m => m.TourDetailsComponent)
  },
  { 
    path: 'contactUs', 
    loadComponent: () => import('./pages/contact-us/contact-us.component').then(m => m.ContactUsComponent)
  },
  { 
    path: 'about', 
    loadComponent: () => import('./pages/about-us/about-us.component').then(m => m.AboutUsComponent)
  },

  // Fallback route
  { 
    path: '**', 
    redirectTo: '/home' 
  }
];