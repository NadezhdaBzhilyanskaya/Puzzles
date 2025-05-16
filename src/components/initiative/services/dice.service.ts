import { Injectable } from '@angular/core';
import DiceBox from '@3d-dice/dice-box'

@Injectable({
  providedIn: 'root'
})
export class DiceService {
  private diceBoxRoll;
  private diceBoxHidden;
  private initialized = false;

  constructor() {
    this.diceBoxRoll = new DiceBox({
        //id: 'dice-canvas',
        assetPath: '/assets/', // include the trailing backslash
        container: "div.diceTray",
        //theme: 'blueGreenMetal',
        themeColor: '#b85fc9',
        scale: 6,
      });
  
      this.diceBoxHidden = new DiceBox({
        assetPath: '/assets/', // include the trailing backslash
        suspendSimulation: true
      });
  }

  processText(input: string){
    //onsole.log(2,input);
    //if(!input.trim().length)
    let okayFlag = Boolean(input.trim().length);
    const split = input.split('+').map(sub => { 
      const subProcessed = sub.split('-').map(multi => {
      const multiProcessed = multi.split('*').map(divide => {
      const divideProcessed = divide.split('/').map(d => {
      // split by 'd' and trim all parts

      const dProcessed = d.split('d').map(e => e.trim());
      if(dProcessed.length === 1) {
        if(isNaN(+dProcessed[0])) okayFlag = false;
        else {
          return { modifier: +dProcessed[0]}
        }
      } else if(dProcessed.length === 2) {
        if(!['4','6','8','10','12','20','100'].includes(dProcessed[1]) || (isNaN(+dProcessed[0]) && dProcessed[0].length)) okayFlag = false;
        else {
          return {qty: dProcessed[0].length ? +dProcessed[0] :  1, sides: +dProcessed[1]}
        }
      } else okayFlag = false;
      return dProcessed
    });
    ////console.log(divideProcessed)
    const divideWithOps = [];
    divideProcessed.forEach((part,i) => {
      divideWithOps.push(part);
      if(i+1 < divideProcessed.length) divideWithOps.push({op: '/'})
    })

   // //console.log('/',divideWithOps)
    return divideWithOps;
  });
 // //console.log(multiProcessed)
  const multiWithOps = [];
    multiProcessed.forEach((part,i) => {
      multiWithOps.push(...part);
      if(i+1 < multiProcessed.length) multiWithOps.push({op: '*'})
    });
   // //console.log('*',multiWithOps)
  return multiWithOps;
});

const subWithOps = [];
    subProcessed.forEach((part,i) => {
      subWithOps.push(...part);
      if(i+1 < subProcessed.length) subWithOps.push({op: '-'})
    });
   // //console.log('-',subWithOps)
return subWithOps
})
const parts = [];
    split.forEach((part,i) => {
      parts.push(...part);
      if(i+1 < split.length) parts.push({op: '+'})
    });

  if(!okayFlag) throw 'Bad Input'
  return parts;
  }

  // TODO change defualt
  async roll(notation: string = 'd20', hidden = false): Promise<number>{
    
    // intialize if not intializes
    if(!this.initialized){
      this.initialized = true;
      await this.diceBoxRoll.init();
      await this.diceBoxHidden.init();
    }
    
    
    const steps: string[] = [notation];
    try{
      //console.log('hi')
      const parts = this.processText(notation);
    //console.log(parts)
    const rolls = parts.filter(p => p.sides);
    if(hidden) await this.diceBoxHidden.roll( rolls);
    else await this.diceBoxRoll.roll( rolls);
    
    const rollResults = hidden ?  this.diceBoxHidden.getRollResults() : this.diceBoxRoll.getRollResults();
    //console.log(rollResults);
    let postRolls = [];
    parts.forEach(p => {
      if(p.sides) postRolls.push(rollResults.shift().value);
      else if(p.modifier) postRolls.push(p.modifier);
      else postRolls.push(p)
    })

    steps.push(postRolls.map(p => p.op ? p.op : p).join(''));
    const ops = ['*','/','+','-'];
    ops.forEach(op =>{
      //console.log('OPeration',op)
    let curIndex = 0;
    while(curIndex< postRolls.length){
      if(postRolls[curIndex].op === op && curIndex >0 && curIndex < postRolls.length){
        if(op == '/') postRolls[curIndex+1] = postRolls[curIndex-1]/postRolls[curIndex+1];
        if(op == '*') postRolls[curIndex+1] = postRolls[curIndex-1]*postRolls[curIndex+1];
        if(op == '-') postRolls[curIndex+1] = postRolls[curIndex-1]-postRolls[curIndex+1];
        if(op == '+') postRolls[curIndex+1] = postRolls[curIndex-1]+postRolls[curIndex+1];
        postRolls.splice(curIndex-1,2);
        curIndex--;
        steps.push(postRolls.map(p => p.op ? p.op : p).join(''));
       // curIndex = 100;
      } else {
        curIndex++;
      }
    }
  });
  //console.log('result', postRolls, steps)

  
  return postRolls[0];
} catch{
  return 0;
}

  }

  checkInput(input:string): boolean{
    //console.log(1,input);
   try{
      this.processText(input)
    } catch{
      return false;
    }
    return true;
  }
}