import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';


let scene, camera, renderer, controls, model;
let textureLoader;

/**
 * Initialize a Three.js scene
 * @param {HTMLElement} container - The container element
 * @returns {Object} - Scene, camera, renderer, and controls
 */
export const initThreeScene = (container) => {
  // Create scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x212121);

  // Create camera
  camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(5, 5, 5);

  // Create renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.outputEncoding = THREE.sRGBEncoding;
  
  // Clear container and append renderer
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  container.appendChild(renderer.domElement);

  // Add orbit controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // Add lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(1, 1, 1).normalize();
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  const secondaryLight = new THREE.DirectionalLight(0xffffff, 0.8);
  secondaryLight.position.set(0, 1, 0).normalize();
  scene.add(secondaryLight);

  // Create texture loader
  textureLoader = new THREE.TextureLoader();

  // Handle window resize
  const handleResize = () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  };
  window.addEventListener('resize', handleResize);

  // Animation loop
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
      
      // Clean up scene
      if (model) {
        scene.remove(model);
        model = null;
      }
      
      // Dispose renderer
      renderer.dispose();
      
      // Dispose controls
      controls.dispose();
    }
  };
};

/**
 * Load an FBX model from URL
 * @param {string} url - URL to the FBX model
 * @param {THREE.Scene} sceneRef - Three.js scene reference (not used, using global scene)
 * @returns {Promise<Object>} - Promise resolving to the loaded model and objects
 */
export const loadFBXModel = (url, sceneRef) => {
  return new Promise((resolve, reject) => {
    // Clear existing model if present
    if (model) {
      scene.remove(model);
      model = null;
    }
    
    const loader = new FBXLoader();
    loader.load(
      url,
      (fbx) => {
        console.log('Model loaded successfully:', fbx);
        model = fbx;
        
        // Center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        
        // Scale model to fit the view
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 10) {
          const scale = 10 / maxDim;
          model.scale.set(scale, scale, scale);
        }
        
        // Add model to scene
        scene.add(model);
        
        // Reset camera and controls to focus on model
        controls.reset();
        
        // Extract objects from the model
        const objects = [];
        model.traverse((child) => {
          if (child.isMesh) {
            // Store original material for later
            child.userData.originalMaterial = child.material;
            
            // Add to objects array
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
        
        resolve({ model: fbx, objects });
      },
      // Progress callback
      (xhr) => {
        console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
      },
      // Error callback
      (error) => {
        console.error('Error loading FBX model:', error);
        reject(error);
      }
    );
  });
};

/**
 * Apply texture to a mesh
 * @param {THREE.Mesh} meshObject - The mesh to apply texture to
 * @param {string} textureUrl - URL to the texture image
 * @returns {Promise<THREE.Material>} - Promise resolving to the new material
 */
export const applyTextureToMesh = (meshObject, textureUrl) => {
  return new Promise((resolve, reject) => {
    if (!textureUrl) {
      reject(new Error('No texture URL provided'));
      return;
    }

    textureLoader.load(
      textureUrl,
      (loadedTexture) => {
        // Apply texture settings from app.js
        loadedTexture.encoding = THREE.sRGBEncoding;
        const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
        loadedTexture.anisotropy = maxAnisotropy;
        loadedTexture.generateMipmaps = true;
        loadedTexture.minFilter = THREE.LinearMipmapLinearFilter;
        
        loadedTexture.wrapS = THREE.RepeatWrapping;
        loadedTexture.wrapT = THREE.RepeatWrapping;
        loadedTexture.repeat.y = 1;
        
        console.log('Texture loaded successfully:', loadedTexture);
        
        // Create material matching app.js
        const newMaterial = new THREE.MeshBasicMaterial({
          map: loadedTexture,
          transparent: true,
          roughness: 0.3,
          metalness: 0.0,
          opacity: 1.0
        });
        
        console.log('Applying texture to mesh:', meshObject.name || 'Unnamed mesh');
        
        // Apply the new material to the mesh
        if (Array.isArray(meshObject.material)) {
          // For multi-material objects, replace all materials
          const materials = [];
          for (let i = 0; i < meshObject.material.length; i++) {
            materials.push(newMaterial.clone());
          }
          meshObject.material = materials;
        } else {
          // For single material objects
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

/**
 * Remove texture from a mesh
 * @param {THREE.Mesh} meshObject - The mesh to remove texture from
 */
export const removeTextureFromMesh = (meshObject) => {
  // Restore original material if available
  if (meshObject.userData.originalMaterial) {
    if (Array.isArray(meshObject.material)) {
      // For multi-material objects
      const origMaterials = Array.isArray(meshObject.userData.originalMaterial) 
        ? meshObject.userData.originalMaterial 
        : Array(meshObject.material.length).fill(meshObject.userData.originalMaterial);
      
      const materials = [];
      for (let i = 0; i < origMaterials.length; i++) {
        materials.push(origMaterials[i].clone());
      }
      meshObject.material = materials;
    } else {
      // For single material objects
      meshObject.material = meshObject.userData.originalMaterial.clone();
    }
  } else {
    // Create a default material
    meshObject.material = new THREE.MeshStandardMaterial({
      color: 0xcccccc
    });
  }
};

/**
 * Toggle mesh visibility
 * @param {THREE.Mesh} meshObject - The mesh to toggle visibility
 * @param {boolean} visible - Whether the mesh should be visible
 */
export const toggleMeshVisibility = (meshObject, visible) => {
  meshObject.visible = visible;
}; 