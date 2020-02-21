import * as THREE from 'three';


export default class GameScene
{

    constructor(canvasElement : HTMLCanvasElement) {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, 2.0, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({canvas: canvasElement});
        canvasElement.style.width = canvasElement.style.height = '';

        renderer.setSize(canvasElement.clientWidth, canvasElement.clientHeight, false);

        const geometry = new THREE.BoxGeometry();

        function makeCube(geometry: THREE.Geometry, color: number, x: number): THREE.Mesh {
            const material = new THREE.MeshPhongMaterial({color});

            const cube = new THREE.Mesh(geometry, material);

            cube.position.x = x;

            return cube;
        }

        function resizeRendererToDisplaySize(renderer: THREE.WebGLRenderer) {

            const canvas = canvasElement; // renderer.domElement;
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            const needResize = canvas.width !== width || canvas.height !== height;
            if (needResize) {
                renderer.setSize(width, height, false);
            }
            return needResize;
        }

        const cubes = [
            makeCube(geometry, 0x44aa88,  0),
            makeCube(geometry, 0x8844aa, -2),
            makeCube(geometry, 0xaa8844,  2),
        ];

        for (const cube of cubes)
            scene.add( cube );


        const light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
        light.position.set(-1, 2, 4);

        scene.add(light);

        camera.position.z = 5;

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
             renderer.render( scene, camera );

            requestAnimationFrame( this.animate );
        }
    }
    private animate: (time: number) => void;

    startAnimation() {
        requestAnimationFrame( this.animate );
    }



}