import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiviListComponent } from './archivi-list.component';

describe('ArchiviListComponent', () => {
  let component: ArchiviListComponent;
  let fixture: ComponentFixture<ArchiviListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArchiviListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchiviListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
