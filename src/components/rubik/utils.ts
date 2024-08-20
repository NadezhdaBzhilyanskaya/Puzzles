import { EventEmitter } from "events";

export const CUBE_SIZE = 300;
export const WAIT_LENGTH = 150;
export const ROTATION_LENGTH_MS = 300;
let DIMENSIONS = 3;
let FACE_SIZE = 100;
let SKIP_VISUAL = false;

export enum FaceType { Front, Back, Left, Right, Top, Bottom }
export enum Color { Red = "red", Blue = 'blue', Green = "green", Yellow = "yellow", Purple = "purple", Cyan = "cyan" }

export const ColorToFace = {
  [FaceType.Front]: Color.Red,
  [FaceType.Back]: Color.Blue,
  [FaceType.Left]: Color.Green,
  [FaceType.Right]: Color.Yellow,
  [FaceType.Top]: Color.Purple,
  [FaceType.Bottom]: Color.Cyan
};

export const ROTATION = [
  [FaceType.Top, FaceType.Front, FaceType.Bottom, FaceType.Back].reverse(),
  [FaceType.Left, FaceType.Back, FaceType.Right, FaceType.Front].reverse(),
  [FaceType.Left, FaceType.Bottom, FaceType.Right, FaceType.Top].reverse(),
];


export function getRandomNumber(min: number, max?: number): number {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  const range = Math.max(1, max - min);
  return min + Math.floor(Math.random() * range);
}

export function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export class Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;

  constructor(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  deepCopy(): Quaternion {
    return new Quaternion(this.x, this.y, this.z, this.w);
  }

  multiply(other: Quaternion): Quaternion {
    const p = this;
    const q = other;

    const x = p.w * q.x + p.x * q.w + p.y * q.z - p.z * q.y;
    const y = p.w * q.y + p.y * q.w + p.z * q.x - p.x * q.z;
    const z = p.w * q.z + p.z * q.w + p.x * q.y - p.y * q.x;
    const w = p.w * q.w - p.x * q.x - p.y * q.y - p.z * q.z;

    return new Quaternion(x, y, z, w);
  }

  normalize(): Quaternion {
    const norm = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    return new Quaternion(this.x / norm, this.y / norm, this.z / norm, this.w / norm);
  }

  conjugate(): Quaternion {
    return new Quaternion(-this.x, -this.y, -this.z, this.w);
  }

  toString(): string {
    return [this.x, this.y, this.z, this.w].join(", ");
  }


  toAxis(): number[] {
    return [this.x, this.y, this.z];
  }

  toAngle(): number {
    const RAD2DEG = 180 / Math.PI;
    return RAD2DEG * 2 * Math.acos(this.w);
  }

  toRotation(): string {
    const axis = this.toAxis();
    const angle = this.toAngle();
    return "rotate3d(" + axis[0].toFixed(10) + "," + axis[1].toFixed(10) + "," + axis[2].toFixed(10) + "," + angle.toFixed(10) + "deg)";
  }

  toRotations(): string {
    const RAD2DEG = 180 / Math.PI;

    let x = RAD2DEG * Math.atan2(2 * (this.w * this.x + this.y * this.z), 1 - 2 * (this.x * this.x + this.y * this.y));
    let y = RAD2DEG * Math.asin(2 * (this.w * this.y - this.x * this.z));
    let z = RAD2DEG * Math.atan2(2 * (this.w * this.z + this.x * this.y), 1 - 2 * (this.y * this.y + this.z * this.z));

    if (x < 0) { x += 360; }
    if (y < 0) { y += 360; }
    if (z < 0) { z += 360; }

    return "rotateX(" + x.toFixed(10) + "deg) rotateY(" + y.toFixed(10) + "deg) rotate(" + z.toFixed(10) + "deg)";
  }

}


export function fromRotation(axis, angle): Quaternion {
  const DEG2RAD = Math.PI / 180;
  const a = angle * DEG2RAD;

  const sin = Math.sin(a / 2);
  const cos = Math.cos(a / 2);

  return new Quaternion(
    axis[0] * sin, axis[1] * sin, axis[2] * sin,
    cos
  );
}



export class Face {
  //public cube: Cube;
  public type: FaceType;
  public color: Color;
  private style: { [key: string]: any; };

