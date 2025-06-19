import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewInvoiceComponent } from './add-new-invoice.component';

describe('AddNewInvoiceComponent', () => {
  let component: AddNewInvoiceComponent;
  let fixture: ComponentFixture<AddNewInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewInvoiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
