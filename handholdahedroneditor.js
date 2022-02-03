import {HandholdahedronVizualizer} from "./handholdahedronvisualizer.js";


import {renderDualPolyhedronFromPlanes, computeDualPolyhedronFromFacePlanes} from "./makedual.js";
import {KeyboardListener} from "./keyboardlistener.js";
import {displayWireframeAsSelected, displayWireframeAsDeselected, 
updatePlaneDebugRectangles, createDebugPlaneMeshes, showDebugPlanes, hideDebugPlanes
} from "./visualizeObjectThree.js";

import {allPossibleEdgeCrossingPairs, triangleFaceIndexDigits} from "./knownmathematicalsymmetry.js";
import {countCrossings, maximizeThisToReduceCrossings} from "./edgeDetection.js";

import {reallyDumbStartParameters, reallyDumbPlaneMaker, oneRoundGradientAscent, maximizeThisFromPlanes, planesToReallyDumbStartParameters, oneRoundRandomChoice} from "./gradientascent.js";


import {computeInitialDualPlaneList, applyTetrahedralishSymmetryAndOverwritePlanes, } from "./chooseStartPlanes.js";

import {matrixForRotationAboutAxis} from "./polyhedramath.js";

import {setPlanesIfProvidedFromURL} from "./premade_selections.js";

class Editor extends HandholdahedronVizualizer{
    constructor(){
        super();
        this.key = new KeyboardListener();
        this.meshesNeedUpdate = true;
        this.meshesInScene = false;

        createDebugPlaneMeshes(this.planeList, this.three.scene);

        this.selectedPlanes = new Set();

        for(let i=0;i<12;i++){
            let selectedCheckbox = document.getElementById("plane"+i);
            selectedCheckbox.checked = false;
            selectedCheckbox.addEventListener("click", () => this.togglePlaneSelection(i))
        }

        //toggle debug planes
        let debugPlaneCheckbox = document.getElementById("debugplanebtn");
        debugPlaneCheckbox.checked = false;
        hideDebugPlanes();
        debugPlaneCheckbox.addEventListener("click", () => {
            if(debugPlaneCheckbox.checked){
                showDebugPlanes();
            }else{
                hideDebugPlanes();
            }
        })

        let wireframesCheckbox = document.getElementById("togglewireframes");
        wireframesCheckbox.checked = true;
        wireframesCheckbox.addEventListener("click", () => this.setWireframesVisibility(wireframesCheckbox.checked))

        let toggleFacesCheckbox = document.getElementById("togglefaces");
        toggleFacesCheckbox.checked = true;
        toggleFacesCheckbox.addEventListener("click", () => this.setFacesVisibility(toggleFacesCheckbox.checked))

        //used for keyboard rotate controls
        this.keyboardAction = "rotate"
        this.update();

        this.selectOnePlaneToEdit(0);

        setPlanesIfProvidedFromURL(this);
    }
    updateMeshesFromPlanes(){
        if(!this.meshesNeedUpdate){
            return
        }

        if(this.meshesInScene){
            for(let i=0;i<this.handholdahedronMeshes.all.length;i++){
                this.three.scene.remove(this.handholdahedronMeshes.all[i]);
            }
            this.meshesInScene = false;
        }

        this.handholdahedronMeshes = renderDualPolyhedronFromPlanes(this.planeList);
        for(let i=0;i<this.handholdahedronMeshes.all.length;i++){
            this.three.scene.add(this.handholdahedronMeshes.all[i]);
        }

        updatePlaneDebugRectangles(this.planeList);
        this.updateUI();
        
        this.meshesInScene = true;
        this.meshesNeedUpdate = false;
    }
    update(){
        for(let planeIndex of this.selectedPlanes){
            if(this.keyboardAction == 'move'){
                this.movePlaneWithArrowKeys(this.planeList[planeIndex]);    
            }else{
                this.rotatePlaneWithArrowKeys(this.planeList[planeIndex]);    
            }
        }
        this.updateMeshesFromPlanes();
        window.requestAnimationFrame(this.update.bind(this));
    }
    toggleKeyboardMode(){
        //switch between rotating with arrow keys and moving with arrow keys
        if(this.keyboardAction == 'move'){
            this.keyboardAction = "rotate";
            document.getElementById("movecontrols").style.display = "none";
            document.getElementById("rotatecontrols").style.display = "";
        }else{
            this.keyboardAction = 'move'
            document.getElementById("movecontrols").style.display = "";
            document.getElementById("rotatecontrols").style.display = "none";
        }
    }
    movePlaneWithArrowKeys(plane){
        if(this.key.left || this.key.a){
            plane.normal.applyMatrix3(this.rotateAroundX);
            this.meshesNeedUpdate = true;
        }
        if(this.key.right || this.key.d){
            plane.point.x += 0.1;
            this.meshesNeedUpdate = true;
        }
        if(this.key.up || this.key.w){
            plane.point.y += 0.1;
            this.meshesNeedUpdate = true;
        }
        if(this.key.down || this.key.s){
            plane.point.y -= 0.1;
            this.meshesNeedUpdate = true;
        }
        if(this.key.q){
            plane.point.z += 0.1;
            this.meshesNeedUpdate = true;
        }
        if(this.key.e){
            plane.point.z -= 0.1;
            this.meshesNeedUpdate = true;
        }

        if(this.symmetryOverwritingEnabled){
            this.applySymmetry();
        }
    }
    rotatePlaneWithArrowKeys(plane){
        this.rotationSpeed = Math.PI/60/10;
        if(this.key.left || this.key.a){
            plane.normal.applyMatrix3(matrixForRotationAboutAxis(new THREE.Vector3(1,0,0), -this.rotationSpeed));
            this.meshesNeedUpdate = true;
        }
        if(this.key.right || this.key.d){
            plane.normal.applyMatrix3(matrixForRotationAboutAxis(new THREE.Vector3(1,0,0), this.rotationSpeed));
            this.meshesNeedUpdate = true;
        }
        if(this.key.up || this.key.w){
            plane.normal.applyMatrix3(matrixForRotationAboutAxis(new THREE.Vector3(0,1,0), this.rotationSpeed));
            this.meshesNeedUpdate = true;
        }
        if(this.key.down || this.key.s){
            plane.normal.applyMatrix3(matrixForRotationAboutAxis(new THREE.Vector3(0,1,0), -this.rotationSpeed));
            this.meshesNeedUpdate = true;
        }
        if(this.key.q){
            plane.normal.applyMatrix3(matrixForRotationAboutAxis(new THREE.Vector3(0,0,1), this.rotationSpeed));
            this.meshesNeedUpdate = true;
        }
        if(this.key.e){
            plane.normal.applyMatrix3(matrixForRotationAboutAxis(new THREE.Vector3(0,0,1), -this.rotationSpeed));
            this.meshesNeedUpdate = true;
        }

        if(this.symmetryOverwritingEnabled){
            this.applySymmetry();
        }
    }
    selectOnePlaneToEdit(planeIndex){
        //planeIndex is 0-11

        let plane = this.planeList[planeIndex];
        this.selectedPlanes.clear();
        this.selectedPlanes.add(planeIndex);

        this.onSelectPlane(planeIndex);
        this.updateUI();
    }
    togglePlaneSelection(planeIndex){
        if(this.selectedPlanes.has(planeIndex)){
            //plane is being deselected
            this.onDeselectPlane(planeIndex);
            this.selectedPlanes.delete(planeIndex);
        }
        else{
            //plane is being selected
            this.onSelectPlane(planeIndex);
            this.selectedPlanes.add(planeIndex);
        }
        this.updateUI();
    }    

