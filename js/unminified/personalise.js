import * as THREE from "../../build/three.module.js";
import { OrbitControls } from "../../jsm/OrbitControls.js";
import { GLTFLoader } from "../../jsm/GLTFLoader.js";
import { RoomEnvironment } from "../../jsm/RoomEnvironment.js";

let camera, scene, renderer, controls;
let selectedImage = null; // Store the selected image data URL
let fabricCanvas = null;
const canvasWidth = 460; // Desired width of the canvas
const canvasHeight = 460; // Desired height of the canvas
let activeItem = null;
// Initialize the 3D viewer
document.addEventListener("variableReady", function (e) {
  if (scene) {
    changeTexture(e.detail.data);
  } else {
    initPersonalise();
    animate();
  }
});
let fabricImageConverted = null;
// function initPersonalise() {
//   const mainContainer = document.getElementById("personalise-3d-container");
//   mainContainer.style.backgroundColor = "#f0f0f0";
//   camera = new THREE.PerspectiveCamera(
//     45,
//     window.innerWidth / window.innerHeight,
//     0.1,
//     20
//   );
//   camera.position.set(0, 0.08, 0.5);

//   scene = new THREE.Scene();
//   new GLTFLoader().load("/assets/3d/P2_type1.glb", function (gltf) {
//     const loadedModel = gltf.scene;
//     const specificMesh = loadedModel.children[0].children[3];
//     const textureLoader = new THREE.TextureLoader();

//     textureLoader.load(
//       "assets/3d/76_leather texture-seamless.jpg",
//       (bumpMap) => {
//         textureLoader.load(selectedImage, (texture) => {
//           const material = new THREE.MeshStandardMaterial({
//             map: texture,
//             bumpMap: bumpMap,
//             roughness: 1,
//             metalness: 1,
//             opacity: 1,
//             bumpScale: 0.5,
//           });
//           specificMesh.material = material;

//           texture.repeat.set(1.9, -1.9);
//           texture.offset.set(0.92, 0.5);
//           texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
//         });
//       }
//     );

//     loadedModel.position.set(0, -0.11, 0);
//     scene.add(gltf.scene);
//   });

//   renderer = new THREE.WebGLRenderer({ antialias: true });
//   renderer.setPixelRatio(window.devicePixelRatio);
//   renderer.setSize(window.innerWidth, window.innerHeight);
//   renderer.toneMapping = THREE.ACESFilmicToneMapping;
//   renderer.toneMappingExposure = 0.5;
//   mainContainer.appendChild(renderer.domElement);

//   const environment = new RoomEnvironment(renderer);
//   const pmremGenerator = new THREE.PMREMGenerator(renderer);

//   scene.background = new THREE.Color(0x818181);
//   scene.environment = pmremGenerator.fromScene(environment).texture;

//   controls = new OrbitControls(camera, renderer.domElement);
//   controls.enableDamping = true;
//   controls.minDistance = 0.35;
//   controls.maxDistance = 0.7;
//   controls.target.set(0, 0, 0);
//   controls.update();

