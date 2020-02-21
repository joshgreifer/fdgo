import * as THREE from 'three';
import {Vector3} from "three";


export default class GameScene
{

    constructor(canvasElement : HTMLCanvasElement) {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, 2.0, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({canvas: canvasElement});
        canvasElement.style.width = canvasElement.style.height = '';

        renderer.setSize(canvasElement.clientWidth, canvasElement.clientHeight, false);

        const geometry = new THREE.BoxBufferGeometry();

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

        camera.position.z = 10;

        for (const obj of objects)
            scene.add( obj );

        this.animate = (time: number) => {
            time *= 0.001;  // convert time to seconds
            const canvas = renderer.domElement;


            if (resizeRendererToDisplaySize(renderer)) {
                const canvas = renderer.domElement;
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
                camera.updateProjectionMatrix();
            }

            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();

            let speed = 1;
            for (const cube of cubes) {
                cube.rotation.y = cube.rotation.x = time * speed++ / 10;

            }
            if (text)
                text.rotation.y = -time * speed++ / 10;

            renderer.render( scene, camera );

            requestAnimationFrame( this.animate );
        }
    }
    private readonly animate: (time: number) => void;

    startAnimation() {
        requestAnimationFrame( this.animate );
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