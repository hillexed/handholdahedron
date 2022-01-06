import {dot, cross, Plane, Polyhedron} from "./polyhedramath.js";
import {makeThreeJSMeshes} from "./visualizeObjectThree.js";
import {triangleFaceIndexDigits} from "./knownmathematicalsymmetry.js";


function computeAndVerifyAllPlaneIntersections(facePlanes){
    let planeIntersections = []
    for(let i=0;i<facePlanes.length;i++){
        for(let j=i+1;j<facePlanes.length;j++){
            for(let k=j+1;k<facePlanes.length;k++){
                //print("Computing intersection of planes {},{},{}".format(i,j,k))
                let point = facePlanes[i].intersectWithTwoOtherPlanes(facePlanes[j],facePlanes[k]);
                planeIntersections.push(point)

                if(!isFinite(point[0]) || !isFinite(point[1]) || !isFinite(point[2])){
                    //print("===WARNING{ POINT AT INTERSECTION{},{},{} HAS NAN VALUES{ {}".format(i,j,k,point))
                }
            }
        }
    }
    //print("Computed {} point intersections".format(len(planeIntersections)))
    return planeIntersections;
}


export function computeDualPolyhedronFromFacePlanes(primalVertices, primalFaces, planeList){
    let dualVertices = [];
    let dualFaces = [];
    for(var i=0;i<primalVertices.length;i++){
      dualFaces.push([]);
    }

    for(let faceIndex=0;faceIndex<triangleFaceIndexDigits.length;faceIndex++){
      let face = triangleFaceIndexDigits[faceIndex];
      let i = face[0], j = face[1], k = face[2];
      let point = planeList[i].intersectWithTwoOtherPlanes(planeList[j],planeList[k])
      dualVertices.push(point)
      for(let vertexNum of face){
        dualFaces[vertexNum].push(faceIndex);
      }
    }

    for(let i=0;i<dualFaces.length;i++){
        let dualFaceList = dualFaces[i];
        dualFaces[i] = reorderFaceIndicesSoNeighboringElementsShareEdges(i, dualFaceList);
    }

    //assert dualVertices.length == primalFaces.length;
    //assert dualFaces.length == primalVertices.length;
    return [dualVertices, dualFaces];
}

function getElementOfArrayWhichIsntOneOfThese(array, notThis, notThisEither){
    for(let i=0;i<array.length;i++){
        if(array[i] != notThis && array[i] != notThisEither){
            return array[i];
        }
    }
    console.error("oh no we didnt find the element of the array which wasnt one of those things", array);
    throw new Exception();
}


export function reorderFaceIndicesSoNeighboringElementsShareEdges(thisFaceIndex, dualFaceIndexList){
    //dualFaceIndexList is a list of which vertex indices belong to which face - for example, if [1,2,3] is in the 44th slot and [1,6,7] is in the 2nd element of triangleFaceIndexDigits, then faceIndex=1 would have 44 and 2 in dualFaceList.
    //this function reorders vertices so that the edges are closed in the right order. the vertex whose index is at slot 0 shares an edge with the vertex whose index is at slot 1, and so on 0 --- 1 --- 2 ----3 etc

    let thisFaceIntersectionLists = dualFaceIndexList.map( (index) => triangleFaceIndexDigits[index]); //all the elements of triangleFaceIndexDigits which have a (faceIndex) in them

    let properlyOrderedIntersections = reorderFaceIntersectionListsSoNeighboringElementsShareEdges(thisFaceIndex, thisFaceIntersectionLists);

    //convert [a,b,c] intersections-of-3-planes back to indices
    return properlyOrderedIntersections.map((thing) => triangleFaceIndexDigits.indexOf(thing))
}

