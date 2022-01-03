import {dot, cross, Plane, Polyhedron} from "./polyhedramath.js";
import * as THREE from "./lib/three.module.js";
import {renderDualPolyhedronFromPlanes} from "./makedual.js";
import {symmetryGenerator1, symmetryGenerator2} from "./knownmathematicalsymmetry.js";


// Generate a dodecahedron's faces from its points.
// Code adapted from https{//github.com/mrdoob/three.js/blob/master/src/geometries/DodecahedronGeometry.js
let t = ( 1 + Math.sqrt( 5 ) ) / 2;
let r = 1 / t;
    
export let dodecahedron = new Polyhedron({
    'verts': [
        // (±1, ±1, ±1)
        [- 1, - 1, - 1],	[- 1, - 1, 1,],
        [- 1, 1, - 1], [- 1, 1, 1,],
        [1, - 1, - 1], [1, - 1, 1,],
        [1, 1, - 1], [1, 1, 1,],
        // (0, ±1/φ, ±φ)
         [0, - r, - t], [0, - r, t,],
         [0, r, - t], [0, r, t,],
        // (±1/φ, ±φ, 0)
       [ - r, - t, 0], [- r, t, 0,],
        [ r, - t, 0], [r, t, 0,],
        // (±φ, 0, ±1/φ)
        [- t, 0, - r], [t, 0, - r,],
        [- t, 0, r], [t, 0, r],
    ],
    'faces':[
        [3, 11, 7, 15, 13],
        [7, 19, 17,  6, 15],
        [17, 4, 8,  10, 6],
        [8, 0, 16,  2, 10],
        [0, 12, 1, 18, 16],
        [6, 10, 2, 13,  15],
        [2, 16, 18,  3, 13],
        [18, 1, 9,  11, 3],
        [4, 14, 12,  0,  8],
        [11, 9, 5,  19,  7],
        [19, 5, 14,  4, 17],
        [1, 12, 14,  5,  9],
    ]
});
console.log(dodecahedron)    

// for debugging
let simplex = new Polyhedron({'verts':[
    [0,0,0],
    [0,0,1],
    [0,1,0],
    [1,0,0],
    ],
    'faces':[[0,1,2],[0,1,3],[1,2,3],[0,2,3]]
});

function computePlanesFromPolyhedron(polyhedron){    
    // given a polyhedron, return an array containing one Plane() object per face of the polyhedron
        
    let facePlanes = []
    for (let face of polyhedron.faces){
        let p1 = new THREE.Vector3(...polyhedron.verts[face[0]])
        let p2 = new THREE.Vector3(...polyhedron.verts[face[1]])
        let p3 = new THREE.Vector3(...polyhedron.verts[face[2]]);
        let normal = cross(p1.sub(p3), p2.sub(p3)); //this modifies p1 and p2, but it doesn't matter since we don't use them anyway
        normal.add(new THREE.Vector3(Math.random(),Math.random(),Math.random()));
        facePlanes.push(new Plane(p1, normal))
    }
    return facePlanes
}

export function computePlanesRandomly(){ 
    let facePlanes = []
    for(var i=0;i<12;i++){
        let p1 = [Math.random()*5,Math.random()*5,Math.random()*5]
        let normal = [Math.random(),Math.random(),Math.random()]
        facePlanes.push(new Plane(p1, normal))
    }
    return facePlanes
}

export function matrixForRotationAboutZAxis(degrees){
    let theta = degrees * Math.PI/180;
    let c = Math.cos(theta), s = Math.sin(theta)
    return new THREE.Matrix3().set(c, -s,0, s, c,0,0,0,1)     
}

export function applyC3SymmetryAndOverwritePlanes(planeList, symmetryGenerator1Action, symmetryGenerator2Action){
    let R = symmetryGenerator1Action
    for(let orbit of symmetryGenerator1){
        let plane1Index = orbit[0], plane2Index = orbit[1], plane3Index = orbit[2]
        let plane = planeList[plane1Index]
        
        let rotated120Plane = new Plane(plane.point.clone().applyMatrix3(R), plane.normal.clone().applyMatrix3(R))
        let rotated240Plane = new Plane(plane.point.clone().applyMatrix3(R).applyMatrix3(R), plane.normal.clone().applyMatrix3(R).applyMatrix3(R))
        planeList[plane2Index] = rotated120Plane;
        planeList[plane3Index] = rotated240Plane;
        console.log("Using plane "+plane1Index+" to set "+plane2Index+" and "+plane3Index+" as rotated copies");
    }
        
    let B = symmetryGenerator2Action;
    for(let orbit of symmetryGenerator2){
        let plane1Index = orbit[0], plane2Index = orbit[1];
        let plane = planeList[plane1Index];
        
        let flippedPlane = new Plane(plane.point.clone().applyMatrix3(B), plane.normal.clone().applyMatrix3(B));
        planeList[plane2Index] = flippedPlane
        console.log("Using plane "+plane1Index+" as template to set "+plane2Index+" as a flipped copy")
    }
    return planeList;
}

function average(points){
    return points.reduce(function (prev, current, _, array ) {
        return [prev[0] + current[0]/ array.length, prev[1] + current[1]/ array.length, prev[2] + current[2]/ array.length];
    }, [0,0,0]);
}

