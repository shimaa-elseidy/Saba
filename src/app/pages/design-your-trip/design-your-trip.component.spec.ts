import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignYourTripComponent } from './design-your-trip.component';

describe('DesignYourTripComponent', () => {
  let component: DesignYourTripComponent;
  let fixture: ComponentFixture<DesignYourTripComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesignYourTripComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DesignYourTripComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
