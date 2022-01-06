import {reorderFaceIntersectionListsSoNeighboringElementsShareEdges} from "./makedual.js";

export function computeAllPossibleCrossingPairs(triangleFaceIndexDigits){
    //returns an array of [edge1, edge2] where each edge is an array of two vertex indices indicating there's a line between them.
    //so, [[[0,1],[2,3]], [[a,b],[c,d]], ...]
    //each one of these means edge1 and edge2 can potentially intersect. if none of these intersect, we win!

    let allIntersectionIndices = [];

    for(let faceIndex=0;faceIndex<12;faceIndex++){
        let edgePairsInThisPlaneToCheck = [];
        let verticesInThisPlane = triangleFaceIndexDigits.filter((arr) => arr.includes(faceIndex));
        verticesInThisPlane = reorderFaceIntersectionListsSoNeighboringElementsShareEdges(faceIndex, verticesInThisPlane);


        //each pair of adjacent vertices shares an edge. that means the edges will look something like this:
        // 5 --- 6 --- 7 --- 8...
        // i           j
        for(let i=0;i<verticesInThisPlane.length;i++){
            let vertex1 = verticesInThisPlane[i];

            let line1 = [verticesInThisPlane[i], verticesInThisPlane[(i+1) % verticesInThisPlane.length]]

            //start at j=i+1 so we don't look at each pair of vertices twice
            for(let j=i+1;j<verticesInThisPlane.length;j++){
                //we should not check: 
                //i) if the same line segment intersects itself, (when i=j), 
                //ii) if the edges are next to one another, meaning i+1 = j or j+1 =i
                if (i == j || i+1 == j || j+1 == i){
                    continue;
                }
                let line2 = [verticesInThisPlane[j], verticesInThisPlane[(j+1) % verticesInThisPlane.length]];

                let edgeIntersection = [line1, line2];
                edgePairsInThisPlaneToCheck.push(edgeIntersection);
            }
        }
        //holy functional programming, batman
        //convert [a,b,c] - which represents point #x in triangleFaceIndexDigits - to its index x
        let edgePairIndicesInThisPlane = edgePairsInThisPlaneToCheck.map(array => array.map(intersectionArrayPair => intersectionArrayPair.map(intersectionArray => triangleFaceIndexDigits.indexOf(intersectionArray))))
        allIntersectionIndices = allIntersectionIndices.concat(edgePairIndicesInThisPlane)
    }
    return allIntersectionIndices;
}



//continuous

export function maximizeThisToReduceCrossings(vertexArray, crossingPairsToCheck){
    let sum = 0;
    for(let crossingPair of crossingPairsToCheck){
        let line1Indices = crossingPair[0], line2Indices = crossingPair[1];
        let line1 = line1Indices.map((index) => vertexArray[index]);
        let line2 = line2Indices.map((index) => vertexArray[index]);

        sum += lineSegmentThingToMaximize(line1[0], line1[1], line2[0],line2[1]);
    }
    return sum;
}


function lineSegmentThingToMaximize(line1_1, line1_2, line2_1, line2_2){
    //if you maximize this, it'll hopefully make the line segments uncross!
    //once both of these things are >0, it means there's no intersection.

    let value = lineSegmentCrossesPlaneTest(line1_1, line1_2, line2_1, line2_2) + lineSegmentCrossesPlaneTest(line2_1, line2_2, line1_1, line1_2)

    //cap the value of a crossing that already isn't intersecting
    if(value > 1){
        value = 1;
    }

    return value;
}


//discrete


export function countCrossings(vertexArray, crossingPairsToCheck){
    let crossCount = 0;
    for(let crossingPair of crossingPairsToCheck){
        let line1Indices = crossingPair[0], line2Indices = crossingPair[1];
        let line1 = line1Indices.map((index) => vertexArray[index]);
        let line2 = line2Indices.map((index) => vertexArray[index]);
        if(doLineSegmentsCross(line1[0], line1[1], line2[0],line2[1])){
            crossCount += 1;
        }
    }
    return crossCount;
}

function subArrays(a,b){
    return new THREE.Vector3(...a).sub(new THREE.Vector3(...b))
}

function doLineSegmentsCross(line1_1, line1_2, line2_1, line2_2){
    // returns a boolean
    if(lineSegmentCrossesPlaneTest(line1_1, line1_2, line2_1, line2_2) < 0){
        // this test only says line 2 crosses a plane given by line 1 - we need to check it with the lines swapped to confirm a true crossing
        if(lineSegmentCrossesPlaneTest(line2_1, line2_2, line1_1, line1_2) < 0){
            return true;
        }
    }
    return false;
}

function lineSegmentCrossesPlaneTest(line1_1, line1_2, line2_1, line2_2){
    let pointNotOnEither = [5,5,5]; //surely no plane will ever choose this point specifically, right? surely this will never come back to haunt me

    let normal = new THREE.Vector3().crossVectors(subArrays(line1_1, pointNotOnEither), subArrays(line1_2, pointNotOnEither))
    normal.normalize();

    let dot1 = subArrays(line2_1, pointNotOnEither).dot(normal);
    let dot2 = subArrays(line2_2, pointNotOnEither).dot(normal);

    //If the signs are different, there's a crossing.
    //in that case we can check if dot1 * dot2 < 0
    return dot1 * dot2;
}
