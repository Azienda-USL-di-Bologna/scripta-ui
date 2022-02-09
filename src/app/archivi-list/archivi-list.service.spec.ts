import { TestBed } from '@angular/core/testing';

import { ArchiviListService } from './archivi-list.service';

describe('ArchiviListService', () => {
  let service: ArchiviListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArchiviListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
