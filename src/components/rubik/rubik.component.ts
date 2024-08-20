import { Component, OnInit } from '@angular/core';
import { FaceMatrix, FaceType, Rubik } from './utils';
import { NgStyle } from '@angular/common';
import { CubeComponent } from './subcomponents/cube/cube.component';
import { FaceMatrixComponent } from './subcomponents/face-matrix/face-matrix.component';



@Component({
  selector: 'rubik',
  standalone: true,
  imports: [NgStyle, CubeComponent, FaceMatrixComponent],
  templateUrl: './rubik.component.html',
  styleUrl: './rubik.component.scss'
})
export class RubikComponent {//implements OnInit {
  readonly dim = 3;
  rubik: Rubik = new Rubik(this.dim);
  mouse: 'UP' | 'MOVE' | 'DOWN' = 'UP';
  rotating: boolean = false;
  openFaceMatrix: boolean = true;


  // ngOnInit(): void {
  //   this.rubik.events.on('rotationDone', () => {
  //     console.log('rotationDone')
  //   })
  //   //this.refresh(true);
  //   //this.rubik.solved()
  //   // setTimeout(() => {
  //   //   console.log(this.rubik.randomize());
  //   // }, 500);
  // }

  public reset() {
    this.rubik = new Rubik(this.dim);
  }

  public solved() {
    console.log(this.rubik.degreeMismatched())

    //console.log(this.rubik.getFaceMatrices());

    //this.rubik.getFace(FaceType.Front)
    //this.rubik.solved();
  }

  public dragStart(e: MouseEvent) {
    if (this.mouse !== 'UP') return;
    this.mouse = 'DOWN';
    this.rubik.dragStart(e);
  }

  public dragMove(e: MouseEvent) {
    if (this.mouse === 'UP') return;
    this.mouse = 'MOVE';
    if ((this.rubik.dragMove(e))) {
      this.mouse = 'UP';
    };
  }


}
