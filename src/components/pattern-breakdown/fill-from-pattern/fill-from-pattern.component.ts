import { Component, Input, OnInit } from '@angular/core';
//import { writeFileSync} from 'fs';

import { Color } from '../types';
import * as Utils from '../utils';
import { PatternDisplayComponent } from '../pattern-display/pattern-display.component';
import { NgClass, NgStyle } from '@angular/common';
import { FileCreationService, FileObject } from '../../../services/file-creation.service';
import { ColorListComponent } from '../color-list/color-list.component';



enum FillSteps { Loading, UploadImage, GetBorderOffsets, GetInsideOffset, CombiningColors };

interface CornersAndEdges {
  topLeft: Color[][];
  topRight: Color[][];
  botLeft: Color[][];
  botRight: Color[][];
  top: Color[][];
  bot: Color[][];
  left: Color[][];
  right: Color[][];
}

interface BorderShift {
  top: number;
  left: number;
  right: number;
  bottom: number;
  insideStart: number;
  insideEnd: number;
}

@Component({
  selector: 'fill-from-pattern',
  standalone: true,
  imports: [PatternDisplayComponent, ColorListComponent],
  templateUrl: './fill-from-pattern.component.html',
  styleUrl: './fill-from-pattern.component.scss'
})
export class FillFromPatternComponent implements OnInit {
  // Const 
  private readonly SIMILARITY_QUOTIENT = 150;
//Enums
  public FillSteps: typeof FillSteps = FillSteps;
  // // services
  // private fileService: FileCreationService;
// inputs
  @Input({ required: true }) set imageData(value: Uint8ClampedArray) {
    this._imageData = JSON.parse(JSON.stringify(value));
    console.log('imgData change')
    this.onImageChange();
  }
  get imageData(): Uint8ClampedArray { return this._imageData; }
  private _imageData: Uint8ClampedArray;

  @Input({ required: true }) img!: HTMLImageElement;
  @Input({ required: true }) context!: CanvasRenderingContext2D;
  @Input() width: number = 0;
  @Input() height: number = 0;
  //@Output() clicked: EventEmitter<ColorClick> = new EventEmitter<ColorClick>();

  // regular variables
  public downloadableFile: FileObject;
  public currentStep: FillSteps = FillSteps.UploadImage;

  public borders: BorderShift = { top: 7, left: 6, right: 11, bottom: 11, insideStart: 2, insideEnd: 1 };
  public factorY: number = 0;
  public factorX: number = 0;

  public corners: CornersAndEdges = { topLeft: [], topRight: [], botLeft: [], botRight: [], top: [], bot: [], left: [], right: [] };
  public display: Color[][] = [];
  public uniqueColors: Color[] = []

  constructor(private fileService:FileCreationService){}

  ngOnInit(): void {
   // console.log(this.fileService)
    this.onImageChange();
  }

  private onImageChange() {
    //console.log(this.img, this, this.imageData)
    if (this.context && this.imageData && this.img && this.height > 0 && this.width > 0) {
      this.factorY = this.img.height / this.height;
      this.factorX = this.img.width / this.width;

      this.setUpCornerViews();

      this.currentStep = FillSteps.GetBorderOffsets;
    } else {
      this.currentStep = FillSteps.UploadImage;
    }
  }

  public setUpCornerViews() {
    this.corners = { topLeft: [], topRight: [], botLeft: [], botRight: [], top: [], bot: [], left: [], right: [] };
    const scaler = 3;
    const cornerSizeY = Math.min(50, Math.round(this.factorY * scaler));
    const cornerSizeX = Math.min(50, Math.round(this.factorX * scaler));
    const cornerSizeHalfY = Math.min(25, Math.round(this.factorY*(scaler/2)));
    const cornerSizeHalfX = Math.min(25, Math.round(this.factorX*(scaler/2)));
    const centerY = Math.round(this.img.height / 2);
    const centerX = Math.round(this.img.width / 2);

    this.corners.topLeft = this.getSection(this.borders.left, cornerSizeX, this.borders.top, cornerSizeY);
    this.corners.top = this.getSection(centerX - cornerSizeHalfX, centerX + cornerSizeHalfX, this.borders.top, cornerSizeY);
    this.corners.topRight = this.getSection(this.img.width - cornerSizeX, this.img.width - this.borders.right, this.borders.top, cornerSizeY);
    this.corners.left = this.getSection(this.borders.left, cornerSizeX, centerY - cornerSizeHalfY, centerY + cornerSizeHalfY);
    this.corners.right = this.getSection(this.img.width - cornerSizeX, this.img.width - this.borders.right, centerY - cornerSizeHalfY, centerY + cornerSizeHalfY);
    this.corners.botLeft = this.getSection(this.borders.left, cornerSizeX, this.img.height - cornerSizeY, this.img.height - this.borders.bottom);
    this.corners.bot = this.getSection(centerX - cornerSizeHalfX, centerX + cornerSizeHalfX, this.img.height - cornerSizeY, this.img.height - this.borders.bottom);
    this.corners.botRight = this.getSection(this.img.width - cornerSizeX, this.img.width - this.borders.right, this.img.height - cornerSizeY, this.img.height - this.borders.bottom);
   // console.log(this.corners, this.borders)

  }


