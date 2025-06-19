import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhySabaComponent } from './why-saba.component';

describe('WhySabaComponent', () => {
  let component: WhySabaComponent;
  let fixture: ComponentFixture<WhySabaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhySabaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhySabaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
