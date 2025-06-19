import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InvoiceService } from '../../services/Invoice/invoice.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-new-invoice',
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './add-new-invoice.component.html',
  styleUrl: './add-new-invoice.component.scss',
  standalone: true
})
export class AddNewInvoiceComponent implements OnInit  {

  invoiceForm: FormGroup;
  isSubmitting = false;
  users: any[] = [];


  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoiceService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.invoiceForm = this.fb.group({
      username: ['', Validators.required],
      userEmail: ['', [Validators.required, Validators.email]],
      tourName: ['', Validators.required],
      description: [''],
      invoiceNumber: [, Validators.required],
      totalAmount: ['', [
        Validators.required,
        Validators.pattern("^[0-9]+(\\.[0-9]{1,2})?$"), // يسمح بأرقام عشرية
        Validators.min(1)
      ]],      issueDate: ['', Validators.required],
      dueDate: ['', Validators.required],
      adults: ['', [Validators.required, Validators.pattern("^[0-9]+$")]],
children: ['', [Validators.required, Validators.pattern("^[0-9]+$")]],
infants: ['', [Validators.required, Validators.pattern("^[0-9]+$")]],
    });
  }
  ngOnInit(): void {
    this.getUsers();
    this.setDateValidators(); // ← هنا

  }

  getUsers() {
    this.invoiceService.getAllUsers().subscribe({
      next: (res) => {
        this.users = res;
      },
      error: (err) => {
        console.error('Failed to load users', err);
      }
    });
  }

  setDateValidators() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // إزالة الوقت
  
    this.invoiceForm.get('issueDate')?.valueChanges.subscribe(issueDateValue => {
      const issueDate = new Date(issueDateValue);
      issueDate.setHours(0, 0, 0, 0); // إزالة الوقت
  
      this.invoiceForm.get('dueDate')?.setValidators([
        Validators.required,
        (control) => {
          const dueDate = new Date(control.value);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate > issueDate ? null : { dueBeforeIssue: true };
        }
      ]);
      this.invoiceForm.get('dueDate')?.updateValueAndValidity();
    });
  
    // تحقق من أن issueDate >= اليوم الحالي
    this.invoiceForm.get('issueDate')?.setValidators([
      Validators.required,
      (control) => {
        const inputDate = new Date(control.value);
        inputDate.setHours(0, 0, 0, 0);
        return inputDate >= today ? null : { beforeToday: true };
      }
    ]);
  }
  
  onSubmit() {
    if (this.invoiceForm.valid) {
      this.isSubmitting = true;
  
      const selectedUser = this.users.find(user => user.userID === this.invoiceForm.value.username);
  
      const payload = {
        userEmail: selectedUser?.email,
        userId: selectedUser?.userID,
        tourId: this.invoiceForm.value.tourName === 'tour1' ? 1 : 2,
        invoiceNumber: this.invoiceForm.value.invoiceNumber,
        issueDate: this.invoiceForm.value.issueDate,
        dueDate: this.invoiceForm.value.dueDate,
        totalAmount: +this.invoiceForm.value.totalAmount,
        adults: +this.invoiceForm.value.adults,
        children: +this.invoiceForm.value.children,
        infants: +this.invoiceForm.value.infants,
        description: this.invoiceForm.value.description || ''
      };
  
      this.invoiceService.createInvoice(payload).subscribe({
        next: (response) => {
          console.log('Invoice Created:', response);
          this.toastr.success('Invoice added successfully');
          this.invoiceForm.reset();
          
          // Navigate back to invoices page after short delay
          setTimeout(() => {
            this.router.navigate(['/dashboard/invoices']);
          }, 1500);
        },
        error: (error) => {
          console.error('Error creating invoice:', error);
          this.toastr.error('Failed to create invoice');
          this.isSubmitting = false;
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
  
    } else {
      // Mark all form controls as touched to trigger validation messages
      Object.keys(this.invoiceForm.controls).forEach(key => {
        const control = this.invoiceForm.get(key);
        control?.markAsTouched();
      });
      
      console.warn('Form is invalid');
      this.toastr.warning('Please fill all required fields correctly');
    }
  }
  
  
  
  
  


}
