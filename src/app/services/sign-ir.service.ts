import { Injectable } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
} from '@microsoft/signalr';import { Subject } from 'rxjs';
interface Message {
  id: number;
  senderId: string;
  receiverId?: string;
  message: string;
  sentAt: Date;
  isRead: boolean;
  senderName?: string;
  senderProfilePicture?: string;
}
@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  hubConnection!: HubConnection;
  private messageSubject = new Subject<Message>();
  private typingSubject = new Subject<{ senderId: string, isTyping: boolean }>();

  messageReceived = this.messageSubject.asObservable();
  typingReceived = this.typingSubject.asObservable(); 

  constructor() {}

  startConnection(): Promise<void> {
    const token = localStorage.getItem('token');
    console.log('Token:', token);

    this.hubConnection = new HubConnectionBuilder()
    .withUrl('https://subatoursapi.premiumasp.net/chathub', {
      accessTokenFactory: () => token || ''
    })
    .withAutomaticReconnect()
    .build();

    this.hubConnection.on('ReceiveMessage', (message: Message) => {
      this.messageSubject.next(message);
    });

    // Update to listen for the new event and emit the correct object
    this.hubConnection.on('ReceiveTypingNotification', (payload: { senderId: string, isTyping: boolean }) => {
      this.typingSubject.next(payload);
    });

    return this.hubConnection.start()
      .then(() => console.log('SignalR Connected'))
      .catch(err => console.error('Error connecting to SignalR:', err));
  }

  stopConnection(): void {
    this.hubConnection.stop()
      .then(() => console.log('SignalR Disconnected'))
      .catch(err => console.error('Error disconnecting SignalR:', err));
  }

  sendMessage(message: Message) {
    if (this.hubConnection) {
      this.hubConnection.invoke('SendMessage', message).catch(err => console.error(err));
    }
  }

  // Update sendTyping and sendStopTyping to use the new backend method
  sendTyping(receiverId?: string) {
    if (this.hubConnection && receiverId) {
      this.hubConnection.invoke('SendTypingNotification', receiverId, true).catch(err => console.error(err));
    }
  }

  sendStopTyping(receiverId?: string) {
    if (this.hubConnection && receiverId) {
      this.hubConnection.invoke('SendTypingNotification', receiverId, false).catch(err => console.error(err));
    }
  }
}