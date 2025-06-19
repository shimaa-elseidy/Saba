import { TestBed } from '@angular/core/testing';

import { BlogHomeService } from './blog-home.service';

describe('BlogHomeService', () => {
  let service: BlogHomeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BlogHomeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
