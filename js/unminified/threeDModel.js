import * as THREE from "../../build/three.module.js";
import { OrbitControls } from "../../jsm/OrbitControls.js";
import { GLTFLoader } from "../../jsm/GLTFLoader.js";
import { RoomEnvironment } from "../../jsm/RoomEnvironment.js";

let camera, scene, renderer, controls, size, center;
let url = null;
let selectedMesh = null;
let modelSource = null;
let linkedMeshImageData = null;
const adminUrl = CONFIG.ADMIN_URL;
const baseUrl = CONFIG.BASE_URL;
let tabCanvasStates = {};

let meshImageDataArray = null;

document.addEventListener("thrDClicked", function () {
  checkMeshImageDataArray();
});

const checkMeshImageDataArray = () => {
  if (window.meshImageDataArray && window.meshImageDataArray.length > 0) {
    meshImageDataArray = window.meshImageDataArray;

    tabCanvasStates = window.tabCanvasStates;
    // Check if all expected items are present
    const expectedLength = Object.keys(tabCanvasStates).length;
    if (meshImageDataArray.length === expectedLength) {
      if (scene) {
        applyTexturesToMeshes();
      } else {
        fetchModelData();
      }
    } else {
      setTimeout(checkMeshImageDataArray, 100);
    }
  } else {
    setTimeout(checkMeshImageDataArray, 100);
  }
};

async function fetchModelData() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");
    const response = await fetch(`${baseUrl}/api/v1/product/get/${productId}`);
    const data = await response.json();

    const product = data.product;

    // Extract the model source (GLB path) based on the name parameter from the URL
    const modelName = urlParams.get("name");
    const productNameTag = document.querySelector(
      ".personalise-product-name-text"
    );
    if (productNameTag) {
      productNameTag.textContent = modelName; // Update the product name
    }
    if (product && product.modelUrl) {
      modelSource = product.modelUrl; // Set the model URL

      linkedMeshImageData = product.linkedMeshImageData[0];
      // selectedMesh = product.specificMesh;
      selectedMesh = linkedMeshImageData.meshName;

      // Now that modelSource is available, initialize the scene
      init();
      animate();
    } else {
      console.error("Model not found for the specified name.");
    }
  } catch (error) {
    console.error("Error fetching model data:", error);
  }
}

function init() {
  const mainContainer = document.getElementById("3d-container");
  mainContainer.style.backgroundColor = "#f0f0f0";
  const urlParams = new URLSearchParams(window.location.search);
  const modelName = urlParams.get("name");
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    20
  );
  camera.position.set(0, 0, 0); // Position camera farther to accommodate larger models

  scene = new THREE.Scene();

  // Load the GLTF model
  new GLTFLoader().load(modelSource, function (gltf) {
    const loadedModel = gltf.scene;

    centerModel(loadedModel, camera);

    loadedModel.traverse((child) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          // If the mesh has multiple materials
          child.material.forEach((material) => {
            material.side = THREE.DoubleSide;
          });
        } else {
          // For single material
          child.material.side = THREE.DoubleSide;
        }
      }
    });

    // Apply textures to specific meshes dynamically
    const textureLoader = new THREE.TextureLoader();
    meshImageDataArray = window.meshImageDataArray;

    meshImageDataArray.forEach(({ meshName, meshImageData }) => {
      const specificMesh = loadedModel.getObjectByName(meshName);
      if (specificMesh) {
        textureLoader.load(meshImageData, (texture) => {
          const material = new THREE.MeshStandardMaterial({
            map: texture,

            roughness: 1,
            metalness: 1,
            opacity: 1,

            side: THREE.DoubleSide,
          });
          specificMesh.material = material;

          switch (meshName) {
            case "P2_Top2":
              texture.repeat.set(1.9, -1.9);
              texture.offset.set(0.92, 0.5);
              break;
            case "P3_typ3_Top":
              texture.repeat.set(1.23, -1.23);
              texture.offset.set(0.875, 1.13);
              break;
            case "P3_Top":
              texture.repeat.set(1.7, -1.7);
              texture.offset.set(1.0, 1.04);
              break;
            case "Booklet_innner":
              break;
            case "P5_typ1":
              texture.repeat.set(1, -1);
              texture.offset.set(1, 1);
              break;
            case "Ear_L2":
              texture.repeat.set(1, -1);
              texture.offset.set(1, 1);
              break;
            case "part2":
              texture.repeat.set(-1, 1);
              texture.offset.set(1, 1);
              break;
            case "polySurface1":
              texture.repeat.set(1, -1);
              break;
            default:
              console.warn(
                `No specific texture settings for mesh: ${meshName}`
              );
          }

          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        });
      } else {
        console.error("Mesh not found:", meshName);
      }
    });

    // Add the model to the scene
    scene.add(loadedModel);

    // Adjust camera position based on model size
    const distance = size.length();
    camera.position.set(0, 0, distance * 2); // Adjust the camera to fit model
    camera.lookAt(center);
  });

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.4;
  mainContainer.appendChild(renderer.domElement);

  const environment = new RoomEnvironment(renderer);
  const pmremGenerator = new THREE.PMREMGenerator(renderer);

  scene.background = new THREE.Color(0x3d3d3d);
  scene.environment = pmremGenerator.fromScene(environment).texture;

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  controls.minDistance = 0.3; // Minimum zoom distance
  controls.maxDistance = 2; // Maximum zoom distance
  controls.target.set(0, 0, 0);
  controls.update();

  window.addEventListener("resize", onWindowResize);
}

