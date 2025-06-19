import { CommonModule, NgFor } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';
import { catchError, of, take, tap } from 'rxjs';
import { UserManagementService } from '../../services/userManagement/user-management.service';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ChatSelectionService } from '../../services/chat-selection.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [FormsModule, NgFor, CommonModule, RouterLink],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  searchTerm: string = '';
  selectedStatus: string = 'all';
  usersCount: any = 0;
  users: any[] = [];
  defaultImage: string = 'https://via.placeholder.com/40'; // Default image URL

  // Modal state
  showModal: boolean = false;
  userToDelete: any = null;

  private dashboardService = inject(DashboardService);
  private userService = inject(UserManagementService);
  private toastr = inject(ToastrService);
  private router = inject(Router);
  private chatSelectionService = inject(ChatSelectionService);

  ngOnInit(): void {
    this.getUsersCount();
    this.loadUsers();
  }

  get filteredUser(): any[] {
    if (!this.users) return [];
    
    return this.users.filter(user => {
      // Fix search filter to handle null values and check both name and email
      const searchTerm = this.searchTerm?.toLowerCase() || '';
      const userName = user.name?.toLowerCase() || '';
      const userEmail = user.email?.toLowerCase() || '';
      
      const matchesSearch = searchTerm === '' || 
                            userName.includes(searchTerm) || 
                            userEmail.includes(searchTerm);
                            
      const matchesStatus = this.selectedStatus === 'all' || user.status === this.selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }

  filterUsers(status: string): void {
    this.selectedStatus = status;
  }

  openChat(user: any) {
    if (user && user.userID) {
      this.chatSelectionService.setSelectedUserId(user.userID);
      this.router.navigate(['/dashboard/chat']);
    } else {
      this.toastr.error('User ID is missing.');
    }
  }

  // Show the delete confirmation modal
  showDeleteConfirmation(user: any): void {
    if (user && user.userID) {
      if (user.isDeleted) {
        this.toastr.warning('This user is already deleted.');
        return;
      }
      this.userToDelete = user;
      this.showModal = true;
    } else {
      this.toastr.error('User ID is missing.');
    }
  }

  // Confirm the deletion
  confirmDelete(): void {
    if (this.userToDelete && this.userToDelete.userID) {
      this.userService.getUserById(this.userToDelete.userID).subscribe({
        next: (fetchedUser) => {
          if (fetchedUser.isDeleted) {
            this.toastr.warning('This user is already deleted.');
            this.closeModal();
            return;
          }

          this.userService.deleteUserById(this.userToDelete.userID).subscribe({
            next: () => {
              this.users = this.users.filter(u => u.userID !== this.userToDelete.userID);
              this.toastr.success(`User ${this.userToDelete.name} has been deleted.`);
              this.closeModal();
            },
            error: (err) => {
              this.toastr.error('Error deleting user. Please try again.');
              this.closeModal();
            }
          });
        },
        error: (err) => {
          this.toastr.error('Error fetching user data before delete.');
          this.closeModal();
        }
      });
    }
  }

  // Close the modal
  closeModal(): void {
    this.showModal = false;
    this.userToDelete = null;
  }

  loadMore() {
    console.log('Load more users');
  }

  getUsersCount(): void {
    this.dashboardService.getUsersCount()
      .pipe(
        take(1),
        tap(),
        catchError((err) => {
          console.error('Error fetching users count:', err);
          return of(0);
        })
      )
      .subscribe((count) => {
        this.usersCount = count;
      });
  }

  loadUsers(): void {
    this.userService.getAllUsers()
      .pipe(
        take(1),
        catchError((err) => {
          console.error('Error loading users:', err);
          return of([]);
        })
      )
      .subscribe((data) => {
        this.users = data.map((user: any) => {
          let status = 'active';
          if (user.isDeleted) {
            status = 'deleted';
          } else if (user.isBanned) {
            status = 'blocked';
          } else if (!user.isEmailConfirmed) {
            status = 'pending';
          }

          return {
            ...user,
            status,
          };
        });
        console.log('Loaded Users:', this.users); // Debugging
      });
  }

  getSafeImageUrl(profilePicture: string): string {
    const defaultAvatar = '../../../assets/avatar.jpg'; // Default avatar image path

    if (!profilePicture) {
      return defaultAvatar;
    }
    if (/^[a-zA-Z0-9+/=]{100,}$/.test(profilePicture)) {
      if (profilePicture.startsWith('/9j/')) {
        return `data:image/jpeg;base64,${profilePicture}`;
      } else if (profilePicture.startsWith('iVBORw0KGgo')) {
        return `data:image/png;base64,${profilePicture}`;
      } else {
        return `data:image/jpeg;base64,${profilePicture}`;
      }
    }
    if (profilePicture.startsWith('http://') || profilePicture.startsWith('https://')) {
      return profilePicture;
    }
    return defaultAvatar;
  }

  handleImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = this.defaultImage;
  }
}