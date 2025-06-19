import { Component } from '@angular/core';
import { AuthService } from '../../services/Auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../../services/Invoice/invoice.service';

@Component({
    selector: 'app-users',
    standalone:true,

    imports: [NgFor,DatePipe,FormsModule,CommonModule],
    templateUrl: './users.component.html',
    styleUrl: './users.component.scss'
})
export class UsersComponent {
    invoices: any[] = [];
    isLoading = true;
    currentPage: number = 1; // الصفحة الحالية
  itemsPerPage: number = 10; // عدد العناصر في الصفحة الواحدة
  statusOptions: { id: number, name: string }[] = []; // تحديث نوع البيانات لتخزين الـ id و name
  startDate: string = '';  // تخزين تاريخ البداية
  endDate: string = '';    // تخزين تاريخ النهاية
    filters: string[] = ['All', 'Deleted'];
    originalInvoices: any[] = [];
    constructor(
      private authService: AuthService,
      private invoiceService :InvoiceService,

      private toastr: ToastrService
    ) {}
  
    ngOnInit(): void {
    this.fetchStatuses(); // جلب الـ Statuses

      this.authService.fetchInvoices().subscribe({
        next: (data) => {
          this.invoices = data;
          this.originalInvoices = [...data]; // Store original data
          this.isLoading = false;
        },
        error: (err) => {
          this.toastr.error('Error fetching invoices', 'Error');
          this.isLoading = false;
        }
      });
    }

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
    
    filter(status: string) {
      if (status === 'All') {
        this.startDate = ''; // إعادة ضبط تاريخ البداية
        this.endDate = ''; // إعادة ضبط تاريخ النهاية
        this.invoices = [...this.originalInvoices]; // عرض جميع الفواتير
      } else {
        this.invoices = this.originalInvoices.filter(invoice => invoice.status === status);
      }
    }
    
    
    applyDateFilter(): void {
      // Reset to original data first
      this.invoices = [...this.originalInvoices];
      
      if (!this.startDate && !this.endDate) {
        return; // No filtering needed
      }
      
      const start = this.startDate ? new Date(this.startDate) : null;
      const end = this.endDate ? new Date(this.endDate) : null;
      
      // If we have start/end dates, normalize them to midnight for proper comparison
      if (start) start.setHours(0, 0, 0, 0);
      if (end) end.setHours(23, 59, 59, 999); // End of day
      
      this.invoices = this.invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.issueDate);
        invoiceDate.setHours(0, 0, 0, 0); // Normalize invoice date
        
        // Check if date is within range
        const afterStart = !start || invoiceDate >= start;
        const beforeEnd = !end || invoiceDate <= end;
        
        return afterStart && beforeEnd;
      });
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
    getDisplayedInvoices(): any[] {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.invoices.slice(startIndex, endIndex);
    }

    // أضف دالة لحساب إجمالي الصفحات
get totalPages(): number {
  return Math.ceil(this.invoices.length / this.itemsPerPage);
}

}
