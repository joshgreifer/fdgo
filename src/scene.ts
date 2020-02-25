import * as THREE from 'three';
import {Intersection, Material, Vector3} from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";

export class Scene
{
    protected scene: THREE.Scene;
    protected renderer: THREE.WebGLRenderer;
    protected camera: THREE.PerspectiveCamera;

    protected raycaster: THREE.Raycaster;

    protected mouse_intersects: THREE.Intersection[] = [];

    private readonly animate: (time: number) => void;

    protected updateScene: (scene: THREE.Scene, time: number) => void = (scene: THREE.Scene, time) => {};

    constructor(protected canvasElement : HTMLCanvasElement) {
        const scene  =  this.scene = new THREE.Scene();
        const renderer = this.renderer = new THREE.WebGLRenderer({canvas: canvasElement});
        const camera = this.camera = new THREE.PerspectiveCamera(75, 2.0, 0.1, 1000);

        const raycaster = this.raycaster = new THREE.Raycaster();

        const mouse_coords = new THREE.Vector2();

        renderer.setSize(canvasElement.clientWidth, canvasElement.clientHeight, false);

        function resizeRendererToDisplaySize(renderer: THREE.WebGLRenderer) {

            const canvas = canvasElement; // == renderer.domElement;
            const pixelRatio = window.devicePixelRatio;
            const width = canvas.clientWidth * pixelRatio | 0;
            const height = canvas.clientHeight * pixelRatio | 0;
            const needResize = canvas.width !== width || canvas.height !== height;
            if (needResize) {
                renderer.setSize(width, height, false);
            }
            return needResize;
        }

        // https://threejs.org/docs/#api/en/core/Raycaster
        canvasElement.onmousemove = (event: MouseEvent) => {
            // calculate mouse position in normalized device coordinates
            // (-1 to +1) for both components

            mouse_coords.x = ( event.offsetX  / canvasElement.clientWidth) * 2 - 1;
            mouse_coords.y = - ( event.offsetY / canvasElement.clientHeight) * 2 + 1;

        };

        // canvasElement.onmouseup = (event: MouseEvent) => {
        //     mouse_coords.x = mouse_coords.y = 9999;
        // };
        this.animate = (time: number) => {

            time *= 0.001;  // convert time to seconds
            const canvas = renderer.domElement;


            if (resizeRendererToDisplaySize(renderer)) {
                const canvas = renderer.domElement;
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
                camera.updateProjectionMatrix();
            }

            // update the picking ray with the camera and mouse position
            raycaster.setFromCamera(mouse_coords, camera);

            // calculate objects intersecting the picking ray
            this.mouse_intersects = raycaster.intersectObjects(scene.children, true);


            this.updateScene(scene, time);

            renderer.render( scene, camera );

            requestAnimationFrame( this.animate );
        }
    }


    startAnimation() {
        requestAnimationFrame( this.animate );
    }
}

// https://threejsfundamentals.org/threejs/lessons/threejs-scenegraph.html
export class SolarSystemScene extends Scene
{
    constructor(canvas : HTMLCanvasElement) {
        super(canvas);
        const scene = this.scene;
        const camera = this.camera;

        // Change the camera fov to 40 from its default of 70
        camera.fov = 40;
        camera.position.set(0, 50, 0);
        camera.up.set(0, 0, 1);
        camera.lookAt(0, 0, 0);

        {
            const color = 0xFFFFFF;
            const intensity = 3;
            const light = new THREE.DirectionalLight(color, intensity);
            scene.add(light);
        }

        // an array of objects who's rotation to update
        const objects: THREE.Object3D[] = [];

        const radius = 1;
        const widthSegments = 6;
        const heightSegments = 6;
        const sphereGeometry = new THREE.SphereBufferGeometry(
            radius, widthSegments, heightSegments);

        const solarSystem = new THREE.Object3D();
        scene.add(solarSystem);
        objects.push(solarSystem);

        const sunMaterial = new THREE.MeshPhongMaterial({emissive: 0xFFFF00});
        const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);
        sunMesh.scale.set(5, 5, 5);
        solarSystem.add(sunMesh);
        objects.push(sunMesh);