//   window.addEventListener("resize", onWindowResizePersonalise);
// }
function initPersonalise() {
  // Extract the 'name' query parameter from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const name = urlParams.get("name");
  console.log("Model name from query param is", name);

  // Set a default model or handle cases where 'name' might not be provided
  const modelName = name ? name : "default-model";

  // Construct the dynamic path for the GLB file using the name
  const normalizedName = name.replace("-", "_").toUpperCase();
  const glbPath = `/assets/3d/${normalizedName}.glb`;
  console.log(glbPath);
  const mainContainer = document.getElementById("personalise-3d-container");
  mainContainer.style.backgroundColor = "#f0f0f0";

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    20
  );
  camera.position.set(0, 0.08, 0.5);

  scene = new THREE.Scene();

  // Load the GLB model dynamically based on the 'name' parameter
  new GLTFLoader().load(glbPath, function (gltf) {
    const loadedModel = gltf.scene;
    const specificMesh = loadedModel.children[0].children[3];
    const textureLoader = new THREE.TextureLoader();

    textureLoader.load(
      "assets/3d/76_leather texture-seamless.jpg",
      (bumpMap) => {
        textureLoader.load(selectedImage, (texture) => {
          const material = new THREE.MeshStandardMaterial({
            map: texture,
            bumpMap: bumpMap,
            roughness: 1,
            metalness: 1,
            opacity: 1,
            bumpScale: 0.5,
          });
          specificMesh.material = material;

          texture.repeat.set(1.9, -1.9);
          texture.offset.set(0.92, 0.5);
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        });
      }
    );

    loadedModel.position.set(0, -0.11, 0);
    scene.add(gltf.scene);
  });

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.5;
  mainContainer.appendChild(renderer.domElement);

  const environment = new RoomEnvironment(renderer);
  const pmremGenerator = new THREE.PMREMGenerator(renderer);

  scene.background = new THREE.Color(0x818181);
  scene.environment = pmremGenerator.fromScene(environment).texture;

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.minDistance = 0.35;
  controls.maxDistance = 0.7;
  controls.target.set(0, 0, 0);
  controls.update();

  window.addEventListener("resize", onWindowResizePersonalise);
}

function onWindowResizePersonalise() {
  const mainContainer = document.getElementById("personalise-3d-container");
  const containerWidth = mainContainer.offsetWidth;
  const containerHeight = mainContainer.offsetHeight;
  const size = Math.min(containerWidth, containerHeight);
  camera.aspect = size / size;
  camera.updateProjectionMatrix();
  renderer.setSize(size, size);
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
          textureLoader.load(newUrl, (texture) => {
            const material = new THREE.MeshStandardMaterial({
              map: texture,
              bumpMap: bumpMap,
              roughness: 1,
              metalness: 1,
              opacity: 1,
              bumpScale: 0.5,
            });
            specificMesh.material = material;
            texture.repeat.set(1.9, -1.9);
            texture.offset.set(0.92, 0.5);
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          });
        }
      );
    }
  }
}
// function changeTexture(newUrl) {
//   if (scene) {
//     const textureLoader = new THREE.TextureLoader();
//     const specificMesh = scene.getObjectByName("P2_Top2");

//     if (specificMesh) {
//       textureLoader.load(
//         // You can use a base64 URL here directly
//         newUrl,
//         (texture) => {
//           const material = new THREE.MeshStandardMaterial({
//             map: texture,
//             roughness: 1,
//             metalness: 1,
//           });
//           specificMesh.material = material;
//           texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
//         },
//         undefined, // onProgress callback
//         (error) => {
//           console.error("Error loading texture:", error);
//         }
//       );
//     }
//   }
// }

function initialize3DViewer() {
  initPersonalise();
  animate();
}

// Function to get the 'name' parameter from the URL
function getNameFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("name");
}

// Function to update the image source
function updateImageSource() {
  const name = getNameFromUrl();
  const normalizedName = name.replace("-", "_").toUpperCase(); // Get the name from URL
  if (normalizedName) {
    const imageElement = document.querySelector(".personalise-template-img");
    const imagePath = `assets/3d/${normalizedName}.png`; // Construct the image path
    imageElement.src = imagePath; // Update the src attribute
  }
}

// Call the function to update the image source on page load
document.addEventListener("DOMContentLoaded", updateImageSource);

// Event listener for the "Personalize" button
document
  .getElementById("personaliseOpenPopupBtn")
  .addEventListener("click", async () => {
    // Check if there is an active item
    if (activeItem) {
      try {
        const response = await fetch(activeItem.src);
        const jsonData = await response.json();
        console.log(jsonData);
        loadJSONToCanvas(jsonData);
      } catch (error) {
        console.error("Error fetching or parsing the JSON:", error);
      }
    }

    // Show the popup
    document.getElementById("personaliseImageUploadPopup").style.display =
      "block";
  });

