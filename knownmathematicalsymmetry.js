//this file contains info on the DUAL of the 12-sided handholdahedron
//it comes from On the Generation of Oriented Matroids by J. Bokowski and A. Guedes de Oliveira (2000)


let symmetryGenerator1ButOneIndexed = [[7,12,11],[10,9,8],[3,6,5],[1,4,2]]
export let symmetryGenerator1 = symmetryGenerator1ButOneIndexed.map((orbit) => orbit.map((n) => n-1));
//console.log("symmetry generator 1", symmetryGenerator1)
//symmetryGenerator1 = ((6,11,10),(9,8,7),(2,5,4),(0,3,1))



let symmetryGenerator2ButOneIndexed = [[7, 10],[12, 8],[11, 9],[1, 3],[2, 6],[4, 5]]
export let symmetryGenerator2 = symmetryGenerator2ButOneIndexed.map((orbit) => orbit.map((n) => n-1));
//symmetryGenerator2 = [[6, 9],[11, 7],[10, 8],[0, 2],[1, 5],[3, 4]])

//these have been zero-indexed
export const triangleFaceIndexDigitsC3 = [[0, 1, 4], [0, 1, 11], [0, 2, 3], [0, 2, 4], [0, 3, 10], [0, 5, 6], [0, 5, 8], [0, 6, 7], [0, 7, 9], [0, 8, 11], [0, 9, 10], [1, 2, 9], [1, 2, 10], [1, 3, 5], [1, 3, 6], [1, 4, 5], [2, 3, 5], [2, 4, 8], [2, 5, 7], [1, 6, 9], [1, 7, 8], [1, 7, 11], [1, 8, 10], [2, 6, 8], [2, 6, 11], [2, 7, 10], [2, 9, 11], [3, 4, 7], [3, 4, 11], [3, 6, 8], [3, 7, 10], [3, 8, 9], [3, 9, 11], [4, 5, 9], [4, 6, 7], [4, 6, 10], [4, 8, 11], [4, 9, 10], [5, 6, 9], [5, 7, 11], [5, 8, 10], [5, 10, 11], [6, 10, 11], [7, 8, 9]];

//from the pdf. lists are starting from the top going clockwise.
//each key is a center of a vertex and these are the vertices attached to it in order
let centersToTrianglesOneIndexed = {
1: [12,8,10,2,5,7,9,6,11,4,3],
2: [4,12,5,1,10,9,11,3,6,8,7],
3: [11,7,12,1,4,9,8,5,10,6,2],
4: [5,9,3,1,11,12,2,7,10,8,6],
5: [4,6,7,1,2,12,10,3,8,11,9],
6: [3,10,11,1,9,12,7,5,4,8,2],
7: [2,8,9,1,5,6,12,3,11,10,4],
8: [6,4,10,1,12,11,5,3,9,7,2],
9: [10,12,6,1,7,8,3,4,5,11,2],
10: [12,9,2,1,8,4,7,11,6,3,5],
11: [8,12,4,1,6,10,7,3,2,9,5],
12: [4,11,8,1,3,7,6,9,10,5,2],
};

//zero index them
let centersToTriangles = {};
for(let i=0;i<12;i++){
    centersToTriangles[i] = centersToTrianglesOneIndexed[i+1].map((x) => x-1);
}



let triangles = [];
let triangleStrings = new Set(); //used to ensure no duplicates
for(let i=0;i<12;i++){
    let indicesAroundVertex = centersToTriangles[i];
    for(let j=0;j<indicesAroundVertex.length;j++){
        //sanity check: each vertex is really connected to every other vertex
        if(!indicesAroundVertex.includes(j) && i != j){
            console.error(i, indicesAroundVertex, j);
        }
        if(indicesAroundVertex.length != 11){
            console.error("Vertex "+i+"doesn't have 11 connected vertices! instead it has " + indicesAroundVertex.length)
        }
        let vert1 = i;
        let vert2 = indicesAroundVertex[j];
        let vert3 = indicesAroundVertex[(j+1) % indicesAroundVertex.length];

        if(vert1 == vert2 || vert2 == vert3 || vert1 == vert3){
            console.error(vert1,vert2,vert3)
        }

        let triangle = [vert1,vert2,vert3].sort();
        
        let string1 = ''+triangle[0]+triangle[1]+triangle[2];
        if(!triangleStrings.has(string1)){
            triangleStrings.add(string1);
            triangles.push(triangle);
        }
    }
}
export const triangleFaceIndexDigits = triangles;
console.log(triangleFaceIndexDigits)



let edgesPerFace = [];
for(let faceIndex=0;faceIndex<12;faceIndex++){
    let edgesInThisFace = [];
    let verticesInThisFace = triangleFaceIndexDigits.filter((arr) => arr.includes(faceIndex))
}
