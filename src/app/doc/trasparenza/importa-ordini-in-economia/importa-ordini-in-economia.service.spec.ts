import { TestBed } from '@angular/core/testing';

import { ImportaOrdiniInEconomiaService } from './importa-ordini-in-economia.service';

describe('ImportaOrdiniInEconomiaService', () => {
  let service: ImportaOrdiniInEconomiaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImportaOrdiniInEconomiaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
