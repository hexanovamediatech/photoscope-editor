import * as THREE from "../../build/three.module.js";
import { OrbitControls } from "../../jsm/OrbitControls.js";
import { GLTFLoader } from "../../jsm/GLTFLoader.js";
import { RoomEnvironment } from "../../jsm/RoomEnvironment.js";

let camera, scene, renderer, controls;
let url = null;
let selectedMesh = null;
let modelSource = null;
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

async function fetchModelData() {
  try {
    const response = await fetch(
      "https://backend.toddlerneeds.com/api/v1/product/all"
    );
    const data = await response.json();

    // Extract the model source (GLB path) based on the name parameter from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const modelName = urlParams.get("name");

    const product = data.products.find((item) => item.name === modelName);
    if (product && product.modelsUrl) {
      modelSource = product.modelsUrl; // Set the model URL
      selectedMesh = product.specificMesh;
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
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    20
  );
  // camera.position.set(0, 0.08, 0.5);
  camera.position.set(0, 0.08, 1);

  scene = new THREE.Scene();

  new GLTFLoader().load(modelSource, function (gltf) {
    const loadedModel = gltf.scene;
    console.log("Loaded model:", loadedModel);

    // Traverse through all objects to list their names
    loadedModel.traverse((child) => {
      if (child.isMesh) {
        console.log("Mesh found:", child.name);
      }
    });

    // Assuming the model contains a mesh with the name selectedMesh
    const specificMesh = loadedModel.getObjectByName(selectedMesh);
    console.log(specificMesh, "specific mesh name");
    if (specificMesh) {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        "assets/3d/76_leather texture-seamless.jpg",
        (bumpMap) => {
          textureLoader.load(url, (texture) => {
            const material = new THREE.MeshStandardMaterial({
              map: texture,
              bumpMap: bumpMap,
              roughness: 1,
              metalness: 1,
              opacity: 1,
              bumpScale: 0.5,
            });
            specificMesh.material = material;

            // texture.repeat.set(1.9, -1.9);
            // texture.offset.set(0.92, 0.5);
            if (selectedMesh === "P2_Top2") {
              texture.repeat.set(1.9, -1.9);
              texture.offset.set(0.92, 0.5);
            } else if (selectedMesh === "P3_typ3_Top") {
              texture.repeat.set(1.23, -1.23);
              texture.offset.set(0.875, 1.13);
            } else if (selectedMesh === "P3_Top") {
              texture.repeat.set(1.7, -1.7);
              texture.offset.set(1.0, 1.04);
            } else if (selectedMesh === "P4Type1") {
              // texture.repeat.set(2.0, -2.0);
              // texture.offset.set(0.9, 0.4);
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
              // texture.repeat.set(1.6, -1.6);
              // texture.offset.set(0.93, 0.55);
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
      console.error(
        "Mesh with the name",
        selectedMesh,
        "not found in the model."
      );
    }

    loadedModel.position.set(0, -0.11, 0);
    scene.add(loadedModel);
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
  controls.minDistance = 0.35;
  controls.maxDistance = 0.7;
  controls.target.set(0, 0, 0);
  controls.update();

  window.addEventListener("resize", onWindowResize);
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
              normalMap: texture,
              bumpMap: bumpMap,
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
            } else if (selectedMesh === "P4Type1") {
              // texture.repeat.set(2.0, -2.0);
              // texture.offset.set(0.9, 0.4);
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
              // texture.repeat.set(1.6, -1.6);
              // texture.offset.set(0.93, 0.55);
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
