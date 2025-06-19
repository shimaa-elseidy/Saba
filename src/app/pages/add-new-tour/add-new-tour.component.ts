import { CommonModule, NgFor, NgIf } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import 'quill/dist/quill.snow.css';
import { TourService } from '../../services/Tours/tour.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';

// 1. Update the custom validator to handle empty values
function minLengthArray(min: number) {
  return (formArray: FormArray) => {
    if (!formArray) return { minLengthArray: true };
    // Count only non-empty values
    const nonEmptyValues = formArray.controls.filter(control =>
      control.value && control.value.toString().trim() !== ''
    );
    return nonEmptyValues.length >= min ? null : { minLengthArray: true };
  };
}

@Component({
  selector: 'app-add-new-tour',
  standalone: true,
  imports: [CommonModule, QuillModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-new-tour.component.html',
  styleUrls: ['./add-new-tour.component.scss'],
})
export class AddNewTourComponent implements OnInit {
  isEditMode: boolean = false;
tourId: number | null = null;
  tourForm: FormGroup;
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  newTag: string = ''; // تعريف المتغير
  modules: any; // ✅ تعريف متغير modules
  availableDates: { date: Date; price: number; maxGuests: number }[] = [];

  @ViewChild('mainImage') mainImageInput!: ElementRef;
  @ViewChild('headerImage') headerImageInput!: ElementRef;
  @ViewChild('galleryImage') galleryImageInput!: ElementRef;

  mainImageUrl: string | null = null;
  headerImageUrl: string | null = null;

  currentDate = new Date();
  displayedMonth: number = this.currentDate.getMonth();
  displayedYear: number = this.currentDate.getFullYear();
  calendarData: any[] = [];

 constructor(
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private tourService: TourService,
    private toastr: ToastrService,
    private route : ActivatedRoute
  ) {
    this.tourForm = this.fb.group({
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\+?[1-9]\d{1,14}$/), // Accepts international phone numbers
        ],
      ],
      tourTitle: ['', [Validators.required, Validators.minLength(3)]],
      selectedCategory: ['', Validators.required],
      tourDays: [0, [Validators.required, Validators.min(1)]],
      tourNights: [0, [Validators.required, Validators.min(0)]],
      tourPrice: ['', [Validators.required, Validators.min(1)]],
      adultPrice: ['', [Validators.required, Validators.min(1)]],
      depositPercentage: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      childrenPrice: ['', [Validators.required, Validators.min(0)]],
      infantPrice: ['', [Validators.required, Validators.min(0)]],
      featured: [false],
      verified: [false],
      guests: this.fb.group({
        adult: [0],
        child: [0],
        infant: [0],
        capacity: [0],
      }),
      tourPlans: this.fb.array([]),
      newPlace: new FormControl(''),
      places: this.fb.array([], minLengthArray(1)),
      newTag: new FormControl(''),
      tags: this.fb.array([], minLengthArray(1)),
      newStartTour: new FormControl(''),
      startTours: this.fb.array([], minLengthArray(1)),
      newPickUp: new FormControl(''),
      pickUps: this.fb.array([], minLengthArray(1)),
      headerImage: [null],
      galleryImages: this.fb.array([]),
      tourDescription: [''],
      facilities: this.fb.array([]),
      facts: this.fb.array([]),
      services: this.fb.array([]),
      includes: this.fb.array([]),
      excludes: this.fb.array([]),
      terms: this.fb.array([]),
      availableDates: [],
    });

    this.modules = {
      toolbar: [
        ['bold', 'italic', 'underline'],
        [{ header: 1 }, { header: 2 }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        ['link', 'image'],
        ['clean'],
      ],
    };
    this.addTourPlan();
    this.addFacility();
    this.addInclude();
    this.addExclude();
    this.addFact();
    this.addService();
    this.addTerms();
  }

  ngOnInit() {
    this.currentDate = new Date();
    this.displayedMonth = this.currentDate.getMonth();
    this.displayedYear = this.currentDate.getFullYear();
    this.generateCalendar(); // توليد التقويم للشهر الحالي
    
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.tourId = +id;
        this.loadTourData(this.tourId); // تحميل بيانات الجولة
      }
    });
  }


  
  loadTourData(tourId: number) {
    this.tourService.getTourById(tourId).subscribe({
      next: (tour) => {
        this.tourForm.patchValue({
          tourTitle: tour.tourTitle,
          selectedCategory: tour.tourCategory.toString(),
          tourDays: tour.tourDay,
          tourNights: tour.tourNight,
          tourPrice: tour.tourPrice,
          adultPrice: tour.adultPrice,
          childrenPrice: tour.childrenPrice,
          infantPrice: tour.infantPrice,
          depositPercentage: tour.depositPercentage,
          guests: {
            adult: tour.guestsCapabilityAdult,
            child: tour.guestsCapabilityChildren,
            infant: tour.guestsCapabilityInfant,
          },
          tourDescription: tour.tourDescription,
          places: tour.places,
          tags: tour.tourTags,
          startTours: tour.startTour ? [tour.startTour] : [],
          pickUps: tour.pickUp ? [tour.pickUp] : [],
          facilities: tour.tourFacilities.map((f: any) =>
            this.fb.group({
              title: f.title,
              description: f.description,
            })
          ),
          facts: tour.tourFacts.map((f: any) =>
            this.fb.group({
              title: f.title,
              number: f.value,
              description: f.description,
            })
          ),
          services: tour.additionalServiceFees.map((s: any) =>
            this.fb.group({
              name: s.serviceName,
              price: s.price,
              description: s.description,
            })
          ),
          includes: tour.tourIncludes.map((i: any) =>
            this.fb.group({ option: i })
          ),
          excludes: tour.tourExcludes.map((e: any) =>
            this.fb.group({ option: e })
          ),
          terms: tour.termsAndConditions.map((t: any) =>
            this.fb.group({
              title: t.title,
              description: t.description,
            })
          ),
          galleryImages: tour.galleryImages,
          availableDates: tour.availableDates,
          featured: tour.isFeatured,
          verified: tour.isVerified,
        });

        this.mainImageUrl = tour.mainImage;
        this.headerImageUrl = tour.headerImages[0] || null;
        this.availableDates = tour.availableDates;
        this.generateCalendar();
      },
      error: (err) => {
        console.error('Failed to load tour data:', err);
      },
    });
  }

  get places(): FormArray {
    return this.tourForm.get('places') as FormArray;
  }

  get tags(): FormArray {
    return this.tourForm.get('tags') as FormArray;
  }

  get startTours(): FormArray {
    return this.tourForm.get('startTours') as FormArray;
  }
  
  get pickUps(): FormArray {
    return this.tourForm.get('pickUps') as FormArray;
  }
  // إرجاع الـ FormArray بشكل صحيح
  get facilities(): FormArray {
    return this.tourForm.get('facilities') as FormArray;
  }

  // Getter للحصول على `FormArray`
  get facts(): FormArray {
    return this.tourForm.get('facts') as FormArray;
  }

  get services(): FormArray {
    return this.tourForm.get('services') as FormArray;
  }

  // إرجاع `FormGroup` لكل عنصر عند التكرار في `*ngFor`

  // Getter للحصول على `FormArray`
  get includes(): FormArray {
    return this.tourForm.get('includes') as FormArray;
  }

  get excludes(): FormArray {
    return this.tourForm.get('excludes') as FormArray;
  }

  get terms(): FormArray {
    return this.tourForm.get('terms') as FormArray;
  }
  // إرجاع قائمة الخطط
  get tourPlans(): FormArray {
    return this.tourForm.get('tourPlans') as FormArray;
  }

  get guests() {
    return this.tourForm.get('guests') as FormGroup;
  }

  setButtonValue(field: 'featured' | 'verified') {
    this.tourForm.patchValue({ [field]: true });
  }
  addPlace() {
    const newPlaceValue = this.tourForm.get('newPlace')?.value?.trim();
    if (newPlaceValue && newPlaceValue.length > 0) {
      this.places.push(new FormControl(newPlaceValue, Validators.required));
      this.tourForm.get('newPlace')?.setValue('');
      this.places.updateValueAndValidity();
    } else {
      this.toastr.warning('Please enter a valid place name', 'Validation');
    }
  }

  removePlace(index: number) {
    this.places.removeAt(index);
    this.places.updateValueAndValidity();
  }

  addStartTour() {
    const newStartTourValue = this.tourForm.get('newStartTour')?.value?.trim();
    if (newStartTourValue && newStartTourValue.length > 0) {
      this.startTours.push(new FormControl(newStartTourValue, Validators.required));
      this.tourForm.get('newStartTour')?.setValue('');
      this.startTours.updateValueAndValidity();
    } else {
      this.toastr.warning('Please enter a valid start tour location', 'Validation');
    }
  }

  removeStartTour(index: number) {
    this.startTours.removeAt(index);
    this.startTours.updateValueAndValidity();
  }
  
  // Add methods for pickUp
  addPickUp() {
    const newPickUpValue = this.tourForm.get('newPickUp')?.value?.trim();
    if (newPickUpValue && newPickUpValue.length > 0) {
      this.pickUps.push(new FormControl(newPickUpValue, Validators.required));
      this.tourForm.get('newPickUp')?.setValue('');
      this.pickUps.updateValueAndValidity();
    } else {
      this.toastr.warning('Please enter a valid pickup location', 'Validation');
    }
  }

  removePickUp(index: number) {
    this.pickUps.removeAt(index);
    this.pickUps.updateValueAndValidity();
  }
  

  trackByFn(index: number): number {
    return index;
  }
  // دالة لإضافة التاجات
   // دالة لإضافة التاجات
   addTag() {
    const newTagValue = this.tourForm.get('newTag')?.value?.trim();
    if (newTagValue && newTagValue.length > 0) {
      this.tags.push(new FormControl(newTagValue, Validators.required));
      this.tourForm.get('newTag')?.setValue('');
      this.tags.updateValueAndValidity();
    } else {
      this.toastr.warning('Please enter a valid tag', 'Validation');
    }
  }
  removeTag(index: number) {
    this.tags.removeAt(index);
    this.tags.updateValueAndValidity();
  }

  getFacilityFormGroup(index: number): FormGroup {
    return this.facilities.at(index) as FormGroup;
  }
  // إضافة عنصر جديد للمرافق
  addFacility() {
    this.facilities.push(
      this.fb.group({
        title: [''],
        description: [''],
      })
    );
  }

  // حذف عنصر من القائمة
  removeFacility(index: number) {
    this.facilities.removeAt(index);
  }

  getFactFormGroup(index: number): FormGroup {
    return this.facts.at(index) as FormGroup;
  }

  getServiceFormGroup(index: number): FormGroup {
    return this.services.at(index) as FormGroup;
  }
  addFact() {
    this.facts.push(this.fb.group({ title: '', number: '', description: '' }));
  }

  addService() {
    this.services.push(this.fb.group({ name: '', price: '', description: '' }));
  }

  // حذف عنصر معين من `FormArray`
  removeFact(index: number) {
    if (this.facts.length > 1) {
      this.facts.removeAt(index);
    }
  }

  removeService(index: number) {
    if (this.services.length > 1) {
      this.services.removeAt(index);
    }
  }

  // إرجاع `FormGroup` لكل عنصر عند التكرار في `*ngFor`
  getIncludeFormGroup(index: number): FormGroup {
    return this.includes.at(index) as FormGroup;
  }

  getExcludeFormGroup(index: number): FormGroup {
    return this.excludes.at(index) as FormGroup;
  }
  addInclude() {
    this.includes.push(this.fb.group({ option: [''] }));
  }

  addExclude() {
    this.excludes.push(this.fb.group({ option: [''] }));
  }

  // حذف عنصر معين من `FormArray`
  removeInclude(index: number) {
    if (this.includes.length > 1) {
      this.includes.removeAt(index);
    }
  }

  removeExclude(index: number) {
    if (this.excludes.length > 1) {
      this.excludes.removeAt(index);
    }
  }

  getTermFormGroup(index: number): FormGroup {
    return this.terms.at(index) as FormGroup;
  }

  // إضافة عنصر جديد إلى `FormArray`
  addTerms() {
    this.terms.push(this.fb.group({ title: '', description: '' }));
  }

  // حذف عنصر معين من `FormArray`
  removeTerms(index: number) {
    if (this.terms.length > 1) {
      this.terms.removeAt(index);
    }
  }
  addTourPlan() {
    this.tourPlans.push(
      this.fb.group({
        title: [''],
        description: [''],
        imageUrl: [null], // لحفظ الصورة كـ Base64
      })
    );
  }

  // حذف خطة معينة
  deleteItem(index: number) {
    this.tourPlans.removeAt(index);
  }

  triggerFileInput(imageType: string) {
    if (imageType === 'mainImage') {
      this.mainImageInput.nativeElement.click();
    } else if (imageType === 'headerImage') {
      this.headerImageInput.nativeElement.click();
    } else if (imageType === 'galleryImage') {
      this.galleryImageInput.nativeElement.click();
    }
  }

  onFileSelected(event: Event, imageType: string) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    if (imageType === 'galleryImage') {
      this.uploadGalleryImages(input.files);
    } else {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        if (imageType === 'mainImage') {
          this.mainImageUrl = reader.result as string;
          this.tourForm.patchValue({ mainImage: this.mainImageUrl });
        } else if (imageType === 'headerImage') {
          this.headerImageUrl = reader.result as string;
          this.tourForm.patchValue({ headerImage: this.headerImageUrl });
        }
        this.cdr.detectChanges();
      };

      reader.readAsDataURL(file);
    }
  }
  get galleryImages(): FormArray {
    return this.tourForm.get('galleryImages') as FormArray;
  }
  uploadGalleryImages(files: FileList) {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        this.galleryImages.push(new FormControl(reader.result as string));
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    });
  }

  uploadFile(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        this.tourPlans.at(index).patchValue({ imageUrl: reader.result });
      };

      reader.readAsDataURL(file);
    }
  }

  removeImage(index: number) {
    this.galleryImages.removeAt(index);
    this.cdr.detectChanges();
  }
  generateCalendar() {
    const firstDay = new Date(this.displayedYear, this.displayedMonth, 1);
    const lastDay = new Date(this.displayedYear, this.displayedMonth + 1, 0);
    const daysInMonth = lastDay.getDate();

    this.calendarData = [];
    for (let day = 1; day <= daysInMonth; day++) {
      this.calendarData.push({
        date: new Date(this.displayedYear, this.displayedMonth, day),
        price:
          Math.random() > 0.5 ? Math.floor(Math.random() * 5000) + 1000 : null,
        optionsForm: false,
        priceSet: false, // للتأكد من عرض السعر فقط بعد تحديده
        maxGuests: 0,
        adultPrice: 0,
        childrenPrice: 0,
      });
    }
  }
  
  changeMonth(step: number) {
    this.displayedMonth += step;
    if (this.displayedMonth < 0) {
      this.displayedMonth = 11;
      this.displayedYear--;
    } else if (this.displayedMonth > 11) {
      this.displayedMonth = 0;
      this.displayedYear++;
    }
    this.generateCalendar();
  }

  openOptionsForm(day: any) {
    day.optionsForm = true; // فتح الفورم عند الضغط على السهم
  }
  selectDate(day: any) {
    const dateIndex = this.availableDates.findIndex(
      (d: any) => new Date(d.date).getTime() === day.date.getTime()
    );

    if (dateIndex !== -1) {
      this.availableDates.splice(dateIndex, 1);
    } else {
      this.availableDates.push({
        date: day.date,
        price: day.price,
        maxGuests: day.maxGuests,
      });
    }

    this.tourForm.patchValue({ availableDates: this.availableDates });
  }

  isSelected(date: Date): boolean {
    return this.availableDates.some((d) => {
      const dDate = d.date instanceof Date ? d.date : new Date(d.date);
      return dDate.getTime() === date.getTime();
    });
  }

  updatePrice(day: any, event: any) {
    day.price = event.target.value;
  }
  setPrice(day: any) {
    if (day.maxGuests && day.adultPrice >= 0 && day.childrenPrice >= 0) {
      const totalPrice =
        day.adultPrice * day.maxGuests + day.childrenPrice * day.maxGuests;
      console.log('Total Price:', totalPrice); // تحقق من السعر
      day.price = totalPrice;
      day.priceSet = true;
      day.optionsForm = false;
      console.log('Updated Day:', day); // تحقق من التحديثات
    }
  }

  // 5. Update the submit method with better validation
  submitTour() {
    this.tourForm.markAllAsTouched();

    let hasErrors = false;
    const errors: string[] = [];

    if (!this.hasValidPlaces()) {
      errors.push('Please add at least one place');
      hasErrors = true;
    }
    if (!this.hasValidTags()) {
      errors.push('Please add at least one tag');
      hasErrors = true;
    }
    if (!this.hasValidStartTours()) {
      errors.push('Please add at least one start tour location');
      hasErrors = true;
    }
    if (!this.hasValidPickUps()) {
      errors.push('Please add at least one pickup location');
      hasErrors = true;
    }
    if (!this.mainImageUrl) {
      errors.push('Please upload a main image');
      hasErrors = true;
    }
    if (!this.headerImageUrl) {
      errors.push('Please upload a header image');
      hasErrors = true;
    }
    if (this.galleryImages.length === 0) {
      errors.push('Please upload at least one gallery image');
      hasErrors = true;
    }
    if (this.availableDates.length === 0) {
      errors.push('Please select at least one available date');
      hasErrors = true;
    }
    if (this.includes.length === 0) {
      errors.push('Please add at least one item to Tour Includes');
      hasErrors = true;
    }
    if (this.excludes.length === 0) {
      errors.push('Please add at least one item to Tour Excludes');
      hasErrors = true;
    }
    if (this.tourPlans.length === 0) {
      errors.push('Please add at least one tour plan');
      hasErrors = true;
    }
    if (this.facts.length === 0) {
      errors.push('Please add at least one tour fact');
      hasErrors = true;
    }
    if (this.facilities.length === 0) {
      errors.push('Please add at least one tour facility');
      hasErrors = true;
    }
    if (this.terms.length === 0) {
      errors.push('Please add at least one term and condition');
      hasErrors = true;
    }
    if (this.services.length === 0) {
      errors.push('Please add at least one additional service fee');
      hasErrors = true;
    }

    if (hasErrors) {
      errors.forEach(error => {
        this.toastr.error(error, 'Validation Error');
      });
      return;
    }

    if (this.tourForm.invalid) {
      this.toastr.error('Please fill all required fields correctly.', 'Validation Error');
      return;
    }

    const payload = this.prepareTourPayload();
    console.log('Payload:', payload);

    this.tourService.submitTourData({ tourDto: payload }).subscribe({
      next: (res) => {
        this.toastr.success('Tour created successfully', 'Success');
        this.router.navigate(['/listingTours']);
      },
      error: (err) => {
        console.error('Submit error:', err);
        this.toastr.error('Tour Failed To Create', 'Failed');
      },
    });
  }

  // 6. Update the prepareTourPayload method to filter empty values
  prepareTourPayload(): any {
    const formValue = this.tourForm.value;

    const toNumber = (val: any, fallback: number = 0) =>
      val === '' || val === null || isNaN(Number(val)) ? fallback : Number(val);

    const filterEmptyValues = (array: any[]) =>
      array.filter(item => item && item.toString().trim() !== '');

    const payload = {
      TourTitle: formValue.tourTitle,
      TourCategory: toNumber(formValue.selectedCategory),
      TourDays: toNumber(formValue.tourDays),
      TourNights: toNumber(formValue.tourNights),
      TourPrice: toNumber(formValue.tourPrice),
      AdultPrice: toNumber(formValue.adultPrice),
      DepositPercentage: toNumber(formValue.depositPercentage),
      ChildrenPrice: toNumber(formValue.childrenPrice),
      InfantPrice: toNumber(formValue.infantPrice),
      PickUp: filterEmptyValues(this.pickUps.value),
      Places: filterEmptyValues(this.places.value),
      TourTags: filterEmptyValues(this.tags.value),
      MainImage: this.mainImageUrl,
      StartTour: filterEmptyValues(this.startTours.value),
      TourFacts: this.facts.value.filter(fact => fact.title && fact.description),
      TourPlans: this.tourPlans.value.filter(plan => plan.title && plan.description),
      HeaderImages: [this.headerImageUrl],
      TourExcludes: this.excludes.value
        .map((ctrl: any) => ctrl.option)
        .filter((option: string) => option && option.trim() !== ''),
      TourIncludes: this.includes.value
        .map((ctrl: any) => ctrl.option)
        .filter((option: string) => option && option.trim() !== ''),
      GalleryImages: this.galleryImages.value.filter(img => img),
      AvailableDates: this.availableDates,
      TourFacilities: this.facilities.value.filter(facility =>
        facility.title && facility.description
      ),
      TourDescription: this.tourForm.value.tourDescription,
      TermsAndConditions: this.terms.value.filter(term =>
        term.title && term.description
      ),
      AdditionalServiceFees: this.services.value.filter(service =>
        service.name && service.price
      ),
    };

    return payload;
  }

  hasValidPlaces(): boolean {
    return this.places.controls.some(control =>
      control.value && control.value.toString().trim() !== ''
    );
  }

  hasValidTags(): boolean {
    return this.tags.controls.some(control =>
      control.value && control.value.toString().trim() !== ''
    );
  }

  hasValidStartTours(): boolean {
    return this.startTours.controls.some(control =>
      control.value && control.value.toString().trim() !== ''
    );
  }

  hasValidPickUps(): boolean {
    return this.pickUps.controls.some(control =>
      control.value && control.value.toString().trim() !== ''
    );
  }
}
