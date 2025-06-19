import { NgClass, NgFor } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-why-saba',
  standalone:true,
  imports: [NgClass,NgFor],
  templateUrl: './why-saba.component.html',
  styleUrl: './why-saba.component.scss'
})
export class WhySabaComponent {
  
  featuresWhy = [
    { icon: 'bi-star-fill', title: 'Experience and Trust', description: 'With more than 20 years of experience...' },
    { icon: 'bi-award', title: 'Quality and Commitment', description: 'High quality staff for full customer satisfaction...' },
    { icon: 'bi-headset', title: 'Support 24 Hours', description: '24-hour assistance and resolution of any problem...' },
    { icon: 'bi-bus-front', title: 'Comfortable and Modern Transport', description: 'The agency has 9 new buses for convenient service...' }
];

stats = [
  { icon: 'bi-people', value: 1254, label: 'New Visitors Every Week' },
  { icon: 'bi-emoji-smile', value: 12168, label: 'Happy customers every year' },
  { icon: 'bi-map', value: 172, label: 'Tours Published' },
  { icon: 'bi-signpost', value: 739, label: 'New Tours Every Month' }
];


}
