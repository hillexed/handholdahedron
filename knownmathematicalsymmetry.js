import {computeAllPossibleCrossingPairs} from "./edgeDetection.js";

function zeroIndex(array){
    return array.map(subarray => subarray.map(item => (item-1)));
}

//this file contains info on the DUAL of the 12-sided handholdahedron
//it comes from On the Generation of Oriented Matroids by J. Bokowski and A. Guedes de Oliveira (2000)

let symmetryGenerator1ButOneIndexed = [[7,12,11],[10,9,8],[3,6,5],[1,4,2]]
export let symmetryGenerator1C3 = symmetryGenerator1ButOneIndexed.map((orbit) => orbit.map((n) => n-1));
//console.log("symmetry generator 1", symmetryGenerator1)
//symmetryGenerator1 = ((6,11,10),(9,8,7),(2,5,4),(0,3,1))

let symmetryGenerator2ButOneIndexed = [[7, 10],[12, 8],[11, 9],[1, 3],[2, 6],[4, 5]]
export let symmetryGenerator2C3 = symmetryGenerator2ButOneIndexed.map((orbit) => orbit.map((n) => n-1));
//symmetryGenerator2 = [[6, 9],[11, 7],[10, 8],[0, 2],[1, 5],[3, 4]])

//these have been zero-indexed
export const triangleFaceIndexDigitsC3 = [[0, 1, 4], [0, 1, 11], [0, 2, 3], [0, 2, 4], [0, 3, 10], [0, 5, 6], [0, 5, 8], [0, 6, 7], [0, 7, 9], [0, 8, 11], [0, 9, 10], [1, 2, 9], [1, 2, 10], [1, 3, 5], [1, 3, 6], [1, 4, 5], [2, 3, 5], [2, 4, 8], [2, 5, 7], [1, 6, 9], [1, 7, 8], [1, 7, 11], [1, 8, 10], [2, 6, 8], [2, 6, 11], [2, 7, 10], [2, 9, 11], [3, 4, 7], [3, 4, 11], [3, 6, 8], [3, 7, 10], [3, 8, 9], [3, 9, 11], [4, 5, 9], [4, 6, 7], [4, 6, 10], [4, 8, 11], [4, 9, 10], [5, 6, 9], [5, 7, 11], [5, 8, 10], [5, 10, 11], [6, 10, 11], [7, 8, 9]];




/*
//new ones, #58 from the labeling
let a = 10;
let b = 11;

export let triangleFaceIndexDigits = [[0,1,4], [0,1,8], [0,2,3], [0,2,7], [0,3,6], [0,4,9], [0,5,6], [0,5,b], [0,7,a], [0,8,a], [0,9,b], [1,2,5], [1,2,6], [1,3,7], [1,3,9], [1,4,7], [1,5,a], [1,6,b], [1,8,b], [1,9,a], [2,3,b], [2,4,8], [2,4,a], [2,5,8], [2,6,9], [2,7,9], [2,a,b], [3,4,5], [3,4,b], [3,5,a], [3,6,7], [3,8,9], [3,8,a], [4,5,9], [4,6,a], [4,6,b], [4,7,8], [5,6,8], [5,7,9], [5,7,b], [6,7,a], [6,8,9], [7,8,b], [9,a,b]];


let generator1 = [[0,1,2],[3,4,5 ],[6,7,8 ],[9,a,b]]; //order 3 - 
let generator2 = [[0,4 ],[1,9 ],[2,6 ],[3,a ],[5,8 ],[7,b]];
let generator3 = [[0,7 ],[1,5 ],[2,a ],[3,6 ],[4,b ],[8,9]];
*/


//jan 6 labeling. order 12 group
let a = 10,b = 11,c=12;
let triangleFaceIndexDigitsOneIndexed = [[1,2,a],[2,3,b],[1,c,3],[2,9,a],[3,7,b],[1,8,c],[1,a,8],[2,b,9],[3,c,7],[1,3,4],[1,5,2],[2,6,3],[1,4,b],[2,5,c],[3,6,a],[1,b,6],[2,c,4],[3,a,5],[1,6,9],[2,4,7],[3,5,8],[1,9,7],[2,7,8],[3,8,9],[1,7,5],[2,8,6],[3,9,4],[4,9,5],[5,7,6],[4,6,8],[4,8,a],[5,9,b],[6,7,c],[4,a,7],[5,b,8],[6,c,9],[4,c,b],[5,a,c],[6,b,a],[7,a,b],[8,b,c],[9,c,a],[7,9,8],[4,5,6]];

export let triangleFaceIndexDigits = zeroIndex(triangleFaceIndexDigitsOneIndexed);

//let generator1 = zeroIndex([[1,2,3],[4,5,6],[7,8,9],[a,b,c]]); //order 3
export let order12Generator1 = zeroIndex([[1,2,3],[6,4,5],[8,9,7],[c,a,b]]); //order 3. reordered so applying 2 then 1 covers all planes
export let order12Generator2 = zeroIndex([[1,c],[2,6],[3,8],[4,b],[5,9],[7,a]]);
//there's a third generator but we don't need it, these two are enough

export let allPossibleEdgeCrossingPairs = computeAllPossibleCrossingPairs(triangleFaceIndexDigits)


