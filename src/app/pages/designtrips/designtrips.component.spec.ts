import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesigntripsComponent } from './designtrips.component';

describe('DesigntripsComponent', () => {
  let component: DesigntripsComponent;
  let fixture: ComponentFixture<DesigntripsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesigntripsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DesigntripsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
