import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListingToursComponent } from './listing-tours.component';

describe('ListingToursComponent', () => {
  let component: ListingToursComponent;
  let fixture: ComponentFixture<ListingToursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListingToursComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListingToursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
