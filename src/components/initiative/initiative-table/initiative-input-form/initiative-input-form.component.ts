import { Component, Input } from '@angular/core';
import {FormsModule } from '@angular/forms';
import { DiceService } from '../../services/dice.service';
import { KeyValuePipe, NgClass, TitleCasePipe } from '@angular/common';
import { InitiativeRowFormInputs, Modifier } from '../../commons/types';
import { checkInputText } from '../../commons/utils';



@Component({
  selector: 'initiative-input-form',
  standalone: true,
  imports: [FormsModule, KeyValuePipe, NgClass, TitleCasePipe],
  templateUrl: './initiative-input-form.component.html',
  styleUrl: './initiative-input-form.component.scss'
})
export class InitiativeInputFormComponent {
  //@Input() rollDice: (notation?: string, hidden?: boolean) => Promise<number>;
  Modifier: typeof Modifier = Modifier;
  diceService: DiceService;
  inputs: InitiativeRowFormInputs;
  errorFields: string[] = [];
  modOrder: Modifier[] = [Modifier.Strength,Modifier.Dexterity,Modifier.Constitution,Modifier.Intelligence,Modifier.Wisdom, Modifier.Charisma];

  constructor(){
    this.errorFields = [];
    this.diceService = new DiceService();
    this.inputs = {
      name: '',
      amount: '1',
      initiative: 'd20',
      ac: '',
      hp: '',
      abilities: {str: '',dex: '',con: '',int: '',wis: '',cha: ''},
      mod: {str: '',dex: '',con: '',int: '',wis: '',cha: ''},
      save: {str: '',dex: '',con: '',int: '',wis: '',cha: ''},
      attacks: []
    };
    console.log((Object.values(Modifier)), this.Modifier)
  }

  async add(){
    this.checkValid();
    console.log(this.inputs)
  }

  checkValid(){
    console.log(this.inputs, Object.keys(this.inputs))
    this.errorFields = [];
    if(!this.inputs.name) this.errorFields.push('name');
    const required = ['amount', 'initiative'];

    Object.keys(this.inputs).filter(key => key != 'name').forEach(key => {
      //console.log(key)
      if(key == 'attacks'){
        this.inputs.attacks.forEach(attack =>{
          console.log(attack)
          if(!attack.toHit || !attack.damage || !attack.name || !checkInputText(attack.toHit) || !checkInputText(attack.damage)) this.errorFields.push(key);
        })
      }
      else if(typeof(this.inputs[key]) === 'object'){
        
        //
        Object.keys(this.inputs[key]).forEach(subKey => {
        //  console.log(key, subKey, this.inputs[key][subKey])
        if(!checkInputText(this.inputs[key][subKey])) this.errorFields.push(key);
        })
      }
      else if((key in required && !this.inputs[key])|| !checkInputText(this.inputs[key])) this.errorFields.push(key);
      
    })
//console.log(this.errorFields)
  }
  

  modifierCalc(mod: Modifier){
    const num = +this.inputs.abilities[mod];
    if(isNaN(num)) return;
    const modifier = Math.floor((num-10)/2);
    this.inputs.mod[mod] = modifier > 0 ? `+${modifier}` : `${modifier}`;
    this.inputs.save[mod] =  modifier > 0 ? `+${modifier}` : `${modifier}`
    console.log(mod, this.inputs.abilities[mod])
     // console.log(i, Math.floor((i-10)/2))
  }

  addAttack(){
    this.inputs.attacks.push({  name: 'New Attack', toHit: '', damage: ''});
  }


  deleteAttack(i: number){
    this.inputs.attacks.splice(i,1);
  }

  test(e: any){
    console.log(e)
  }

  
}
