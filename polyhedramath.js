
import * as THREE from "./lib/three.module.js";
window.THREE = THREE;

export function dot(a,b){
   return a.dot(b);
}
export function cross(a,b){
  return new THREE.Vector3().crossVectors(a,b);
}

export class Plane{
    constructor(onePoint, normalDirection){
        this.point = onePoint.constructor === Array ? new THREE.Vector3(...onePoint) : onePoint.clone();
        this.normal = normalDirection.constructor === Array ? new THREE.Vector3(...normalDirection) : normalDirection.clone();
        this.normal.normalize();
    }

    intersectWithTwoOtherPlanes(planeB,planeC){
        let planeA = this;

        // condition for pt being on a plane{ 
        // (pt - pointOnPlane) dot normal = 0?
        /*
        [[pt-planeA.point] dot [plane1NormalX, plane2NormalX...   ] = [0
        [pt-planeB.point]      plane1NormalY                           0
        [pt-planeC.point]]                                             0]
        '''

        '''
        [normal1X, normal1Y,normal1Z, (planeA.point dot planeA.normal), dot [x,y,z] = [0,0,0]
        normal2,
        normal3]
        */
        // grabbed from https{//math.stackexchange.com/questions/1380472/intersection-of-three-planes-proof because it's been a while since I did linear algebra
        //point = (this.pointNormalDist (u2 cross u3) + d2(u3 cross u1) + d3(u1 cross u2))/(u1 dot (u2 cross u3)

        let tripleProduct = dot(planeA.normal,cross(planeB.normal,planeC.normal))

        let point = cross(planeB.normal,planeC.normal).multiplyScalar(dot(planeA.point,planeA.normal))
             .add(cross(planeC.normal,planeA.normal).multiplyScalar(dot(planeB.point,planeB.normal)))
             .add(cross(planeA.normal,planeB.normal).multiplyScalar(dot(planeC.point,planeC.normal)));

        point.divideScalar(tripleProduct);

        return point.toArray();
    }
}

export class Polyhedron{
    constructor(verts, faces){
        //new Polyhedron(verts, faces)
        if(faces !== undefined){
            this.verts = verts;
            this.faces = faces;
        }else{
            //new Polyhedron({verts: [], faces: []})
            let data = verts;
            this.verts = data.verts;
            this.faces = data.faces;
        }
    }
}

export function matrixForRotationAboutAxis(axis, angle){
    if(angle === undefined){
        angle = Math.PI; //180 degrees
    }
    let mat4 = new THREE.Matrix4().makeRotationAxis(axis, angle);
    return new THREE.Matrix3().setFromMatrix4(mat4);
}
