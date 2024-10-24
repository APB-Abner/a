import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const GLBViewer = ({ modelo, scale }) => {
  const mountRef = useRef(null); // Referência para o DOM onde será renderizada a cena
  const colorInputRef = useRef(null); // Referência para o input de cor
  let car = null; // Variável para armazenar o modelo do carro

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
    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);

    // Adiciona uma grade para orientação
    const gridHelper = new THREE.GridHelper(1000, 100);
    scene.add(gridHelper);

    // Carregar o modelo GLB
    const loader = new GLTFLoader();
    let mixer; // Armazenar o mixer de animações

    loader.load(modelo, (gltf) => {
      car = gltf.scene;

      // Ajustar a escala do modelo
      car.scale.set(scale, scale, scale);

      // Adicionar o modelo à cena
      scene.add(car);

      // Criar o mixer de animações
      mixer = new THREE.AnimationMixer(car);

      // Reproduzir a primeira animação (caso haja)
      if (gltf.animations.length > 0) {
        const action = mixer.clipAction(gltf.animations[0]);
        action.play();
      }
    });

    camera.position.set(20, 15, 20);
    camera.lookAt(0, 0, 10);

    // Função de animação
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);

      const delta = clock.getDelta();
      if (mixer) mixer.update(delta); // Atualizar as animações

      controls.update(); // Atualizar controles
      renderer.render(scene, camera); // Renderizar a cena
    };
    animate();

    // Ajustar o tamanho da janela
    const handleResize = () => {
      const { clientWidth, clientHeight } = mountRef.current;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    };
    window.addEventListener('resize', handleResize);

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

    // Cleanup: remover o evento e o renderizador ao desmontar o componente
    return () => {
      window.removeEventListener('resize', handleResize);

      // Verifica se mountRef ainda existe antes de tentar remover o domElement
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }

      // Remove o listener de cor
      if (colorInputRef.current) {
        colorInputRef.current.removeEventListener('input', handleColorChange);
      }
    };
  }, [modelo, scale]); // Atualiza o efeito ao mudar o modelo ou a escala

  return (
    <div>
      <div ref={mountRef} style={{ width: '100vw', height: '100vh', margin: '0 auto' }}></div>
      <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1 }}>
        <label htmlFor="color">Escolha a cor:</label>
        <input ref={colorInputRef} type="color" id="color" />
      </div>
    </div>
  );
};

export default GLBViewer;
