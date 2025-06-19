import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InnerdashboardComponent } from './innerdashboard.component';

describe('InnerdashboardComponent', () => {
  let component: InnerdashboardComponent;
  let fixture: ComponentFixture<InnerdashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InnerdashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InnerdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
