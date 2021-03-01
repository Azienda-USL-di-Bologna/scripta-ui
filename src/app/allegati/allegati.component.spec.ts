import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllegatiComponent } from './allegati.component';

describe('AllegatiComponent', () => {
  let component: AllegatiComponent;
  let fixture: ComponentFixture<AllegatiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllegatiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AllegatiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
