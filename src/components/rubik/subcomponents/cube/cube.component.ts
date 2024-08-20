import { Component, Input, OnInit } from '@angular/core';
import { Cube } from '../../utils';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'cube',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './cube.component.html',
  styleUrl: './cube.component.scss'
})
export class CubeComponent {
  @Input() public cube: Cube;

  public ngOnInit() {
    //console.log(this.cube.faces)
  }

}
