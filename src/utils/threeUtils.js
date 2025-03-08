import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

let scene, camera, renderer, controls, model;
let textureLoader;

export const initThreeScene = (container) => {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(5, 5, 5);

  renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: true 
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.toneMappingExposure = 1.0;
  
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
  directionalLight.position.set(5, 10, 7);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);

  textureLoader = new THREE.TextureLoader();

  const handleResize = () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  };
  window.addEventListener('resize', handleResize);

  const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };
  animate();

  return {
    scene,
    camera,
    renderer,
    controls,
    cleanup: () => {
      window.removeEventListener('resize', handleResize);
      
      if (model) {
        scene.remove(model);
        model = null;
      }
      
      renderer.dispose();
      controls.dispose();
    }
  };
};

export const loadFBXModel = (url, sceneRef) => {
  return new Promise((resolve, reject) => {
    if (model) {
      scene.remove(model);
      model = null;
    }
    
    const loader = new FBXLoader();
    loader.load(
      url,
      (fbx) => {
        console.log('Model loaded successfully:', fbx);
        
        model = new THREE.Group();
        
        const box = new THREE.Box3().setFromObject(fbx);
        const center = box.getCenter(new THREE.Vector3());
        
        fbx.position.sub(center);
        
        model.add(fbx);
        
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 10) {
          const scale = 10 / maxDim;
          model.scale.set(scale, scale, scale);
        }
        
        scene.add(model);
        
        controls.reset();
        
        const objects = [];
        fbx.traverse((child) => {
          if (child.isMesh) {
            child.userData.originalMaterial = child.material;
            
            objects.push({
              id: child.uuid,
              name: child.name || `Object_${objects.length + 1}`,
              mesh: child,
              visible: true,
              hasTexture: false,
              textureUrl: null
            });
            
            console.log('Found mesh:', child.name || 'Unnamed mesh');
          }
        });
        
        console.log(`Found ${objects.length} meshes in total`);
        
        resolve({ model: model, objects });
      },
      (xhr) => {
        console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
      },
      (error) => {
        console.error('Error loading FBX model:', error);
        reject(error);
      }
    );
  });
};

export const applyTextureToMesh = (meshObject, textureUrl) => {
  return new Promise((resolve, reject) => {
    if (!textureUrl) {
      reject(new Error('No texture URL provided'));
      return;
    }

    textureLoader.load(
      textureUrl,
      (loadedTexture) => {
        loadedTexture.encoding = THREE.sRGBEncoding;
        loadedTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        loadedTexture.generateMipmaps = true;
        loadedTexture.minFilter = THREE.LinearFilter;
        loadedTexture.magFilter = THREE.LinearFilter;
        loadedTexture.wrapS = THREE.ClampToEdgeWrapping;
        loadedTexture.wrapT = THREE.ClampToEdgeWrapping;
        
        console.log('Texture loaded successfully:', loadedTexture);
        
        const newMaterial = new THREE.MeshBasicMaterial({
          map: loadedTexture,
          transparent: true,
          side: THREE.DoubleSide,
          alphaTest: 0.1,
        });
        
        console.log('Applying exact image texture to mesh:', meshObject.name || 'Unnamed mesh');
        
        if (!meshObject.userData.originalMaterial) {
          meshObject.userData.originalMaterial = meshObject.material ? 
            (Array.isArray(meshObject.material) ? 
              meshObject.material.map(m => m.clone()) : 
              meshObject.material.clone()) : 
            null;
        }
        
        if (Array.isArray(meshObject.material)) {
          const materials = [];
          for (let i = 0; i < meshObject.material.length; i++) {
            materials.push(newMaterial.clone());
          }
          meshObject.material = materials;
        } else {
          meshObject.material = newMaterial;
        }
        
        resolve(newMaterial);
      },
      undefined,
      (error) => {
        console.error('Error loading texture:', error);
        reject(error);
      }
    );
  });
};

export const removeTextureFromMesh = (meshObject) => {
  if (meshObject.userData.originalMaterial) {
    if (Array.isArray(meshObject.material)) {
      const origMaterials = Array.isArray(meshObject.userData.originalMaterial) 
        ? meshObject.userData.originalMaterial 
        : Array(meshObject.material.length).fill(meshObject.userData.originalMaterial);
      
      const materials = [];
      for (let i = 0; i < origMaterials.length; i++) {
        materials.push(origMaterials[i].clone());
      }
      meshObject.material = materials;
    } else {
      meshObject.material = meshObject.userData.originalMaterial.clone();
    }
  } else {
    meshObject.material = new THREE.MeshStandardMaterial({
      color: 0xcccccc
    });
  }
};

export const toggleMeshVisibility = (meshObject, visible) => {
  meshObject.visible = visible;
};

export const takeTextureScreenshot = () => {
  const originalWidth = renderer.domElement.width;
  const originalHeight = renderer.domElement.height;
  
  renderer.setSize(2000, 2000);
  
  renderer.render(scene, camera);
  
  const dataURL = renderer.domElement.toDataURL('image/png');
  
  renderer.setSize(originalWidth, originalHeight);
  
  return dataURL;
};