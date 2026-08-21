import { NgClass, NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { FLOSS_LOOK_UP, Floss } from './floss';
import {kmeans, kmeansGivenCentroids} from './kmeans';
import { Color, GUIDE } from './types';
import { PatternDisplayComponent } from './pattern-display/pattern-display.component';
import { FillFromPatternComponent } from './fill-from-pattern/fill-from-pattern.component';
import *  as Utils from './utils';
import { ColorListComponent } from './color-list/color-list.component';
import patternJSON from '../../../public/patternOutputMushroomHedgehog.json';

enum ImageProcessingType { Basic, Kmeans, ConfigAndSim, SelfFill, FromFile};

@Component({
  selector: 'pattern-breakdown',
  standalone: true,
  imports: [ColorListComponent, PatternDisplayComponent, FillFromPatternComponent],
  templateUrl: './pattern-breakdown.component.html',
  styleUrl: './pattern-breakdown.component.scss'
})
export class PatternBreakdownComponent {
  public ImageProcessingType: typeof ImageProcessingType = ImageProcessingType;

  private flossDic: Record<string, Floss> = {};
  public imageName: any = 'WatercolorWitch.png';// ON IMAGE Change
  public img: HTMLImageElement;
  public context: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  public imageData: Uint8ClampedArray;
  public colors: Color[][] = [];
  public uniqueColors: Color[] = [];
  public loaded = false;
  public hide: boolean = false;
  public selectingColorsForCentroid: boolean = false;
  public selectedCentroidsColors: Color[][];
  public selectedCentroids: number[][];
  public PIXELS_PER_CENTROID = 3;
  public bumpStart: number = 2; // ON IMAGE Change
  public minCount: number = 0;//35;
  private factorX: number = 1;// count numbers per square X
  private factorY: number = 1;// count numbers per square Y
  // not important right now
  public totalColors: number = 18;//35;
  public imageProcessType: ImageProcessingType = ImageProcessingType.Basic;  // ON IMAGE Change (Maybe)

  private borders = {top: 0, left: 0, right: 0,bottom:0, insideStart: 0, insideEnd: 0};

  public height = 268; // ON IMAGE Change
  public width = 200; // ON IMAGE Change

  ngOnInit(): void {
    // setTimeout(() => {

    //this.img = document.getElementsByTagName('img')[0];

    FLOSS_LOOK_UP.forEach(f => {
      const hex = Utils.rgbToHex(f.r, f.g, f.b);
      f.hex = hex;
      this.flossDic[f.floss] = { ...f, hex };
    })

    if(this.imageProcessType === ImageProcessingType.FromFile) this.loadFromFile();
    else this.updateImage();

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
// Playing with resizing images on the file that may be too big maybe can be taken out
    const totalSizeMax = 2000*2000;
    if((this.img.height*this.img.width) > totalSizeMax){
      const ratio = this.img.height/this.img.width;
      const widthNew = Math.round(Math.sqrt(totalSizeMax/ratio))
      const heightNew = Math.round(widthNew*ratio)
      this.img.width = widthNew;
      this.img.height = heightNew;
    }

    this.canvas.height = this.img.height;
    this.canvas.width = this.img.width;
    this.context.drawImage(this.img, 0, 0, this.img.width, this.img.height);
    //console.log(this.context.createImageData(this.img.width, this.img.height))
   
    //console.log(this.img.height, this.img.width, widthNew, heightNew, widthNew*heightNew)
   //this.context.scale(widthNew/this.img.width, heightNew/this.img.height);
    //console.log(this.img.height, this.img.width, widthNew, heightNew, widthNew*heightNew)

    // this.img.width = widthNew;
    // this.img.height = heightNew;
    //this.context.scale()
    //this.width =  Math.round(this.img.width/6.1);
    //this.height =  Math.round(this.img.height/6.1)
    //console.log(this.img.height, this.img.width)
    //console.log(this.height, this.width)
    this.imageData = this.context.getImageData(0, 0, this.img.width, this.img.height).data;

    this.factorY = this.img.height / this.height;

    this.factorX = this.img.width / this.width;
    console.log(this.img.height/this.factorX)



    console.log(this.img.height, this.img.width, this.factorY, this.factorY, this.bumpStart, this.img.height / this.height)
    const begin = Number(this.bumpStart);

    //const colorTemp = [];

    for (let y = begin; y < this.img.height; y += this.factorY) {
      const row: Color[] = [];
      //const tempRow: Color[] = [];
      for (let x = begin; x < this.img.width; x += this.factorX) {

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
    //console.log(JSON.parse(JSON.stringify(this.colors[0][0])),this.colors.length, this.colors[0].length)
    //console.log(this.colors);
    
    //Maybe will be useful inn future
    //Try to reassign colors
   // this.fillColors();

    //Clean up stuff
    // TODO turn back on
    this.removeBorder();

    if(this.imageProcessType == ImageProcessingType.Kmeans) this.preformKmeansAnalysis()
    // else if(this.imageProcessType == 'self-fill-kmeans') {
    //   this.loaded = true;
    //   this.selectedCentroidsColors = [];
    //   console.log(this.selectedCentroidsColors)
    //   this.selectingColorsForCentroid = true;
    //   return;
    // }
    else if(this.imageProcessType == ImageProcessingType.ConfigAndSim) this.fillColors();
    //else if(this.imageProcessType == 'self-fill') this.calcAverages();
  console.log(this.colors.length,this.colors[0].length)
   this.uniqueColors = Utils.loadUniqueColors(this.colors);
   console.log(JSON.parse(JSON.stringify(this.uniqueColors)))
   this.loaded = true;
  }

  public loadFromFile(){
    this.colors =( patternJSON as any);
    this.removeBorder();
    this.uniqueColors = Utils.loadUniqueColors(this.colors);
    console.log(this.uniqueColors.map(c => c.dmc).sort())
    this.loaded = true;
  }

  public onClick(c: Color, x: number = -1, y: number = -1) {
    if(this.selectingColorsForCentroid){
      if(this.selectedCentroidsColors.length == this.totalColors && this.selectedCentroidsColors[this.selectedCentroidsColors.length-1].length == this.PIXELS_PER_CENTROID-1){
        this.selectedCentroidsColors[this.selectedCentroidsColors.length-1].push(c);

        console.log('Done', this.selectedCentroidsColors)
       this.selectedCentroids = this.selectedCentroidsColors.map(centroid => {
          console.log(centroid, Utils.getAverageColorAsArr(centroid));
          return Utils.getAverageColorAsArr(centroid);
        });
        console.log(this.selectedCentroids)
        this.colors.forEach(r => r.forEach(cell => delete cell.count))
        this.selectingColorsForCentroid = false;
        this.loaded = false;
        this.preformKmeansAnalysis();
        console.log(this.colors)
        this.uniqueColors = Utils.loadUniqueColors(this.colors);
        this.loaded = true;
       console.log(this.colors);

      }
      else if(this.selectedCentroidsColors.length <= this.totalColors){
        if(!this.selectedCentroidsColors.length || this.selectedCentroidsColors[this.selectedCentroidsColors.length-1].length === this.PIXELS_PER_CENTROID){
          this.selectedCentroidsColors.push([c]);
        } else {
          this.selectedCentroidsColors[this.selectedCentroidsColors.length-1].push(c);
        }
      }
      else {
        console.log('Error:', this.selectedCentroidsColors)
      }
      //console.log(this.selectedCentroidsColors)
    }
    else if (this.hide) {
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
    else {
      this.toggleHighlight(c.str);
    }
    console.log('click', c,x,y,)
    //highlighted = color.str
  }


  public clearHighlight(){
    this.colors.forEach(row => row.forEach(c => {
      c.highlighted = false;
      c.show = ![c.r, c.g, c.b].every(a => a == 255);
    }));
    this.uniqueColors.forEach(c => {
      c.highlighted = false;
      c.show = ![c.r, c.g, c.b].every(a => a == 255);
    });
  }

  private toggleHighlight(str: string){
    this.colors.forEach(row => row.forEach(c => {
      if(c.str == str) c.highlighted =!c.highlighted;
    }))
    this.uniqueColors.forEach(c => {
      if(c.str == str) c.highlighted = !c.highlighted;
    });
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
    return Utils.getPixelColor(this.imageData, this.img.width,x,y);
  }

  private getUnique(a: Color[]): Color[] {
    const temp = a.map(c => JSON.stringify(c));
    return a.filter((item, i) => temp.indexOf(JSON.stringify(item)) === i);
  }



//***************************************************** */
  // Beyond this point things are kinda expiremental
//***************************************************** */
  
public test(e: any){console.log(e)}
private calcAverages(){
  //const borders = {top: 2, left: 1, right: 2,bottom:0, inside: 2};
  this.img.width = this.img.width-this.borders.left-this.borders.right;
  this.img.height = this.img.height-this.borders.top-this.borders.bottom;
  this.factorY = this.img.height / this.height;
  this.factorX =  this.img.width / this.width;
  this.imageData = this.context.getImageData(this.borders.left, this.borders.top, this.img.width,this.img.height).data;
  
  // this.img.height = imgHeight;
  // this.img.width = imgWidth;
  //console.log('hi', JSON.parse(JSON.stringify(this.colors.slice(0,  Math.round(this.factorY)).map(row => row.slice(0, Math.round(this.factorX))))))

  this.colors = [];

  for(let i = 0; i < this.height;i++){
    const row: Color[] = [];
    for(let j = 0; j < this.width;j++){
      row.push(this.getCellAverageColor(j,i));
    }
    //console.log('row:', i, 'Done')
    this.colors.push(row);
  }
  console.log(this.colors)
 // this.preformKmeansAnalysis()
 
 // TODO use for IDentifying borders
//   const tempColors = [];
//  for (let i = (this.factorY*0)+this.borders.insideStart; i < (this.factorY*(1+1))-this.borders.insideEnd; i++) {
//   const row: Color[] = [];
//   for (let j = (this.factorX*49)+this.borders.insideStart; j < (this.factorX*(50+1))-this.borders.insideEnd; j++) {
//  // for (let y = 0; y < this.factorY*(1); y++) {
//   //for (let y = Math.round(this.img.height-(this.factorY*3)); y < this.img.height; y++) {

//     //const tempRow: Color[] = [];
//     //for (let x = Math.round(this.img.width-(this.factorX*3)); x < this.img.width; x++) {
//     //for (let x = 0; x < this.factorX*1; x++) {

//      // console.log(x,y)
//       const c = this.getPixelColor(j,i);
//       row.push(c);
//     }
//     tempColors.push(row)
//   }
//   this.colors = tempColors;
//   console.log(tempColors)
 // this.tempForDisplay(Math.floor(Math.random()*this.width),Math.floor(Math.random()*this.height))

}

private getCellAverageColor(x:number,y: number): Color{
  const tempColors: Color[] = [];
  for (let i = (this.factorY*y)+this.borders.insideStart; i < (this.factorY*(y+1))-this.borders.insideEnd; i++) {
    for (let j = (this.factorX*x)+this.borders.insideStart; j < (this.factorX*(x+1))-this.borders.insideEnd; j++) {
      tempColors.push(this.getPixelColor(Math.round(j),Math.round(i)));
    }
  }
  //console.log(tempColors)
  return Utils.getAverageColor(tempColors);

}

private tempForDisplay(x:number,y: number){
  const tempColors: Color[][] = [];
  for (let i = (this.factorY*y)+this.borders.insideStart; i < (this.factorY*(y+1))-this.borders.insideEnd; i++) {
    const tempRow: Color[] = [];
    for (let j = (this.factorX*x)+this.borders.insideStart; j < (this.factorX*(x+1))-this.borders.insideEnd; j++) {
        const c = this.getPixelColor(Math.round(j),Math.round(i));
        tempRow.push(c);
      }
      tempColors.push(tempRow)
    }
    console.log(tempColors)
    this.colors = tempColors;
}
  private fillColors(){

    const colorOverride = Array(this.colors.length).fill(0).map(i => Array(this.colors[0].length).fill(undefined));
    GUIDE.forEach((colorGuide,i) => {
      const testColor = Utils.getAverageColor(colorGuide.colorSample.map(c => this.colors[c.i][c.j]));
      //console.log(testColor);
      //console.log(this.getColorSiimilarity(testColor,this.colors[38][90]))
      const colorSims: {i:number,j:number,sim:number}[] = [];
      this.colors.forEach((row,i) => row.forEach((cell,j) => {
        if(!colorOverride[i][j])colorSims.push({i,j,sim: Utils.getColorSimilarity(testColor,cell)})
      }));
    const picked = colorSims.sort((a,b) => a.sim-b.sim).slice(0,colorGuide.count);
    let floss = this.flossDic[colorGuide.floss];
    console.log(floss)//, this.flossDic)
    const averagedColor = floss ? this.flossToColor(floss) : Utils.getAverageColor(picked.map(x => this.colors[x.i][x.j]));
    picked.forEach(x => {
      //reomve this 
      this.colors[x.i][x.j] = JSON.parse(JSON.stringify(averagedColor));
      //keep this
      colorOverride[x.i][x.j] = JSON.parse(JSON.stringify(averagedColor));
    })
    this.toggleHighlight(averagedColor.str);
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

  private getNoneColor(): Color{
    return {
      r: 255,
      g: 255,
      b: 255,
      a: 255,
      count: 0,
      dmc: "None",
      show: false,
      str: "#ffffff",
      highlighted: false
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
          show: ![floss.r, floss.g, floss.b].every(a => a == 255),
          highlighted: false
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
  this.uniqueColors = Utils.generateUniqueColors(this.colors);
    const uniqueColorsArray = this.uniqueColors.map(c => [c.r,c.g,c.b]);
    //const possible = [4, 23, 351,415,610,739,758, 814, 817,841, 930, 931,932,950,987,3042,3371,3841,3864, "B5200", "White"];
    //console.log(possible.length)
    //const centroids = FLOSS_LOOK_UP.filter(f => possible.includes(f.floss)).map(c => [c.r,c.g,c.b]);
    const k = kmeans(uniqueColorsArray, this.totalColors)//, centroids);
    const tempColors = Array(this.colors.length).fill(0).map(i => Array(this.colors[0].length).fill(undefined));
    this.uniqueColors = [];
    console.log(k)
   k.clusters.forEach(cluster =>{
    
    let newColor: Color = Utils.getColorFromRGB(cluster.centroid);
    

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
      show: ![bestFloss.r, bestFloss.g, bestFloss.b].every(a => a == 255),
      highlighted: false
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
      show: ![bestFloss.r, bestFloss.g, bestFloss.b].every(a => a == 255),
      highlighted: false
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


  // getDMC(c: Color): string {
  //   if (c.str == '#ffffff' || c.str == '#fffdf9') return 'None';
  //   else if (c.str == '#4b4b49') return '535';
  //   else if (c.str == '#09092f') return '939';
  //   else if (c.str == '#3a3068') return '158';
  //   else if (c.str == '#39393d') return '3799';
  //   else if (c.str == '#494749') return '413';
  //   else if (c.str == '#202754') return '803';
  //   else if (c.str == '#000000') return '310';
  //   else if (c.str == '#999b9d') return '318';
  //   else if (c.str == '#908e85') return '647';

  //   else if (c.str == '#fcfcff') return 'White';
  //   else if (c.str == "#e0d7ee") return '24';
  //   else if (c.str == "#c5c4c9") return '2';
  //   else if (c.str == "#efeef0") return '1';
  //   else if (c.str == "#827d7d") return '169';
  //   else if (c.str == "#776e72") return '414';
  //   else if (c.str == "#9fa8a5") return '927';
  //   else if (c.str == "#b0b0b5") return '3';
  //   else if (c.str == "#b8b9bd") return '415';
  //   // else if (c.str == ) return '';
  //   // else if (c.str == ) return '';
  //   // else if (c.str == ) return '';
  //   // else if (c.str == ) return '';
  //   // else if (c.str == ) return '';
  //   // else if (c.str == ) return '';
  //   // else if (c.str == ) return '';

  //   // else if (c.str == ) return '';
  //   // else if (c.str == ) return '';
  //   // else if (c.str == ) return '';
  //   // else if (c.str == ) return '';
  //   // else if (c.str == ) return '';
  //   // else if (c.str == ) return '';
  //   // else if (c.str == ) return '';
  //   // else if (c.str == ) return '';
  //   // else if (c.str == ) return '';
  //   // else if (c.str == ) return '';
  //   return ''
  // }
}
//1150 1540