// document.getElementById("openEditor").addEventListener("click", function () {
//   var inactive = document.querySelector(".personalise-page-inactive");
//   var active = document.querySelector(".personalise-page-active");

//   if (inactive.style.display === "none") {
//     inactive.style.display = "block";
//     active.style.display = "none";
//   } else {
//     inactive.style.display = "none";
//     active.style.display = "block";
//   }
// });
document.getElementById("openEditor").addEventListener("click", function () {
  var editorMainCont = document.getElementById("editor-main-cont");
  var miniEditorMainCont = document.getElementById("mini-editor-main-cont");

  editorMainCont.classList.toggle("personalise-page-inactive");
  editorMainCont.classList.toggle("personalise-page-active");

  miniEditorMainCont.classList.toggle("personalise-page-active");
  miniEditorMainCont.classList.toggle("personalise-page-inactive");
});

// function loadJSONToCanvas(json, format = "png", quality = 1) {
//   try {
//     console.log("Received JSON data:", json);

//     // Get the canvas element
//     const canvasElement = document.getElementById("personaliseCanvas");
//     if (!canvasElement) {
//       throw new Error('Canvas element with ID "personaliseCanvas" not found');
//     }

//     // Initialize Fabric.js canvas
//     const fabricCanvas = new fabric.Canvas(canvasElement);

//     // Set canvas dimensions to 460x460
//     const canvasWidth = 460;
//     const canvasHeight = 460;
//     fabricCanvas.setWidth(canvasWidth);
//     fabricCanvas.setHeight(canvasHeight);

//     // Clear the canvas
//     fabricCanvas.clear();

//     // Handle background image if present
//     if (json.backgroundImage) {
//       const backgroundImage = json.backgroundImage;
//       fabric.Image.fromURL(
//         backgroundImage.src,
//         function (img) {
//           img.set({
//             left: 0,
//             top: 0,
//             scaleX: canvasWidth / img.width,
//             scaleY: canvasHeight / img.height,
//             originX: "left",
//             originY: "top",
//           });
//           fabricCanvas.setBackgroundImage(
//             img,
//             fabricCanvas.renderAll.bind(fabricCanvas)
//           );
//         },
//         { crossOrigin: backgroundImage.crossOrigin || "anonymous" }
//       );
//     }

//     // Calculate the bounding box of all objects
//     const boundingBox = json.objects.reduce(
//       (box, obj) => {
//         const objWidth = obj.width * (obj.scaleX || 1);
//         const objHeight = obj.height * (obj.scaleY || 1);
//         return {
//           left: Math.min(box.left, obj.left),
//           top: Math.min(box.top, obj.top),
//           right: Math.max(box.right, obj.left + objWidth),
//           bottom: Math.max(box.bottom, obj.top + objHeight),
//         };
//       },
//       {
//         left: Infinity,
//         top: Infinity,
//         right: -Infinity,
//         bottom: -Infinity,
//       }
//     );

//     // Calculate scale factors to fit the bounding box within the canvas
//     const boundingBoxWidth = boundingBox.right - boundingBox.left;
//     const boundingBoxHeight = boundingBox.bottom - boundingBox.top;
//     const scaleX = canvasWidth / boundingBoxWidth;
//     const scaleY = canvasHeight / boundingBoxHeight;
//     const baseScale = Math.min(scaleX, scaleY); // Use min to fit within both dimensions

//     // Define a multiplier for additional scaling if needed
//     const scaleMultiplier = 1; // Adjust this multiplier as needed for fitting

//     // Final scale factor
//     const scale = baseScale * scaleMultiplier;

//     // Apply scaling and adjust object positions
//     json.objects.forEach((obj) => {
//       obj.scaleX = (obj.scaleX || 1) * scale;
//       obj.scaleY = (obj.scaleY || 1) * scale;

