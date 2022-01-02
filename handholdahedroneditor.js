import {HandholdahedronVizualizer} from "./handholdahedronvisualizer.js";


import {renderDualPolyhedronFromPlanes} from "./makedual.js";
import {KeyboardListener} from "./keyboardlistener.js";
import {displayWireframeAsSelected, displayWireframeAsDeselected, 
updatePlaneDebugRectangles, createDebugPlaneMeshes, showDebugPlanes, hideDebugPlanes
} from "./visualizeObjectThree.js";


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

        this.update();

        this.selectOnePlaneToEdit(0);

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
        
        this.meshesInScene = true;
        this.meshesNeedUpdate = false;
    }
    update(){
        for(let planeIndex of this.selectedPlanes){
            this.movePlaneWithArrowKeys(this.planeList[planeIndex]);
        }
        this.updateMeshesFromPlanes();
        window.requestAnimationFrame(this.update.bind(this));
    }
    movePlaneWithArrowKeys(plane){
        if(this.key.left || this.key.a){
            plane.point.x -= 0.1;
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

    exportPlaneList(){
        let planes = this.planeList.map(
            (plane) => ({point: plane.point.toArray(), normal: plane.normal.toArray()})
        )
    
        let planeString = JSON.stringify({"planeList":planes});
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
        let planeData = data.planeList;
        for(let i=0;i<planeData.length;i++){
            
            this.planeList[i].point.set(...planeData[i].point);
            this.planeList[i].normal.set(...planeData[i].normal);
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
    }
}



window.addEventListener("load",function(){
    window.editor = new Editor();
});

