import * as THREE from "../../build/three.module.js";
import { OrbitControls } from "../../jsm/OrbitControls.js";
import { GLTFLoader } from "../../jsm/GLTFLoader.js";
import { RoomEnvironment } from "../../jsm/RoomEnvironment.js";

let camera, scene, renderer, controls;
let url = null;
let selectedMesh = null;
let modelSource = null;
let linkedMeshImageData = null;
const adminUrl = CONFIG.ADMIN_URL;
const baseUrl = CONFIG.BASE_URL;
document.addEventListener("variableReady", function (e) {
  console.log(e);
  url = e.detail.data;
  console.log(url);
  if (scene) {
    changeTexture(url);
  } else {
    fetchModelData();
  }
});

// async function fetchModelData() {
//   try {
//     const response = await fetch(
//       "https://backend.toddlerneeds.com/api/v1/product/all"
//     );
//     const data = await response.json();

//     // Extract the model source (GLB path) based on the name parameter from the URL
//     const urlParams = new URLSearchParams(window.location.search);
//     const modelName = urlParams.get("name");

//     const product = data.products.find((item) => item.name === modelName);
//     if (product && product.modelsUrl) {
//       modelSource = product.modelsUrl; // Set the model URL
//       selectedMesh = product.specificMesh;
//       // Now that modelSource is available, initialize the scene
//       init();
//       animate();
//     } else {
//       console.error("Model not found for the specified name.");
//     }
//   } catch (error) {
//     console.error("Error fetching model data:", error);
//   }
// }

async function fetchModelData() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");
    const response = await fetch(`${baseUrl}/api/v1/product/get/${productId}`);
    const data = await response.json();
    console.log(data);
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
      console.log(modelSource);
      linkedMeshImageData = product.linkedMeshImageData[0];
      // selectedMesh = product.specificMesh;
      selectedMesh = linkedMeshImageData.meshName;
      console.log(selectedMesh);
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
  camera.position.set(0, 0.08, 1); // Position camera farther to accommodate larger models

  scene = new THREE.Scene();

  // Load the GLTF model
  new GLTFLoader().load(modelSource, function (gltf) {
    const loadedModel = gltf.scene;
    console.log("Loaded model:", loadedModel);
    centerModel(loadedModel, camera);

    // Find the specific mesh
    const specificMesh = loadedModel.getObjectByName(selectedMesh);
    if (specificMesh) {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        "assets/3d/76_leather texture-seamless.jpg",
        (bumpMap) => {
          textureLoader.load(url, (texture) => {
            const material = new THREE.MeshStandardMaterial({
              map: texture,
              // bumpMap: bumpMap,
              roughness: 1,
              metalness: 1,
              opacity: 1,
              bumpScale: 0.5,
            });
            specificMesh.material = material;

            // Apply specific texture transformations based on mesh name
            if (selectedMesh === "P2_Top2") {
              texture.repeat.set(1.9, -1.9);
              texture.offset.set(0.92, 0.5);
            } else if (selectedMesh === "P3_typ3_Top") {
              texture.repeat.set(1.23, -1.23);
              texture.offset.set(0.875, 1.13);
            } else if (selectedMesh === "P3_Top") {
              texture.repeat.set(1.7, -1.7);
              texture.offset.set(1.0, 1.04);
            } else if (selectedMesh === "Booklet_innner") {
              console.log("No changes required");
            } else if (selectedMesh === "P5_typ1") {
              texture.repeat.set(1, -1);
              texture.offset.set(1, 1);
            } else if (selectedMesh === "Ear_L2") {
              texture.repeat.set(1, -1);
              texture.offset.set(1, 1);
            } else if (selectedMesh === "part2") {
              texture.repeat.set(-1, 1);
              texture.offset.set(1, 1);
            } else if (selectedMesh === "polySurface1") {
              texture.repeat.set(1, -1);
            } else {
              console.warn(
                "No specific texture settings for selectedMesh:",
                selectedMesh
              );
            }

            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          });
        }
      );
    } else {
      console.error("Specific mesh not found.");
    }

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
  renderer.toneMappingExposure = 0.5;
  mainContainer.appendChild(renderer.domElement);

  const environment = new RoomEnvironment(renderer);
  const pmremGenerator = new THREE.PMREMGenerator(renderer);

  scene.background = new THREE.Color(0x3d3d3d);
  scene.environment = pmremGenerator.fromScene(environment).texture;

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  controls.minDistance = 1; // Minimum zoom distance
  controls.maxDistance = 2; // Maximum zoom distance
  controls.target.set(0, 0, 0);
  controls.update();

  window.addEventListener("resize", onWindowResize);
}

function centerModel(model, camera) {
  // Calculate the bounding box of the model
  const box = new THREE.Box3().setFromObject(model);

  // Get the size and center of the box
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  // Calculate scaling factor to fit the model within the desired size
  const targetSize = 1; // Adjust this value if needed
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
    size.z * scaleFactor * 2
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

function changeTexture(newUrl) {
  if (scene) {
    const textureLoader = new THREE.TextureLoader();
    const specificMesh = scene.getObjectByName(selectedMesh);
    console.log(specificMesh, "specific mesh name");
    if (specificMesh) {
      textureLoader.load(
        "assets/3d/76_leather texture-seamless.jpg",
        (bumpMap) => {
          textureLoader.load(newUrl, (texture) => {
            const material = new THREE.MeshStandardMaterial({
              map: texture,
              // normalMap: texture,
              // bumpMap: bumpMap,
              roughness: 1,
              metalness: 1,
              opacity: 1,
              bumpScale: 0.5,
            });
            specificMesh.material = material;

            if (selectedMesh === "P2_Top2") {
              texture.repeat.set(1.9, -1.9);
              texture.offset.set(0.92, 0.5);
            } else if (selectedMesh === "P3_typ3_Top") {
              texture.repeat.set(1.23, -1.23);
              texture.offset.set(0.875, 1.13);
            } else if (selectedMesh === "P3_Top") {
              texture.repeat.set(1.7, -1.7);
              texture.offset.set(1.0, 1.04);
            } else if (selectedMesh === "Booklet_innner") {
              console.log("No changes required");
            } else if (selectedMesh === "P5_typ1") {
              texture.repeat.set(1, -1);
              texture.offset.set(1, 1);
            } else if (selectedMesh === "Ear_L2") {
              texture.repeat.set(1, -1);
              texture.offset.set(1, 1);
            } else if (selectedMesh === "part2") {
              texture.repeat.set(-1, 1);
              texture.offset.set(1, 1);
            } else if (selectedMesh === "polySurface1") {
              texture.repeat.set(1, -1);
            } else {
              console.warn(
                "No specific texture settings for selectedMesh:",
                selectedMesh
              );
            }

            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          });
        }
      );
    }
  }
}