//       obj.left = (obj.left - boundingBox.left) * scale;
//       obj.top = (obj.top - boundingBox.top) * scale;
//     });

//     // Load objects from JSON data
//     fabricCanvas.loadFromJSON(json, function () {
//       fabricCanvas.renderAll();

//       // Export canvas to image URL
//       const imgData = fabricCanvas.toDataURL({
//         format: format, // 'png' or 'jpeg'
//         quality: quality, // Quality between 0 and 1
//         enableRetinaScaling: false,
//       });
//       fabricImageConverted = imgData;
//       changeTexture(fabricImageConverted);
//       console.log("Image Data URL:", imgData);
//       // You can now use this URL to display or download the image
//       // Example: Set it as the source for an <img> element
//       // document.getElementById('outputImage').src = imgData;
//     });
//   } catch (error) {
//     console.error("Error processing JSON data:", error);
//   }
// }

// function loadJSONToCanvas(json, format = "png", quality = 1) {
//   try {
//     console.log("Received JSON data:", json);

//     // Get the canvas element
//     const canvasElement = document.getElementById("personaliseCanvas");
//     if (!canvasElement) {
//       throw new Error('Canvas element with ID "personaliseCanvas" not found');
//     }

//     // Initialize Fabric.js canvas
//     const fabricCanvas = new fabric.Canvas(canvasElement);

//     // Set canvas dimensions to 460x460
//     const canvasWidth = 460;
//     const canvasHeight = 460;
//     fabricCanvas.setWidth(canvasWidth);
//     fabricCanvas.setHeight(canvasHeight);

//     // Clear the canvas
//     fabricCanvas.clear();

//     // Handle background image if present
//     if (json.backgroundImage) {
//       const backgroundImage = json.backgroundImage;
//       fabric.Image.fromURL(
//         backgroundImage.src,
//         function (img) {
//           img.set({
//             left: 0,
//             top: 0,
//             scaleX: canvasWidth / img.width,
//             scaleY: canvasHeight / img.height,
//             originX: "left",
//             originY: "top",
//           });
//           fabricCanvas.setBackgroundImage(
//             img,
//             fabricCanvas.renderAll.bind(fabricCanvas)
//           );
//         },
//         { crossOrigin: backgroundImage.crossOrigin || "anonymous" }
//       );
//     }

//     // Apply scaling and adjust object positions
//     json.objects.forEach((obj) => {
//       // Apply hardcoded scaling
//       obj.scaleX = 0.225;
//       obj.scaleY = 0.225;

//       // Adjust positions to ensure the object remains within the canvas
//       const scaledWidth = obj.width * obj.scaleX;
//       const scaledHeight = obj.height * obj.scaleY;

//       // Recalculate `left` and `top` positions
//       obj.left = Math.max(0, Math.min(obj.left, canvasWidth - scaledWidth));
//       obj.top = Math.max(0, Math.min(obj.top, canvasHeight - scaledHeight));
//     });

//     // Load objects from JSON data
//     fabricCanvas.loadFromJSON(json, function () {
//       fabricCanvas.renderAll();

//       // Export canvas to image URL
//       const imgData = fabricCanvas.toDataURL({
//         format: format, // 'png' or 'jpeg'
//         quality: quality, // Quality between 0 and 1
//         enableRetinaScaling: false,
//       });
//       fabricImageConverted = imgData;
//       changeTexture(fabricImageConverted);
//       console.log("Image Data URL:", imgData);
//     });
//   } catch (error) {
//     console.error("Error processing JSON data:", error);
//   }
// }

let newFabricCanvas;

function initializeCanvas() {
  const canvasElement = document.getElementById("personaliseCanvas");
  if (!canvasElement) {
    throw new Error('Canvas element with ID "personaliseCanvas" not found');
  }

  newFabricCanvas = new fabric.Canvas(canvasElement);
  newFabricCanvas.setWidth(460);
  newFabricCanvas.setHeight(460);
}

