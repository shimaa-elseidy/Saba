import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewTourComponent } from './add-new-tour.component';

describe('AddNewTourComponent', () => {
  let component: AddNewTourComponent;
  let fixture: ComponentFixture<AddNewTourComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewTourComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewTourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
