import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryExploreComponent } from './history-explore.component';

describe('HistoryExploreComponent', () => {
  let component: HistoryExploreComponent;
  let fixture: ComponentFixture<HistoryExploreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryExploreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryExploreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