document.getElementById("text-1").addEventListener("input", function () {
  updateCanvasText(1, this.value);
});

document.getElementById("text-2").addEventListener("input", function () {
  updateCanvasText(2, this.value);
});

function updateCanvasText(textIndex, newText) {
  if (!newFabricCanvas) {
    console.error("Fabric canvas is not initialized.");
    return;
  }

  const textObjects = newFabricCanvas.getObjects("textbox");
  let textObjectFound = false;

  textObjects.forEach((obj) => {
    if (obj.dataIndex === textIndex) {
      obj.set({ text: newText });
      textObjectFound = true;
    }
  });

  if (!textObjectFound) {
    console.warn(`No textbox found with dataIndex ${textIndex}`);
  }

  newFabricCanvas.renderAll();
}

// function loadJSONToCanvas(json, format = "png", quality = 1) {
//   try {
//     console.log("Received JSON data:", json);

//     // Initialize the canvas if it hasn't been initialized yet
//     if (!newFabricCanvas) {
//       initializeCanvas();
//     }

//     newFabricCanvas.clear();

//     if (json.backgroundImage) {
//       const backgroundImage = json.backgroundImage;
//       fabric.Image.fromURL(
//         backgroundImage.src,
//         function (img) {
//           img.set({
//             left: 0,
//             top: 0,
//             scaleX: 460 / img.width,
//             scaleY: 460 / img.height,
//             originX: "left",
//             originY: "top",
//             selectable: false,
//             hasControls: false,
//             hasBorders: false,
//             lockMovementX: true,
//             lockMovementY: true,
//             lockRotation: true,
//             lockScalingX: true,
//             lockScalingY: true,
//           });
//           newFabricCanvas.setBackgroundImage(
//             img,
//             newFabricCanvas.renderAll.bind(newFabricCanvas)
//           );
//         },
//         { crossOrigin: backgroundImage.crossOrigin || "anonymous" }
//       );
//     }

//     let nextIndex = 1; // Initialize the index for default values

//     json.objects.forEach((obj) => {
//       obj.scaleX = 0.225;
//       obj.scaleY = 0.225;

//       const scaledWidth = obj.width * obj.scaleX;
//       const scaledHeight = obj.height * obj.scaleY;

//       // obj.left = Math.max(0, Math.min(obj.left, 160 - scaledWidth));
//       // obj.top = Math.max(0, Math.min(obj.top, 160 - scaledHeight));
//       obj.left = Math.max(0, Math.min(350 - scaledWidth));
//       obj.top = Math.max(0, Math.min(160 - scaledHeight));
//       if (obj.type === "textbox") {
//         // Assign a default dataIndex if not provided
//         obj.dataIndex = obj.dataIndex || nextIndex++;
//       }
//     });

//     newFabricCanvas.loadFromJSON(json, function () {
//       newFabricCanvas.forEachObject((obj) => {
//         obj.set({
//           selectable: false,
//           hasControls: false,
//           hasBorders: false,
//           lockMovementX: true,
//           lockMovementY: true,
//           lockRotation: true,
//           lockScalingX: true,
//           lockScalingY: true,
//         });
//       });

//       newFabricCanvas.renderAll();

