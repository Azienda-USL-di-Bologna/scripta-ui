import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportaOrdiniInEconomiaComponent } from './importa-ordini-in-economia.component';

describe('ImportaOrdiniInEconomiaComponent', () => {
  let component: ImportaOrdiniInEconomiaComponent;
  let fixture: ComponentFixture<ImportaOrdiniInEconomiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportaOrdiniInEconomiaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportaOrdiniInEconomiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