  constructor(type: FaceType) {
    this.type = type;
    this.style = {
      width: FACE_SIZE + "px",
      height: FACE_SIZE + "px",
    }
    // this._color = null;
    // this._node = OZ.DOM.elm("div", {
    //   className: "face face" + type,
    //   width: FACE_SIZE + "px",
    //   height: FACE_SIZE + "px",
    //   position: "absolute",
    //   left: "0px",
    //   top: "0px",
    // });
    this.style["box-sizing"] = "border-box";
    //	this.style = { "backface-visibility", "hidden");

    switch (type) {
      case FaceType.Left:
        this.style["transform-origin"] = "100% 50%";
        this.style["transform"] = "translate3d(-" + FACE_SIZE + "px, 0px, 0px) rotateY(-90deg)";
        break;
      case FaceType.Right:
        this.style["transform-origin"] = "0% 50%";
        this.style["transform"] = "translate3d(" + FACE_SIZE + "px, 0px, 0px) rotateY(90deg)";
        break;
      case FaceType.Top:
        this.style["transform-origin"] = "50% 100%";
        this.style["transform"] = "translate3d(0px, -" + FACE_SIZE + "px, 0px) rotateX(90deg)";
        break;
      case FaceType.Bottom:
        this.style["transform-origin"] = "50% 0%";
        this.style["transform"] = "translate3d(0px, " + FACE_SIZE + "px, 0px) rotateX(-90deg)";
        break;
      case FaceType.Front:
        break;
      case FaceType.Back:
        this.style["transform"] = "translate3d(0px, 0px, -" + FACE_SIZE + "px) rotateY(180deg)";
        break;
    }
  }

  public deepCopy(): Face {
    const copy = new Face(this.type);
    console.log(copy)
    copy.style = JSON.parse(JSON.stringify(this.style));
    copy.color = this.color;
    return copy;
  }

  public setColor(color: Color) {
    this.color = color;
    this.style['backgroundColor'] = color;
  };
  public getColor(): Color {
    return this.color;
  };

  public getStyles(): { [key: string]: any } {
    return this.style;
  }
}

export class Cube {
  public faces: { [face: number]: Face };
  private tmpFaces: { [face: number]: Color };
  private position: number[];
  private style: { [key: string]: any; };
  private rotation?: string;

  //
  constructor(position: number[]) {
    this.position = position;
    this.faces = {};
    this.style = {
      width: FACE_SIZE + "px",
      height: FACE_SIZE + "px",
    }
    this.update();
  }

  public deepCopy(): Cube {
    const copy = new Cube(this.position);
    for (let k in this.faces) {
      copy.faces[k] = this.faces[k].deepCopy();
    }
    copy.style = JSON.parse(JSON.stringify(this.style));
    copy.rotation = this.rotation;
    return copy;
  }

  public getPosition(): number[] {
    return this.position;
  }

  public getFaces(): { [face: number]: Face } {
    return this.faces;
  }

  public getFacesArr(): Face[] {
    return Object.values(this.faces);
  }

  public setFace(faceType: FaceType, color: Color) {
    const face = new Face(faceType);
    face.setColor(color);
    this.faces[faceType] = face;
    //this.color = color;
    //this.faceType = face;
    // if (!(type in this._faces)) {
    //   var face = new Face(this, type);
    //   this._node.appendChild(face.getNode());
    //   this._faces[type] = face;
    // }
    // this._faces[type].setColor(color);
  }

  public update() {
    var transform = "";
    transform +=
      "translate3d(" +
      -FACE_SIZE / 2 +
      "px, " +
      -FACE_SIZE / 2 +
      "px, " +
      -FACE_SIZE / 2 +
      "px) ";
    if (this.rotation) {
      transform += this.rotation + " ";
    }

    var half = Math.floor(DIMENSIONS / 2) - (DIMENSIONS % 2 === 0 ? 1 / 2 : 0);
    var x = this.position[0];
    var y = this.position[1];
    var z = -this.position[2];
    x -= half;
    y -= half;
    z += half + 1 / 2;
    transform +=
      "translate3d(" +
      x * FACE_SIZE +
      "px, " +
      y * FACE_SIZE +
      "px, " +
      z * FACE_SIZE +
      "px)";

    if (!SKIP_VISUAL) {
      const val = this.rotation ? "transform " + ROTATION_LENGTH_MS + "ms" : "";
      this.style["transition"] = val;
    }
    this.style["transform"] = transform;
  };

