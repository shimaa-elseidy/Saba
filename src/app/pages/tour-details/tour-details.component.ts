import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TourService } from '../../services/Tours/tour.service';
import { CommonModule, DatePipe, NgIf } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

interface TourPlan {
  title: string;
  description: string;
}

interface TourFacility {
  title: string;
  description: string;
}

interface TourFact {
  title: string;
  value: string;
  description: string;
}

interface AdditionalServiceFee {
  serviceName: string;
  price: number;
  description: string;
}

interface TermCondition {
  title: string;
  description: string;
}

interface AvailableDate {
  date: string;
  price: number;
  maxGuests: number;
}



// interface Reply {
//   id: number;
//   content: string;
//   createdAt: string;
//   user: User;
// }
interface Comment {
  id: number;
  content: string;
  createdAt: string;
  replies: null;
  user: {
    id: string;
    profilePicture: string;
    userName: string; // تأكد من وجود هذه الخاصية هنا
  };
}


interface TourDetails {
  id: number;
  tourTitle: string;
  tourCategory: string;
  tourDay: number;
  tourNight: number;
  tourPrice: number;
  adultPrice: number;
  childrenPrice: number;
  infantPrice: number;
  guestsCapabilityAdult: number;
  guestsCapabilityChildren: number;
  guestsCapabilityInfant: number;
  tourDescription: string;
  mainImage: string;
  startTour: string;
  pickUp: string;
  isFeatured: boolean;
  isVerified: boolean;
  headerImages: string[];
  galleryImages: string[];
  places: string[];
  tourTags: string[];
  tourPlans: TourPlan[];
  depositPercentage:number;
  tourIncludes: string[];
  tourExcludes: string[];
  tourFacilities: TourFacility[];
  tourFacts: TourFact[];
  additionalServiceFees: AdditionalServiceFee[];
  termsAndConditions: TermCondition[];
  availableDates: AvailableDate[];
  comments: Comment[];
}
@Component({
  selector: 'app-tour-details',
  imports: [CommonModule,FormsModule,ReactiveFormsModule],
  standalone:true,
  providers:[DatePipe],
  templateUrl: './tour-details.component.html',
  styleUrl: './tour-details.component.scss'
})
export class TourDetailsComponent {
  session : string = ''
  phoneNumber: string = '201000676285';
  email:string= 'info@sabatours.com'

  callPhone() {
    window.location.href = `tel:${this.phoneNumber}`;
  }

  sendEmail() {
    window.location.href = `mailto:${this.email}`;
  }
  selectedBlog:any | null = null;

  tourId: number = 0;
  tourDetails: TourDetails | null = null;
  loading: boolean = true;
  error: string | null = null;
   // نموذج التعليق الجديد
   newComment = {
    content: '',
  };
  showAllComments = false;

  
  // Booking related properties
  selectedDate: string = '';
  adults: number = 1;
  children: number = 0;
  infants: number = 0;
  selectedServices: { [key: string]: boolean } = {};
  totalPrice: number = 0;
  
  // UI state
  activeTab: string = 'description';
  
  constructor(
    private route: ActivatedRoute,
    private tourService: TourService,
        private cdr: ChangeDetectorRef,
            private toastr: ToastrService,
            private datePipe: DatePipe,
            private formBuilder: FormBuilder,
        
    
  ) {}

  
  bookingForm: FormGroup; // نموذج الحجز
  formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    return this.datePipe.transform(date, 'shortTime') || '';
  }
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.tourId = +params['id'];
      this.loadTourDetails();
    });
    
    this.bookingForm = this.formBuilder.group({
      selectedDate: new FormControl(''),
      selectedTime: new FormControl(''),
      adults: [1, [Validators.required, Validators.min(1)]],
      children: [0, Validators.min(0)],
      infants: [0, Validators.min(0)],
      additionalServices: [[]],
      isDepositPayment: [false]
    });
    
    // Listen for changes to the deposit payment radio buttons
    this.bookingForm.get('isDepositPayment')?.valueChanges.subscribe(value => {
      console.log('Deposit payment option changed:', value);
      // Recalculate price if needed
      this.calculateTotalPrice();
    });
  }

  depositAmount: number = 0;
