import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavouritesUserComponent } from './favourites-user.component';

describe('FavouritesUserComponent', () => {
  let component: FavouritesUserComponent;
  let fixture: ComponentFixture<FavouritesUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavouritesUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FavouritesUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
