import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeisComponent } from './peis.component';

describe('PeisComponent', () => {
  let component: PeisComponent;
  let fixture: ComponentFixture<PeisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PeisComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PeisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
