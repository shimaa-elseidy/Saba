import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TurkeyComponent } from './turkey.component';

describe('TurkeyComponent', () => {
  let component: TurkeyComponent;
  let fixture: ComponentFixture<TurkeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TurkeyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TurkeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
