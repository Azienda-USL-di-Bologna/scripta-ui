import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MittenteComponent } from './mittente.component';

describe('MittenteComponent', () => {
  let component: MittenteComponent;
  let fixture: ComponentFixture<MittenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MittenteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MittenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