  public getStyles(): { [key: string]: any } {
    return this.style;;
  }

  setRotation(rotation: string) {
    this.rotation = rotation;
    this.update();
  };

  prepareColorChange(sourceCube: Cube, rotation: number[]) {
    this.tmpFaces = {};
    let sourceFaces = sourceCube.getFaces();
    for (let p in sourceFaces) {
      let sourceType = parseInt(p);
      let targetType = this.rotateType(sourceType, rotation);
      this.tmpFaces[targetType] = sourceFaces[sourceType].getColor();
    }
  };

  commitColorChange() {
    for (let k in this.style) {
      if (!['width', 'height'].includes(k)) delete this.style[k]
    }

    this.faces = {};
    for (var p in this.tmpFaces) {
      var type = parseInt(p);
      this.setFace(type, this.tmpFaces[p]);
    }
    this.tmpFaces = {};

    this.rotation = null;
    this.update();
  }

  rotateType(type: number, rotation: number[]) {
    for (var i = 0; i < 3; i++) {
      if (!rotation[i]) {
        continue;
      }
      var faces = ROTATION[i];
      var index = faces.indexOf(type);
      if (index == -1) {
        continue;
      } /* no rotation available */
      index = (index + rotation[i] + faces.length) % faces.length;
      return faces[index];
    }

    return type;
  }

  public correctPlacement(): boolean {
    const [x, y, z] = this.position;
    return !((z == 0 && this.faces[FaceType.Front].color !== ColorToFace[FaceType.Front])
      || (z == DIMENSIONS - 1 && this.faces[FaceType.Back].color !== ColorToFace[FaceType.Back])
      || (x == 0 && this.faces[FaceType.Left].color !== ColorToFace[FaceType.Left])
      || (x == DIMENSIONS - 1 && this.faces[FaceType.Right].color !== ColorToFace[FaceType.Right])
      || (y == 0 && this.faces[FaceType.Top].color !== ColorToFace[FaceType.Top])
      || (y == DIMENSIONS - 1 && this.faces[FaceType.Bottom].color !== ColorToFace[FaceType.Bottom]));
  }
}


export interface FaceMatrix {
  [face: number]: string[][];
}

class Move {
  method: 'X' | 'Y' | 'Z';
  dir: number;
  layer: number;

  constructor(method: 'X' | 'Y' | 'Z', dir: number, layer: number) {
    this.method = method;
    this.dir = dir;
    this.layer = layer;
  }

  deepCopy(): Move {
    return new Move(this.method, this.dir, this.layer);
  }

  isInverse(other: Move): boolean {
    return Boolean(this.method === other.method && this.layer === other.layer && (-1 * this.dir) === other.dir)
  }
}

interface CubeFacePair {
  cube: Cube;
  face: Face;
}

interface Drag {
  mouse: number[],
  faceCubePair?: CubeFacePair;
}

interface SolveOpts {
  start: Rubik;
  backUp: Rubik;
  skipVisual: boolean;
  rounds: number;
}

class StepControl {
  // functions as a stack with latest moves at the end/top
  private moveHistory: Move[];
  // functions as a stack with move next at end/top
  private upcomingMoves: Move[];
  private currentMove?: Move;

  constructor(moveHistory: Move[] = [], upcomingMoves: Move[] = []) {
    this.moveHistory = moveHistory.map(m => m.deepCopy());
    this.upcomingMoves = upcomingMoves.map(m => m.deepCopy());
  }

  deepCopy(): StepControl {
    return new StepControl(this.moveHistory, this.upcomingMoves);
  }

  currentlyMoving(): boolean {
    return !!this.currentMove;
  }

  getCurrent(): Move | undefined {
    return this.currentMove ? this.currentMove.deepCopy() : undefined;
  }

  add(m: Move) { this.upcomingMoves.push(m) };

