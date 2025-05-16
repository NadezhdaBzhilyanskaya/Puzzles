export interface CellLocation {i:number; j: number;}
export interface ColorGuide {
    colorSample: CellLocation[];
    count: number;
    floss: number | string;
}

export const GUIDE: ColorGuide[] = [{
    colorSample: [{i:173, j: 50}, {i:71, j: 136}, {i:37, j: 52},{i:160, j:136}],
    count: 176,
    floss: 987
},{
    colorSample: [{i:104, j: 131}, {i:157, j: 74}, {i:41 , j: 139}],//,{i:160, j:136}],
    count: 405,
    floss: 3042
},
{
    colorSample: [{i:23, j: 103}, {i:37, j: 51}, {i:160, j: 71},{i:163, j:81}],
    count: 509,
    floss: 415
},{
    colorSample: [{i:159, j: 71}, {i:93, j: 68}, {i:32, j: 56}],//,{i:163, j:81}],
    count: 535,
    floss: 931
},{
    colorSample: [{i:95, j: 70}, {i:159, j: 133}, {i:44 , j: 102},{i:172, j:46}],
    count: 602,
    floss: 4
}]

export interface Color { 
    r: number, 
    g: number, 
    b: number, 
    a: number, 
    str: string; 
    dmc: string | number, 
    title?: string; 
    show: boolean, 
    count?: number,
    highlighted: boolean,
};