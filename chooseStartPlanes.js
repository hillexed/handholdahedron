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
            
    let R = rotate120Deg
    for(let orbit of symmetryGenerator1){
        let plane1Index = orbit[0], plane2Index = orbit[1], plane3Index = orbit[2]
        let plane = facePlanes[plane1Index]
        
        let rotated120Plane = new Plane(plane.point.clone().applyMatrix3(R), plane.normal.clone().applyMatrix3(R))
        let rotated240Plane = new Plane(plane.point.clone().applyMatrix3(R).applyMatrix3(R), plane.normal.clone().applyMatrix3(R).applyMatrix3(R))
        facePlanes[plane2Index] = rotated120Plane;
        facePlanes[plane3Index] = rotated240Plane;
        console.log("Using plane "+plane1Index+" to set "+plane2Index+" and "+plane3Index+" as rotated copies");
    }
        
    let B = flipX;
    for(let orbit of symmetryGenerator2){
        let plane1Index = orbit[0], plane2Index = orbit[1];
        let plane = facePlanes[plane1Index];
        
        let flippedPlane = new Plane(plane.point.clone().applyMatrix3(B), plane.normal.clone().applyMatrix3(B));
        facePlanes[plane2Index] = flippedPlane
        console.log("Using plane "+plane1Index+" as template to set "+plane2Index+" as a flipped copy")
    }
    return facePlanes;
}

export function computeInitialDualPlaneList(){
    //let planeList = computePlanesFromPolyhedron(dodecahedron)
    //let  planeList = computePlanesFromPolyhedron(simplex)
    let planeList = computePlanesRandomlyWithKnownC3Symmetry();
    //console.log(planeList)
    return planeList;
}

