
import {countCrossings, maximizeThisToReduceCrossings} from "./edgeDetection.js";
import {Plane} from "./polyhedramath.js";
import {computeDualPolyhedronFromFacePlanes} from "./makedual.js";
import {allPossibleEdgeCrossingPairs, triangleFaceIndexDigits} from "./knownmathematicalsymmetry.js";


export function oneRoundRandomChoice(parameters, testingFunction, stepSize){
    //stepSize here

    let baseValue = testingFunction(parameters);

    let bestValue = baseValue;
    let bestParams = parameters;

    //wiggle every parameter
    for(let j=0;j<5;j++){
        let parameterCopy = [...parameters];
        for(let i=0;i<20;i++){ //wiggle 10 parameters per trial
            //generate a copy with slight variation

            let parameterIndex = parseInt(Math.random() * parameters.length);

            parameterCopy[parameterIndex] += Math.random() * stepSize;
        }
        let value = testingFunction(parameterCopy);

        //is it better?
        if(value > bestValue){
            bestParams = parameterCopy;
            bestValue = value;
        }
    }
    //console.log("before the value was", baseValue, "now it's'", testingFunction(bestParams));
    return bestParams;
}

export function oneRoundGradientAscent(parameters, testingFunction, stepSize){
    let gradientComputingStepSize = 0.001;

    let gradient = [];

    let baseValue = testingFunction(parameters);
    for(let i=0;i<parameters.length;i++){
        let parameterCopy = [...parameters];
        parameterCopy[i] += gradientComputingStepSize;
        let valPositive = testingFunction(parameterCopy);


        let parameterCopyMinus = [...parameters];
        parameterCopyMinus[i] -= gradientComputingStepSize;
        let valNegative = testingFunction(parameterCopyMinus);


        gradient.push( (valPositive-valNegative)/(2*gradientComputingStepSize));
    }
    console.log(gradient)

    let newParameters = [...parameters];
    for(let i=0;i<parameters.length;i++){
        newParameters[i] += gradient[i] * stepSize;
    }
    //console.log("before the value was", baseValue, "now it's'", testingFunction(newParameters));
    return newParameters;
}

export let reallyDumbStartParameters = [];
for(let i=0;i<12*3*2;i++){
    let randomSign = Math.sign(Math.random()-0.5);
    reallyDumbStartParameters.push(randomSign * (2 + Math.random()));
}

export function planesToReallyDumbStartParameters(planeList){
    let params = [];
    for(let i=0;i<12;i++){
        let pos = planeList[i].point;
        let normal = planeList[i].normal;
        params.push(pos.x);
        params.push(pos.y);
        params.push(pos.z);
        params.push(normal.x);
        params.push(normal.y);
        params.push(normal.z);
    }
    return params;
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