//       const imgData = newFabricCanvas.toDataURL({
//         format: format,
//         quality: quality,
//         enableRetinaScaling: false,
//       });
//       fabricImageConverted = imgData;
//       changeTexture(fabricImageConverted);
//       console.log("Image Data URL:", imgData);
//     });
//   } catch (error) {
//     console.error("Error processing JSON data:", error);
//   }
// }
function loadJSONToCanvas(json, format = "png", quality = 1) {
  try {
    console.log("Received JSON data:", json);

    // Initialize the canvas if it hasn't been initialized yet
    if (!newFabricCanvas) {
      initializeCanvas();
    }

    newFabricCanvas.clear();

    // Set canvas dimensions
    const canvasWidth = 460;
    const canvasHeight = 460;

    if (json.backgroundImage) {
      const backgroundImage = json.backgroundImage;
      fabric.Image.fromURL(
        backgroundImage.src,
        function (img) {
          img.set({
            left: 0,
            top: 0,
            scaleX: canvasWidth / img.width,
            scaleY: canvasHeight / img.height,
            originX: "left",
            originY: "top",
            selectable: false,
            hasControls: false,
            hasBorders: false,
            lockMovementX: true,
            lockMovementY: true,
            lockRotation: true,
            lockScalingX: true,
            lockScalingY: true,
          });
          newFabricCanvas.setBackgroundImage(
            img,
            newFabricCanvas.renderAll.bind(newFabricCanvas)
          );
        },
        { crossOrigin: backgroundImage.crossOrigin || "anonymous" }
      );
    }

    // Calculate bounding box of all objects
    const boundingBox = json.objects.reduce(
      (box, obj) => {
        const objWidth = obj.width * (obj.scaleX || 1);
        const objHeight = obj.height * (obj.scaleY || 1);
        return {
          left: Math.min(box.left, obj.left),
          top: Math.min(box.top, obj.top),
          right: Math.max(box.right, obj.left + objWidth),
          bottom: Math.max(box.bottom, obj.top + objHeight),
        };
      },
      {
        left: Infinity,
        top: Infinity,
        right: -Infinity,
        bottom: -Infinity,
      }
    );

    // Calculate scale factors to fit the bounding box within the canvas
    const boundingBoxWidth = boundingBox.right - boundingBox.left;
    const boundingBoxHeight = boundingBox.bottom - boundingBox.top;
    const scaleX = canvasWidth / boundingBoxWidth;
    const scaleY = canvasHeight / boundingBoxHeight;
    const baseScale = Math.min(scaleX, scaleY); // Use min to fit within both dimensions

    // Define a multiplier for additional scaling if needed
    const scaleMultiplier = 1; // Adjust this multiplier as needed for fitting

    // Final scale factor
    const scale = baseScale * scaleMultiplier;

    let nextIndex = 1; // Initialize the index for default values

    json.objects.forEach((obj) => {
      // Apply calculated scale to each object
      obj.scaleX = (obj.scaleX || 1) * scale;
      obj.scaleY = (obj.scaleY || 1) * scale;

      const scaledWidth = obj.width * obj.scaleX;
      const scaledHeight = obj.height * obj.scaleY;

      // Center the objects within the canvas, adjusting for their original positions
      obj.left =
        (canvasWidth - boundingBoxWidth * scale) / 2 +
        (obj.left - boundingBox.left) * scale;
      obj.top =
        (canvasHeight - boundingBoxHeight * scale) / 2 +
        (obj.top - boundingBox.top) * scale;

      if (obj.type === "textbox") {
        // Assign a default dataIndex if not provided
        obj.dataIndex = obj.dataIndex || nextIndex++;
      }
    });

    newFabricCanvas.loadFromJSON(json, function () {
      newFabricCanvas.forEachObject((obj) => {
        obj.set({
          selectable: false,
          hasControls: false,
          hasBorders: false,
          lockMovementX: true,
          lockMovementY: true,
          lockRotation: true,
          lockScalingX: true,
          lockScalingY: true,
        });
      });

      newFabricCanvas.renderAll();

      const imgData = newFabricCanvas.toDataURL({
        format: format,
        quality: quality,
        enableRetinaScaling: false,
      });
      fabricImageConverted = imgData;
      changeTexture(fabricImageConverted);
      console.log("Image Data URL:", imgData);
    });
  } catch (error) {
    console.error("Error processing JSON data:", error);
  }
}
function replaceCanvasObjectImage(newImageURL) {
  if (!newFabricCanvas) {
    console.error("Fabric canvas is not initialized.");
    return;
  }

  // Find the image object to replace
  const imageObjects = newFabricCanvas.getObjects("image");

  if (imageObjects.length > 0) {
    const imageObject = imageObjects[0]; // Assuming you want to replace the first image object found

    fabric.Image.fromURL(
      newImageURL,
      function (newImg) {
        newImg.set({
          left: imageObject.left,
          top: imageObject.top,
          scaleX: imageObject.scaleX,
          scaleY: imageObject.scaleY,
          originX: "left",
          originY: "top",
          selectable: false,
          hasControls: false,
          hasBorders: false,
          lockMovementX: true,
          lockMovementY: true,
          lockRotation: true,
          lockScalingX: true,
          lockScalingY: true,
        });

        // Replace the old image object with the new one
        newFabricCanvas.remove(imageObject);
        newFabricCanvas.add(newImg);
        newFabricCanvas.renderAll();
      },
      { crossOrigin: "anonymous" }
    );
  } else {
    console.warn("No image object found to replace.");
  }
}

