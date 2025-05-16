import { Component, Input } from '@angular/core';
import { InitiativeRowComponent } from './initiative-row/initiative-row.component';
import { InitiativeInputFormComponent } from './initiative-input-form/initiative-input-form.component';
import { InitiativeRowProps } from '../commons/types';


@Component({
  selector: 'initiative-table',
  standalone: true,
  imports: [InitiativeRowComponent,InitiativeInputFormComponent],
  templateUrl: './initiative-table.component.html',
  styleUrl: './initiative-table.component.scss'
})
export class InitiativeTableComponent {
  //@Input() rollDice: (notation?: string, hidden?: boolean) => Promise<number>;
  rows: InitiativeRowProps[] = [];

}
