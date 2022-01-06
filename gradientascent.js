
import {countCrossings, maximizeThisToReduceCrossings} from "./edgeDetection.js";
import {Plane} from "./polyhedramath.js";
import {computeDualPolyhedronFromFacePlanes} from "./makedual.js";
import {allPossibleEdgeCrossingPairs, triangleFaceIndexDigits} from "./knownmathematicalsymmetry.js";

export function oneRoundGradientAscent(parameters, testingFunction, stepSize){
    let gradientComputingStepSize = 0.00001;

    let gradient = [];

    let baseValue = testingFunction(parameters);
    for(let i=0;i<parameters.length;i++){
        let parameterCopy = [...parameters];
        parameterCopy[i] += gradientComputingStepSize;
        gradient.push(testingFunction(parameterCopy) - baseValue);
    }

    let newParameters = [...parameters];
    for(let i=0;i<parameters.length;i++){
        newParameters[i] += gradient[i] * stepSize;
    }
    console.log("before the value was", baseValue, "now it's'", testingFunction(newParameters));
    return newParameters;
}

export let reallyDumbStartParameters = [];
for(let i=0;i<12*3*2;i++){
    let randomSign = Math.sign(Math.random()-0.5);
    reallyDumbStartParameters.push(randomSign * (2 + Math.random()));
}

export function reallyDumbPlaneMaker(parameters){
    let planes = [];
    for(let i=0;i<12;i++){
        let pos = [parameters[i*6],parameters[i*6+1],parameters[i*6+2]];
        let normal = [parameters[i*6+3],parameters[i*6+4],parameters[i*6+5]];
        let plane = new Plane(pos, normal);
        planes.push(plane);
    }
    return planes;
}

export function maximizeThisFromPlanes(planeList){
    let dualPolyhedronData = computeDualPolyhedronFromFacePlanes([[],[],[],[],[],[],[],[],[],[],[],[]], triangleFaceIndexDigits, planeList);
    let dualVertices = dualPolyhedronData[0], dualFaces = dualPolyhedronData[1];

    return maximizeThisToReduceCrossings(dualVertices, allPossibleEdgeCrossingPairs);
}
