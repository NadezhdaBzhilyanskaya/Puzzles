import { Color } from "./types";

export  function getPixelColor(imageData: Uint8ClampedArray, width: number, x: number, y: number): Color {
    const red = Math.round(y) * (width * 4) + Math.round(x) * 4;
    const temp = {
      r: imageData[red],
      g: imageData[red + 1],
      b: imageData[red + 2],
      a: imageData[red + 3],
      str: '',
      dmc: '',
      show: true,
      highlighted: false
    };
    temp.str = colorToBackground(temp);
    if (temp.str == 'None') temp.show = false;
    temp.dmc = getDMC(temp);

    if (temp.dmc == 'None') temp.show = false;
    return temp;
  }

export function colorToBackground(c: Color): string {
    return rgbToHex(c.r, c.g, c.b);
    //return `rgb(${c.r}, ${c.g}, ${c.b})`
    //return `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`
  }

  export function getUnique(a: Color[]): Color[] {
    const temp = a.map(c => JSON.stringify(c));
    return a.filter((item, i) => temp.indexOf(JSON.stringify(item)) === i);
  }

  export function componentToHex(c) {
   // if(c === null || c === undefined) return '';
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }


  export function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  }

  export function getDMC(c: Color): string {
    if (c.str == '#ffffff' || c.str == '#fffdf9') return 'None';
    else if (c.str == '#4b4b49') return '535';
    else if (c.str == '#09092f') return '939';
    else if (c.str == '#3a3068') return '158';
    else if (c.str == '#39393d') return '3799';
    else if (c.str == '#494749') return '413';
    else if (c.str == '#202754') return '803';
    else if (c.str == '#000000') return '310';
    else if (c.str == '#999b9d') return '318';
    else if (c.str == '#908e85') return '647';

    else if (c.str == '#fcfcff') return 'White';
    else if (c.str == "#e0d7ee") return '24';
    else if (c.str == "#c5c4c9") return '2';
    else if (c.str == "#efeef0") return '1';
    else if (c.str == "#827d7d") return '169';
    else if (c.str == "#776e72") return '414';
    else if (c.str == "#9fa8a5") return '927';
    else if (c.str == "#b0b0b5") return '3';
    else if (c.str == "#b8b9bd") return '415';
    // else if (c.str == ) return '';
    // else if (c.str == ) return '';
    // else if (c.str == ) return '';
    // else if (c.str == ) return '';
    // else if (c.str == ) return '';
    // else if (c.str == ) return '';
    // else if (c.str == ) return '';

    // else if (c.str == ) return '';
    // else if (c.str == ) return '';
    // else if (c.str == ) return '';
    // else if (c.str == ) return '';
    // else if (c.str == ) return '';
    // else if (c.str == ) return '';
    // else if (c.str == ) return '';
    // else if (c.str == ) return '';
    // else if (c.str == ) return '';
    // else if (c.str == ) return '';
    return ''
  }


  export function getColorFromRGB(arr: number[]): Color {
    const temp = {
      r: Math.round(arr[0]),
      g: Math.round(arr[1]),
      b: Math.round(arr[2]),
      a: 255,
      str: '',
      dmc: '',
      show: true,
      highlighted: false
    };
    temp.str = colorToBackground(temp);
    if (temp.str == 'None') temp.show = false;
    temp.dmc = getDMC(temp);

    if (temp.dmc == 'None') temp.show = false;
    return temp;
  }

  export function getAverageColorAsArr(colors: Color[]): number[] {
    const r = Math.round(colors.reduce((partialSum, a) => partialSum + a.r, 0) / colors.length);
    const g = Math.round(colors.reduce((partialSum, a) => partialSum + a.g, 0) / colors.length);
    const b = Math.round(colors.reduce((partialSum, a) => partialSum + a.b, 0) / colors.length);
    return [r,g,b]
  }
  export function getAverageColor(colors: Color[]): Color {
    return getColorFromRGB(getAverageColorAsArr(colors));
  }

  export function generateUniqueColors(colors: Color[][]): Color[]{
    return JSON.parse(JSON.stringify(getUnique([].concat(...colors))))//.slice(75).map(r => r.slice(37))))
  }

  export function  loadUniqueColors(display: Color[][]): Color[]{
    // ON SECTION Change
   //if (imageName == 'test.png') colors = colors.slice(0, 76).map(r => r.slice(171))//, 171))
   const uniqueColors = generateUniqueColors(display);
   console.log(uniqueColors.length)

   uniqueColors.forEach(c => {
     //console.log(basicSim(c))
     c.count = 0;
     display.forEach(r => r.forEach(cell => {
       if (cell.str == c.str) c.count++;
     }))
   })
   // give count
   let temp = 0;
   uniqueColors.forEach(c => {
     display.forEach(r => r.forEach(cell => {
       if (cell.str == c.str) {
         if(cell.str !== "#ffffff") temp++;
         // if (['#aea78e', '#a29b86', "#e0d7ee", "#667584", "#ad9994"].includes(cell.str)) {
         //   cell.count = 1000;
         //   c.count = 1000
         // }
         // else
         cell.count = c.count;
       }
     }))
   })
   uniqueColors.sort((a, b) => (a.count ?? 0) - (b.count ?? 0));
   //console.log(colors.length, colors[0].length, 'total: ',temp)
   return uniqueColors;
 }

 export function getColorSimilarity(a:Color, b:Color): number{
  //console.log(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)))
  return Math.pow(a.r - b.r, 2) + Math.pow(a.g - b.g, 2) + Math.pow(a.b - b.b, 2);
}