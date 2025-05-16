import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitiativeRowComponent } from './initiative-row.component';

describe('InitiativeRowComponent', () => {
  let component: InitiativeRowComponent;
  let fixture: ComponentFixture<InitiativeRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InitiativeRowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InitiativeRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