// depositPercentage: number = 20; // 40% as mentioned in your requirements
finalAmount: number = 0;
  nextImage(): void {
    if (this.tourDetails?.galleryImages) {
      this.modalImageIndex = (this.modalImageIndex + 1) % this.tourDetails.galleryImages.length;
    }
  }
  
  prevImage(): void {
    if (this.tourDetails?.galleryImages) {
      this.modalImageIndex = (this.modalImageIndex - 1 + (this.tourDetails.galleryImages?.length || 0)) % (this.tourDetails.galleryImages?.length || 1);
    }
  }

  toggleComments() {
    this.showAllComments = !this.showAllComments;
  }
  loadTourDetails(): void {
    this.loading = true;
    this.tourService.getTourDetails(this.tourId).subscribe({
      next: (data) => {
        this.tourDetails = data;
        
        // Add this debug log
        console.log('Tour details loaded:', data);
        console.log('Deposit percentage:', data.depositPercentage);
        
        this.calculateTotalPrice();
        this.generateCalendar();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching tour details:', err);
        this.error = 'Failed to load tour details. Please try again later.';
        this.loading = false;
      }
    });
  }

  setActiveImage(index: number): void {
    this.activeImageIndex = index;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  isServiceSelected(serviceName: string): boolean {
    return this.selectedServices[serviceName] === true;
  }

  toggleService(serviceName: string, price: number): void {
    this.selectedServices[serviceName] = !this.selectedServices[serviceName];
    this.calculateTotalPrice();
  }
  updateGuestCount(guestType: string, change: number): void {
    const currentCount = this.bookingForm.get(guestType)?.value;
    let newCount = currentCount + change;
  
    // منع العدد من النزول تحت الصفر أو أكثر من الحد الأقصى إذا كان لديك حد معين
    if (newCount < 0) newCount = 0;
  
    // تحديث قيمة الـ formControl للنوع المحدد (البالغين أو الأطفال)
    this.bookingForm.get(guestType)?.setValue(newCount);
  
    // تحديث إجمالي السعر بناءً على التغيير الجديد في عدد الضيوف
    this.calculateTotalPrice();
  }

  get getDepositPercentage(): number {
    return this.tourDetails?.depositPercentage || 40; // Fallback to 40% if not available
  }
  
  calculateTotalPrice(): void {
    if (!this.tourDetails) return;
  
    // Calculate base price based on guests
    let adultTotal = this.bookingForm.get('adults')?.value * (this.tourDetails.adultPrice || this.tourDetails.tourPrice);
    let childrenTotal = this.bookingForm.get('children')?.value * (this.tourDetails.childrenPrice || this.tourDetails.tourPrice * 0.5);
    let infantTotal = this.bookingForm.get('infants')?.value * (this.tourDetails.infantPrice || 0);
    
    // Calculate the total price
    let total = adultTotal + childrenTotal + infantTotal;
  
    // Add additional services
    if (this.tourDetails.additionalServiceFees) {
      for (const service of this.tourDetails.additionalServiceFees) {
        if (this.selectedServices[service.serviceName]) {
          total += service.price;
        }
      }
    }
  
    this.totalPrice = total;
    
    // Use the getter to ensure we have a valid percentage
    this.depositAmount = Math.round((this.totalPrice + this.tourDetails.tourPrice) * (this.getDepositPercentage / 100));
    this.finalAmount = this.totalPrice + this.tourDetails.tourPrice;
  }
  
  months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  weekDays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  displayedMonth: number = new Date().getMonth();
  displayedYear: number = new Date().getFullYear();
  calendarData: any[] = [];
  selectedDatee: any = null;
  generateCalendar(): void {
    this.calendarData = [];
    const firstDay = new Date(this.displayedYear, this.displayedMonth, 1).getDay();
    const daysInMonth = new Date(this.displayedYear, this.displayedMonth + 1, 0).getDate();
  
    // أيام فارغة في بداية الشهر
    for (let i = 0; i < firstDay; i++) {
      this.calendarData.push({ date: null, price: null, maxGuests: null });
    }
  
    // أيام الشهر
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(this.displayedYear, this.displayedMonth, i);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // البحث عن تاريخ متاح في بيانات الرحلة
      const availableDate = this.tourDetails?.availableDates?.find(d => {
        const apiDate = new Date(d.date);
        return apiDate.getFullYear() === currentDate.getFullYear() && 
               apiDate.getMonth() === currentDate.getMonth() && 
               apiDate.getDate() === currentDate.getDate();
      });
  
      this.calendarData.push({
        date: currentDate,
        price: availableDate?.price || null,
        maxGuests: availableDate?.maxGuests || null,
        priceSet: !!availableDate,
        optionsForm: false
      });
    }
  }

  changeMonth(offset: number): void {
    this.displayedMonth += offset;
    
    // تصحيح السنة إذا تجاوزنا الحدود
    if (this.displayedMonth > 11) {
      this.displayedMonth = 0;
      this.displayedYear++;
    } else if (this.displayedMonth < 0) {
      this.displayedMonth = 11;
      this.displayedYear--;
    }
    
    this.generateCalendar();
  }
  // تحديد تاريخ
