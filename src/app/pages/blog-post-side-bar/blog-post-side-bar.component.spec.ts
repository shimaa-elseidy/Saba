import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogPostSideBarComponent } from './blog-post-side-bar.component';

describe('BlogPostSideBarComponent', () => {
  let component: BlogPostSideBarComponent;
  let fixture: ComponentFixture<BlogPostSideBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogPostSideBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogPostSideBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