export function reorderFaceIntersectionListsSoNeighboringElementsShareEdges(thisFaceIndex, faceIntersectionList){
    //dualFaceList is a list of which vertex indices belong to which face - for example, if [1,2,3] is in the 44th slot and [1,6,7] is in the 2nd element of triangleFaceIndexDigits, then faceIndex=1 would have 44 and 2 in dualFaceList.
    //this function reorders vertices so that the edges are closed in the right order. the vertex whose index is at slot 0 shares an edge with the vertex whose index is at slot 1, and so on 0 --- 1 --- 2 ----3 etc

    let properlyOrderedIntersections = [];
    let firstIntersection = faceIntersectionList[0];

    let currentLineIndex = getElementOfArrayWhichIsntOneOfThese(firstIntersection, thisFaceIndex);
    let prevLineIndex = getElementOfArrayWhichIsntOneOfThese(firstIntersection, thisFaceIndex, currentLineIndex);
    for(let i=0;i<faceIntersectionList.length;i++){
        //get the two points in theseVertices formed by the intersection of plane # thisFaceIndex, plane # otherPlaneIndex, and one other plane
        //
        let twoVerticesOfThisEdge = faceIntersectionList.filter((intersection) => intersection.includes(thisFaceIndex) && intersection.includes(currentLineIndex));
        //assert twoVerticesOfThisEdge.length == 2;    

        //now move along the line made by intersecting plane thisFaceIndex with plane currentLineIndex
        let nextPoint = twoVerticesOfThisEdge[0];
        if(getElementOfArrayWhichIsntOneOfThese(nextPoint, thisFaceIndex, currentLineIndex) == prevLineIndex){
            nextPoint = twoVerticesOfThisEdge[1];
        }
        prevLineIndex = currentLineIndex;
        currentLineIndex = getElementOfArrayWhichIsntOneOfThese(nextPoint, thisFaceIndex, currentLineIndex);

        properlyOrderedIntersections.push(nextPoint);
    }
    return properlyOrderedIntersections;
}


export function visualizePlanesWithMeshes(planeList,planeRectSize=20){
    for(var i=0;i<planeList.length;i++){
        let plane = planeList[i];

        let upVec = [0,0.001,1];
        // create a vector parallel to z plane but also lie in the plane. the 0.001 is there just in case the plane is vertical
        let onPlaneVec1 = cross(upVec, plane.normal).normalize().multiplyScalar(planeRectSize);
        let onPlaneVec2 = cross(onPlaneVec1, plane.normal).normalize().multiplyScalar(planeRectSize); //this vector will also lie in the plane
        
        //make a rectangle centered on plane.point
        let verts = [onPlaneVec1.clone().add(onPlaneVec2),
         onPlaneVec1.clone().sub(onPlaneVec2),
        onPlaneVec1.clone().multiplyScalar(-1).sub(onPlaneVec2),
        onPlaneVec1.clone().multiplyScalar(-1).add(onPlaneVec2)]        
        
        verts = verts.map((vert) => vert.add(plane.point));
        verts = verts.map((vert) => vert.toArray());
        
        //now make a debug mesh
        addBlenderMesh(vertexArray=verts, faceArray=[[0,1,2,3]], name="face "+(i+1))
    }
}

export function renderDualPolyhedronFromPlanes(planeList){
    //given a list of 12 planes, using triangleFaceIndexDigits to know which planes' intersections have a vertex, compute the dual polyhedron.
    let allPlaneIntersections = computeAndVerifyAllPlaneIntersections(planeList)

    //let debugMesh = addBlenderMesh(vertexArray=allPlaneIntersections, faceArray=[], name="all vertices")
    //visualizePlanesWithMeshes(planeList)

    let dualPolyhedronData = computeDualPolyhedronFromFacePlanes([[],[],[],[],[],[],[],[],[],[],[],[]], triangleFaceIndexDigits, planeList);
    let dualVertices = dualPolyhedronData[0], dualFaces = dualPolyhedronData[1];
    return makeThreeJSMeshes(dualVertices, dualFaces);
}