    setFacesVisibility(isVisible){
        this.handholdahedronMeshes.faces.forEach((mesh) => {mesh.visible = isVisible});
        this.handholdahedronMeshes.vertexSpheres.forEach((mesh) => {mesh.visible = isVisible});
    }
    setWireframesVisibility(isVisible){
        this.handholdahedronMeshes.faceWireframes.forEach((mesh) => {mesh.visible = isVisible});
    }

    countEdgeCrossings(){
        let dualPolyhedronData = computeDualPolyhedronFromFacePlanes([[],[],[],[],[],[],[],[],[],[],[],[]], triangleFaceIndexDigits, this.planeList);
        let dualVertices = dualPolyhedronData[0], dualFaces = dualPolyhedronData[1];

        return countCrossings(dualVertices, allPossibleEdgeCrossingPairs);
    }

    initGradientAscent(){
        this.gradientAscentParameters = planesToReallyDumbStartParameters(this.planeList);
        this.planeList = reallyDumbPlaneMaker(this.gradientAscentParameters);
        this.meshesNeedUpdate = true;
        this.numAscentIterations = 0;
    }


    gradientAscent(){
        let optimizationFunction = maximizeThisFromPlanes(this.planeList);

        function testingFunction(parameters){
            let planeList = reallyDumbPlaneMaker(parameters);
            return maximizeThisFromPlanes(planeList);
        }

        let stepSize = 0.00001;

        this.gradientAscentParameters = oneRoundGradientAscent(this.gradientAscentParameters, testingFunction, stepSize)
        this.planeList = reallyDumbPlaneMaker(this.gradientAscentParameters);
        this.meshesNeedUpdate = true;

        this.numAscentIterations += 1;
    }
    randomAscent(){
        let optimizationFunction = maximizeThisFromPlanes(this.planeList);

        function testingFunction(parameters){
            let planeList = reallyDumbPlaneMaker(parameters);
            return maximizeThisFromPlanes(planeList);
        }

        let stepSize = 0.1;

        this.gradientAscentParameters = oneRoundRandomChoice(this.gradientAscentParameters, testingFunction, stepSize)
        this.planeList = reallyDumbPlaneMaker(this.gradientAscentParameters);
        this.meshesNeedUpdate = true;

        this.numAscentIterations += 1;
    }

