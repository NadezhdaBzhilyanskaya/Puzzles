import { FaceType } from './../../utils';
import { Component, Input } from '@angular/core';
import { FaceMatrix } from '../../utils';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'face-matrix',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './face-matrix.component.html',
  styleUrl: './face-matrix.component.scss'
})
export class FaceMatrixComponent {
  @Input() matrix: FaceMatrix;

  FaceType: typeof FaceType = FaceType;


}
