import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const CarCustomizer = () => {
    const mountRef = useRef(null);  // Referência para o div do canvas
    const colorInputRef = useRef(null);  // Referência para o input de cor

    useEffect(() => {
        // Configurar cena, câmera e renderizador
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true }); // Fundo transparente
        renderer.setClearColor(0x000000, 0); // Define a transparência

        // Adicionar o renderizador ao DOM
        mountRef.current.appendChild(renderer.domElement);

        const { clientWidth, clientHeight } = mountRef.current;
        renderer.setSize(clientWidth, clientHeight);

        // Adicionar controles de câmera
        const controls = new OrbitControls(camera, renderer.domElement);

        // Adicionar luz à cena
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(1, 1, 1).normalize();
        scene.add(light);

        // Adiciona uma grade para orientação
        const gridHelper = new THREE.GridHelper(10, 10);
        scene.add(gridHelper);

        // Carregar o modelo GLTF do carro
        const loader = new GLTFLoader();
        let car;
        loader.load('./car.glb', function (gltf) {
            car = gltf.scene;
            scene.add(car);
            camera.position.set(0, 2, 5);  // Ajuste a posição da câmera para ver o carro
        });

        // Função para animar a cena
        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        // Alterar a cor do carro ao escolher uma nova cor
        const handleColorChange = (event) => {
            const newColor = event.target.value;
            if (car) {
                car.traverse((child) => {
                    if (child.isMesh) {
                        child.material.color.set(newColor);  // Altera a cor do material do carro
                    }
                });
            }
        };

        // Evento de alteração de cor
        colorInputRef.current.addEventListener('input', handleColorChange);

        // Limpeza do efeito ao desmontar o componente
        return () => {
            mountRef.current.removeChild(renderer.domElement);
            colorInputRef.current.removeEventListener('input', handleColorChange);
        };
    }, []);

    return (
        <div>
            <div ref={mountRef} style={{ width: '100vw', height: '100vh' }}></div>
            <div id="options" style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1 }}>
                <label htmlFor="color">Escolha a cor:</label>
                <input ref={colorInputRef} type="color" id="color" />
            </div>
        </div>
    );
};

export default CarCustomizer;
