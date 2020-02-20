import * as THREE from 'three';


export default class GameScene
{

    constructor(sceneContainerElement : HTMLDivElement) {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, 2.0, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(sceneContainerElement.clientWidth, sceneContainerElement.clientHeight);
        sceneContainerElement.appendChild(renderer.domElement);

        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshPhongMaterial( { color: 0x44aa88 } );
        const cube = new THREE.Mesh( geometry, material );

        scene.add( cube );


        const light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
        light.position.set(-1, 2, 4);

        scene.add(light);

        camera.position.z = 5;

        this.animate = (time: number) => {
            time *= 0.001;  // convert time to seconds
            renderer.render( scene, camera );
            cube.rotation.x = time;
            cube.rotation.y = time;
            requestAnimationFrame( this.animate );
        }
    }
    private animate: (time: number) => void;

    startAnimation() {
        requestAnimationFrame( this.animate );
    }



}