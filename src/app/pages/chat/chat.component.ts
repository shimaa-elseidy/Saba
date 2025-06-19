import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Subscription, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { SignalRService } from '../../services/sign-ir.service';
import { ChatSelectionService } from '../../services/chat-selection.service';
import { environment } from '../../../environment/environment';
import Swal from 'sweetalert2';
interface User {
  id: string;
  name: string;
  profilePicture?: string;
  role: string;
}

interface BackendUser {
  userID: string;
  name: string;
  email: string;
  profilePicture: string;
  lastSeen: string | null;
  isDeleted: boolean;
  isBanned: boolean;
  role: string;
  isEmailConfirmed: boolean;
  createdAt: string;
}

interface Message {
  id: number;
  senderId: string;
  receiverId?: string;
  message: string;
  sentAt: Date;
  isRead: boolean;
  senderName?: string;
  senderProfilePicture?: string;
  imagePath?: string;
}

interface UserData {
  userId: string;
  name: string;
  lastName: string;
  username: string;
  gender: string;
  email: string;
  phone: string;
  profilePicture: string;
  roleId: number;
  roleName: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [NgFor, NgClass, FormsModule, NgIf, DatePipe],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  users: User[] = [];
  selectedUser: User | null = null;
  messages: Message[] = [];
  notifications: any[] = [];
  showNotifications: boolean = false;
  showUserPairs: boolean = true;
  newMessage: string = '';
  currentUserRole: 'admin' | 'employee' | 'user' = 'user';
  currentUserId: string | null = null;
  currentUserName: string | null = null;
  currentUserProfilePicture: string | null = null;
  showSidebar: boolean = false;
  searchTerm: string = '';
  private apiUrl = environment.apiUrl + '/Chat';
  private usersApiUrl = environment.apiUrl + '/ManageUser/GetAllUsers';
  private notificationsApiUrl = environment.apiUrl + '/Chat/notifications';
  private sendWithImageApiUrl = environment.apiUrl + '/Chat/send-with-image';
  private sendTextApiUrl = environment.apiUrl + '/Chat/send';
  private adminConversationApiUrl = environment.apiUrl + '/Chat/admin/conversation';
  private adminMessageApiUrl = environment.apiUrl + '/Chat/admin/message';
  private userPairsApiUrl = environment.apiUrl + '/Chat/admin/user-pairs';
  private signalRSubscription!: Subscription;
  private chatSelectionSubscription!: Subscription;
  defaultImage = '';