// Event listeners for buttons

// Close button event listener
document
  .getElementById("personaliseClosePopupBtn")
  .addEventListener("click", () => {
    // Hide the popup
    document.getElementById("personaliseImageUploadPopup").style.display =
      "none";

    // Clear input fields
    document.getElementById("text-1").value = "";
    document.getElementById("text-2").value = "";

    // Clear image input field
    document.getElementById("personaliseImgUpload").value = "";
  });

// Replace image event listener
// document
//   .getElementById("personaliseImgUpload")
//   .addEventListener("change", function (event) {
//     const file = event.target.files[0];
//     if (file) {
//       const reader = new FileReader();

//       reader.onload = function (e) {
//         const newImageURL = e.target.result;

//         // Replace image in canvas object
//         replaceCanvasObjectImage(newImageURL);
//       };

//       reader.readAsDataURL(file);
//     }
//   });
// document
//   .getElementById("personaliseClosePopupBtn")
//   .addEventListener("click", () => {
//     // Hide the popup
//     document.getElementById("personaliseImageUploadPopup").style.display =
//       "none";
//   });
document
  .getElementById("personaliseClosePopupBtn")
  .addEventListener("click", () => {
    // Hide the popup
    document.getElementById("personaliseImageUploadPopup").style.display =
      "none";

    // Clear the file input field

    // Clear the text input fields
    const textInput1 = document.getElementById("text-1");
    const textInput2 = document.getElementById("text-2");

    if (textInput1) {
      textInput1.value = ""; // Clear the first text input
    }

    if (textInput2) {
      textInput2.value = ""; // Clear the second text input
    }
  });

// Event listener for file input change
document
  .getElementById("personaliseImgUpload")
  .addEventListener("change", handleImageUpload);

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.getElementById("personaliseCanvas");
        const ctx = canvas.getContext("2d");

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Calculate dimensions while maintaining aspect ratio
        const imgAspectRatio = img.width / img.height;
        const canvasAspectRatio = canvas.width / canvas.height;
        let drawWidth, drawHeight;

        if (imgAspectRatio > canvasAspectRatio) {
          drawWidth = canvas.width;
          drawHeight = canvas.width / imgAspectRatio;
        } else {
          drawWidth = canvas.height * imgAspectRatio;
          drawHeight = canvas.height;
        }

        const drawX = (canvas.width - drawWidth) / 2;
        const drawY = (canvas.height - drawHeight) / 2;

        // Draw the image with maintained aspect ratio
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

        // Update the selected image data URL
        selectedImage = canvas.toDataURL("image/png");

        // Initialize Fabric.js canvas
        fabricCanvas = new fabric.Canvas("personaliseCanvas");
        const fabricImage = new fabric.Image(img, {
          left: drawX,
          top: drawY,
          scaleX: drawWidth / img.width,
          scaleY: drawHeight / img.height,
          selectable: false, // Disable selection and resizing controls by default
        });
        fabricCanvas.add(fabricImage);
        fabricCanvas.setActiveObject(fabricImage);
        fabricCanvas.discardActiveObject(); // Ensure the image is not selected initially
        fabricCanvas.renderAll();

        // Store a reference to the fabric image
        fabricCanvas.imageObject = fabricImage;
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