  public toggleHighlight(str: string){
    this.display.forEach(row => row.forEach(c => {
      if(c.str == str) c.highlighted =!c.highlighted;
    }))
    this.uniqueColors.forEach(c => {
      if(c.str == str) c.highlighted = !c.highlighted;
    });
  }

  public changeBorder(e, key: keyof (BorderShift)) {
   // console.log(e, key)
    this.borders[key] = isNaN(Number(e.target.value)) ? 0 : Number(e.target.value);
    //console.log(this.borders)
    if (key === 'top') {
      ['topLeft', 'top', 'topRight'].forEach(section => {
        const rows = document.querySelector('.pattern-display-' + section).children;
        for (let i = 0; i < rows.length; i++) {
          if (i < this.borders.top) rows[i]['style'].display = 'none';
          else rows[i]['style'].display = 'flex';
        };
      });
    } else if (key === 'bottom'){
      ['botLeft', 'bot', 'botRight'].forEach(section => {
        const rows = document.querySelector('.pattern-display-' + section).children;
        for (let i = 0; i < rows.length; i++) {
          if (i >= (rows.length - this.borders.bottom)) rows[i]['style'].display = 'none';
          else rows[i]['style'].display = 'flex';
        };
      });
    } else if (key === 'left'){
      ['topLeft', 'left', 'botLeft'].forEach(section => {
        const rows = document.querySelector('.pattern-display-' + section).children;
        for (let i = 0; i < rows.length; i++) {
          for (let j = 0; j < rows[i].children.length; j++) {
            if (j < this.borders.left) rows[i].children[j]['style'].display = 'none';
            else rows[i].children[j]['style'].display = 'block';
          }
        };
      });
    } else if (key === 'right'){
      ['topRight', 'right', 'botRight'].forEach(section => {
        const rows = document.querySelector('.pattern-display-' + section).children;
        for (let i = 0; i < rows.length; i++) {
          for (let j = 0; j < rows[i].children.length; j++) {
            if (j >= (rows[i].children.length - this.borders.right)) rows[i].children[j]['style'].display = 'none';
            else rows[i].children[j]['style'].display = 'block';
          }
        };
      });
    } else if(key === 'insideStart' || key === 'insideEnd'){
      this.adjustStylesCellDisplay();
    }
    
    // delete this.corners.topLeft;
    // this.corners.topLeft =this.originalCorners.topLeft.slice(this.borders.top).map(row => row.slice(this.borders.left));
    // delete this.corners.top;
    // this.corners.top = this.originalCorners.top.slice(this.borders.top);

    // this.corners.topRight =this.originalCorners.topRight.slice(this.borders.top).map(row => row.slice(0, row.length - this.borders.right));
    // this.corners.left =this.originalCorners.left.map(row => row.slice(this.borders.left));
    // this.corners.right =this.originalCorners.right.map(row => row.slice(0, row.length - this.borders.right));
    // this.corners.botLeft =this.originalCorners.botLeft.slice(0,this.originalCorners.botLeft.length-this.borders.bottom).map(row => row.slice(this.borders.left));
    // this.corners.bot = this.originalCorners.bot.slice(0,this.originalCorners.bot.length-this.borders.bottom);
    // this.corners.botRight =this.originalCorners.botRight.slice(0,this.originalCorners.botRight.length-this.borders.bottom).map(row => row.slice(0, row.length - this.borders.right));
    // console.log(this.corners)
  }