  addRandom(noUndoConsecutiveMoves: boolean) {
    const newMove = new Move(getRandom(["X", "Y", "Z"]), getRandom([-1, 1]), Math.floor(Math.random() * DIMENSIONS))

    //dont undo last/prev move
    if (noUndoConsecutiveMoves && this.upcomingMoves.length) {
      const prev = this.peakNext();
      if (!prev || prev.isInverse(newMove)) {
        this.addRandom(noUndoConsecutiveMoves);
        return;
      }
    }
    this.upcomingMoves.push(newMove);
  };

  clearAll() { this.upcomingMoves = []; }
  next() {
    if (this.currentMove) return;
    this.currentMove = this.upcomingMoves.pop();
  }

  done() {
    if (!this.currentMove) return;
    this.moveHistory.push(this.currentMove);
    delete this.currentMove;
  }

  hasUpcoming(): boolean {
    return !!this.upcomingMoves.length;
  }

  peakNext(): Move | undefined {
    return this.upcomingMoves.length ? this.upcomingMoves[this.upcomingMoves.length - 1] : undefined;
  }
}

export class Rubik {
  public readonly RANDOMIZE_COMPLETE = 'randomize_done';
  public readonly ROTATION_COMPLETE = 'rotation_done';
  private rotation: Quaternion;
  public cubes: Cube[];
  private style: { [key: string]: any; };
  public faceMatrix: FaceMatrix;
  public events: EventEmitter = new EventEmitter();
  private drag: Drag;
  private stepControl: StepControl;
  private tryingToSolve?: SolveOpts;


  //
  constructor(dim: number = 3) {
    DIMENSIONS = dim;
    FACE_SIZE = CUBE_SIZE / DIMENSIONS
    this.cubes = [];
    this.style = {};
    this.stepControl = new StepControl();
    this.drag = {
      mouse: [],
    };
    this.buildCubes();
    this.reorient();
    this.faceMatrix = this.getFaceMatrices();
  }

  public get moving(): boolean {
    return !!this.stepControl.hasUpcoming();
  }

  public get solving(): boolean {
    return !!this.tryingToSolve;
  }
  public get solved(): boolean {
    return this.degreeMismatched() === 0;
  }

  public deepCopy(): Rubik {
    const copy = new Rubik(DIMENSIONS);
    copy.cubes = this.cubes.map(c => c.deepCopy());
    copy.style = JSON.parse(JSON.stringify(this.style));
    copy.rotation = this.rotation.deepCopy();
    copy.stepControl = this.stepControl.deepCopy();
    return copy;
  }



  public getStyles(): { [key: string]: any } {
    return this.style;
  }


  public reorient() {
    this.rotation = fromRotation([1, 0, 0], -35).multiply(fromRotation([0, 1, 0], 45));
    this.update();
  }

  update() {
    this.style["transform"] =
      "translateZ(" +
      (-FACE_SIZE / 2 - FACE_SIZE) +
      "px) " +
      this.rotation.toRotation() +
      " translateZ(" +
      FACE_SIZE / 2 +
      "px)";
  };

  public getFaceMatrices(): FaceMatrix {
    const faceMatrix: FaceMatrix = {};
    const faceTypes: FaceType[] = Object.keys(FaceType).filter(t => isNaN(Number(t))).map(t => FaceType[t]);
    faceTypes.forEach(t => {
      const full = this.cubes.map(c => c.faces[t]?.color).filter(color => color);
      faceMatrix[t] = [];
      while (full.length) faceMatrix[t].push(full.splice(0, DIMENSIONS));
    });
    faceMatrix[FaceType.Top].reverse();
    faceMatrix[FaceType.Back].reverse();
    faceMatrix[FaceType.Right].forEach(r => r.reverse());
    return faceMatrix;
  }



  public degreeMismatched(): number {
    return this.cubes.filter(c => !c.correctPlacement()).length;
  }

  public degreeMismatchedColor(): number {
    console.log(this.faceMatrix[FaceType.Bottom])
    return 0;
  }

  public stop() {
    delete this.tryingToSolve;
    this.stepControl.clearAll();
    SKIP_VISUAL = false;
    this.update()

  }

  //temp functions
  private findCubeFacePair(type: 'edge' | 'corner' | 'center', face: FaceType): CubeFacePair {
    const correctType = this.cubes.filter(c => c.getFacesArr().length === 1);
    const c = correctType.filter(c => c.getFacesArr()[0].color === ColorToFace[face])[0];
    return { cube: c, face: c.getFacesArr()[0] }
  }

