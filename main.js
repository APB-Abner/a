import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';



// Cena e renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true }); // Fundo transparente
renderer.setClearColor(0x000000, 0); // Define a transparência


const { clientWidth, clientHeight } = window.innerWidth;
renderer.setSize(clientWidth, clientHeight);

// Adicionar controles de câmera
const controls = new OrbitControls(camera, renderer.domElement);

// Adicionar luz à cena
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1).normalize();
scene.add(light);
// Criar uma grade de 10x10 unidades com divisões a cada 1 unidade
const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);

// Carregar o modelo GLTF
const loader = new THREE.GLTFLoader();
let car;
loader.load('./car.glb', function (gltf) {
    car = gltf.scene;
    scene.add(car);
    camera.position.set(0, 2, 5);
    animate();
});

// Função para animar a cena
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Modificar cor do carro
document.getElementById('color').addEventListener('input', function (event) {
    const newColor = event.target.value;

    if (car) {
        car.traverse(function (child) {
            if (child.isMesh) {
                child.material.color.set(newColor); // Aplica a cor
            }
        });
    }
});
