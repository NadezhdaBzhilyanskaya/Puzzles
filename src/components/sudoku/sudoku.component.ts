import { NgClass } from '@angular/common';
import { Component } from '@angular/core';

interface Move {
  r: number;
  c: number;
  value: number;
}

@Component({
  selector: 'sudoku',
  standalone: true,
  imports: [NgClass],
  templateUrl: './sudoku.component.html',
  styleUrl: './sudoku.component.scss'
})

export class SudokuComponent {
  protected readonly arrayOneToNine: number[] = Array.from(Array(10).keys()).slice(1, 10);
  private movesHistory: Move[] = [];
  protected board: number[][] = [];
  protected status: string = '';
  private stop = false;

  constructor() {
    this.clear();
    console.log(this.arrayOneToNine, this.board);

  }


  protected clear(): void {
    this.board = Array(9).fill(1).map(i => Array(9).fill(1).map(j => 0));
    this.status = 'Fill in known numbers:';
  }

  protected setCell(i: number, r: number, c: number): void {
    //console.log(+i, r, c,)
    const exclude = this.getExclude(r, c);
    if (i > 9 || i < 0 || exclude.includes(i)) return
    this.board[r][c] = +i;
  }

  private getExclude(r: number, c: number): number[] {
    // get Row
    const exclude: number[] = JSON.parse(JSON.stringify(this.board[r]));
    // get Column
    for (let x = 0; x < 9; x++) exclude.push(this.board[x][c]);
    // Get block
    const rStart = Math.floor(r / 3) * 3;
    const cStart = Math.floor(c / 3) * 3;
    for (let i = rStart; i < rStart + 3; i++) {
      for (let j = cStart; j < cStart + 3; j++) {
        exclude.push(this.board[i][j]);
      }
    }
    return this.getUnique(exclude.filter(x => x > 0 && x < 10)).sort();
  }

  protected getPossibilities(r: number, c: number): number[] {
    const exclude = this.getExclude(r, c);
    return this.arrayOneToNine.filter(x => !exclude.includes(x));
  }

  private getUnique(a: number[]): number[] {
    return a.filter((item, i, ar) => ar.indexOf(item) === i);
  }

  //return can be solved;
  protected solve(): void {
    this.status = "Working...";
    let result = true;

    setTimeout(() => {
      let counter = 0;

      while (result && counter < 5000000) {
        result = this.step();
        counter++
        // if (counter % 1000 == 0) console.log(counter)
      }

      let solved = true;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (this.board[r][c] === 0) solved = false;
        }
      }

      this.status = solved ? "Complete!" : "Puzzle Cannot be Solved";
    }, 1)
  }

  protected step(): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (this.board[r][c] === 0) {
          const possible = this.getPossibilities(r, c);

          if (possible.length) {
            //console.log(possible)
            const nextTry: Move = { r, c, value: Math.min(...possible) };
            this.addMove(nextTry);
            return true;
          }
          else {
            return this.undoAndRetry();
          }
        }
      }
    }
    return false;
  }

  private addMove(move: Move): void {
    this.movesHistory.push(move);
    this.setCell(move.value, move.r, move.c);
  }

  private undoAndRetry(): boolean {
    const lastMove = this.movesHistory.pop();
    if (!lastMove) return false;
    this.setCell(0, lastMove.r, lastMove.c);
    //get next possibility
    const possible = this.getPossibilities(lastMove.r, lastMove.c).filter(x => x > lastMove.value);
    if (possible.length) {
      const nextTry: Move = { r: lastMove.r, c: lastMove.c, value: Math.min(...possible) };
      this.addMove(nextTry);
      return true;
    } else {
      return this.undoAndRetry();
    }
  }

  public test(a: any) {
    console.log(a)
  }

}
