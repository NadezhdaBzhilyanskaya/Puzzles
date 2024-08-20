import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatternBreakdownComponent } from './pattern-breakdown.component';

describe('PatternBreakdownComponent', () => {
  let component: PatternBreakdownComponent;
  let fixture: ComponentFixture<PatternBreakdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatternBreakdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatternBreakdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
