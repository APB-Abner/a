import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import HdriPath from '../assets/hdri.hdr';


const GLBViewer = ({ modelo, scale }) => {
  const mountRef = useRef(null); // Referência para o DOM onde será renderizada a cena

  // Estados para armazenar cores e materiais
  const [primaryColor, setPrimaryColor] = useState('#ff0000'); // Cor Primária
  const [decalColor, setDecalColor] = useState('#ffffff'); // Cor do Decalque
  const [paintMaterial, setPaintMaterial] = useState('metálico'); // Tipo de Material de Tinta
  const [decalTexture, setDecalTexture] = useState(null); // Decalque

  const carBodyRef = useRef(null); // Referência para armazenar a carroceria do carro
  const carDecalRef = useRef(null); // Referência para armazenar o decalque do carro

  useEffect(() => {
    // Configurar cena, câmera e renderizador
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    const back = new renderer.setClearColor(0x000000, 0); // Fundo transparente
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.set(20, 15, 20);

    // Carregar o HDRI como ambiente
    new RGBELoader().load(HdriPath, (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.background = back;
      scene.environment = texture;
    });

    // Carregar o modelo GLB
    const loader = new GLTFLoader();
    loader.load(modelo, (gltf) => {
      const model = gltf.scene;
      model.scale.set(scale, scale, scale);

      // Percorre cada parte do modelo para identificar carroceria e decalque
      model.traverse((child) => {
        if (child.isMesh) {
          if (child.name === 'Formula_E_Gen_3_Model_Scaled_1-32_1') {  // Identifique o nome da carroceria (ajuste para o nome real)
            carBodyRef.current = child;
            carBodyRef.current.material = new THREE.MeshStandardMaterial({ color: primaryColor });
          } else if (child.name === 'Decal') {  // Identifique o nome do decalque (ajuste para o nome real)
            carDecalRef.current = child;
            carDecalRef.current.material = new THREE.MeshBasicMaterial({
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
  }, [modelo, scale, HdriPath]);

  // Função para aplicar as personalizações no carro
  const applyCustomizations = () => {
    if (carBodyRef.current) {
      // Aplicar cor primária e material
      carBodyRef.current.material.color.set(primaryColor);
      switch (paintMaterial) {
        case 'metálico':
          carBodyRef.current.material.metalness = 1;
          carBodyRef.current.material.roughness = 0.2;
          break;
        case 'fosco':
          carBodyRef.current.material.metalness = 0;
          carBodyRef.current.material.roughness = 1;
          break;
        case 'perolado':
          carBodyRef.current.material.metalness = 0.3;
          carBodyRef.current.material.roughness = 0.3;
          break;
        default:
          carBodyRef.current.material.metalness = 0.5;
          carBodyRef.current.material.roughness = 0.5;
      }
    }
    if (carDecalRef.current && decalTexture) {
      carDecalRef.current.material.map = decalTexture;
      carDecalRef.current.material.color.set(decalColor);
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

        {/* <label>Cor do Decalque:</label>
        <input type="color" value={decalColor} onChange={(e) => setDecalColor(e.target.value)} /> */}

        <label>Tipo de Material de Tinta:</label>
        <select value={paintMaterial} onChange={(e) => setPaintMaterial(e.target.value)}>
          <option value="metálico">Metálico</option>
          <option value="fosco">Fosco</option>
          <option value="perolado">Perolado</option>
        </select>

        {/* <label>Decalque:</label>
        <select onChange={handleDecalChange}>
          <option value="">Nenhum</option>
          <option value="/public/Animus GP/Animus GP Aquiline/body_focaccia_d.png">Decalque 1</option>
          <option value="/public/Animus GP/Animus GP Feral/body_focaccia_d.png">Decalque 2</option>
          <option value="/public/Animus GP/Animus GP L-ITA 99/body_focaccia_d.png">Decalque 3</option>
          <option value="/public/Animus GP/Animus GP Monza/body_focaccia_d.png">Decalque 4</option>
          <option value="/public/Animus GP/Animus GP Necro/body_focaccia_d.png">Decalque 5</option>
        </select> */}
      </div>
    </div>
  );
};
GLBViewer.propTypes = {
  modelo: PropTypes.string.isRequired,
  scale: PropTypes.number.isRequired,
};

export default GLBViewer;


