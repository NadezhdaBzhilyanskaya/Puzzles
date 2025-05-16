import { NgClass, NgStyle } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Color } from '../types';

@Component({
  selector: 'color-list',
  standalone: true,
  imports: [NgClass, NgStyle],
  templateUrl: './color-list.component.html',
  styleUrl: './color-list.component.scss'
})
export class ColorListComponent {
  @Input() colors: Color[];
  @Output() clicked: EventEmitter<Color> = new EventEmitter<Color>();
}
