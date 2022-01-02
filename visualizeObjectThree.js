import * as THREE from "./lib/three.module.js";
import {Earcut} from "./lib/Earcut.js";

const colors = [];

export function colorForPlane(i, lightness){
    if(lightness === undefined){
        lightness = "50";
    }
    let numPlanes = 12;
    return "hsl(" + (360 / numPlanes * i) + ", 50%, "+lightness+"%)";
}

export function makeThreeJSMeshes(vertexArray, faceArray, color){
    let meshes = {};
    meshes.all = [];
    //faces
    meshes.faces = [];
    meshes.faceWireframes = [];
    for(let i=0;i<faceArray.length;i++){
        let faceIndices = faceArray[i];
        let color = colorForPlane(i);

        let mesh = makeThreeJSMeshForOneFace(vertexArray, faceIndices, color)
	    meshes.faces.push(mesh);
	    meshes.all.push(mesh);

        let wireframe = makeWireframeMeshForOneFace(vertexArray, faceIndices, i);
	    meshes.faceWireframes.push(wireframe);
	    meshes.all.push(wireframe);

    }
    //vertices
    meshes.vertexSpheres = [];
    for(let i=0;i<vertexArray.length;i++){
        let mesh = makeThreeJSMeshForOneVertex(vertexArray, i)
	    meshes.vertexSpheres.push(mesh);
	    meshes.all.push(mesh);
    }
	return meshes;
}

let vertexSphereMeshes = [];
let vertexSphereMaterial = new THREE.MeshBasicMaterial({color: "lightblue"});
function makeThreeJSMeshForOneVertex(vertexArray, i){
    while(vertexSphereMeshes.length <= i){
        let mesh = new THREE.Mesh(new THREE.SphereGeometry(0.2), vertexSphereMaterial);
        vertexSphereMeshes.push(mesh);
    }
    //reuse meshes if they already exist

    //set position
    vertexSphereMeshes[i].position.set(...vertexArray[i]);
    return vertexSphereMeshes[i]
}

export function makeThreeJSMeshForOneFace(vertexArray, faceIndices, color){
    //faceIndices is an 1D array of all the vertices in this face.

    //use earcut to triangulate our 11-faced polygons into triangles
    const holeIndices = [];
    const theseVertices = faceIndices.map((index) => vertexArray[index]); //only vertices used for this face
    const flatVertices = theseVertices.reduce((a,b) => a.concat(b), []);//flatten, [[1,2,3],[4,5,6]] into [1,2,3,4,5,6]. used to plug into three.js vertex list    

    const triangleIndexes = Earcut.triangulate( flatVertices, holeIndices, 3);

    var geometry = new THREE.BufferGeometry();


    geometry.setIndex( triangleIndexes );
    geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( flatVertices, 3 ) ); //.setAttribute in newer three.js


    var material = new THREE.MeshBasicMaterial( {
	    side: THREE.DoubleSide,
        color: color,
        opacity: 0.3,
        transparent: true,
    } );

    return new THREE.Mesh(geometry, material);
}

//each face has a different wireframe material so we can change their line width and color independently
let wireframeMaterials = [];
for(let i=0;i<12;i++){
    wireframeMaterials.push(new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 1 } ));
}

export function makeWireframeMeshForOneFace(vertexArray, faceIndices, thisFaceIndex){

    //THREE.LINE() adds an edge between each pair of vertices. this adds a line between the last vertex and the first vertex
    let edgeVertexIndices = faceIndices.concat([ faceIndices[0] ])
    const theseVertices = edgeVertexIndices.map((index) => vertexArray[index]); //only vertices used for this face
    const flatVertices = theseVertices.reduce((a,b) => a.concat(b), []);//flatten, [[1,2,3],[4,5,6]] into [1,2,3,4,5,6]. used to plug into three.js vertex list    

    var geometry = new THREE.BufferGeometry();
    geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( flatVertices, 3 ) ); //.setAttribute in newer three.js

    let material = wireframeMaterials[thisFaceIndex]; //reuse materials instead of creating new ones
    return new THREE.Line( geometry, material );
}

export function displayWireframeAsSelected(index){
    wireframeMaterials[index].linewidth = 5;
    wireframeMaterials[index].color.set(colorForPlane(index));
}

export function displayWireframeAsDeselected(index){
    wireframeMaterials[index].linewidth = 1;
    wireframeMaterials[index].color.setRGB(0,0,0);
}


