import { Component, OnInit, HostListener, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TourService } from '../../services/Tours/tour.service';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-new-booking',
  imports: [NgIf, ReactiveFormsModule, NgFor, FormsModule],
  templateUrl: './add-new-booking.component.html',
  styleUrl: './add-new-booking.component.scss',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
})
export class AddNewBookingComponent implements OnInit {
  bookingForm: FormGroup;
  tours: any[] = [];
  users: any[] = [];
  filteredUsers: any[] = []; // لتخزين المستخدمين المصفّين
  userSearchTerm: string = ''; // لتخزين مصطلح البحث
  showUserDropdown: boolean = false; // للتحكم في ظهور القائمة المنسدلة
  submitting = false;
  errorMessage = '';
  session : string = ''
  
  // إضافة متغيرات جديدة لمعالجة الدفع
  paymentUrl: string | null = null;
  showRedirectingMessage = false;
  bookingResponse: any = null;

  constructor(private fb: FormBuilder, private bookingService: TourService) {
    // Initialize form with default values to ensure fields are never empty
    this.bookingForm = this.fb.group({
      travelerName: ['', [Validators.required]],
      tourName: ['', Validators.required],
      tourPrice: [{ value: '', disabled: true }, Validators.required],
      tourTime: ['09:00', Validators.required], // Default value for time
      isDepositPayment: [false, Validators.required], // Default to false
      paymentMethod: [false, Validators.required], // Default to false
      adultsCount: [1, [Validators.required, Validators.min(1)]],
      childrenCount: [0, [Validators.required, Validators.min(0)]],
      tourDate: [this.formatDate(new Date()), Validators.required], // Today's date
      emailToNotify: ['', [Validators.required, Validators.email]],
    });
  }

  // Helper to format date as YYYY-MM-DD for date input
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  ngOnInit() {
    this.loadTours();
    this.loadUsers();
    this.setupTourNameListener();
    this.setupPaymentMethodListener();
    
    // تهيئة قائمة المستخدمين المصفاة
    this.filteredUsers = this.users;
  }

  loadTours() {
    this.bookingService.getTours().subscribe({
      next: (data) => {
        this.tours = data;
        console.log('Tours loaded:', this.tours);
      },
      error: (err) => {
        console.error('Error loading tours:', err);
      },
    });
  }

