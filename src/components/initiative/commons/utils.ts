export function checkInputText(input: string): boolean{
  if(!input) return true
    try{
        processText(input)
    } catch {
        return false;
    }
    return true;
}

export function processText(input: string){
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
    //console.log(divideProcessed)
    const divideWithOps = [];
    divideProcessed.forEach((part,i) => {
      divideWithOps.push(part);
      if(i+1 < divideProcessed.length) divideWithOps.push({op: '/'})
    })

   // console.log('/',divideWithOps)
    return divideWithOps;
  });
 // console.log(multiProcessed)
  const multiWithOps = [];
    multiProcessed.forEach((part,i) => {
      multiWithOps.push(...part);
      if(i+1 < multiProcessed.length) multiWithOps.push({op: '*'})
    });
   // console.log('*',multiWithOps)
  return multiWithOps;
});

const subWithOps = [];
    subProcessed.forEach((part,i) => {
      subWithOps.push(...part);
      if(i+1 < subProcessed.length) subWithOps.push({op: '-'})
    });
   // console.log('-',subWithOps)
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