import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyToorsComponent } from './my-toors.component';

describe('MyToorsComponent', () => {
  let component: MyToorsComponent;
  let fixture: ComponentFixture<MyToorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyToorsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MyToorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
