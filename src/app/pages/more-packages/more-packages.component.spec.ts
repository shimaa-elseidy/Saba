import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MorePackagesComponent } from './more-packages.component';

describe('MorePackagesComponent', () => {
  let component: MorePackagesComponent;
  let fixture: ComponentFixture<MorePackagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MorePackagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MorePackagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