selectDate(day: any): void {
  if (!day.date || !day.priceSet) return;
  this.selectedDate = day;
  this.bookingForm.patchValue({
    selectedDate: day.date.toISOString()
  });
  this.calculateTotalPrice();
}
  



 

  onDateChange(event: Event): void {
    this.selectedDate = (event.target as HTMLSelectElement).value;
    this.calculateTotalPrice();
  }

 


  getDateString(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  submitComment() {
    if (!this.newComment.content.trim() || !this.tourDetails) return;
  
    const token = localStorage.getItem('token');
    if (!token) {
      this.toastr.error('Please log in to add a comment.', 'Unauthorized');
      return;
    }
  
    const commentData = {
      content: this.newComment.content,
      tourId: this.tourDetails.id
    };
  
    this.tourService.addComment(commentData).subscribe({
      next: (response: any) => {
        const newComment: any = {
          userName: response.user?.userName || 'Anonymous',
          profilePicture: response.user?.profilePicture || 'assets/images/default-avatar.png',
          content: response.content,
          createdAt: response.createdAt || new Date().toISOString()
        };
  
        if (this.tourDetails) {
          if (!this.tourDetails.comments) {
            this.tourDetails.comments = [];
          }
          this.tourDetails.comments = [newComment, ...this.tourDetails.comments];
          this.newComment.content = '';
  
          this.cdr.detectChanges();
          this.loadTourDetails(); // إعادة جلب التفاصيل بما فيها التعليقات

  
          // ✅ Show success toast
          this.toastr.success('Comment added successfully!', 'Success');
        }
      },
      error: (error) => {
        console.error('Error adding comment:', error);
        if (error.status === 401) {
          this.toastr.error('Your session has expired. Please log in again.', 'Unauthorized');
        } else {
          this.toastr.error('Failed to add comment. Please try again.', 'Error');
        }
      }
    });
  }
  

  
  selectedTime: string = '';  // الوقت المحدد

// أضف هذه الخصائص
activeImageIndex: number = 0;
isModalOpen: boolean = false;
modalImageIndex: number = 0;

// دوال التحكم بالصور
getActiveImage(): string {
  return this.tourDetails?.galleryImages?.length > 0 ? 
         this.tourDetails.galleryImages[this.activeImageIndex] : 
         this.tourDetails?.mainImage || '';
}


// دوال المودال
openImageModal(index: number): void {
  this.modalImageIndex = index;
  this.isModalOpen = true;
  document.body.style.overflow = 'hidden';
}

closeModal(): void {
  this.isModalOpen = false;
  document.body.style.overflow = 'auto';
}


getModalImage(): string {
  if (!this.tourDetails?.galleryImages || this.tourDetails.galleryImages.length === 0) {
    return this.tourDetails?.mainImage || '';
  }
  return this.tourDetails.galleryImages[this.modalImageIndex];
}

setModalImage(index: number): void {
  this.modalImageIndex = index;
}
  // تحديث عدد الضيوف

  // تحديث إجمالي السعر بناءً على عدد الأشخاص
  updateTotalPrice() {
    // افترض أن السعر هو لكل شخص بالغ فقط.
    this.totalPrice = this.adults * 50; // قيمة افتراضية للسعر لكل شخص
    if (this.selectedDate) {
      // خصم السعر بناءً على التاريخ المحدد
      this.totalPrice += 10; // مثال لتعديل السعر حسب التاريخ
    }
  }

  // عند تغيير التاريخ المحدد
  
  formatDate(date: string): string {
    const dateObj = new Date(date);
    return dateObj.toISOString().split('T')[0];  // Format as yyyy-MM-dd
  }
  // دالة للحجز
// Updated bookNow function to handle payment session with proper type casting
// In your component.ts file - Update the bookNow function

bookNow() {
  if (!this.tourDetails) return;

  // Get form values
  const selectedDate = this.bookingForm.value.selectedDate;
  const selectedTime = this.bookingForm.value.selectedTime;
  const isDepositPayment = this.bookingForm.value.isDepositPayment;

  // Format the date
  const formattedDate = this.formatDate(selectedDate);

  // Prepare booking data including the deposit payment option
  const bookingData = {
    tourId: this.tourDetails.id,
    tourDate: formattedDate,
    tourTime: selectedTime,
    adultsCount: this.bookingForm.value.adults,
    childrenCount: this.bookingForm.value.children,
    isDepositPayment: isDepositPayment
  };

  // Send booking data to API
  this.tourService.bookTour(bookingData).subscribe({
    next: (response) => {
      this.toastr.success('Tour booked successfully!', 'Success');
      console.log('Booking response:', response);
      
      // If we have a payment URL from the response
      if (response.paymentUrl) {
        this.session = response.paymentUrl;
        console.log('Payment session set:', this.session);
        
        // Update the session.id field
        this.updatePaymentForm();
        
        // Automatically submit the payment form after a short delay to ensure DOM updates
        setTimeout(() => {
          const form = document.getElementById('paymentForm') as HTMLFormElement;
          if (form) {
            form.submit();
          }
        }, 300);
      }
    },
    error: (error) => {
      console.error('Error booking tour:', error);
      this.toastr.error('Failed to book tour. Please try again.', 'Error');
    }
  });
}

// Add this helper method to update the payment form
updatePaymentForm() {
  setTimeout(() => {
    const sessionInput = document.querySelector('input[name="session.id"]') as HTMLInputElement;
    if (sessionInput) {
      sessionInput.value = this.session;
    }
  }, 100);
}
}
