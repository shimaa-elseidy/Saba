import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DayTourComponent } from './day-tour.component';

describe('DayTourComponent', () => {
  let component: DayTourComponent;
  let fixture: ComponentFixture<DayTourComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DayTourComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DayTourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
