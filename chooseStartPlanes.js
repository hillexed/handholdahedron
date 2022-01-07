import {dot, cross, Plane, Polyhedron} from "./polyhedramath.js";
import * as THREE from "./lib/three.module.js";
import {renderDualPolyhedronFromPlanes} from "./makedual.js";
import {symmetryGenerator1C3, symmetryGenerator2C3, order12Generator1, order12Generator2} from "./knownmathematicalsymmetry.js";


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

export function matrixForRotationAboutAxis(axis, angle){
    if(angle === undefined){
        angle = Math.PI; //180 degrees
    }
    let mat4 = new THREE.Matrix4().makeRotationAxis(axis, angle);
    return new THREE.Matrix3().setFromMatrix4(mat4);
}

export function matrixForRotationAboutZAxis(degrees){
    let theta = degrees * Math.PI/180;
    let c = Math.cos(theta), s = Math.sin(theta)
    return new THREE.Matrix3().set(c, -s,0, s, c,0,0,0,1)     
}

export function applySymmetryAndOverwritePlanes(planeList, generator, actionMatrix){
    //actionMatrix is a THREE.Matrix3
    for(let orbit of generator){
        let plane1Index = orbit[0];

        let point = planeList[plane1Index].point.clone();
        let normal = planeList[plane1Index].normal.clone();
        
        for(let i=1;i<orbit.length;i++){
            point = point.applyMatrix3(actionMatrix);
            normal = normal.applyMatrix3(actionMatrix);

            let nextIndex = orbit[i];

            planeList[nextIndex] = new Plane(point.clone(), normal.clone());
            console.log("Using plane "+plane1Index+" as template to set "+nextIndex+" as an affected copy")
        }
    }
}

export function applyC3SymmetryAndOverwritePlanes(planeList, symmetryGenerator1Action, symmetryGenerator2Action){
    applySymmetryAndOverwritePlanes(planeList, symmetryGenerator1C3, symmetryGenerator1Action);
    applySymmetryAndOverwritePlanes(planeList, symmetryGenerator2C3, symmetryGenerator2Action);
    return planeList;
}

function average(points){
    return points.reduce(function (prev, current, _, array ) {
        return [prev[0] + current[0]/ array.length, prev[1] + current[1]/ array.length, prev[2] + current[2]/ array.length];
    }, [0,0,0]);
}

export function useExpandedTetrahedron(){

    let data = [[1.5567, -1.3957, -0.62313], [2.0065, -1.3326, 0.0096854],[1.2623, -1.7774, 0.08866],
[-0.827, -0.0039, -0.6381],[2.0062, 1.3706, 0.0900],[0.4964, -0.43, 2.25],
[1.5204, 1.3539, -0.63263],[1.2446, -0.006, 2.2535],[-1.0698, -0.43225, 0.069121],
[-1.0653, 0.4301, 0.069121],[1.2548, 1.7975, 0.0568],[0.50744, 0.42445, 2.2649]];

    //this shape lies flatish on the z=0 plane, but we want to move the shape downwards so it's centered at 0

    let shapeMidpoint = average(data);

    //shift the dataset so it's centered at the origin
    data = data.map((point) => [
        point[0]-shapeMidpoint[0], 
        point[1]-shapeMidpoint[1],
        point[2]-shapeMidpoint[2]
    ])

    /*
        //make 5 times as big
    data = data.map((point) => [
        point[0]*5, 
        point[1]*5,
        point[2]*5
    ])
    */

    let planeList = [];
    for(let i=0;i<data.length;i++){
        let point = data[i];
        let normal = data[i].map((i) => -i); //point backwards into zero

        planeList.push(new Plane(point, normal));
    }

    return planeList;
}    

export function computePlanesRandomlyWithTetrahedralIshRotationSymmetry(){        
    //  Compute four random planes, then repeat them after being rotated 120 and 240 degrees around Z axis.
    // this function computes planes randomly with the same symmmetry group as the polyhedron found in the 2000 paper by bokowski and de oliviera. see knownmathematicalsymmmetry.js for the origins of symmetryGenerator1 and symmetryGenerator2

    // matrix that applies generator 1, order 3
    let rotate120Deg = matrixForRotationAboutZAxis(120)
    
    // matrix that applies generator 2, order 2
    let rotate180Deg = matrixForRotationAboutZAxis(180);
    let flipZ = new THREE.Matrix3().set(1,0,0,0,1,0,0,0,-1);

    //from wikipedia. vertices of a tetrahedron centered at origin.
    //we're going to use them to calculate the rotation axis through their midpoint
    let tetrahedronVertex1 = new THREE.Vector3(0,0,1);
    let tetrahedronVertex2 = new THREE.Vector3(Math.sqrt(8/9),0,-1/3); 
    let tetrahedronEdgeMidpoint = tetrahedronVertex1.clone().add(tetrahedronVertex2).multiplyScalar(1/2).normalize();

    let rotate180AroundTetrahedronAxis = matrixForRotationAboutAxis(tetrahedronEdgeMidpoint, Math.PI);

    //this should rotate tetrahedronVertex1 to tetrahedronVertex2; check
    let rotatedVertex1 = tetrahedronVertex1.clone().applyMatrix3(rotate180AroundTetrahedronAxis);
    if(rotatedVertex1.sub(tetrahedronVertex2).length() > 0.1){
        console.error("ROTATION ERROR! these two should be equal", tetrahedronVertex1.clone().applyMatrix3(rotate180AroundTetrahedronAxis), tetrahedronVertex2);
    }
    

    let p1 = [Math.random()*5,Math.random()*5,Math.random()*5]
    let normal = [Math.random(),Math.random(),Math.random()];
    
    //the rest will be filled in later by the symmetry
    let facePlanes = [];
    for(var i=0;i<12;i++){
        facePlanes.push(new Plane([0,0,0], [0,0,1]))
    }
    facePlanes[0] = new Plane(p1, normal);

    applySymmetryAndOverwritePlanes(facePlanes, order12Generator1, rotate120Deg);
    applySymmetryAndOverwritePlanes(facePlanes, order12Generator2, rotate180AroundTetrahedronAxis);
    applySymmetryAndOverwritePlanes(facePlanes, order12Generator1, rotate120Deg);

    return facePlanes;
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

    applySymmetryAndOverwritePlanes(facePlanes, symmetryGenerator1C3, rotate120Deg);
    applySymmetryAndOverwritePlanes(facePlanes, symmetryGenerator2C3, flipX);

    return facePlanes;
}

export function computeInitialDualPlaneList(){
    //let planeList = computePlanesFromPolyhedron(dodecahedron)
    //let  planeList = computePlanesFromPolyhedron(simplex)

    //let planeList = computePlanesRandomlyWithKnownC3Symmetry(); //best
    let planeList = computePlanesRandomlyWithTetrahedralIshRotationSymmetry(); //best

    //let planeList = useExpandedTetrahedron();

    //console.log(planeList)
    return planeList;
}

