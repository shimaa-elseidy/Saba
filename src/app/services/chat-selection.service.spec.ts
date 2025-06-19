import { TestBed } from '@angular/core/testing';

import { ChatSelectionService } from './chat-selection.service';

describe('ChatSelectionService', () => {
  let service: ChatSelectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatSelectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