function centerModel(model, camera) {
  // Calculate the bounding box of the model
  const box = new THREE.Box3().setFromObject(model);

  // Get the size and center of the box
  size = box.getSize(new THREE.Vector3());
  center = box.getCenter(new THREE.Vector3());

  // Calculate scaling factor to fit the model within the desired size
  const targetSize = 0.29; // Adjust this value if needed
  const maxSize = Math.max(size.x, size.y, size.z);
  const scaleFactor = targetSize / maxSize;

  // Apply scaling to the model
  model.scale.set(scaleFactor, scaleFactor, scaleFactor);

  // Center the model by adjusting its position
  model.position.set(
    -center.x * scaleFactor,
    -center.y * scaleFactor,
    -center.z * scaleFactor
  );

  // Adjust camera to look at the center of the model
  camera.position.set(
    0,
    Math.max(size.y * scaleFactor, 1.5),
    size.z * scaleFactor * 5
  );
  camera.lookAt(center);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  render();
}

function render() {
  renderer.render(scene, camera);
}

function applyTexturesToMeshes() {
  meshImageDataArray = window.meshImageDataArray;

  const textureLoader = new THREE.TextureLoader();

  meshImageDataArray.forEach((meshData) => {
    const { meshName, meshImageData } = meshData; // Destructure mesh name and texture URL

    const specificMesh = scene.getObjectByName(meshName);

    if (specificMesh) {
      textureLoader.load(
        "assets/3d/76_leather texture-seamless.jpg",
        (bumpMap) => {
          textureLoader.load(meshImageData, (texture) => {
            const material = new THREE.MeshStandardMaterial({
              map: texture,
              // bumpMap: bumpMap,
              roughness: 1,
              metalness: 1,
              opacity: 1,
              // bumpScale: 0.5,
              side: THREE.DoubleSide,
            });

            specificMesh.material = material;

            // Apply texture transformations based on the mesh name
            switch (meshName) {
              case "P2_Top2":
                texture.repeat.set(1.9, -1.9);
                texture.offset.set(0.92, 0.5);
                break;
              case "P3_typ3_Top":
                texture.repeat.set(1.23, -1.23);
                texture.offset.set(0.875, 1.13);
                break;
              case "P3_Top":
                texture.repeat.set(1.7, -1.7);
                texture.offset.set(1.0, 1.04);
                break;
              case "Booklet_innner":
                console.log("No changes required for this mesh.");
                break;
              case "P5_typ1":
                texture.repeat.set(1, -1);
                texture.offset.set(1, 1);
                break;
              case "Ear_L2":
                texture.repeat.set(1, -1);
                texture.offset.set(1, 1);
                break;
              case "part2":
                texture.repeat.set(-1, 1);
                texture.offset.set(1, 1);
                break;
              case "polySurface1":
                texture.repeat.set(1, -1);
                break;
              default:
              // console.warn(
              //   `No specific texture settings for mesh: ${meshName}`
              // );
            }

            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          });
        }
      );
    } else {
      console.error(`Mesh not found: ${meshName}`);
    }
  });
}
