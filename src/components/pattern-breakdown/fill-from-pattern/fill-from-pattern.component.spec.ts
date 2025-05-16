import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FillFromPatternComponent } from './fill-from-pattern.component';

describe('FillFromPatternComponent', () => {
  let component: FillFromPatternComponent;
  let fixture: ComponentFixture<FillFromPatternComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FillFromPatternComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FillFromPatternComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