export function useExpandedTetrahedron(){

        let originalData = [[-1.0736196041107178, 0.4330126941204071, 0.06391012668609619], [-0.8257338404655457, -2.9802322387695312e-08, -0.6439406871795654], [-1.0736196041107178, -0.4330126643180847, 0.06391012668609619], [0.5006407499313354, 0.4289108216762543, 2.2649168968200684], [0.5006407499313354, -0.4371145963668823, 2.2649168968200684], [1.2506407499313354, -0.004101799800992012, 2.2649168968200684], [2.007485866546631, -1.3343980312347412, 0.09912711381912231], [1.5532994270324707, -1.3950482606887817, -0.6323106288909912], [1.2617474794387817, -1.7821930646896362, 0.08308467268943787], [1.2558016777038574, 1.7986215353012085, 0.0579473078250885], [2.0133895874023438, 1.371612310409546, 0.08377200365066528], [1.5378903150558472, 1.3574577569961548, -0.6341543197631836]];

   //vertices 0-2 and 3-5 are swapped, so vertex 0 is on the top face.
   let data = [[0.5006407499313354, 0.4289108216762543, 2.2649168968200684], [0.5006407499313354, -0.4371145963668823, 2.2649168968200684], [1.2506407499313354, -0.004101799800992012, 2.2649168968200684], [-1.0736196041107178, 0.4330126941204071, 0.06391012668609619], [-0.8257338404655457, -2.9802322387695312e-08, -0.6439406871795654], [-1.0736196041107178, -0.4330126643180847, 0.06391012668609619], [2.007485866546631, -1.3343980312347412, 0.09912711381912231], [1.5532994270324707, -1.3950482606887817, -0.6323106288909912], [1.2617474794387817, -1.7821930646896362, 0.08308467268943787], [1.2558016777038574, 1.7986215353012085, 0.0579473078250885], [2.0133895874023438, 1.371612310409546, 0.08377200365066528], [1.5378903150558472, 1.3574577569961548, -0.6341543197631836]];

    //this shape lies flatish on the z=0 plane, but we want to move the shape downwards so it's centered at 0

    let shapeMidpoint = average(data)

    console.log(shapeMidpoint)

    //shift the dataset so it's centered at the origin
    data = data.map((point) => [
        point[0]-shapeMidpoint[0], 
        point[1]-shapeMidpoint[1],
        point[2]-shapeMidpoint[2]
    ])

    let planeList = [];
    for(let i=0;i<data.length;i++){
        let point = data[i];
        let normal = data[i].map((i) => -i); //point backwards into zero

        planeList.push(new Plane(point, normal));
    }

    /*
    //now overwrite those planes to get them into the right order for the symmetry to work

    // matrix that applies generator 1, order 3
    let rotate120Deg = matrixForRotationAboutZAxis(120);

    //now compute a 180 degree rotation about the midpoint of two tetrahedron vertices
    //these seem like where some of the corners are aligned
    let trianglePt1 = [-Math.sqrt(8/9),0,-1/3]; //from wikipedia page on tetrahedron
    let trianglePt2 = [0,0,1];
    let bottomTriangleMidpoint = [0,1,2].map((index) => (trianglePt1[index] + trianglePt2[index])/2);

    //the axis to be rotated about points to the midpoint of an edge of a tetrahedron. 
    let rotationAxis = new THREE.Vector3(...bottomTriangleMidpoint);
    //rotationAxis.sub(new THREE.Vector3(...shapeMidpoint));
    rotationAxis.normalize();
    console.log("rotation axis", rotationAxis)

    //make a 180 degree rotation matrix around that axis. for some reason makeRotationAxis only exists on Matrix4
    let rotationMatrix4 = new THREE.Matrix4().makeRotationAxis(rotationAxis, Math.PI);
    let rotationMatrix = new THREE.Matrix3().setFromMatrix4(rotationMatrix4);
 
    
    return applyC3SymmetryAndOverwritePlanes(planeList, rotate120Deg, rotationMatrix);
    */

    //symmetryGenerator1 = ((6,11,10),(9,8,7),(2,5,4),(0,3,1))
    //symmetryGenerator2 = [[6, 9],[11, 7],[10, 8],[0, 2],[1, 5],[3, 4]])
    //let reordering = [0,1,2,3,4,5,6,7,8,9,10,11];
    let reordering = [0,1,4,2,3,5,
    6,11,9,10,8,7];
    planeList = reordering.map((index) => planeList[index])

    return planeList;
}    
        
        
export function computePlanesRandomlyWithKnownC3Symmetry(){        
    //  Compute four random planes, then repeat them after being rotated 120 and 240 degrees around Z axis.
    // this function computes planes randomly with the same symmmetry group as the polyhedron found in the 2000 paper by bokowski and de oliviera. see knownmathematicalsymmmetry.js for the origins of symmetryGenerator1 and symmetryGenerator2

    // matrix that applies generator 1, order 3
    let rotate120Deg = matrixForRotationAboutZAxis(120)
    
    // matrix that applies generator 2, order 2
    let rotate180Deg = matrixForRotationAboutZAxis(180);
    let flipZ = new THREE.Matrix3().set(1,0,0,0,1,0,0,0,-1);
    let flipX = new THREE.Matrix3().set(-1,0,0,0,1,0,0,0,1);
    
    //here we use the symmetry generators from the bokowski 2000 paper.

    
    // set planes 0 and 6
    let facePlanes = []
    for(var i=0;i<12;i++){
        let p1 = [Math.random()*5,Math.random()*5,Math.random()*5]
        let normal = [Math.random(),Math.random(),Math.random()]
        facePlanes.push(new Plane(p1, normal))
    }

    return applyC3SymmetryAndOverwritePlanes(facePlanes, rotate120Deg, flipX);
}

export function computeInitialDualPlaneList(){
    //let planeList = computePlanesFromPolyhedron(dodecahedron)
    //let  planeList = computePlanesFromPolyhedron(simplex)

    //let planeList = computePlanesRandomlyWithKnownC3Symmetry(); //best

    let planeList = useExpandedTetrahedron();

    //console.log(planeList)
    return planeList;
}

