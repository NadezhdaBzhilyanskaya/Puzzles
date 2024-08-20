import { join } from 'node:path';
import { NgClass, NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { FLOSS_LOOK_UP, Floss } from './floss';

interface Dim { startX: number, startY: number, blockX: number, blockY: number, endX: number, endY: number, borderX: number, borderY: number, };
interface Color { r: number, g: number, b: number, a: number, str: string; dmc: string | number, title?: string; show: boolean, count?: number };
@Component({
  selector: 'pattern-breakdown',
  standalone: true,
  imports: [NgStyle, NgClass],
  templateUrl: './pattern-breakdown.component.html',
  styleUrl: './pattern-breakdown.component.scss'
})
export class PatternBreakdownComponent {
  private flossDic: Record<string, Floss> = {};
  private img: HTMLImageElement;
  private context: CanvasRenderingContext2D;
  private imageData: Uint8ClampedArray;
  public colors: Color[][] = [];
  public uniqueColors: Color[] = [];
  public uniqueSym: Color[][][] = [];
  public highlighted: string = '';
  public loaded = false;
  public hide: boolean = false;

  public Height = 300;

  ngOnInit(): void {
    // setTimeout(() => {

    //this.img = document.getElementsByTagName('img')[0];

    FLOSS_LOOK_UP.forEach(f => {
      const hex = this.rgbToHex(f.r, f.g, f.b);
      f.hex = hex;
      this.flossDic[hex] = { ...f, hex };
    })
    try {
      this.img = new Image();
      const canvas = document.getElementsByTagName('canvas')[0];
      this.context = canvas.getContext('2d');
      this.img.src = "bg2.png";

      //this.loadImage()
      this.img.onload = (e) => this.loadImage(e);
      //, 1000)
    } catch (e) {
      // Issue anticipated and ignored
    }

  }

  loadImage(e) {
    if (this.colors.length) return;
    // console.log(e.target.width, e.target.height)
    this.context.drawImage(this.img, 0, 0, this.img.width, this.img.height);
    //console.log(this.context.createImageData(this.img.width, this.img.height))
    this.imageData = this.context.getImageData(0, 0, this.img.width, this.img.height).data;

    let startY = -1;
    let startX = -1;
    let endY = -1;
    let endX = -1;
    let borderX = -1;
    let borderY = -1;
    let blockX = -1;
    let blockY = -1;

    // Get corner blocks
    for (let y = 0; y < this.img.height; y++) {
      for (let x = 0; x < this.img.width; x++) {
        const color = this.getPixelColor(x, y);
        if (startY < 0 && startY < 0 && color.str == "gray") {
          startX = x;
          startY = y;
          break;
        }
      }
      if (startY >= 0 && startY >= 0) break;
    }
    //this.colors.push([this.getPixelColor(1009, 0)])
    // console.log(startX, startY)
    // get Ends
    let tempIndex = startX;
    while (tempIndex < this.img.width && this.getPixelColor(tempIndex, startY).str != 'white') tempIndex++;
    endX = tempIndex;
    tempIndex = startY;
    while (tempIndex < this.img.height && this.getPixelColor(startX, tempIndex).str != 'white') tempIndex++;
    endY = tempIndex;
    //border calculations
    let inner = 1;
    while (this.getPixelColor(startX + inner, startY + inner).str == 'gray') inner++;
    tempIndex = 0;
    while (this.getPixelColor(startX + tempIndex, startY + inner).str == 'gray') tempIndex++;
    borderX = tempIndex;
    tempIndex = 0;
    while (this.getPixelColor(startX + inner, startY + tempIndex).str == 'gray') tempIndex++;
    borderY = tempIndex;

    // block calculations
    tempIndex = 0;
    while (this.getPixelColor(startX + borderX + tempIndex, startY + borderY).str == 'white') tempIndex++;
    blockX = tempIndex;
    tempIndex = 0;
    while (this.getPixelColor(startX + borderX, startY + borderY + tempIndex).str == 'white') tempIndex++;
    blockY = tempIndex;

    const d: Dim = { startX, startY, endX, endY, blockX, blockY, borderX, borderY };
    //console.log(startX, startY, endX, endY, borderX, borderY, blockX, blockY)
    //console.log(endX - startX, endY - startY, (endX - startX - borderX) / (borderX + blockX))

    // this.colors = this.getSymbol(d, 1, 14);

    for (let y = startY; y < endY; y++) {
      const row: Color[] = [];
      for (let x = startX; x < endX; x++) {
        row.push(this.getPixelColor(x, y));
      }
      this.colors.push(row);//.reverse());
    }
    //console.log(this.colors);

    //this.colors = this.colors.slice(200, 400).map(r => r.slice(0, 200));
    const { boundY, boundX } = this.getBoundaries()

    const test = [];
    //console.log(boundX, boundY);
    for (let borderYI = 0; borderYI < boundY.length - 1; borderYI++) {
      if (boundY[borderYI + 1] - boundY[borderYI] > 20) {
        //console.log(boundY[borderYI], boundY[borderYI + 1])
        const r = [];
        for (let borderXI = 0; borderXI < boundX.length - 1; borderXI++) {
          if (boundX[borderXI + 1] - boundX[borderXI] > 20) {
            const item = this.colors.slice(boundY[borderYI] + 1, boundY[borderYI + 1]).map(row => row.slice(boundX[borderXI] + 1, boundX[borderXI + 1]));
            r.push(item)
          }
        }
        if (r.length) test.push(r);
      }
    }

    //console.log(test)
    //this.uniqueSym = [].concat(...test);
    this.colors = []// test[0][4]
    let uniqueTemp = []
    for (let x = 0; x < test.length; x++) {
      for (let y = 0; y < test[x].length; y++) {
        uniqueTemp.push(this.getNumRepOfSym(test[x][y]))
      }
    }
    // const names = uniqueTemp.map(x => JSON.stringify(x.name));//.filter((item, i) => uniqueTemp.indexOf(item) === i);
    // const unique = uniqueTemp.filter((item, i) => names.indexOf(JSON.stringify(item.name)) === i);
    // this.uniqueSym = unique.map(x => x.sym)
    //this.uniqueSym = unique;
    //console.log(names)



    const unique = [];

    for (let c1 = 0; c1 < uniqueTemp.length; c1++) {
      const name1 = uniqueTemp[c1].name;
      let check = true;
      for (let c2 = 0; c2 < unique.length; c2++) {
        // console.log(1, unique2)
        const name2 = unique[c2].name;

        //if (Math.abs(name1.length - name2.length) > 2) continue

        const sim = (name1.reduce((prev, cur, i) => prev + Math.pow(cur - (name2[i] ?? 0), 2), 0) + name2.reduce((prev, cur, i) => prev + Math.pow(cur - (name1[i] ?? 0), 2), 0)) / 2;
        //console.log(sim)
        //if (unique2.length == 4, c2 == 3) console.log(sim)
        if (sim < 5) {
          check = false
          //console.log(sim)
        }
      }
      if (check) {
        unique.push(uniqueTemp[c1])
        // console.log(c1)
      }
    }

    // const a = 4;
    // const b = 7;
    console.log(unique);
    // console.log(unique2, unique2[a].name, unique2[b].name, unique2[a].name.reduce((prev, cur, i) => prev + Math.pow(cur - (unique2[b].name[i] ?? 0), 2), 0), unique2[b].name.reduce((prev, cur, i) => prev + Math.pow(cur - (unique2[a].name[i] ?? 0), 2), 0));
    this.uniqueSym = unique.map(x => x.sym)
    // console.log(test)
    //this.uniqueSym = test[0]


    //this.uniqueSym = [this.getNumRepOfSym(this.uniqueSym[2], true).sym]
    //console.log(this.getNumRepOfSym(this.uniqueSym[0], true))
    //this.uniqueSym.forEach(a => a.forEach(b => b.forEach(c => c.str = this.colorToBackground(c))))
    // const unique3 = []
    // for (let c1 = 0; c1 < unique2.length; c1++) {
    //   const name1 = unique2[c1].name;
    //   let check = true;
    //   for (let c2 = 0; c2 < unique3.length; c2++) {
    //     // console.log(1, unique2)
    //     const name2 = unique3[c2].name;


    //     // console.log(name1, name2)
    //     const sim = name1.reduce((prev, cur, i) => prev + Math.pow(cur - (name2[i] ?? 0), 2), 0)
    //     //console.log(sim, unique2[5].name.join(''), unique2[8].name.join(''))
    //     if (sim < 100) {
    //       check = false

    //     }
    //   }
    //   if (check) {
    //     unique3.push(unique2[c1])
    //     // console.log(c1)
    //   }
    // }

    // console.log(unique3)
    // this.uniqueSym = unique3.map(x => x.sym)
    // const tempMatrix: number[][][][] = [];
    // for (let y = startY; y < startY + 2; y++) {
    //   const row: Color[] = [];
    //   for (let x = startX; x < endX; x++) {
    //     const color = this.getPixelColor(x, y);
    //     row.push(color)
    //     // if (startY < 0 && startY < 0 && color.str == "gray") {
    //     //   startX = x;
    //     //   startY = y;
    //     //   break;
    //     // }
    //   }
    //   // add outer row
    //   if (this.getUniqueJustStr(row).length == 1) tempMatrix.push([]);
    //   else {
    //    // console.log(row.map(r => r.str), row.filter(r => r.str == 'black'))
    //     let tempMatrix: number[] = [];
    //     let tempRow: number[] = [];
    //     for (let i = 0;  i< row.length) {
    //       if (row[i].str == 'white') {
    //        tempMatrix.push(i,i+blockY)
    //       } else {
    //         tempRow.push(c.str == 'white' ? 0 : 1)
    //       }
    //     }
    //     console.log(tempMatrix)
    //   }
    //   //if (startY >= 0 && startY >= 0) break;
    //   //this.colors.push(row);
    // }

    // const factor = Math.floor(this.img.height / this.Height);
    // for (let y = 0; y < this.img.height; y += 5) {
    //   const row: Color[] = [];
    //   for (let x = 0; x < this.img.width; x += 5) {
    //     row.push(this.getPixelColor(x, y));
    //     //row.push(this.getBestMatch(this.getPixelColor(x, y)));
    //     // const factorSet = [];
    //     // for (let j = 0; j < factor && (j + y < this.img.height); j++) {
    //     //   for (let i = 0; i < factor && (i + x < this.img.width); i++) {
    //     //     factorSet.push(this.getPixelColor(x + i, y + j))

    //     //   }
    //     // }
    //     // //if (x < 10 && y < 15) console.log(x, y, factorSet)
    //     // if (this.getUnique(factorSet).length > 1) console.log(x, y, factorSet)
    //     // //if (x == 500 && y == 500) console.log(factorSet, this.getAverageColor(factorSet))
    //     // row.push(this.test(this.getAverageColor(factorSet)));
    //   }
    //   this.colors.push(row);//.reverse());
    // }
    // // console.log(this.colors);
    // this.removeBorder();

    // this.colors = this.colors.slice(151, 226).map(r => r.slice(114))//, 171))
    // this.uniqueColors = this.getUnique([].concat(...this.colors));

    // this.uniqueColors.forEach(c => {
    //   //console.log(this.basicSim(c))
    //   c.count = 0;
    //   this.colors.forEach(r => r.forEach(cell => {
    //     if (cell.str == c.str) c.count++;
    //   }))
    // })
    // //console.log(FLOSS_LOOK_UP)

    this.loaded = true;
  }

  getNumRepOfSym(c: Color[][], log = false) {
    // if (log) console.log(c)
    let newC = JSON.parse(JSON.stringify(c));
    //for (let x = 0; x < 2; x++) {
    newC = newC.filter(row => this.getUniqueJustStr(row).length > 1 && this.getUnique(row).length > 1);
    //if (log) console.log(1, c.map(r => this.getUniqueJustStr(r).length))
    if (newC.length == 0) return { name: [], sym: [] };
    const rotated = newC[0].map((val, index) => newC.map(row => row[index]).reverse()).filter(row => this.getUniqueJustStr(row).length > 1);
    //if (log) console.log(rotated)
    //
    // name.push(...rotated.map(r => r.filter(cell => cell.str == 'black').length).filter(i => i));//.join('');
    // console.log(rotated)
    // if (rotated.length == 0) return { name: [0], sym: [] };
    //console.log(rotated.map(r => r.filter(cell => cell.str == 'black').length).join(''))
    newC = rotated[0].map((val, index) => rotated.map(row => row[row.length - 1 - index]));

    if (newC.length == 0) return { name: [0], sym: [] };
    //}
    const name = [].concat(...newC.map(r => r.map(cell => this.colorToNumber(cell))));
    // const name = newC.map(r => r.filter(cell => cell.str == 'black').length).filter(i => i);//.join('');
    // const rotated = newC[0].map((val, index) => newC.map(row => row[index]).reverse())
    //   .filter(row => this.getUniqueJustStr(row).length > 1);
    // name.push(...rotated.map(r => r.filter(cell => cell.str == 'black').length).filter(i => i));//.join('');
    // console.log(rotated)
    // if (rotated.length == 0) return { name: [0], sym: [] };
    //console.log(rotated.map(r => r.filter(cell => cell.str == 'black').length).join(''))
    //newC = rotated[0].map((val, index) => rotated.map(row => row[row.length - 1 - index]));
    // console.log(newC)
    // return { name: rName + cName, symbol: newC };
    return { name: name, sym: newC };
  }

  colorToNumber(c: Color) {
    return Math.round(((c.r + c.g + c.b) / (3 * 255)) * 1000) / 1000
    // if (s == 'white') return 0;
    // if (s == 'black') return 10;
    // if (s == 'gray') return 2;
    // else return 5;
  }

  getSymbol(d: Dim, x: number, y: number): Color[][] {
    const temp: Color[][] = []
    const startY = (d.startY + d.borderY) + (y * (d.borderY + d.blockY));
    const startX = (d.startX + d.borderX) + (x * (d.borderX + d.blockX));
    for (let i = startY; i < startY + d.blockY; i++) {
      const row: Color[] = [];
      for (let j = startX; j < startX + d.blockX; j++) {
        const color = this.getPixelColor(j, i);
        row.push(color)
        // if (startY < 0 && startY < 0 && color.str == "gray") {
        //   startX = x;
        //   startY = y;
        //   break;
        // }
      }
      //if (startY >= 0 && startY >= 0) break;
      temp.push(row);
    }
    return temp;
  }


  public onClick(c: Color) {
    if (this.hide) {
      const tempStr = c.str;
      const cur = this.uniqueColors.find(x => x.str === tempStr);
      cur.show = !cur.show;
      this.colors.forEach(row => row.filter(x => x.str === tempStr).forEach(x => x.show = cur.show));
      this.highlighted = null;
      //   .forEach(x => {
      //   if(x.str === tempStr) c.show = false
      // })
      // this.uniqueColors.filter(x => x.str === tempStr).forEach(x => )
    }
    else if (this.highlighted == c.str) this.highlighted = null;
    else {
      this.highlighted = c.str;
    }
    console.log('click', c)
    //highlighted = color.str
  }

  private tempTest(c1: number[], c2: number[]) {


  }


  private getBoundaries() {
    const boundY = this.colors.map((row, i) => !row.some(r => r.str == 'white') ? i : -1).filter(r => r >= 0);
    //console.log(this.colors.map((row, i) => row.filter(r => r.str == 'white').length))
    // this.colors = this.colors.filter(row => this.getUnique(row).length > 1);
    // //specific to just this, last row looks weird
    // this.colors.pop()
    // //sides
    const boundX = this.colors[0].map((val, index) => this.colors.map(row => row[index]).reverse())
      .map((row, i) => !row.some(r => r.str == 'white') ? i : -1).filter(r => r >= 0);
    return { boundY, boundX };
  }

  private removeBorder() {

    this.colors = this.colors.filter(row => this.getUnique(row).length > 1);
    //specific to just this, last row looks weird
    this.colors.pop()
    //sides
    const rotated = this.colors[0].map((val, index) => this.colors.map(row => row[index]).reverse())
      .filter(row => this.getUnique(row).length > 1);
    this.colors = rotated[0].map((val, index) => rotated.map(row => row[row.length - 1 - index]));
  }


  private getPixelColor(x, y): Color {
    const red = y * (this.img.width * 4) + x * 4;
    const temp = {
      r: this.imageData[red],
      g: this.imageData[red + 1],
      b: this.imageData[red + 2],
      a: this.imageData[red + 3],
      str: '',
      dmc: '',
      show: true
    };
    temp.str = this.getParts(temp)//this.colorToBackground(temp);
    //if (temp.str == 'None') temp.show = false;
    temp.dmc = this.getDMC(temp);

    if (temp.dmc == 'None') temp.show = false;
    return temp;
  }

  private getAverageColor(colors: Color[]): Color {
    const temp = {
      r: Math.round(colors.reduce((partialSum, a) => partialSum + a.r, 0) / colors.length),
      g: Math.round(colors.reduce((partialSum, a) => partialSum + a.g, 0) / colors.length),
      b: Math.round(colors.reduce((partialSum, a) => partialSum + a.b, 0) / colors.length),
      a: Math.round(colors.reduce((partialSum, a) => partialSum + a.a, 0) / colors.length),
      str: '',
      dmc: '',
      show: true
    };
    temp.str = this.colorToBackground(temp);
    return temp;
  }

  private colorToBackground(c: Color): string {
    return this.rgbToHex(c.r, c.g, c.b);
    //return `rgb(${c.r}, ${c.g}, ${c.b})`
    //return `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`
  }

  private getUnique(a: Color[]): Color[] {
    const temp = a.map(c => JSON.stringify(c));
    return a.filter((item, i) => temp.indexOf(JSON.stringify(item)) === i);
  }
  private getUniqueJustStr(a: Color[]): Color[] {
    const temp = a.map(c => c.str);
    return a.filter((item, i) => temp.indexOf(item.str) === i);
  }

  private componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }


  private rgbToHex(r, g, b) {
    return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
  }

  // getBestMatch(c: Color): Color {
  //   //console.log(c)
  //   let max = 0;
  //   let bestFloss: Floss;
  //   FLOSS_LOOK_UP.forEach(f => {
  //     const cosim = this.cosinesim(c, f);
  //     //console.log(f, cosim, max)
  //     if (cosim > max) {
  //       max = cosim;
  //       bestFloss = f;
  //     }
  //   });

  //   return {
  //     r: bestFloss.r,
  //     g: bestFloss.g,
  //     b: bestFloss.b,
  //     a: 255,
  //     str: bestFloss.hex ?? '',
  //     dmc: bestFloss.floss,
  //     title: bestFloss.name,
  //     show: ![bestFloss.r, bestFloss.g, bestFloss.b].every(a => a == 255)
  //   }
  //   console.log(max, bestFloss,);
  // }

  private getBestMatch(c: Color): Color {
    let min = Math.pow(255, 2) * 3;
    let bestFloss: Floss;
    FLOSS_LOOK_UP.forEach(f => {
      const sim = Math.pow(c.r - f.r, 2) + Math.pow(c.g - f.g, 2) + Math.pow(c.b - f.b, 2);
      if (sim < min) {
        min = sim;
        bestFloss = f;
      }
    });
    //return bestFloss
    return {
      r: bestFloss.r,
      g: bestFloss.g,
      b: bestFloss.b,
      a: 255,
      str: bestFloss.hex ?? '',
      dmc: bestFloss.floss,
      title: bestFloss.name,
      show: ![bestFloss.r, bestFloss.g, bestFloss.b].every(a => a == 255)
    }
  }
  private getBestMatchYUV(color: Color): Color {
    //TODO filter out white if not white
    let min = Math.pow(255, 2) * 3;
    let bestFloss: Floss;
    const A = this.rgbToYuv(color.r, color.g, color.b);
    FLOSS_LOOK_UP.forEach(floss => {
      const B = this.rgbToYuv(floss.r, floss.g, floss.b);
      const sim = A.reduce((prev, cur, i) => prev + Math.pow(cur - B[i], 2), 0)
      //const sim = Math.pow(c.r - f.r, 2) + Math.pow(c.g - f.g, 2) + Math.pow(c.b - f.b, 2);
      if (sim < min) {
        min = sim;
        bestFloss = floss;
      }
    });
    //return bestFloss
    return {
      r: bestFloss.r,
      g: bestFloss.g,
      b: bestFloss.b,
      a: 255,
      str: bestFloss.hex ?? '',
      dmc: bestFloss.floss,
      title: bestFloss.name,
      show: ![bestFloss.r, bestFloss.g, bestFloss.b].every(a => a == 255)
    }
  }
  private cosinesim(color: Color, floss: Floss) {
    //const A = this.rgbToYuv(color.r, color.g, color.b);
    //const B = this.rgbToYuv(floss.r, floss.g, floss.b);
    // const A = [color.r + 256, color.g + 256, color.b + 256];
    // const B = [floss.r + 256, floss.g + 256, floss.b + 256];
    const A = [color.r, color.g, color.b].map(t => Math.max(t, .01));
    const B = [floss.r, floss.g, floss.b].map(t => Math.max(t, .01));;
    var dotproduct = 0;
    var mA = 0;
    var mB = 0;

    for (var i = 0; i < A.length; i++) {
      dotproduct += A[i] * B[i];
      mA += A[i] * A[i];
      mB += B[i] * B[i];
    }

    mA = Math.sqrt(mA);
    mB = Math.sqrt(mB);
    var similarity = dotproduct / (mA * mB);
    var similarity = dotproduct / ((mA * mB) == 0 ? .001 : (mA * mB));
    //console.log(similarity)
    return similarity;
  }

  rgbToYuv(R: number, G: number, B: number) {
    const Y = ((66 * R + 129 * G + 25 * B + 128) / 256) + 16;
    const U = ((-38 * R - 74 * G + 112 * B + 128) / 256) + 128;
    const V = ((112 * R - 94 * G - 18 * B + 128) / 256) + 128;
    return [Y, U, V];
  }

  getParts(c: Color) {
    if (c.r > 230 && c.b > 230 && c.g > 230 || (((c.r + c.b + c.g) / 3) > 230)) return 'white';
    else if (c.r > 210 && c.b > 210 && c.g > 210 && (Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b) < 5)) return 'gray';
    else if ((c.r < 100 || c.b < 100 || c.g < 100) || (c.r < 150 && c.b < 150 && c.g < 150)) return 'black';
    else return 'grey';

  }


  getDMC(c: Color): string {
    //if (c.str == '#ffffff') return 'None';
    if (c.str == '#4b4b49') return '535';
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
}
//1150 1540