  private adjustStylesCellDisplay(){
    const rows = document.querySelector('.cellDisplay').children;
      for (let i = 0; i < rows.length; i++) {
        if (this.borders.insideStart && i < this.borders.insideStart) rows[i]['style'].display = 'none';
        else if(this.borders.insideEnd && i >= (rows.length - this.borders.insideEnd)) rows[i]['style'].display = 'none';
        else rows[i]['style'].display = 'flex';
        for (let j = 0; j < rows[i].children.length; j++) {
          if (this.borders.insideStart && j < this.borders.insideStart) rows[i].children[j]['style'].display = 'none';
          else if(this.borders.insideEnd && j >= (rows[i].children.length - this.borders.insideEnd))  rows[i].children[j]['style'].display = 'none';
          else rows[i].children[j]['style'].display = 'block';
        }
      };
  }
  private getSection(startX: number, endX: number, startY: number, endY: number): Color[][] {
    const section: Color[][] = [];
    for (let y = Math.round(startY); y < endY; y++) {
      const row: Color[] = [];
      for (let x = Math.round(startX); x < endX; x++) {
        row.push(this.getPixel(x, y));
      }
      section.push(row)
    }
    return section;
  }

  public confirmBorder(){
      
    if(this.currentStep !== FillSteps.GetBorderOffsets) return;
    this.currentStep = FillSteps.GetInsideOffset;
    this.img.width = this.img.width-this.borders.left-this.borders.right;
    this.img.height = this.img.height-this.borders.top-this.borders.bottom;
    this.factorY = this.img.height / this.height;
    this.factorX =  this.img.width / this.width;
    this._imageData = this.context.getImageData(this.borders.left, this.borders.top, this.img.width,this.img.height).data;

    this.displayRandomCell();
  }

  public confirmInsideOffset(){
  
    // this.img.height = imgHeight;
    // this.img.width = imgWidth;
    //console.log('hi', JSON.parse(JSON.stringify(this.colors.slice(0,  Math.round(this.factorY)).map(row => row.slice(0, Math.round(this.factorX))))))
  
    if(this.currentStep !== FillSteps.GetInsideOffset) return;
    this.currentStep = FillSteps.Loading;

  
  
      this.display = [];
  
      for(let i = 0; i < this.height;i++){
        const row: Color[] = [];
        for(let j = 0; j < this.width;j++){
          row.push(this.getCellAverageColor(j,i));
        }
       // console.log('row:', i, 'Done')
        this.display.push(row);
      }
      //console.log(this.display)
      this.uniqueColors = Utils.loadUniqueColors(this.display);

  
      //console.log('auto')
  
  this.autoCombine();
  this.currentStep = FillSteps.CombiningColors;
  
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
     // this.tempForDisplay(Math.floor(Math.random()*this.Width),Math.floor(Math.random()*this.Height))
  }

  private autoCombine(){
    const checked: string[] = [];
    let colorToCheck = this.similarColorsExist();

    while(colorToCheck){
      console.log(colorToCheck)
      checked.push(colorToCheck.str)
      const toCombine = this.getSimilar(colorToCheck);
      this.combineColors(toCombine);
      colorToCheck = this.similarColorsExist();
    }
  }

  private similarColorsExist(out = false): Color | undefined{
    for(let i = 0; i< this.uniqueColors.length; i++){
      for(let j = i+1; j< this.uniqueColors.length; j++){
        if(out) console.log(Utils.getColorSimilarity(this.uniqueColors[i], this.uniqueColors[j]) )
        if(Utils.getColorSimilarity(this.uniqueColors[i], this.uniqueColors[j]) < this.SIMILARITY_QUOTIENT) 
          return this.uniqueColors[i];
      }
    }
    return undefined;
  }

  // private similarColorsExist(exclude: string[], out = false): Color | undefined{
  //   for(let i = 0; i< this.uniqueColors.length; i++){
  //     for(let j = i+1; j< this.uniqueColors.length; j++){
  //       if(out) console.log(Utils.getColorSimilarity(this.uniqueColors[i], this.uniqueColors[j]) )
  //       if(!exclude.includes(this.uniqueColors[i].str) && !exclude.includes(this.uniqueColors[j].str) 
  //         && Utils.getColorSimilarity(this.uniqueColors[i], this.uniqueColors[j]) < this.SIMILARITY_QUOTIENT) 
  //         return this.uniqueColors[i];
  //     }
  //   }
  //   return undefined;
  // }

  private getSimilar(c: Color): Color[]{
    const similar: Color[] = [];
    for(let i = 0; i< this.uniqueColors.length; i++){
      const similarity = Utils.getColorSimilarity(this.uniqueColors[i], c);
        if(similarity<this.SIMILARITY_QUOTIENT){
          similar.push(this.uniqueColors[i])
      }
    }
    return similar;
  }

  public combineCurrent(){
    const colorsToCombine = this.uniqueColors.filter(c => c.highlighted);
    this.combineColors(colorsToCombine);
  }

