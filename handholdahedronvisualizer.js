import {setupThree, ThreeasyEnvironment, ThreeasyRecorder} from "./lib/three_bootstrap.js";
import {OrbitControls} from "./lib/OrbitControls.js";

import {computeInitialDualPlaneList} from "./chooseStartPlanes.js";
import {renderDualPolyhedronFromPlanes} from "./makedual.js";

import * as THREE from "./lib/three.module.js";

export class HandholdahedronVizualizer{
    constructor(){

        this.setupThreeJS();

        let startingPlaneList = computeInitialDualPlaneList();
        this.planeList = startingPlaneList;
        this.updateMeshesFromPlanes();
    }
    updateMeshesFromPlanes(){
        this.handholdahedronMeshes = renderDualPolyhedronFromPlanes(this.planeList);
        for(let i=0;i<this.handholdahedronMeshes.length;i++){
            this.three.scene.add(this.handholdahedronMeshes[i]);
        }
    }
    setupThreeJS(){
	    this.three = setupThree(60,15,document.getElementById("canvas"));
	    this.controls = new OrbitControls(this.three.camera,this.three.renderer.domElement);
        this.controls.enableKeys = false;

	    this.three.camera.position.z = 20;
	    this.three.camera.position.y = -20;
        this.three.camera.lookAt(new THREE.Vector3())

        //add lights
	    //three.scene.add( new THREE.AmbientLight( 0x443333 ) );
	    this.three.scene.add( new THREE.AmbientLight( 0xaaaaaa ) );

	    var light1 = new THREE.DirectionalLight( 0xffddcc, 0.5 );
	    light1.position.set( 1, 0.75, 0.5 );
	    this.three.scene.add( light1 );

	    var light2 = new THREE.DirectionalLight( 0xccccff, 0.5 );
	    light2.position.set( - 1, 0.75, - 0.5 );
	    this.three.scene.add( light2 );

	    this.raycaster = new THREE.Raycaster();


        // a ground plane
        var planeGeometry = new THREE.PlaneGeometry(50,50,50);
        var mesh = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial({color: Math.random()*0x000000, side: THREE.DoubleSide, wireframe: true}));
        mesh.rotation.z = Math.PI/2;
        this.three.scene.add(mesh);
    }

}

