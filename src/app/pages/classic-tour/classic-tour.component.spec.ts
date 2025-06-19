import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassicTourComponent } from './classic-tour.component';

describe('ClassicTourComponent', () => {
  let component: ClassicTourComponent;
  let fixture: ComponentFixture<ClassicTourComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassicTourComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClassicTourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