  public combineColors(colorsToCombine: Color[]){
    const colorsToCombineStr = colorsToCombine.map(c => c.str);
    //console.log(colorsToCombineStr)
    const avg = Utils.getAverageColorAsArr(colorsToCombine);
    this.display = this.display.map(row => row.map(cell => {
      if(colorsToCombineStr.includes(cell.str)) {
        return Utils.getColorFromRGB(avg)
      } else return cell;
    }));
    this.uniqueColors = Utils.loadUniqueColors(this.display);
    //return Utils.getColorFromRGB(avg);
    //console.log(this.uniqueColors.filter(c => c.highlighted))
  }

  private getPixel(x: number, y: number): Color {

    return Utils.getPixelColor(this.imageData, this.img.width, x, y);
  }

  //private calcAverages(){
  // //const borders = {top: 2, left: 1, right: 2,bottom:0, inside: 2};
  // this.img.width = this.img.width-this.borders.left-this.borders.right;
  // this.img.height = this.img.height-this.borders.top-this.borders.bottom;
  // this.factorY = this.img.height / this.Height;
  // this.factorX =  this.img.width / this.Width;
  // this.imageData = this.context.getImageData(this.borders.left, this.borders.top, this.img.width,this.img.height).data;

  // // this.img.height = imgHeight;
  // // this.img.width = imgWidth;
  // //console.log('hi', JSON.parse(JSON.stringify(this.colors.slice(0,  Math.round(this.factorY)).map(row => row.slice(0, Math.round(this.factorX))))))

  //   this.colors = [];

  //   for(let i = 0; i < this.Height;i++){
  //     const row: Color[] = [];
  //     for(let j = 0; j < this.Width;j++){
  //       row.push(this.getCellAverageColor(j,i));
  //     }
  //     console.log('row:', i, 'Done')
  //     this.colors.push(row);
  //   }
  //   console.log(this.colors)
  //  // this.preformKmeansAnalysis()

  //  // TODO use for IDentifying borders
  // //   const tempColors = [];
  // //  for (let i = (this.factorY*0)+this.borders.insideStart; i < (this.factorY*(1+1))-this.borders.insideEnd; i++) {
  // //   const row: Color[] = [];
  // //   for (let j = (this.factorX*49)+this.borders.insideStart; j < (this.factorX*(50+1))-this.borders.insideEnd; j++) {
  // //  // for (let y = 0; y < this.factorY*(1); y++) {
  // //   //for (let y = Math.round(this.img.height-(this.factorY*3)); y < this.img.height; y++) {

  // //     //const tempRow: Color[] = [];
  // //     //for (let x = Math.round(this.img.width-(this.factorX*3)); x < this.img.width; x++) {
  // //     //for (let x = 0; x < this.factorX*1; x++) {

  // //      // console.log(x,y)
  // //       const c = this.getPixelColor(j,i);
  // //       row.push(c);
  // //     }
  // //     tempColors.push(row)
  // //   }
  // //   this.colors = tempColors;
  // //   console.log(tempColors)
  //  // this.tempForDisplay(Math.floor(Math.random()*this.Width),Math.floor(Math.random()*this.Height))

  // }

  private getCellAverageColor(x:number,y: number): Color{
    const tempColors: Color[] = [];
    for (let i = (this.factorY*y)+this.borders.insideStart; i < (this.factorY*(y+1))-this.borders.insideEnd; i++) {
      for (let j = (this.factorX*x)+this.borders.insideStart; j < (this.factorX*(x+1))-this.borders.insideEnd; j++) {
        tempColors.push(this.getPixel(Math.round(j),Math.round(i)));
      }
    }
    //console.log(tempColors)
    return Utils.getAverageColor(tempColors);

  }

  public displayRandomCell(){
    if(this.currentStep !== FillSteps.GetInsideOffset) return;
    const x = Math.floor(Math.random()*this.width);
    const y = Math.floor(Math.random()*this.height);
    const tempColors: Color[][] = [];
    for (let i = (this.factorY*y)+this.borders.insideStart; i < (this.factorY*(y+1))-this.borders.insideEnd; i++) {
      const tempRow: Color[] = [];
      for (let j = (this.factorX*x)+this.borders.insideStart; j < (this.factorX*(x+1))-this.borders.insideEnd; j++) {
          const c = this.getPixel(Math.round(j),Math.round(i));
          tempRow.push(c);
        }
        tempColors.push(tempRow)
      }
      console.log(tempColors)
      this.display = tempColors;
      setTimeout(() => this.adjustStylesCellDisplay(),200);
  }


 createFile(){
  this.downloadableFile = this.fileService.createJSONFile('patternOutput.json', this.display);
 }
}
