import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyCommentsUserComponent } from './my-comments-user.component';

describe('MyCommentsUserComponent', () => {
  let component: MyCommentsUserComponent;
  let fixture: ComponentFixture<MyCommentsUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyCommentsUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyCommentsUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