  public attemptToSolveStart() {
    //if (this.solved) return;
    //if (this.stepControl.currentlyMoving() || this.stepControl.hasUpcoming()) return;
    // new attampe
    console.log(this.degreeMismatched(), this.degreeMismatchedColor())
    const pair = this.findCubeFacePair('center', FaceType.Top);
    console.log(pair, pair.cube.getPosition())
    for (let x = 0; x < pair.cube.getPosition()[1]; x++) this.stepControl.add(new Move('X', 1, 1))
    this.makeMove()
    // old attampe
    // this.tryingToSolve = {
    //   start: this.deepCopy(),
    //   backUp: this.deepCopy(),
    //   rounds: 0,
    //   skipVisual: false
    // };
    // //SKIP_VISUAL = true;
    // //get random number of moves
    // this.randomize(getRandomNumber(1, 10));
  }

  private afterRotation() {
    console.log('Mismatch middle', this.degreeMismatched());
    this.faceMatrix = this.getFaceMatrices();
    this.stepControl.done();
    // console.log('after', this.stepControl)
    if (this.tryingToSolve && this.solved) this.afterSolutionFound();
    else if (this.stepControl.hasUpcoming()) {
      if (SKIP_VISUAL) this.makeMove();
      else setTimeout(() => this.makeMove(), WAIT_LENGTH);
    }
    else if (this.tryingToSolve) this.afterAttemptToSolve()
  };

  private afterAttemptToSolve() {
    const mismatch = this.degreeMismatched();
    console.log('Mismatch END', mismatch);
    console.log('current', this.deepCopy(), this.tryingToSolve.backUp.deepCopy())
    if (mismatch == 0) {
      console.log(1)
      this.afterSolutionFound();
      return;
    }
    else if (mismatch < this.tryingToSolve.backUp.degreeMismatched()) {
      console.log(2)
      this.tryingToSolve.rounds++;
      this.tryingToSolve.backUp = this.deepCopy();
    } else {
      console.log(3)
      const copyBackup = this.tryingToSolve.backUp.deepCopy();
      this.cubes = copyBackup.cubes;
      this.style = copyBackup.style;
      this.stepControl = copyBackup.stepControl;//.deepCopy();
      this.update();
    }
    const r = getRandomNumber(1, 10)
    console.log(4, r)
    if (SKIP_VISUAL) this.randomize(r)
    else setTimeout(() => this.randomize(r), WAIT_LENGTH);

    // console.log('hi')
    // this.tryingToSolve = {
    //   backUp: this.deepCopy(),
    // };
    // this.randomize();
  }

  private afterSolutionFound() {
    console.log('Solution Found')
  }


  public randomize(times: number = 10) {
    console.log('Mismatch Start', this.degreeMismatched());
    for (let x = 0; x < times; x++) this.stepControl.addRandom(!!this.tryingToSolve);
    console.log('Mismatch Start', 'hello', this.tryingToSolve);
    this.makeMove();
  }


  public dragStart(e: MouseEvent) {
    this.drag.faceCubePair = this.eventToFace(e);
    this.drag.mouse = [e.clientX, e.clientY];
  }

  public dragMove(e: MouseEvent): boolean {
    if (this.drag.faceCubePair) {
      /* check second face for rotation */
      var thisFace = this.eventToFace(e);
      if (!thisFace || thisFace.face == this.drag.faceCubePair.face) {
        return false;
      }

      /// get move
      const move = this.getMoveFromFaces(this.drag.faceCubePair, thisFace);
      if (!move) return false;
      else {
        this.stepControl.add(move);
        console.log('added drag move', move.deepCopy(), this.stepControl.deepCopy())
        this.makeMove();
        return true;
      }
    } else {
      /* rotate cube */
      // ..e = e.touches ? e.touches[0] : e;
      var mouse = [e.clientX, e.clientY];
      var dx = mouse[0] - this.drag.mouse[0];
      var dy = mouse[1] - this.drag.mouse[1];
      var norm = Math.sqrt(dx * dx + dy * dy);
      if (!norm) {
        return false;
      }
      var N = [-dy / norm, dx / norm];

      this.drag.mouse = mouse;
      this.rotation = fromRotation(
        [N[0], N[1], 0],
        norm / 2
      ).multiply(this.rotation);
      this.update();
      return false;
    }
  }

