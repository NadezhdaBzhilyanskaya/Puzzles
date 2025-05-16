import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';
import { Color } from '../types';

export interface ColorClick {color: Color, x: number, y:number};
@Component({
  selector: 'pattern-display',
  standalone: true,
  imports: [NgStyle, NgClass],
  templateUrl: './pattern-display.component.html',
  styleUrl: './pattern-display.component.scss'
})
export class PatternDisplayComponent {
  @Input() colors: Color[][] = [];
  @Output() clicked: EventEmitter<ColorClick> = new EventEmitter<ColorClick>();
}
