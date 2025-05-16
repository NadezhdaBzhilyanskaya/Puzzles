import { Component, Input } from '@angular/core';
import DiceBox from '@3d-dice/dice-box'
import { InitiativeRowProps } from '../../commons/types';

@Component({
  selector: 'initiative-row',
  standalone: true,
  imports: [],
  templateUrl: './initiative-row.component.html',
  styleUrl: './initiative-row.component.scss'
})

export class InitiativeRowComponent {
  @Input() check: (notation?: string, hidden?: boolean) => Promise<number>;
  @Input() row: InitiativeRowProps;
}
