import * as THREE from "../../build/three.module.js";
import { OrbitControls } from "../../jsm/OrbitControls.js";
import { GLTFLoader } from "../../jsm/GLTFLoader.js";
import { RoomEnvironment } from "../../jsm/RoomEnvironment.js";

let camera, scene, renderer, controls;
var url = "/assets/3d/img2.jpeg";


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
    0.1,
    20
  );
  camera.position.set(0, 0.08, 0.5);

  scene = new THREE.Scene();
  var glbUrl;
  var searchParams = new URLSearchParams(window.location.search);
  var id = searchParams.get('id');
  fetch(`https://starter-express-production.up.railway.app/data/${id}`)
      .then(response => response.json())
      .then(data => {
          glbUrl = data.glburl;
          if (glbUrl) {
            console.log('the glb url is here')
            new GLTFLoader().load(glbUrl, function (gltf) {
                const loadedModel = gltf.scene;
                const specificMesh = loadedModel.children[0].children[3];
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
                        metalness: 1,
                        opacity: 1,
                        bumpScale: 0.5,
                      });
                      specificMesh.material = material;
            
                      texture.repeat.set(1.9, -1.9);
                      texture.offset.set(.92, 0.5);
                      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                    });
                  }
                );
            
                loadedModel.position.set(0, -0.11, 0);
                scene.add(gltf.scene);
              });
            
          } else {
              console.error('GLB URL not found');
          }
      })
      .catch(error => {
          console.error('Error fetching data:', error);
      });


  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .5;
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
    const specificMesh = scene.getObjectByName("P2_Top2");
    if (specificMesh) {
      textureLoader.load(
        "assets/3d/76_leather texture-seamless.jpg",
        (bumpMap) => {
          textureLoader.load(url, (texture) => {
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
            texture.repeat.set(1.9, -1.9);
            texture.offset.set(.92, 0.5);
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          });
        }
      );
    }
  }
}
