import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-more-packages',
  standalone:true,
  imports: [RouterLink],
  templateUrl: './more-packages.component.html',
  styleUrl: './more-packages.component.scss'
})
export class MorePackagesComponent {

}
