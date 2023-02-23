import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttoriComponent } from './attori.component';

describe('AttoriComponent', () => {
  let component: AttoriComponent;
  let fixture: ComponentFixture<AttoriComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttoriComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AttoriComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
