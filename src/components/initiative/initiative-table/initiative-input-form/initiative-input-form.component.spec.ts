import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitiativeInputFormComponent } from './initiative-input-form.component';

describe('InitiativeInputFormComponent', () => {
  let component: InitiativeInputFormComponent;
  let fixture: ComponentFixture<InitiativeInputFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InitiativeInputFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InitiativeInputFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
