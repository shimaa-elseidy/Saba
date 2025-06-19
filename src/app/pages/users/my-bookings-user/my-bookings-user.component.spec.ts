import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyBookingsUserComponent } from './my-bookings-user.component';

describe('MyBookingsUserComponent', () => {
  let component: MyBookingsUserComponent;
  let fixture: ComponentFixture<MyBookingsUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyBookingsUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyBookingsUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
