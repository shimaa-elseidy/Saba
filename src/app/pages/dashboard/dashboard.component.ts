import { LoadingService } from './../../services/loading.service';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { NavbarDashboardComponent } from '../../components/navbar-dashboard/navbar-dashboard.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { LoadingComponent } from "../../components/loading/loading.component";

@Component({
    selector: 'app-dashboard',
    standalone:true,
    imports: [
    CommonModule,
    RouterModule,
    SidebarComponent,
    NavbarDashboardComponent,
    NgxChartsModule,
    LoadingComponent
],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit , OnDestroy {
  pageTitle :string = 'Dashboard';
  isLoading = false;
  private loadingService: LoadingService;
  private subscriptions: any[] = [];
  private cdr: ChangeDetectorRef
  updateTitle(title: string) {
    this.pageTitle = title;
  }
      ngOnInit(): void {
    // Subscribe to loading state changes
    const loadingSub = this.loadingService.loading$.subscribe((loading) => {
      if (this.isLoading !== loading) {
        this.isLoading = loading;
        this.cdr.detectChanges();
      }
    });
    this.subscriptions.push(loadingSub);
  }
    ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
