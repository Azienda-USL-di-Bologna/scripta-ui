import { TestBed } from '@angular/core/testing';

import { ArchivioService } from './archivio.service';

describe('ArchivioService', () => {
  let service: ArchivioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArchivioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