  selectedImageBase64: string | null = null;
  selectedImageFile: File | null = null;
  previewImageUrl: string | null = null;
  selectedPair: any = null;
  userPairs: any[] = [];
  typingUsers: { id: string, name: string }[] = [];
  isTyping: boolean = false;
  typingTimeout: any = null;
  otherUserTyping: boolean = false;
  windowWidth: number = window.innerWidth;
  pairMessages: Message[] = [];

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private signalRService: SignalRService,
    private route: ActivatedRoute,
    private router: Router,
    private chatSelectionService: ChatSelectionService
  ) {}

  ngOnInit(): void {
    this.showSidebar = window.innerWidth > 768;
    this.windowWidth = window.innerWidth;

    const token = localStorage.getItem('token');
    if (!token) {
      this.toastr.error('Please login to access the chat', 'Error');
      return;
    }

    const userData = this.getUserData();
    if (!userData) {
      this.toastr.error('User data not found. Please login again.', 'Error');
      return;
    }

    this.currentUserRole = this.getUserRole(userData);
    this.currentUserId = this.getUserId(userData);
    this.currentUserName = userData.name;
    this.currentUserProfilePicture = userData.profilePicture;

    this.signalRService.startConnection().then(() => {
      this.signalRSubscription = this.signalRService.messageReceived.subscribe((message: Message) => {
        if (this.currentUserRole === 'admin' && this.selectedPair) {
          const isBetweenSelectedPair =
            (message.senderId === this.selectedPair.user1Id && message.receiverId === this.selectedPair.user2Id) ||
            (message.senderId === this.selectedPair.user2Id && message.receiverId === this.selectedPair.user1Id);
             if (isBetweenSelectedPair) {
                this.pairMessages.push(message); // Fix: use pairMessages instead of messages
                setTimeout(() => this.scrollToBottom(), 100);
              }
              return;
            }
        if (
          this.selectedUser &&
          (message.senderId === this.selectedUser.id || message.senderId === this.currentUserId) &&
          (message.receiverId === this.selectedUser.id || message.receiverId === this.currentUserId)
        ) {
          this.messages.push(message);
          setTimeout(() => this.scrollToBottom(), 100);
        }
      });
    });

    this.signalRService.typingReceived.subscribe((payload: { senderId: string, isTyping: boolean }) => {
    if (this.selectedUser && payload.senderId === this.selectedUser.id) {
      this.otherUserTyping = payload.isTyping;
      // Optionally, you can use a timeout to auto-hide after a few seconds if needed
      if (payload.isTyping) {
        if (this.typingTimeout) clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
          this.otherUserTyping = false;
        }, 2000);
      }
    }
  });

    this.loadUsersByRole();
    if (this.currentUserRole === 'admin') {
      this.getUserPairsForAdmin();
    }

    this.chatSelectionSubscription = this.chatSelectionService.selectedUserId$.subscribe(userId => {
      if (userId) {
        const checkUsersLoaded = () => {
          const user = this.users.find(u => u.id === userId);
          if (user) {
            this.selectUser(user);
            this.chatSelectionService.clearSelectedUserId();
          } else {
            setTimeout(checkUsersLoaded, 100);
          }
        };
        checkUsersLoaded();
      }
    });

    this.loadNotifications();

    document.addEventListener('click', this.handleDocumentClick, true);
  }

  ngOnDestroy(): void {
    this.signalRService.stopConnection();
    if (this.signalRSubscription) {
      this.signalRSubscription.unsubscribe();
    }
    if (this.chatSelectionSubscription) {
      this.chatSelectionSubscription.unsubscribe();
    }
    document.removeEventListener('click', this.handleDocumentClick, true);
    // No need to remove resize listener as we're using HostListener
  }

  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;
  }

  getUserData(): UserData | null {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      return JSON.parse(userDataString) as UserData;
    }
    return null;
  }

  getUserId(userData: UserData): string {
    return userData.userId;
  }

  getUserRole(userData: UserData): 'admin' | 'employee' | 'user' {
    const role = userData.roleName.toLowerCase();
    if (role === 'admin') return 'admin';
    if (role === 'employee' || role === 'موظف') return 'employee';
    return 'user';
  }

  loadUsersByRole(): void {
    const headers = this.getAuthHeaders();

    this.http.get<BackendUser[]>(this.usersApiUrl, { headers })
      .pipe(
        catchError((err) => {
          this.toastr.error('Failed to load users', 'Error');
          return throwError(() => err);
        })
      )
      .subscribe((users) => {
        if (users && users.length > 0) {
          this.users = users
            .filter(user => !user.isDeleted && !user.isBanned && user.userID !== this.currentUserId)
            .map(user => ({
              id: user.userID,
              name: user.name,
              profilePicture: user.profilePicture,
              role: user.role
            }));
        } else {
          this.toastr.info('No users found', 'Information');
        }
      });
  }

  loadNotifications(): void {
    const headers = this.getAuthHeaders();
    this.http.get<any[]>(this.notificationsApiUrl, { headers })
      .pipe(
        catchError((err) => {
          this.toastr.error('Failed to load notifications', 'Error');
          return [];
        })
      )
      .subscribe((notifications) => {
        this.notifications = notifications;
      });
  }

  selectUser(user: User): void {
    this.selectedUser = user;
    const headers = this.getAuthHeaders();

    this.http.get<Message[]>(`${this.apiUrl}/conversation/${user.id}`, { headers })
      .pipe(
        catchError((err) => {
          this.toastr.error('Failed to load conversation', 'Error');
          return throwError(() => err);
        })
      )
      .subscribe((messages) => {
        this.messages = messages.map(msg => ({
          id: msg.id,
          senderId: msg.senderId,
          message: msg.message,
          sentAt: new Date(msg.sentAt),
          isRead: msg.isRead,
          senderName: msg.senderName,
          senderProfilePicture: msg.senderProfilePicture,
          imagePath: msg.imagePath 
        }));

        if (window.innerWidth <= 768) {
          this.showSidebar = false;
        }

        setTimeout(() => this.scrollToBottom(), 100);
      });
    this.showAllConversationsButton = true;
  }

  openNotificationChat(notification: any): void {
    let user: User | undefined;
    if (notification.content) {
      const username = notification.content.split(' ')[0].trim().toLowerCase();
      user = this.users.find(u => u.name.toLowerCase() === username);
    }

    if (user) {
      this.selectUser(user);
      this.showNotifications = false;
      this.showAllConversationsButton = true;
    } else if (this.currentUserRole === 'admin' && this.userPairs.length > 0) {
      const username = notification.content ? notification.content.split(' ')[0].trim().toLowerCase() : '';
      const pair = this.userPairs.find(p =>
        p.user1Name?.toLowerCase() === username || p.user2Name?.toLowerCase() === username
      );
      if (pair) {
        this.selectUserPair(pair);
        this.showNotifications = false;
        this.showAllConversationsButton = true;
        return;
      }
      this.toastr.error('User pair not found for this notification');
    } else {
      this.toastr.error('User not found for this notification');
    }
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  sendMessage(): void {
    if (!this.selectedUser || (this.newMessage.trim() === '' && !this.selectedImageBase64)) {
      return;
    }

    const headers = this.getAuthHeaders();

    if (this.selectedImageBase64) {
      const formData = new FormData();
      formData.append('Message', this.newMessage);
      formData.append('ReceiverId', this.selectedUser.id);
      formData.append('ImagePath', this.selectedImageBase64);

      this.http.post<Message>(this.sendWithImageApiUrl, formData, { headers })
        .pipe(
          tap((response) => {
            this.messages.push({
              ...response,
              sentAt: new Date(response.sentAt)
            });
            this.newMessage = '';
            this.selectedImageBase64 = null;
            this.selectedImageFile = null;
            setTimeout(() => this.scrollToBottom(), 100);
          }),
          catchError((err) => {
            this.toastr.error('Failed to send message', 'Error');
            return throwError(() => err);
          })
        )
        .subscribe();
    } else {
      const body = {
        message: this.newMessage,
        receiverId: this.selectedUser.id
      };

      this.http.post<Message>(this.sendTextApiUrl, body, { headers })
        .pipe(
          tap((response) => {
            this.messages.push({
              ...response,
              sentAt: new Date(response.sentAt)
            });
            this.newMessage = '';
            setTimeout(() => this.scrollToBottom(), 100);
          }),
          catchError((err) => {
            this.toastr.error('Failed to send message', 'Error');
            return throwError(() => err);
          })
        )
        .subscribe();
    }
  }

  deleteMessage(messageId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this message?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        const headers = this.getAuthHeaders();
        this.http.delete(
          `${this.adminMessageApiUrl}/${messageId}`,
          { headers, responseType: 'text' as 'json' }
        ).subscribe({
          next: () => {
            this.messages = this.messages.filter(m => m.id !== messageId);
            this.toastr.success('Message deleted successfully');
          },
          error: () => {
            this.toastr.error('Failed to delete message', 'Error');
          }
        });
      }
    });
  }

  deleteConversation(): void {
    if (!this.selectedUser || !this.currentUserId) return;
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete the whole conversation?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        const headers = this.getAuthHeaders();
        this.http.delete(
          `${this.adminConversationApiUrl}?user1Id=${this.currentUserId}&user2Id=${this.selectedUser.id}`,
          { headers, responseType: 'text' as 'json' }
        ).subscribe({
          next: () => {
            this.messages = [];
            this.toastr.success('Conversation deleted successfully');
          },
          error: () => {
            this.toastr.error('Failed to delete conversation', 'Error');
          }
        });
      }
    });
  }

  isCurrentUserSender(message: Message): boolean {
    return message.senderId === this.currentUserId;
  }

  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  getSafeImageUrl(profilePicture: string) {
    const defaultImage = '../../../assets/avatar.jpg';

    if (!profilePicture) {
      return defaultImage;
    }

    // If already a DataURL, return as is
    if (profilePicture.startsWith('data:image')) {
      return profilePicture;
    }

    // If only Base64, add prefix
    if (/^[a-zA-Z0-9+/=]+$/.test(profilePicture)) {
      if (profilePicture.startsWith('/9j/')) {
        return `data:image/jpeg;base64,${profilePicture}`;
      }
      if (profilePicture.startsWith('iVBORw0KGgo')) {
        return `data:image/png;base64,${profilePicture}`;
      }
      return `data:image/jpeg;base64,${profilePicture}`;
    }

    if (profilePicture.startsWith('http://') || profilePicture.startsWith('https://')) {
      return profilePicture;
    }

    return defaultImage;
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '../../../assets/sabba.png';
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedImageFile = file;

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result as string;
        this.selectedImageBase64 = result;
      };
      reader.readAsDataURL(file);
    }
  }

  get filteredUsers(): User[] {
    if (!this.searchTerm) return this.users;
    return this.users.filter(u =>
      u.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  openImagePreview(imageUrl: string) {
    this.previewImageUrl = imageUrl;
  }

  closeImagePreview() {
    this.previewImageUrl = null;
  }

  getUserPairsForAdmin(): void {
    if (this.currentUserRole !== 'admin') return;
    const headers = this.getAuthHeaders();

    this.http.get<any[]>(this.userPairsApiUrl, { headers })
      .pipe(
        catchError((err) => {
          this.toastr.error('Failed to fetch user pairs', 'Error');
          return throwError(() => err);
        })
      )
      .subscribe((pairs) => {
        this.userPairs = pairs;
      });
  }

  selectUserPair(pair: any): void {
  this.selectedPair = pair; 
  this.selectedUser = null; // Clear selectedUser when viewing admin pair
  this.showUserPairs = false;
  this.getAllConversationBetweenUsers(pair.user1Id, pair.user2Id);
  this.showAllConversationsButton = true;
  
  if (window.innerWidth <= 768) {
    this.showSidebar = false;
  }
}

  get notificationCount(): number {
    return this.notifications.length;
  }

  showAllConversationsButton: boolean = true;
  showAllConversations: boolean = false;   

  handleDocumentClick = (event: MouseEvent) => {
    const bell = document.querySelector('.bi-bell');
    const dropdown = document.querySelector('.notification-dropdown');
    if (
      this.showNotifications &&
      dropdown &&
      !dropdown.contains(event.target as Node) &&
      bell &&
      !bell.contains(event.target as Node)
    ) {
      this.showNotifications = false;
    }
  };

  onTyping() {
    if (this.typingTimeout) clearTimeout(this.typingTimeout);
    this.isTyping = true;
    this.signalRService.sendTyping(this.selectedUser?.id);

    this.typingTimeout = setTimeout(() => {
      this.isTyping = false;
      this.signalRService.sendStopTyping(this.selectedUser?.id);
    }, 1500);
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  @HostListener('window:resize')
  onResize() {
    this.windowWidth = window.innerWidth;
    if (this.windowWidth > 768) {
      this.showSidebar = true;
    }
  }

  getAllConversationBetweenUsers(user1Id: string, user2Id: string): void {
  const headers = this.getAuthHeaders();
  const body = { user1Id, user2Id };
  this.http.post<Message[]>(`${this.apiUrl}/admin/All_conversation`, body, { headers })
    .pipe(
      catchError((err) => {
        this.toastr.error('Failed to load conversation', 'Error');
        return throwError(() => err);
      })
    )
    .subscribe((messages) => {
      this.pairMessages = messages.map(msg => ({
        ...msg,
        sentAt: new Date(msg.sentAt)
      }));
      this.messages = []; // Clear regular messages when viewing admin pair
      setTimeout(() => this.scrollToBottom(), 100);
    });
}
get shouldShowMessageInput(): boolean {
  if (this.currentUserRole === 'admin' && this.selectedPair && !this.selectedUser) {
    return false; // Admin viewing pair conversation without selected user
  }
  return !!this.selectedUser;
}
  get filteredUserPairs(): any[] {
    if (!this.searchTerm) return this.userPairs;
    return this.userPairs.filter(pair =>
      (pair.user1Name && pair.user1Name.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
      (pair.user2Name && pair.user2Name.toLowerCase().includes(this.searchTerm.toLowerCase()))
    );
  }
  get currentMessages(): Message[] {
  if (this.currentUserRole === 'admin' && this.selectedPair) {
    return this.pairMessages;
  }
  return this.messages;
}
}