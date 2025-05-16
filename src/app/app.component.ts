import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SudokuComponent } from '../components/sudoku/sudoku.component';
import { RubikComponent } from '../components/rubik/rubik.component';
import { PatternBreakdownComponent } from '../components/pattern-breakdown/pattern-breakdown.component';
import { InitiativeComponent } from '../components/initiative/initiative.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SudokuComponent, RubikComponent, PatternBreakdownComponent,InitiativeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Puzzles';
}