  private makeMove() {
    console.log('move', this.stepControl.currentlyMoving())
    // cannot start 2 moves simultaneously
    if (this.stepControl.currentlyMoving()) return;
    // start next move
    console.log('next', this.stepControl.hasUpcoming())
    this.stepControl.next();
    console.log('pre trigger')
    this.triggerRotate();
  }

  private eventToFace(e: MouseEvent): CubeFacePair | undefined {
    if (e.target['className'] !== 'main' && e.target['className'].startsWith('face')) {
      const c = this.cubes[Number(e.target['parentElement']['className'].replace('cube', ''))];

      return { cube: c, face: c.faces[Number(e.target['className'].replace('face face', ''))] };
    }
    return undefined;
  }


  private getMoveFromFaces(pair1: CubeFacePair, pair2: CubeFacePair): Move | void {
    const face1 = pair1.face;
    const face2 = pair2.face;
    var t1 = face1.type;
    var t2 = face2.type;
    var pos1 = pair1.cube.getPosition();
    var pos2 = pair2.cube.getPosition();

    /* find difference between cubes */
    var diff = 0;
    var diffIndex = -1;
    for (var i = 0; i < 3; i++) {
      var d = pos1[i] - pos2[i];
      if (d) {
        if (diffIndex != -1) {
          return;
        } /* different in >1 dimensions */
        diff = d > 0 ? 1 : -1;
        diffIndex = i;
      }
    }

    if (t1 == t2) {
      /* same face => diffIndex != -1 */
      switch (t1) {
        case FaceType.Front:
        case FaceType.Back:
          var coef = t1 == FaceType.Front ? 1 : -1;
          if (diffIndex == 0) {
            return new Move('Y', coef * diff, pos1[1]);
          } else {
            return new Move('X', coef * diff, pos1[0]);
          }

        case FaceType.Left:
        case FaceType.Right:
          var coef = t1 == FaceType.Left ? 1 : -1;
          if (diffIndex == 2) {
            return new Move('Y', -coef * diff, pos1[1]);
          } else {
            return new Move('Z', coef * diff, pos1[2]);
          }

        case FaceType.Top:
        case FaceType.Bottom:
          var coef = t1 == FaceType.Top ? 1 : -1;
          if (diffIndex == 0) {
            return new Move('Z', -coef * diff, pos1[2]);
          } else {
            return new Move('X', -coef * diff, pos1[0]);
          }
      }
    }

    switch (t1 /* different face => same cube, diffIndex == 1 */) {
      case FaceType.Front:
      case FaceType.Back:
        var coef = t1 == FaceType.Front ? 1 : -1;
        if (t2 == FaceType.Left) {
          return new Move('Y', 1 * coef, pos1[1]);
        }
        if (t2 == FaceType.Right) {
          return new Move('Y', -1 * coef, pos1[1]);
        }
        if (t2 == FaceType.Top) {
          return new Move('X', 1 * coef, pos1[0]);
        }
        if (t2 == FaceType.Bottom) {
          return new Move('X', -1 * coef, pos1[0]);
        }
        break;

      case FaceType.Left:
      case FaceType.Right:
        var coef = t1 == FaceType.Left ? 1 : -1;
        if (t2 == FaceType.Front) {
          return new Move('Y', -1 * coef, pos1[1]);
        }
        if (t2 == FaceType.Back) {
          return new Move('Y', 1 * coef, pos1[1]);
        }
        if (t2 == FaceType.Top) {
          return new Move('Z', 1 * coef, pos1[2]);
        }
        if (t2 == FaceType.Bottom) {
          return new Move('Z', -1 * coef, pos1[2]);
        }
        break;

      case FaceType.Top:
      case FaceType.Bottom:
        var coef = t1 == FaceType.Top ? 1 : -1;
        if (t2 == FaceType.Front) {
          return new Move('X', -1 * coef, pos1[0]);
        }
        if (t2 == FaceType.Back) {
          return new Move('X', 1 * coef, pos1[0]);
        }
        if (t2 == FaceType.Left) {
          return new Move('Z', -1 * coef, pos1[2]);
        }
        if (t2 == FaceType.Right) {
          return new Move('Z', 1 * coef, pos1[2]);
        }
        break;
    }
  };

