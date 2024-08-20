import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaceMatrixComponent } from './face-matrix.component';

describe('FaceMatrixComponent', () => {
  let component: FaceMatrixComponent;
  let fixture: ComponentFixture<FaceMatrixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaceMatrixComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaceMatrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