  loadUsers() {
    this.bookingService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = this.users; // تهيئة قائمة المستخدمين المصفاة بكل المستخدمين
        console.log('Users loaded:', this.users);
      },
      error: (err) => {
        console.error('Error loading users:', err);
      },
    });
  }

  // تصفية المستخدمين بناءً على مصطلح البحث
  filterUsers() {
    const term = this.userSearchTerm.toLowerCase();
    
    if (!term) {
      this.filteredUsers = this.users;
    } else {
      this.filteredUsers = this.users.filter(user => 
        user.name.toLowerCase().includes(term)
      );
    }
    
    // إظهار القائمة المنسدلة عند تصفية النتائج
    this.showUserDropdown = true;
  }

  // اختيار مستخدم من القائمة المنسدلة
  selectUser(userId: string, userName: string) {
    this.bookingForm.get('travelerName')?.setValue(userId);
    this.userSearchTerm = userName;
    
    // تأخير إخفاء القائمة لضمان استكمال عملية الاختيار
    setTimeout(() => {
      this.showUserDropdown = false;
    }, 150);
  }

  // التعامل مع حدث التركيز على حقل الإدخال
  onUserInputFocus() {
    // إظهار جميع المستخدمين عند التركيز إذا كان حقل البحث فارغاً
    if (!this.userSearchTerm) {
      this.filteredUsers = this.users;
    }
    this.showUserDropdown = true;
  }

  // الاستماع لأحداث النقر في المستند للإغلاق عند النقر خارج القائمة
  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent) {
    const clickedElement = event.target as HTMLElement;
    const dropdownContainer = document.querySelector('.searchable-dropdown');
    
    // التحقق مما إذا كان النقر خارج القائمة المنسدلة
    if (dropdownContainer && !dropdownContainer.contains(clickedElement)) {
      this.showUserDropdown = false;
    }
  }

  // الاستماع لأحداث الضغط على المفاتيح للتنقل في القائمة
  @HostListener('keydown', ['$event'])
  handleKeyboardNavigation(event: KeyboardEvent) {
    if (!this.showUserDropdown) return;
    
    const dropdown = document.querySelector('.dropdown-menu');
    const items = dropdown?.querySelectorAll('.dropdown-item:not(.no-results)');
    
    if (!items || items.length === 0) return;
    
    // البحث عن العنصر الحالي المحدد
    const currentIndex = Array.from(items).findIndex(item => 
      item.classList.contains('keyboard-focus')
    );
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        // إزالة التحديد من العنصر الحالي
        if (currentIndex >= 0) {
          items[currentIndex].classList.remove('keyboard-focus');
        }
        // تحديد العنصر التالي أو الأول إذا وصلنا للنهاية
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        items[nextIndex].classList.add('keyboard-focus');
        (items[nextIndex] as HTMLElement).scrollIntoView({ block: 'nearest' });
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        // إزالة التحديد من العنصر الحالي
        if (currentIndex >= 0) {
          items[currentIndex].classList.remove('keyboard-focus');
        }
        // تحديد العنصر السابق أو الأخير إذا كنا في البداية
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        items[prevIndex].classList.add('keyboard-focus');
        (items[prevIndex] as HTMLElement).scrollIntoView({ block: 'nearest' });
        break;
        
      case 'Enter':
        // اختيار العنصر المحدد حاليا
        if (currentIndex >= 0) {
          event.preventDefault();
          const user = this.filteredUsers[currentIndex];
          this.selectUser(user.userID, user.name);
        }
        break;
        
      case 'Escape':
        // إغلاق القائمة
        event.preventDefault();
        this.showUserDropdown = false;
        break;
    }
  }

  setupTourNameListener() {
    this.bookingForm.get('tourName')?.valueChanges.subscribe((tourId) => {
      const selectedTour = this.tours.find((tour) => tour.id === +tourId);
      if (selectedTour) {
        this.bookingForm.get('tourPrice')?.setValue(selectedTour.tourPrice);
      } else {
        this.bookingForm.get('tourPrice')?.setValue('');
      }
    });
  }
  
  // Debug method to log form values before submission
  logFormValues() {
    console.log('Form values before submission:', this.bookingForm.value);
    console.log('Form valid:', this.bookingForm.valid);
    console.log('Form touched:', this.bookingForm.touched);
    console.log('Form errors:', this.getFormValidationErrors());
  }
  
  // Helper method to get form validation errors
  getFormValidationErrors() {
    const errors: any = {};
    Object.keys(this.bookingForm.controls).forEach(key => {
      const control = this.bookingForm.get(key);
      if (control?.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }
  
  submitBooking() {
    this.logFormValues(); // Debug form values
    
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      this.errorMessage = 'Please fill all required fields correctly.';
      
      // Add animation to highlight invalid fields
      const invalidControls = document.querySelectorAll('.ng-invalid.ng-touched');
      invalidControls.forEach((element: Element) => {
        element.classList.add('shake-animation');
        setTimeout(() => {
          element.classList.remove('shake-animation');
        }, 500);
      });
      
      return;
    }
    
    this.submitting = true;
    this.errorMessage = '';
    
    // Add animation to the form container
    const container = document.querySelector('.booking-container');
    if (container) {
      container.classList.add('pulse-animation');
    }
    
    // Ensure we have non-empty values for the problematic fields
    const tourTimeValue = this.bookingForm.get('tourTime')?.value || '09:00';
    const emailToNotify = this.bookingForm.get('emailToNotify')?.value || '';
    
    if (!tourTimeValue || !emailToNotify) {
      this.errorMessage = 'Tour time and email are required fields.';
      this.submitting = false;
      return;
    }
    
    // إنشاء بيانات الحجز
    const bookingData = {
      userId: this.bookingForm.get('travelerName')?.value,
      tourId: Number(this.bookingForm.get('tourName')?.value),
      tourDate: new Date(this.bookingForm.get('tourDate')?.value).toISOString(),
      tourTime: tourTimeValue,
      adultsCount: Number(this.bookingForm.get('adultsCount')?.value),
      childrenCount: Number(this.bookingForm.get('childrenCount')?.value),
      paymentMethod: Boolean(this.bookingForm.get('paymentMethod')?.value),
      isDepositPayment: Boolean(this.bookingForm.get('isDepositPayment')?.value),
      emailToNotify: emailToNotify
    };
    
    // Log the payload for debugging
    console.log('Booking data to submit:', JSON.stringify(bookingData));
    
    // Send the data to the API
    this.bookingService.submitBooking(bookingData).subscribe({
      next: (response) => {
        console.log('Booking successful:', response);
        
        // Remove the pulse animation
        const container = document.querySelector('.booking-container');
        if (container) {
          container.classList.remove('pulse-animation');
        }
        
        // حفظ تفاصيل الحجز
        this.bookingResponse = response;
        
        // جميع بيانات الرد للتصحيح
        console.log('Full response:', JSON.stringify(response, null, 2));
        console.log('Payment URL:', response.paymentUrl);
        
        // استخدام رابط الجلسة الكامل (paymentSessionUrl) بدلاً من معرف الجلسة (paymentUrl)
        if (response.paymentUrl) {
          this.session = response.paymentUrl;
          console.log('Payment session set:', this.session);
          
          // Add success animation
          const successAnimation = document.createElement('div');
          successAnimation.className = 'success-animation';
          container?.appendChild(successAnimation);
          
          // Update the session.id field
          this.updatePaymentForm();
          
          // Automatically submit the payment form after a short delay to ensure DOM updates
          setTimeout(() => {
            const form = document.getElementById('paymentForm') as HTMLFormElement;
            if (form) {
              form.submit();
            }
          }, 800);
        }
      
        else {
          // إذا لم يكن هناك رابط دفع، نعرض رسالة نجاح فقط
          alert('Booking submitted successfully!');
          this.resetForm();
        }
        
        this.submitting = false;
      },
      error: (error) => {
        console.error('Error submitting booking:', error);
        this.submitting = false;
        
        // Handle validation errors if available
        if (error.error && error.error.errors) {
          const errorMessages = Object.entries(error.error.errors)
            .map(([field, msgs]: [string, any]) => `${field}: ${msgs.join(', ')}`)
            .join('\n');
          this.errorMessage = `Validation errors:\n${errorMessages}`;
          alert(this.errorMessage);
        } else {
          this.errorMessage = 'Error submitting booking. Please try again.';
          alert(this.errorMessage);
        }
      },
    });
  }
  
  updatePaymentForm() {
    setTimeout(() => {
      const sessionInput = document.querySelector('input[name="session.id"]') as HTMLInputElement;
      if (sessionInput) {
        sessionInput.value = this.session;
      }
    }, 100);
  }
  
  // دالة إعادة تعيين النموذج
  resetForm() {
    this.bookingForm.reset({
      tourTime: '09:00',
      isDepositPayment: false,
      paymentMethod: false,
      adultsCount: 1,
      childrenCount: 0,
      tourDate: this.formatDate(new Date())
    });
    
    // إعادة تعيين متغيرات الدفع ومتغيرات البحث
    this.paymentUrl = null;
    this.showRedirectingMessage = false;
    this.bookingResponse = null;
    this.userSearchTerm = '';
    this.showUserDropdown = false;
  }

  setupPaymentMethodListener() {
    this.bookingForm.get('paymentMethod')?.valueChanges.subscribe((value) => {
      if (value === true) {
        console.log('User chose to pay now.');
      } else if (value === false) {
        console.log('User chose to pay later.');
      }
    });
  
    this.bookingForm.get('isDepositPayment')?.valueChanges.subscribe((value) => {
      if (value === true) {
        console.log('User chose to pay a deposit.');
      } else if (value === false) {
        console.log('User chose to pay the full amount.');
      }
    });
  }
}