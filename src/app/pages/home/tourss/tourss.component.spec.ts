import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourssComponent } from './tourss.component';

describe('TourssComponent', () => {
  let component: TourssComponent;
  let fixture: ComponentFixture<TourssComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourssComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TourssComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
