import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DestinatariComponent } from './destinatari.component';

describe('DestinatariComponent', () => {
  let component: DestinatariComponent;
  let fixture: ComponentFixture<DestinatariComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DestinatariComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DestinatariComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
