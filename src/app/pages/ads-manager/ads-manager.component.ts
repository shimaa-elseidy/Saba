import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-ads-manager',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ads-manager.component.html',
  styleUrls: ['./ads-manager.component.scss']
})
export class AdsManagerComponent {
  showColumnSelector = false;
  
  columns = [
    { key: 'checkbox', name: 'Select', visible: true },
    { key: 'id', name: 'ID', visible: true },
    { key: 'package', name: 'Ad Package', visible: true },
    { key: 'startDate', name: 'Start Date', visible: true },
    { key: 'endDate', name: 'End Date', visible: true },
    { key: 'amount', name: 'Amount', visible: true },
    { key: 'status', name: 'Status', visible: true }
  ];
  
  constructor() {
  }
  
  Ads = [
    { ID: '532', 'Ad Package': 'Silver', 'Advertised on': 'Visa', 'Start Date': 'March 13, 2025 1:46 am', 'End Date':'March 13, 2025 1:46 am', status: 'Completed' ,amount:'$50.00' },
    { ID: '195', 'Ad Package': 'Silver', 'Advertised on': 'Mastercard', 'Start Date': 'March 13, 2025 1:46 am', 'End Date':'March 13, 2025 1:46 am', status: 'Pending',amount:'$100.00' },
    { ID: '262', 'Ad Package': 'Business', 'Advertised on': 'Cash', 'Start Date': 'March 13, 2025 1:46 am', 'End Date':'March 13, 2025 1:46 am', status: 'Failed',amount:'$1200.00' },
    { ID: '268', 'Ad Package': 'Gold', 'Advertised on': 'Manual', 'Start Date': 'March 13, 2025 1:46 am', 'End Date':'March 13, 2025 1:46 am', status: 'Rejected' ,amount:'$520.00'},
    { ID: '332', 'Ad Package': 'Silver', 'Advertised on': 'Bank transfer', 'Start Date': 'March 13, 2025 1:46 am', 'End Date':'March 13, 2025 1:46 am', status: 'On progress',amount:'$362.00' },
    { ID: '695', 'Ad Package': 'Platinum', 'Advertised on': 'Cash', 'Start Date': 'March 13, 2025 1:46 am', 'End Date':'March 13, 2025 1:46 am', status: 'Refund' ,amount:'$560.00'},
    { ID: '985', 'Ad Package': 'Gold', 'Advertised on': 'Visa', 'Start Date': 'March 13, 2025 1:46 am', 'End Date':'March 13, 2025 1:46 am', status: 'Rejected' ,amount:'$780.00'},
    { ID: '458', 'Ad Package': 'Platinum', 'Advertised on': 'Visa', 'Start Date': 'March 13, 2025 1:46 am', 'End Date':'March 13, 2025 1:46 am', status: 'On Review' ,amount:'$950.00'},
    { ID: '782', 'Ad Package': 'Business', 'Advertised on': 'Visa', 'Start Date': 'March 13, 2025 1:46 am', 'End Date':'March 13, 2025 1:46 am', status: 'On Review' ,amount:'$1200.00'}
  ];

  getStatusClass(status: string): string {
    switch (status) {
      case 'Completed': return 'completed';
      case 'Pending': return 'pending';
      case 'Failed': return 'failed';
      case 'Rejected': return 'rejected';
      case 'On progress': return 'on-progress';
      case 'Refund': return 'refund';
      case 'On Review': return 'On-review';
      default: return '';
    }
  }

  getPackageClass(Package: string): string {
    switch (Package) {
      case 'Business': return 'business';
      case 'Gold': return 'gold';
      case 'Platinum': return 'platinum';
      case 'Silver': return 'silver';
      
      default: return '';
    }
  }
  
  toggleColumnSelector() {
    this.showColumnSelector = !this.showColumnSelector;
  }
  
  toggleColumn(key: string) {
    const column = this.columns.find(col => col.key === key);
    if (column) {
      column.visible = !column.visible;
    }
  }
  
  isColumnVisible(key: string): boolean {
    const column = this.columns.find(col => col.key === key);
    return column ? column.visible : true;
  }
}