    toggleAscent(){
        if(this.gradientAscentParameters === undefined){
            this.initGradientAscent();
        }

        if(!this.runningAscent){
            this.runningAscent = true;
            this.doAscent();
        }else{
            this.runningAscent = false;
        }
    }

    doAscent(){
        if(!this.runningAscent)return;

        this.gradientAscent();
        //this.randomAscent();

        if(this.numAscentIterations % 1000 != 999){
            window.requestAnimationFrame(this.doAscent.bind(this))
        }

        document.getElementById("numIterations").innerHTML = this.numAscentIterations;
        document.getElementById("maximizingValue").innerHTML = maximizeThisFromPlanes(this.planeList);
    }

    startPlaneSearch(limit){
        //keep trying one random handholdahedron per frame until we find one or your browser crashes.
        if(limit === undefined){
            limit = 15;
        }
        this.maxIntersectionsToHuntFor = limit;
        this.doPlaneSearch()
    }

    doPlaneSearch(limit){
        //keep trying one random handholdahedron per frame until we find one or your browser crashes.

        let startingPlaneList = computeInitialDualPlaneList();
        this.planeList = computeInitialDualPlaneList();
        this.meshesNeedUpdate = true;
        this.updateMeshesFromPlanes();

        if(this.countEdgeCrossings() >= this.maxIntersectionsToHuntFor){
            window.setTimeout(this.doPlaneSearch.bind(this), 1);
        }

    }

    applySymmetry(){
    //make planes 1-11 rotated copies of plane #0
        applyTetrahedralishSymmetryAndOverwritePlanes(this.planeList)
    }
    


    exportData(){
        let planes = this.planeList.map(
            (plane) => ({point: plane.point.toArray(), normal: plane.normal.toArray()})
        )


        let dualPolyhedronData = computeDualPolyhedronFromFacePlanes([[],[],[],[],[],[],[],[],[],[],[],[]], triangleFaceIndexDigits, this.planeList);
        let dualVertices = dualPolyhedronData[0], dualFaces = dualPolyhedronData[1];

        let data = {"planeList":planes, "vertices":dualVertices, "faces": dualFaces}

        if(this.gradientAscentParameters !== undefined){
            data.gradientAscentParameters = this.gradientAscentParameters;
        }
    
        let planeString = JSON.stringify(data);
        alert(planeString);
    }

    importPlaneList(){
        let planeString = prompt("Enter a JSON plane list here:");
        let data = null;
        try{
            data = JSON.parse(planeString);
        }catch(e){
            alert("Something went wrong!" + e)
        }
        this.importData(data);
    }

    importData(data){
        let planeData = data.planeList;
        for(let i=0;i<planeData.length;i++){
            this.planeList[i].point.set(...planeData[i].point);
            this.planeList[i].normal.set(...planeData[i].normal);
        }

        if(data.gradientAscentParameters !== undefined){
            this.gradientAscentParameters = data.gradientAscentParameters;
        }

        this.meshesNeedUpdate = true;
    }

    onSelectPlane(planeIndex){
        displayWireframeAsSelected(planeIndex);

        let selectedCheckbox = document.getElementById("plane"+planeIndex);
        selectedCheckbox.checked = true;
    }
    onDeselectPlane(planeIndex){
        displayWireframeAsDeselected(planeIndex);
        
        let selectedCheckbox = document.getElementById("plane"+planeIndex);
        selectedCheckbox.checked = false;
    }
    updateUI(){
        document.getElementById("selectedPlane").innerHTML = "";
        for(let planeIndex of this.selectedPlanes){
            document.getElementById("selectedPlane").innerHTML += planeIndex + ",";
        }

        document.getElementById("crossingCount").innerHTML = this.countEdgeCrossings();
    }
}



window.addEventListener("load",function(){
    window.editor = new Editor();
});

