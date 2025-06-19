import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeCaraComponent } from './home-cara.component';

describe('HomeCaraComponent', () => {
  let component: HomeCaraComponent;
  let fixture: ComponentFixture<HomeCaraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeCaraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeCaraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