  private triggerRotate() {
    const m: Move = this.stepControl.getCurrent();
    if (!m) return;
    let cubes: Cube[] = [];

    switch (m.method) {
      case 'X':
        for (let i = 0; i < DIMENSIONS * DIMENSIONS; i++) {
          cubes.push(this.cubes[m.layer + i * DIMENSIONS]);
        }
        this.rotateCubes(cubes, [m.dir, 0, 0]);
        break;
      case 'Y':
        for (let i = 0; i < DIMENSIONS; i++) {
          for (let j = 0; j < DIMENSIONS; j++) {
            cubes.push(
              this.cubes[j + m.layer * DIMENSIONS + i * DIMENSIONS * DIMENSIONS]
            );
          }
        }
        this.rotateCubes(cubes, [0, -m.dir, 0]);
        break;
      case 'Z':
        let offset = m.layer * DIMENSIONS * DIMENSIONS;
        for (var i = 0; i < DIMENSIONS * DIMENSIONS; i++) {
          cubes.push(this.cubes[offset + i]);
        }
        this.rotateCubes(cubes, [0, 0, m.dir]);
    }
  };


  rotateCubes(cubes: Cube[], rotation: number[]) {
    const suffixes = ["X", "Y", ""];

    var str = "";
    for (var i = 0; i < 3; i++) {
      if (!rotation[i]) {
        continue;
      }
      str = "rotate" + suffixes[i] + "(" + 90 * rotation[i] + "deg)";
    }
    for (var i = 0; i < cubes.length; i++) {
      cubes[i].setRotation(str);
    }

    if (SKIP_VISUAL) this.finalizeRotation(cubes, rotation);
    else {
      // complete rotation of all cubes
      let count = DIMENSIONS ** 2;
      // wait till transition
      document.addEventListener('transitionend', (e) => {
        count--;
        if (!count) this.finalizeRotation(cubes, rotation);
      });
    }
  };

  private finalizeRotation(cubes: Cube[], rotation: number[]) {
    var direction = 0;
    for (var i = 0; i < 3; i++) {
      if (rotation[i]) {
        direction = rotation[i];
      }
    }

    if (rotation[0]) {
      direction *= -1;
    } /* FIXME wtf */

    var half = Math.floor(DIMENSIONS / 2) - (DIMENSIONS % 2 === 0 ? 1 / 2 : 0);

    for (var i = 0; i < cubes.length; i++) {
      var x = (i % DIMENSIONS) - half;
      var y = Math.floor(i / DIMENSIONS) - half;

      var source = [y * direction + half, -x * direction + half];
      var sourceIndex = source[0] + DIMENSIONS * source[1];

      cubes[i].prepareColorChange(cubes[sourceIndex], rotation);
    }

    for (var i = 0; i < cubes.length; i++) {
      cubes[i].commitColorChange();
    }

    this.afterRotation()
  };


  private buildCubes() {
    for (var z = 0; z < DIMENSIONS; z++) {
      for (var y = 0; y < DIMENSIONS; y++) {
        for (var x = 0; x < DIMENSIONS; x++) {
          const cube = new Cube([x, y, z]);

          if (z == 0) {
            cube.setFace(FaceType.Front, ColorToFace[FaceType.Front]);
          }
          if (z == DIMENSIONS - 1) {
            cube.setFace(FaceType.Back, ColorToFace[FaceType.Back]);
          }

          if (x == 0) {
            cube.setFace(FaceType.Left, ColorToFace[FaceType.Left]);
          }
          if (x == DIMENSIONS - 1) {
            cube.setFace(FaceType.Right, ColorToFace[FaceType.Right]);
          }

          if (y == 0) {
            cube.setFace(FaceType.Top, ColorToFace[FaceType.Top]);
          }
          if (y == DIMENSIONS - 1) {
            cube.setFace(FaceType.Bottom, ColorToFace[FaceType.Bottom]);
          }

          this.cubes.push(cube);
        }
      }
    }
  }
}