        const earthOrbit = new THREE.Object3D();
        earthOrbit.position.x = 10;
        solarSystem.add(earthOrbit);
        objects.push(earthOrbit);

        const earthMaterial = new THREE.MeshPhongMaterial({color: 0x2233FF, emissive: 0x112244});
        const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);
        earthOrbit.add(earthMesh);
        objects.push(earthMesh);

        const moonOrbit = new THREE.Object3D();
        moonOrbit.position.x = 2;
        earthOrbit.add(moonOrbit);

        const moonMaterial = new THREE.MeshPhongMaterial({color: 0x888888, emissive: 0x222222});
        const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);
        moonMesh.scale.set(.5, .5, .5);
        moonOrbit.add(moonMesh);
        objects.push(moonMesh);

        // add an AxesHelper to each node
        for (const node of objects) {

            const axes = new THREE.AxesHelper();
            if (axes.material instanceof Material) {
                axes.material.depthTest = false;
            }
            axes.renderOrder = 1;
            node.add(axes);
        }
        this.updateScene = (scene: THREE.Scene, time: number) => {
            for (const obj of objects)
                obj.rotation.y = time;
        }
    }

}
// extended from https://threejsfundamentals.org/threejs/lessons/threejs-primitives.html
export class TestScene extends Scene
{

    constructor(canvasElement : HTMLCanvasElement) {
        super(canvasElement);

        const scene = this.scene;


        const geometry = new THREE.BoxBufferGeometry();


        const objects: THREE.Object3D[] = [];

        const cubes: THREE.Object3D[] = [
            this.makeCube(geometry, 0x44aa88,  0),
            this.makeCube(geometry, 0x8844aa, -2),
            this.makeCube(geometry, 0xaa8844,  2),
        ];

        objects.push(...cubes);

        let text: THREE.Object3D | undefined;

       (async () => {
           text  = await this.createTextObject('FD Go © 2020 Josh Greifer');
           text.position.x = 5;
           text.position.y = -2;
           text.position.z = -5;
           text.rotation .y = .6;
           text.scale.set(0.3, 0.3, 0.3);
           scene.add(text);
       })();


        const light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
        light.position.set(-1, 2, 4);

        objects.push(light);

        scene.background = new THREE.Color(0xaaaaaa);

        this.camera.position.z = 10;

        for (const obj of objects)
            scene.add( obj );

        this.updateScene = (scene: THREE.Scene, time: number) => {

            let speed = 1;
            for (const cube of cubes) {
                cube.rotation.y = cube.rotation.x = time * speed++ / 10;

            }
            if (text)
                text.rotation.y = -time * speed++ / 10;

        }
    }



    private async loadFont(fontName: string) : Promise<THREE.Font> {
        const url = '/fonts/json/' + fontName +'.json';
        const loader = new THREE.FontLoader();
        return new Promise((resolve, reject) => {
            loader.load(url, resolve, undefined, reject);
        });
    }

    makeCube(geometry: THREE.Geometry | THREE.BufferGeometry, color: number, x: number): THREE.Mesh {
        const material = new THREE.MeshPhongMaterial({color});

        const cube = new THREE.Mesh(geometry, material);

        cube.position.x = x;

        return cube;
    }

    createMaterial() {
        const material = new THREE.MeshPhongMaterial({
            side: THREE.DoubleSide,
        });

        const hue = Math.random();
        const saturation = 1;
        const luminance = .5;
        material.color.setHSL(hue, saturation, luminance);

        return material;
    }

    async  createTextObject(text: string) : Promise<THREE.Object3D> {
        const font = await this.loadFont('Arial Black_Regular');
        const geometry = new THREE.TextBufferGeometry(text, {
            font: font,
            size: 5.0,
            height: .2,
            curveSegments: 24,
            bevelEnabled: true,
            bevelThickness: 0.15,
            bevelSize: .3,
            bevelSegments: 15,
        });

 //       addSolidGeometry(-.5, 0, geometry);

        const mesh = new THREE.Mesh(geometry, this.createMaterial());
        geometry.computeBoundingBox();
        geometry.boundingBox.getCenter(mesh.position).multiplyScalar(-1);


        const parent = new THREE.Object3D();
        parent.add(mesh);

        return parent;
    }

}