// Event listener for the "Adjust" button click
document
  .getElementById("personaliseAdjustBtn")
  .addEventListener("click", () => {
    if (fabricCanvas) {
      const activeObject = fabricCanvas.imageObject;
      if (activeObject) {
        activeObject.set({
          selectable: true,
          hasControls: true,
        });
        fabricCanvas.setActiveObject(activeObject);
      }
      fabricCanvas.renderAll();
    }
  });

document.getElementById("personaliseDoneBtn").addEventListener("click", () => {
  console.log(fabricImageConverted);
  changeTexture(fabricImageConverted);
  if (fabricCanvas || fabricImageConverted) {
    // Check if there's an active object (the uploaded image)
    const activeObject = fabricCanvas.getActiveObject();

    // If no active object, use the imageObject stored in the fabricCanvas
    const objectToUse = activeObject || fabricCanvas.imageObject;

    if (objectToUse) {
      // Get the image as a data URL
      selectedImage = fabricCanvas.toDataURL({
        format: "png",
      });
      console.log(fabricImageConverted);
      // Apply the selectedImage as a texture to your 3D model
      changeTexture(fabricImageConverted);
      changeTexture(selectedImage);
      // Disable resizing and adjusting
      objectToUse.set("selectable", false);
      fabricCanvas.discardActiveObject(); // Deselect the object
      fabricCanvas.renderAll();
    }

    // Close the image upload popup
    document.getElementById("personaliseImageUploadPopup").style.display =
      "none";
  }
});

// Initialize the 3D viewer when the page is ready
initialize3DViewer();

(async () => {
  try {
    const response = await fetch(
      "https://interactive.hexanovamedia.tech/api/v1/user/get/all"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const dataArray = data.data; // Access the array from the data object

    if (Array.isArray(dataArray)) {
      // Filter the objects with type "p2-type1"
      const filteredData = dataArray.filter((obj) => obj.type === "p2-type1");

      // Get the container element where you want to display the names
      const container = document.getElementById("library-container");

      filteredData.forEach((item) => {
        const newDiv = document.createElement("div");
        newDiv.classList.add("personalise-library-box");

        const newP = document.createElement("p");
        newP.textContent = item.name;

        newDiv.appendChild(newP);
        container.appendChild(newDiv);

        // Add click event listener
        newDiv.addEventListener("click", async () => {
          // Remove active class from previously selected item
          const previouslyActive = container.querySelector(
            ".personalise-library-box.active"
          );
          if (previouslyActive) {
            previouslyActive.classList.remove("active");
          }

          // Add active class to the clicked item
          newDiv.classList.add("active");
          activeItem = item.src; // Set the clicked item as active
          console.log(activeItem);
          // Fetch the JSON data from the URL in activeItem
          try {
            const jsonResponse = await fetch(activeItem); // Assuming activeItem has a jsonUrl property
            if (!jsonResponse.ok) {
              throw new Error(`HTTP error! status: ${jsonResponse.status}`);
            }
            const jsonData = await jsonResponse.json();
            console.log(jsonData);
            console.log(fabricImageConverted);
            // Pass the JSON object to loadJSONToCanvas
            loadJSONToCanvas(jsonData);
          } catch (fetchError) {
            console.error("Error fetching JSON data:", fetchError);
          }
        });
      });

      console.log("Filtered data:", filteredData);
    } else {
      console.error("Error: The fetched data is not an array:", dataArray);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
})();
