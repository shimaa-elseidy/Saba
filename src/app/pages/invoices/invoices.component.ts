import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Invoice } from '../../Intrerfaces/Invoice';
import { InvoiceService } from '../../services/Invoice/invoice.service';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [NgFor, RouterModule, CommonModule, DatePipe, FormsModule, NgClass, NgIf],
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class InvoicesComponent implements OnInit {
  filters: string[] = ['All', 'Deleted'];
  originalInvoices: Invoice[] = [];
  Invoices: Invoice[] = [];
  statusOptions: { id: number, name: string }[] = []; // تحديث نوع البيانات لتخزين الـ id و name

  startDate: string = ''; // تخزين تاريخ البداية
  endDate: string = ''; // تخزين تاريخ النهاية
  currentPage: number = 1; // الصفحة الحالية
  itemsPerPage: number = 10; // عدد العناصر في الصفحة الواحدة

  constructor(private invoiceService: InvoiceService,
    private toastr : ToastrService
  ) {}

  ngOnInit(): void {
    this.fetchStatuses(); // جلب الـ Statuses
    this.fetchInvoices(); // جلب الفواتير
  }

  // جلب الـ Statuses من الـ API
  fetchStatuses(): void {
    this.invoiceService.getStatuses().subscribe({
      next: (statuses: { id: number, name: string }[]) => {
        this.statusOptions = statuses; // تخزين الـ Statuses
      },
      error: (error) => {
        console.error('Error fetching statuses:', error);
      }
    });
  }

// تحديث حالة الفاتورة

onStatusChange(invoice: Invoice): void {
  // console.log(`Status changed for invoice ${invoice.invoiceNumber} to ${invoice.status}`);
  
  const invoiceIdentifier = invoice.invoiceNumber;
  
  this.invoiceService.updateInvoiceStatus(invoiceIdentifier, invoice.status).subscribe({
    next: (response) => {
      // console.log('Invoice status updated successfully:', response);
      this.toastr.success(response.message + ` to ${invoice.status}`, 'Success');
    },
    error: (error) => {
      // console.error('Error updating invoice status:', error);
      this.toastr.error('Failed to update invoice status', 'Error');
    }
  });
}


  getDisplayedInvoices(): Invoice[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = this.currentPage * this.itemsPerPage;
    return this.Invoices.slice(startIndex, endIndex);
  }

  getEntriesInfoText(): string {
    const totalInvoices = this.Invoices.length;
    const displayedInvoices = this.getDisplayedInvoices().length;
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(start + displayedInvoices - 1, totalInvoices);
    return `Showing ${start} to ${end} of ${totalInvoices} entries`;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'OnReview':
        return 'status-review';
      case 'Completed':
        return 'status-completed';
      case 'Rejected':
        return 'status-rejected';
      case 'Canceled':
        return 'status-canceled';
      case 'Onprogress':
        return 'status-onprogress';
      default:
        return '';
    }
  }

  filter(status: string) {
    if (status === 'All') {
      this.startDate = ''; // إعادة ضبط تاريخ البداية
      this.endDate = ''; // إعادة ضبط تاريخ النهاية
      this.Invoices = [...this.originalInvoices]; // عرض جميع الفواتير
    } else {
      this.Invoices = this.originalInvoices.filter(invoice => invoice.status === status);
    }
  }

  applyDateFilter(): void {
    if (!this.startDate && !this.endDate) {
      this.Invoices = [...this.originalInvoices]; // إذا لم يتم تحديد تواريخ، اعرض كل الفواتير
      return;
    }

    this.Invoices = this.originalInvoices.filter(invoice => {
      const invoiceDate = new Date(invoice.issueDate);
      const start = this.startDate ? new Date(this.startDate) : null;
      const end = this.endDate ? new Date(this.endDate) : null;

      return (!start || invoiceDate >= start) && (!end || invoiceDate <= end);
    });
  }
  get totalPages(): number {
    return Math.ceil(this.Invoices.length / this.itemsPerPage);
  }
  fetchInvoices(): void {
    this.invoiceService.getInvoices().subscribe({

      next: (data: Invoice[]) => {
      console.log(data);

        this.originalInvoices = data;
        this.Invoices = [...data];
        this.startDate = ''; // إعادة ضبط تاريخ البداية
        this.endDate = ''; // إعادة ضبط تاريخ النهاية
      },
      
      error: (error) => {
        console.error('Error fetching invoices:', error);
      }
    });
  }
}

