import * as THREE from "../../build/three.module.js";
import { OrbitControls } from "../../jsm/OrbitControls.js";
import { GLTFLoader } from "../../jsm/GLTFLoader.js";
import { RoomEnvironment } from "../../jsm/RoomEnvironment.js";

let camera, scene, renderer, controls;
let url = "/assets/3d/model-1.png";
let part3Mesh = null;


document.addEventListener("variableReady", function (e) {
  url = e.detail.data;
  if (scene) {
    changeTexture(url);
  } else {
    init();
    animate();
  }
});

function init() {
  const mainContainer = document.getElementById("3d-container");
  mainContainer.style.backgroundColor = "#f0f0f0";
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.01,
    100
  );
  camera.position.set(0, 0.01, 0.2);

  scene = new THREE.Scene();
  new GLTFLoader().load("/assets/3d/Model-1.glb", function (gltf) {
    const loadedModel = gltf.scene;
    // Find part3 in the loaded model
    loadedModel.traverse((child) => {
      if (child.isMesh && child.name === "part3") {
        part3Mesh = child;
      }
    });
    const specificMesh = loadedModel.children[0];
    const textureLoader = new THREE.TextureLoader();

    textureLoader.load(
      "assets/3d/76_leather texture-seamless.jpg",
      (bumpMap) => {
        textureLoader.load(url, (texture) => {
          const material = new THREE.MeshStandardMaterial({
            map: texture,
            // normalMap: texture,
            bumpMap: bumpMap,
            roughness: 1,
            metalness: 0.5,
            opacity: 1,
            bumpScale: 0.5,
          });
          
          texture.repeat.set(-1, 1);
        texture.offset.set(1, 1);
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          specificMesh.material = material;
          specificMesh.geometry.computeVertexNormals();
        });
      }
    );

    if (part3Mesh) {
      console.log("Found part3:", part3Mesh);
      // Example of changing material or properties of part3
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load("assets/3d/Wool_Knitted_base_black.png", (texture) => {
        const material = new THREE.MeshStandardMaterial({
          map: texture,
          bumpMap: texture,
          roughness: 1,
          metalness: 1,
          opacity: 1,
          bumpScale: 0.5,
        });
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2,2);
        // texture.offset.set(5,0)
        part3Mesh.material = material;
        part3Mesh.geometry.attributes.normal.array.forEach((value, index, array) => {
          array[index] = -value;
        });
        part3Mesh.geometry.attributes.normal.needsUpdate = true;
      });
    }
    const specificMesh4 = loadedModel.children[0].children[1];
    textureLoader.load("assets/3d/White_top_typ1.png", (texture) => {
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        normalMap: texture,
        roughness: 1,
        metalness: 1,
        opacity: 1,
        bumpScale: 0.5,
      });
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      specificMesh4.material = material;
    });

    loadedModel.position.set(0, -0.03, 0);
    scene.add(gltf.scene);
  });

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .5; // Adjust as needed
  mainContainer.appendChild(renderer.domElement);

  const environment = new RoomEnvironment(renderer);
  const pmremGenerator = new THREE.PMREMGenerator(renderer);

  scene.background = new THREE.Color(0x3d3d3d);
  scene.environment = pmremGenerator.fromScene(environment).texture;

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.minDistance = 0.12;
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
    const specificMesh = scene.getObjectByName("part2");

    if (specificMesh) {
      textureLoader.load(newUrl, (texture) => {
        const material = new THREE.MeshStandardMaterial({
          map: texture,
          normalMap: texture,
          roughness: 1,
          metalness: 1,
          opacity: 1,
          bumpScale: 0.5,
        });
        texture.repeat.set(-1, 1);
        texture.offset.set(1, 1);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        specificMesh.material = material;
        specificMesh.material.needsUpdate = true;
      });
    }
  }
}
