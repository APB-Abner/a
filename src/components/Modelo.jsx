import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const GLBViewer = ({ modelo, scale }) => {
  const mountRef = useRef(null); // Referência para o DOM onde será renderizada a cena

  // Estados para armazenar cores e materiais
  const [primaryColor, setPrimaryColor] = useState('#ff0000'); // Cor Primária
  const [decalColor, setDecalColor] = useState('#ffffff'); // Cor do Decalque
  const [paintMaterial, setPaintMaterial] = useState('metálico'); // Tipo de Material de Tinta
  const [decalTexture, setDecalTexture] = useState(null); // Decalque

  let carBody = null; // Variável para armazenar a carroceria do carro
  let carDecal = null; // Variável para armazenar o decalque do carro

  useEffect(() => {
    // Configurar cena, câmera e renderizador
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setClearColor(0x000000, 0); // Fundo transparente

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

    // Carregar o modelo GLB
    const loader = new GLTFLoader();
    loader.load(modelo, (gltf) => {
      const model = gltf.scene;
      model.scale.set(scale, scale, scale);

      // Percorre cada parte do modelo para identificar carroceria e decalque
      model.traverse((child) => {
        if (child.isMesh) {
          if (child.name === 'CarBody') {  // Identifique o nome da carroceria (ajuste para o nome real)
            carBody = child;
            carBody.material = new THREE.MeshStandardMaterial({ color: primaryColor });
          } else if (child.name === 'Decal') {  // Identifique o nome do decalque (ajuste para o nome real)
            carDecal = child;
            carDecal.material = new THREE.MeshBasicMaterial({
              map: decalTexture,
              color: decalColor,
              transparent: true,
              opacity: 0.7,
            });
          }
        }
      });

      // Adiciona o modelo à cena
      scene.add(model);
      applyCustomizations();
    });

    camera.position.set(20, 15, 20);
    camera.lookAt(0, 0, 10);

    // Função de animação
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
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

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [modelo, scale]);

  // Função para aplicar as personalizações no carro
  const applyCustomizations = () => {
    if (carBody) {
      // Aplicar cor primária e material
      carBody.material.color.set(primaryColor);
      switch (paintMaterial) {
        case 'metálico':
          carBody.material.metalness = 1;
          carBody.material.roughness = 0.2;
          break;
        case 'fosco':
          carBody.material.metalness = 0;
          carBody.material.roughness = 1;
          break;
        case 'perolado':
          carBody.material.metalness = 0.3;
          carBody.material.roughness = 0.3;
          break;
        default:
          carBody.material.metalness = 0.5;
          carBody.material.roughness = 0.5;
      }
    }
    if (carDecal && decalTexture) {
      carDecal.material.map = decalTexture;
      carDecal.material.color.set(decalColor);
    }
  };

  useEffect(() => {
    applyCustomizations();
  }, [primaryColor, decalColor, paintMaterial, decalTexture]);

  // Carregar decalques ao mudar o estado
  const handleDecalChange = (event) => {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(event.target.value);
    setDecalTexture(texture);
  };

  return (
    <div>
      <div ref={mountRef} style={{ width: '100vw', height: '100vh', margin: '0 auto' }}></div>
      <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1 }}>
        <label>Cor Primária:</label>
        <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />

        <label>Cor do Decalque:</label>
        <input type="color" value={decalColor} onChange={(e) => setDecalColor(e.target.value)} />

        <label>Tipo de Material de Tinta:</label>
        <select value={paintMaterial} onChange={(e) => setPaintMaterial(e.target.value)}>
          <option value="metálico">Metálico</option>
          <option value="fosco">Fosco</option>
          <option value="perolado">Perolado</option>
        </select>

        <label>Decalque:</label>
        <select onChange={handleDecalChange}>
          <option value="">Nenhum</option>
          <option value="decal1.jpg">Decalque 1</option>
          <option value="decal2.jpg">Decalque 2</option>
        </select>
      </div>
    </div>
  );
};

export default GLBViewer;
