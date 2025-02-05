import { NgClass, NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { FLOSS_LOOK_UP, Floss } from './floss';
import kmeans from './kmeans';
import { GUIDE } from './types';

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
  public imageName: any = 'blockview.png';// ON IMAGE Change
  private img: HTMLImageElement;
  private context: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private imageData: Uint8ClampedArray;
  public colors: Color[][] = [];
  public uniqueColors: Color[] = [];
  public highlighted: string = '';
  public loaded = false;
  public hide: boolean = false;
  public bumpStart: number = 1; // ON IMAGE Change
  public minCount: number = 0;//35;
  // not important right now
  public totalColors: number = 21;//35;
  public imageProcessType: 'basic' | 'kmeans' | 'configAndSim' | 'self-fill' = 'basic';  // ON IMAGE Change (Maybe)

  public Height = 226; // ON IMAGE Change
  public Width = 200; // ON IMAGE Change

  ngOnInit(): void {
    // setTimeout(() => {

    //this.img = document.getElementsByTagName('img')[0];

    FLOSS_LOOK_UP.forEach(f => {
      const hex = this.rgbToHex(f.r, f.g, f.b);
      f.hex = hex;
      this.flossDic[f.floss] = { ...f, hex };
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
    const factorY = this.img.height / this.Height;
    const factorX = this.img.width / this.Width;
    console.log(this.img.height, this.img.width, factorY, factorY, this.bumpStart, this.img.height / this.Height)
    const begin = Number(this.bumpStart);

    //const colorTemp = [];

    for (let y = begin; y < this.img.height; y += factorY) {
      const row: Color[] = [];
      //const tempRow: Color[] = [];
      for (let x = begin; x < this.img.width; x += factorX) {

        const c = this.getPixelColor(Math.round(x), Math.round(y));
        row.push(c);
        //row.push(this.getBestMatch(c))
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
      //colorTemp.push(tempRow);//.reverse());
    }
    console.log(this.colors.length, this.colors[0].length)
    //console.log(this.colors);
    
    //Maybe will be useful inn future
    //Try to reassign colors
   // this.fillColors();

    //Clean up stuff
    this.removeBorder();

    if(this.imageProcessType == 'kmeans') this.preformKmeansAnalysis()
    else if(this.imageProcessType == 'configAndSim') this.fillColors();

    // ON SECTION Change
    //if (this.imageName == 'test.png') this.colors = this.colors.slice(0, 76).map(r => r.slice(171))//, 171))
    this.generateUniqueColors();
    console.log(this.uniqueColors.length)

    this.uniqueColors.forEach(c => {
      //console.log(this.basicSim(c))
      c.count = 0;
      this.colors.forEach(r => r.forEach(cell => {
        if (cell.str == c.str) c.count++;
      }))
    })
    // give count
    let temp = 0;
    this.uniqueColors.forEach(c => {
      this.colors.forEach(r => r.forEach(cell => {
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
    this.uniqueColors.sort((a, b) => (a.count ?? 0) - (b.count ?? 0));
    console.log(this.colors.length, this.colors[0].length, 'total: ',temp)

    this.loaded = true;
  }

  public onClick(c: Color,i = -1,j=-1) {
    if (this.hide) {
      const tempStr = c.str;
      const cur = this.uniqueColors.find(x => x.str === tempStr);
      cur.show = !cur.show;
      this.colors.forEach(row => row.filter(x => x.str === tempStr).forEach(x => x.show = cur.show));
      // this.highlighted = null;
      //   .forEach(x => {
      //   if(x.str === tempStr) c.show = false
      // })
      // this.uniqueColors.filter(x => x.str === tempStr).forEach(x => )
    }
    else if (this.highlighted == c.str) this.highlighted = null;
    else {
      this.highlighted = c.str;
    }
    console.log('click', c,i,j)
    //highlighted = color.str
  }

  private generateUniqueColors(){
    this.uniqueColors = this.getUnique([].concat(...this.colors))//.slice(75).map(r => r.slice(37))))
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


//***************************************************** */
  // Beyond this point things are kinda expiremental
//***************************************************** */
  
  private fillColors(){

    const colorOverride = Array(this.colors.length).fill(0).map(i => Array(this.colors[0].length).fill(undefined));
    GUIDE.forEach((colorGuide,i) => {
      const testColor = this.getAverageColor(colorGuide.colorSample.map(c => this.colors[c.i][c.j]));
      //console.log(testColor);
      //console.log(this.getColorSiimilarity(testColor,this.colors[38][90]))
      const colorSims: {i:number,j:number,sim:number}[] = [];
      this.colors.forEach((row,i) => row.forEach((cell,j) => {
        if(!colorOverride[i][j])colorSims.push({i,j,sim: this.getColorSiimilarity(testColor,cell)})
      }));
    const picked = colorSims.sort((a,b) => a.sim-b.sim).slice(0,colorGuide.count);
    let floss = this.flossDic[colorGuide.floss];
    console.log(floss)//, this.flossDic)
    const averagedColor = floss ? this.flossToColor(floss) : this.getAverageColor(picked.map(x => this.colors[x.i][x.j]));
    picked.forEach(x => {
      //reomve this 
      this.colors[x.i][x.j] = JSON.parse(JSON.stringify(averagedColor));
      //keep this
      colorOverride[x.i][x.j] = JSON.parse(JSON.stringify(averagedColor));
    })
    this.highlighted = averagedColor.str;
    })
    // const numberOfColor = 176;
    // const colorSample = [this.getColorFromRGB([68,100,59]), this.getColorFromRGB([92, 120,85])];
    // const testGreen = this.getAverageColor(colorSample);
    // console.log(testGreen);
    // const colorSims: {i:number,j:number,sim:number}[] = [];
    // this.colors.forEach((row,i) => row.forEach((cell,j) => {
    //   colorSims.push({i,j,sim: this.getColorSiimilarity(testGreen,cell)})
    // }));
    // const picked = colorSims.sort((a,b) => a.sim-b.sim).slice(0,numberOfColor)
    // picked.forEach(x => this.colors[x.i][x.j] = JSON.parse(JSON.stringify(testGreen)))
    // this.highlighted = testGreen.str;
    // console.log(picked)
  }

  private getColorFromRGB(arr: number[]): Color {
    const temp = {
      r: Math.round(arr[0]),
      g: Math.round(arr[1]),
      b: Math.round(arr[2]),
      a: 255,
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
    const r = Math.round(colors.reduce((partialSum, a) => partialSum + a.r, 0) / colors.length);
    const g = Math.round(colors.reduce((partialSum, a) => partialSum + a.g, 0) / colors.length);
    const b = Math.round(colors.reduce((partialSum, a) => partialSum + a.b, 0) / colors.length);
    return this.getColorFromRGB([r,g,b])
  }

  private getNoneColor(): Color{
    return {
      r: 255,
      g: 255,
      b: 255,
      a: 255,
      count: 0,
      dmc: "None",
      show: false,
      str: "#ffffff"
    };
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

  private flossToColor(floss:Floss): Color{
       return {
          r: floss.r,
          g: floss.g,
          b: floss.b,
          a: 255,
          str: floss.hex ?? '',
          dmc: floss.floss,
          title: floss.name,
          show: ![floss.r, floss.g, floss.b].every(a => a == 255)
        }
  }


  private preformKmeansAnalysis(){
    console.log(this.colors.length*this.colors[0].length)
    const sample = Array(100).fill(1).map(i => {
      const y = Math.floor(Math.random()*this.colors.length);
      const x =Math.floor(Math.random()*this.colors[0].length);
      return({ y,x,
      color: this.colors[y][x]
    })
  });
  console.log(sample)
  this.generateUniqueColors();
    const uniqueColorsArray = this.uniqueColors.map(c => [c.r,c.g,c.b]);
    //const possible = [4, 23, 351,415,610,739,758, 814, 817,841, 930, 931,932,950,987,3042,3371,3841,3864, "B5200", "White"];
    //console.log(possible.length)
    //const centroids = FLOSS_LOOK_UP.filter(f => possible.includes(f.floss)).map(c => [c.r,c.g,c.b]);
    const k = kmeans(uniqueColorsArray, this.totalColors)//, centroids);
    const tempColors = Array(this.colors.length).fill(0).map(i => Array(this.colors[0].length).fill(undefined));
    this.uniqueColors = [];
    console.log(k)
   k.clusters.forEach(cluster =>{
    
    let newColor: Color = this.getColorFromRGB(cluster.centroid);
    

   // console.log(cluster.points)
    this.colors.forEach((row,i) => 
      row.forEach((cell,j) => {
        const pointStrings = cluster.points.map(p => JSON.stringify(p))
        if(!tempColors[i][j] && (pointStrings.includes(JSON.stringify([cell.r, cell.g, cell.b])))){
          //if(i == 0 && j==0) newColor = this.getColorFromRGB([255,255,255]);
          //console.log('test', [cell.r, cell.g, cell.b], i,j)
          tempColors[i][j] = JSON.parse(JSON.stringify(newColor));
        }
      //if (cell.str == c.str) c.count++;
    }))

    this.uniqueColors.push(JSON.parse(JSON.stringify(newColor)));
    //cluster.points
    //console.log(cluster.points,tempColors)
   }); 
   this.colors = tempColors;
   console.log(tempColors)
   this.removeBorder();
    //console.log(k)
// // execute clustering using dataset

// kmeans.cluster(uniqueColorsArray, function (err, clusters, centroids) {
//    // show any errors
//    console.log(err);
// // show the clusters founds
//    console.log(clusters);
// // show the centroids
//    console.log(centroids);
// });
//     let min = Math.pow(255, 2) * 3;
//     let retVal = 'None';
//     ///const possible = [4, 23, 351,415,610,739,758, 814, 817,841, 930, 931,932,950,987,3042,3371,3841,3864, "Snow White", "White"];
//     //FLOSS_LOOK_UP.filter(f => possible.includes(f.floss)).forEach(f => {
//       this.uniqueColors.forEach((a,i) => {
//         this.uniqueColors.forEach((b,j)=> {
//           if(i !== j) {
            
//             const sim = Math.pow(a.r - b.r, 2) + Math.pow(a.g - b.g, 2) + Math.pow(a.b - b.b, 2);
//             console.log(i, j, sim);
//  if (sim < min) {
//         min = sim;
//         retVal = 'Indexes '+i+' and '+j+' is '+sim;
//         console.log(i, j, sim);
//         //bestFloss = f;
//       }
//           }
        
//         })

//       //})
//       // this.uniqueColors.forEach(f => {
//       // const sim = Math.pow(c.r - f.r, 2) + Math.pow(c.g - f.g, 2) + Math.pow(c.b - f.b, 2);
//       // if (sim < min) {
//       //   min = sim;
//       //   bestFloss = f;
//       // }
//     });
//     return 

  }

  private getColorSiimilarity(a:Color, b:Color): number{
    return Math.pow(a.r - b.r, 2) + Math.pow(a.g - b.g, 2) + Math.pow(a.b - b.b, 2);
  }

  private getBestMatch(c: Color): Color {
    let min = Math.pow(255, 2) * 3;
    let bestFloss: Floss;
    //const possible = [4, 23, 351,415,610,739,758, 814, 817,841, 930, 931,932,950,987,3042,3371,3841,3864, "Snow White", "White"];
    //FLOSS_LOOK_UP.filter(f => possible.includes(f.floss)).forEach(f => {
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
}
//1150 1540