let debugPoints = [];
let pointVizMaterial = new THREE.MeshBasicMaterial({color: "orange"});
let debugRectangles = [];

window.debugRectangles = debugRectangles;

export function createDebugPlaneMeshes(planeList, scene){
    for(let i=0;i<planeList.length;i++){
        //add a sphere for the plane start point
        let mesh = new THREE.Mesh(new THREE.SphereGeometry(0.2), pointVizMaterial);
        scene.add(mesh);
        debugPoints.push(mesh);

        //create a rectangle
        var geometry = new THREE.BufferGeometry();
        let vertices = [0,0,0,0,0,0,0,0,0,0,0,0]; //to be overridden later
        let indices = [0,1,2,1,2,3]

        geometry.setIndex( indices );
        geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) ); //.setAttribute in newer three.js

        var material = new THREE.MeshBasicMaterial( {
	        side: THREE.DoubleSide,
            color: colorForPlane(i, 40),
            opacity: 0.5,
            transparent: true,
        } );

        let planeRectangleMesh = new THREE.Mesh(geometry, material)

        debugRectangles.push(planeRectangleMesh);
        scene.add(planeRectangleMesh);
    }
    
    //a rectangle with the plane
}
export function updatePlaneDebugRectangles(planeList){
    for(let i=0;i<planeList.length;i++){
        debugPoints[i].position.copy(planeList[i].point)
        computeRectanglePointsFromPlane(planeList, i);
    }
}

function computeRectanglePointsFromPlane(planeList, indexToUpdate){
    let upVec = new THREE.Vector3(0,0,1);
    let plane = planeList[indexToUpdate]

    let sidewaysVec = new THREE.Vector3().crossVectors(upVec, plane.normal).normalize().multiplyScalar(3);
    let planeUpVec =  new THREE.Vector3().crossVectors(sidewaysVec, plane.normal).normalize().multiplyScalar(3);

    let vert1 = plane.point.clone().add(sidewaysVec).add(planeUpVec);
    let vert2 = plane.point.clone().sub(sidewaysVec).add(planeUpVec);
    let vert3 = plane.point.clone().add(sidewaysVec).sub(planeUpVec);
    let vert4 = plane.point.clone().sub(sidewaysVec).sub(planeUpVec);

    //update the buffergeometry with the right positions
    let rectanglemesh = debugRectangles[indexToUpdate];
    let attribute = rectanglemesh.geometry.getAttribute("position");
    let vertexArray = attribute.array;

    vertexArray[0] = vert1.x;
    vertexArray[1] = vert1.y;
    vertexArray[2] = vert1.z;

    vertexArray[3] = vert2.x;
    vertexArray[4] = vert2.y;
    vertexArray[5] = vert2.z;

    vertexArray[6] = vert3.x;
    vertexArray[7] = vert3.y;
    vertexArray[8] = vert3.z;

    vertexArray[9]  = vert4.x;
    vertexArray[10] = vert4.y;
    vertexArray[11] = vert4.z;

    attribute.needsUpdate = true;
}

export function showDebugPlanes(){
    debugPoints.forEach(rect => {rect.material.visible = true;})
    debugRectangles.forEach(rect => {rect.material.visible = true;})
}
export function hideDebugPlanes(){
    debugPoints.forEach(rect => {rect.material.visible = false;})
    debugRectangles.forEach(rect => {rect.material.visible = false;})
}

/*
export function addBlenderMesh(vertexArray, faceArray, name="new mesh"){
    if(name in meshes){
        return replaceMesh(vertexArray, faceArray, name);
    }

	three.scene.add( mesh );

    meshes[name] = mesh;
    
    let wireframeMesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({wireframe: true,color:0x000000}));
    three.scene.add(wireframeMesh);
    meshes[name + 'w'] = wireframeMesh;
}

export function replaceMesh(vertexArray, faceArray, name){
    let meshGeometry = meshes[name].geometry;
    let positionAttributeArray = meshGeometry.getAttribute("position");

	var indices = faceArray.reduce((a,b) => a.concat(b), []);
	var vertices = vertexArray.reduce((a,b) => a.concat(b), []); //flatten, [[1,2,3],[4,5,6]] into [1,2,3,4,5,6]

	meshGeometry.setIndex( indices );
    //update position array. It's assumed here that the number of vertices never changes; otherwise this code will break and there'll be leftover dummy vertices.
    for(let i=0;i<vertices.length;i++){
        positionAttributeArray.array[i] = vertices[i];
    }
    positionAttributeArray.needsUpdate = true;
}*/
