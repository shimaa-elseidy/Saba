import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuideTourComponent } from './guide-tour.component';

describe('GuideTourComponent', () => {
  let component: GuideTourComponent;
  let fixture: ComponentFixture<GuideTourComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuideTourComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuideTourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
