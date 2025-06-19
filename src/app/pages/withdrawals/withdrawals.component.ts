import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { catchError, of, take, tap } from 'rxjs';
import { PaymentService } from '../../services/payment/payment.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-withdrawals',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './withdrawals.component.html',
    styleUrls: ['./withdrawals.component.scss']
})
export class WithdrawalsComponent implements OnInit {
  myWalletBalance: number = 0; 
  allRefunds: number = 0; 
  paymentLastWeek: number = 0; 
  
  currentPage: number = 1;
  pageSize: number = 10; // عدد العناصر لكل صفحة
  totalEntries: number = 0; // إجمالي عدد العناصر
  allTransactions: any[] = []; // لتخزين جميع البيانات

  startDate: string = '';
  endDate: string = '';
  
  constructor(private dashboardService: DashboardService, private paymentService: PaymentService) {}
  
  transactions: any[] = []; // تعريف المصفوفة لاستقبال البيانات من API
  filteredTransactions: any[] = [];

  getStatusClass(status: string): string {
    switch (status) {
      case 'Completed': return 'completed';
      case 'Pending': return 'pending';
      case 'Failed': return 'failed';
      case 'Rejected': return 'rejected';
      case 'On progress': return 'on-progress';
      case 'Refund': return 'refund';
      default: return '';
    }
  }

  ngOnInit(): void {
    this.fetchDashStats();
    this.fetchAllPayments(); 
  }

  fetchAllPayments(): void {
    this.paymentService.getAllPayments()
      .pipe(
        take(1),
        tap((data) => {
          console.log('Fetched All Payments:', data);
          this.allTransactions = data; // تخزين جميع البيانات
          this.totalEntries = data.length;
          this.updateDisplayedTransactions(); // تحديث البيانات المعروضة
        }),
        catchError((err) => {
          console.error('Error fetching payments:', err);
          return of([]);
        })
      )
      .subscribe();
  }

  // تحديث البيانات المعروضة بناءً على الصفحة الحالية
  updateDisplayedTransactions(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    
    // إذا كان هناك تصفية بالتاريخ، نستخدم المصفوفة المصفاة
    const sourceArray = this.startDate && this.endDate ? this.filteredTransactions : this.allTransactions;
    
    this.transactions = sourceArray.slice(startIndex, endIndex);
  }

  filterByDate(): void {
    if (this.startDate && this.endDate) {
      this.filteredTransactions = this.allTransactions.filter(transaction => {
        const transactionDate = new Date(transaction.paymentDate);
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);
        return transactionDate >= start && transactionDate <= end;
      });
      
      this.totalEntries = this.filteredTransactions.length;
      this.currentPage = 1; // إعادة تعيين لأول صفحة عند التصفية
      this.updateDisplayedTransactions();
    } else {
      this.filteredTransactions = [];
      this.totalEntries = this.allTransactions.length;
      this.updateDisplayedTransactions();
    }
  }

  // الانتقال للصفحة السابقة
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedTransactions();
    }
  }

  // الانتقال للصفحة التالية
  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
      this.updateDisplayedTransactions();
    }
  }

  // الحصول على إجمالي عدد الصفحات
  getTotalPages(): number {
    return Math.ceil(this.totalEntries / this.pageSize);
  }

  getDisplayedEntries(): string {
    const startIndex = (this.currentPage - 1) * this.pageSize + 1;
    const endIndex = Math.min(this.currentPage * this.pageSize, this.totalEntries);
    return `${startIndex} to ${endIndex} of ${this.totalEntries}`;
  }

  fetchDashStats(): void {
    this.paymentService.getAllDashStats()
      .pipe(
        take(1),
        tap((data: any) => {
          console.log('Fetched Dashboard Stats:', data);
          this.myWalletBalance = this.extractCurrencyValue(data.myWalletBalance);
          this.allRefunds = this.extractCurrencyValue(data.allRefunds);
          this.paymentLastWeek = this.extractCurrencyValue(data.paymentLastWeek);
        }),
        catchError((err) => {
          console.error('Error fetching dashboard stats:', err);
          return of({ myWalletBalance: "$0", allRefunds: "$0", paymentLastWeek: "$0" });
        })
      )
      .subscribe();
  }
  
  // دالة لاستخراج القيمة العددية فقط
  extractCurrencyValue(value: string): number {
    return Number(value.replace(/[^0-9.]/g, ''));
  }
}