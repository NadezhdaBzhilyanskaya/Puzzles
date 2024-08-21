import { NgClass, NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { FLOSS_LOOK_UP, Floss } from './floss';

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
  public imageName: any = 'test.png';
  private img: HTMLImageElement;
  private context: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private imageData: Uint8ClampedArray;
  public colors: Color[][] = [];
  public uniqueColors: Color[] = [];
  public highlighted: string = '';
  public loaded = false;
  public hide: boolean = false;
  public bumpStart: number = 0;

  public Height = 300; // ON IMAGE Change

  ngOnInit(): void {
    // setTimeout(() => {

    //this.img = document.getElementsByTagName('img')[0];

    FLOSS_LOOK_UP.forEach(f => {
      const hex = this.rgbToHex(f.r, f.g, f.b);
      f.hex = hex;
      this.flossDic[hex] = { ...f, hex };
    })

    this.updateImage();

  }

  public update(e) {
    console.log(e.value)
    for (var i = 0; i < e.srcElement.files.length; i++) {

      var file = e.srcElement.files[i];

      var img = document.createElement("img");
      var reader = new FileReader();
      reader.onloadend = () => {
        this.imageName = reader.result;
      }
      reader.readAsDataURL(file);
      //$("input").after(img);
    }
  }

  public updateImage() {
    this.colors = [];
    try {
      this.img = undefined;
      this.img = new Image();
      this.canvas = document.getElementsByTagName('canvas')[0];
      this.context = this.canvas.getContext('2d');
      //this.img.src = "blockview.png"; // ON IMAGE Change
      this.img.src = this.imageName;

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
    this.context.reset();
    this.canvas.height = this.img.height;
    this.canvas.width = this.img.width;
    this.context.drawImage(this.img, 0, 0, this.img.width, this.img.height);
    //console.log(this.context.createImageData(this.img.width, this.img.height))
    this.imageData = this.context.getImageData(0, 0, this.img.width, this.img.height).data;
    console.log(this.img.height, this.img.width)
    const factor = Math.floor(this.img.height / this.Height);
    console.log(this.img.height, this.img.width, factor, this.bumpStart)
    const begin = Number(this.bumpStart); // ON IMAGE Change
    for (let y = begin; y < this.img.height; y += factor) {
      const row: Color[] = [];
      for (let x = begin; x < this.img.width; x += factor) {
        row.push(this.getPixelColor(x, y));
        //row.push(this.getBestMatch(this.getPixelColor(x, y)));
        // const factorSet = [];
        // for (let j = 0; j < factor && (j + y < this.img.height); j++) {
        //   for (let i = 0; i < factor && (i + x < this.img.width); i++) {
        //     factorSet.push(this.getPixelColor(x + i, y + j))

        //   }
        // }
        // //if (x < 10 && y < 15) console.log(x, y, factorSet)
        // if (this.getUnique(factorSet).length > 1) console.log(x, y, factorSet)
        // //if (x == 500 && y == 500) console.log(factorSet, this.getAverageColor(factorSet))
        // row.push(this.test(this.getAverageColor(factorSet)));
      }
      this.colors.push(row);//.reverse());
    }
    //console.log(this.colors);
    this.removeBorder();

    // ON SECTION Change
    if (this.imageName == 'test.png') this.colors = this.colors.slice(60, 151).map(r => r.slice(55))//, 171))
    this.uniqueColors = this.getUnique([].concat(...this.colors));

    this.uniqueColors.forEach(c => {
      //console.log(this.basicSim(c))
      c.count = 0;
      this.colors.forEach(r => r.forEach(cell => {
        if (cell.str == c.str) c.count++;
      }))
    })
    //console.log(FLOSS_LOOK_UP)

    this.loaded = true;
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


  private removeBorder() {

    this.colors = this.colors.filter(row => this.getUnique(row).length > 1);
    //specific to just this, last row looks weird
    //this.colors.pop() // ON IMAGE Change
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
    temp.str = this.colorToBackground(temp);
    if (temp.str == 'None') temp.show = false;
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


  getDMC(c: Color): string {
    if (c.str == '#ffffff') return 'None';
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
}
//1150 1540
