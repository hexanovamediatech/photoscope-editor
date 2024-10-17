import * as THREE from "../../build/three.module.js";
import { OrbitControls } from "../../jsm/OrbitControls.js";
import { GLTFLoader } from "../../jsm/GLTFLoader.js";
import { RoomEnvironment } from "../../jsm/RoomEnvironment.js";

let camera, scene, renderer, controls;
let activeItem = null;
let savedCanvasJSON;
let newImageSrc = null;
let imageUpdatedJSON;
let imageReplace = false;
let newFabricCanvas;
let fabricImageConverted = null;
let modelSource = null;
let templateId = null;
let selectedMesh = null;
let isPublic;
// Initialize the 3D viewer
document.addEventListener("variableReady", function (e) {
  if (scene) {
    changeTexture(e.detail.data);
  } else {
    initialize3DViewer();
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
    const productNameTag = document.querySelector(
      ".personalise-product-name-text"
    );
    if (productNameTag) {
      productNameTag.textContent = modelName; // Update the product name
    }
    const product = data.products.find((item) => item.name === modelName);
    if (product && product.modelsUrl) {
      modelSource = product.modelsUrl; // Set the model URL
      window.layoutSource = product.imageUrl;
      selectedMesh = product.specificMesh;
    } else {
      console.error("Model not found for the specified name.");
    }
  } catch (error) {
    console.error("Error fetching model data:", error);
  }
}

// function initPersonalise() {
//   const loader = document.getElementById("mini-editor-loader-cont");

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

//   // Load the GLB model dynamically based on the 'name' parameter
//   new GLTFLoader().load(modelSource, function (gltf) {
//     const loadedModel = gltf.scene;

//     loadedModel.position.set(0, -0.11, 0);
//     scene.add(gltf.scene);
//     loader.classList.remove("display-block-prop");
//     loader.classList.add("display-none-prop");
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
function showLoader() {
  const mainContainer = document.getElementById("personalise-3d-container");
  // Create the loader
  const loader = document.createElement("div");
  loader.classList.add("loader3");

  // Add the bars dynamically for the loader
  for (let i = 1; i <= 10; i++) {
    const bar = document.createElement("div");
    bar.classList.add("bars", `bar${i}`);
    loader.appendChild(bar);
  }

  // Append loader to the main container
  mainContainer.appendChild(loader);
  // mainContainer.style.backgroundColor = "#f0f0f0";

  // Return the loader element so it can be hidden later
  return loader;
}

// Call this function to hide the loader after the model is loaded
function hideLoader(loader) {
  loader.style.display = "none";
}

const loader = showLoader();

function initPersonalise() {
  const mainContainer = document.getElementById("personalise-3d-container");

  mainContainer.style.backgroundColor = "#f0f0f0";

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    20
  );

  camera.position.set(0, 0.08, 2);

  scene = new THREE.Scene();

  // Load the GLB model dynamically based on the 'name' parameter
  new GLTFLoader().load(modelSource, function (gltf) {
    const loadedModel = gltf.scene;

    // Calculate the bounding box of the loaded model
    const boundingBox = new THREE.Box3().setFromObject(loadedModel);
    const center = boundingBox.getCenter(new THREE.Vector3());
    const size = boundingBox.getSize(new THREE.Vector3());

    // Reposition the model to center it
    loadedModel.position.x -= center.x;
    loadedModel.position.y -= center.y;
    loadedModel.position.z -= center.z;

    // Fine-tune Y-axis to center vertically (slight downward adjustment)
    loadedModel.position.y -= size.y * 0.2; // Adjust to center vertically

    // Optionally scale the model to fit within the camera's view
    const maxSize = Math.max(size.x, size.y, size.z);
    const scaleFactor = 0.35 / maxSize; // Adjust based on your camera setup
    loadedModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

    // Add the centered model to the scene
    scene.add(loadedModel);
    // loader.style.display = "none";
    hideLoader(loader);
  });

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.5;

  mainContainer.appendChild(renderer.domElement);

  const environment = new RoomEnvironment(renderer);
  const pmremGenerator = new THREE.PMREMGenerator(renderer);

  scene.background = new THREE.Color(0xbfc3cc);
  scene.environment = pmremGenerator.fromScene(environment).texture;

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.minDistance = 0.35;
  controls.maxDistance = 0.7;
  controls.target.set(0, 0, 0); // Ensure controls target the center of the scene
  controls.update();
  onWindowResizePersonalise()
  window.addEventListener("resize", onWindowResizePersonalise);
}
// function onWindowResizePersonalise() {
//   const mainContainer = document.getElementById("personalise-3d-container");
//   const containerWidth = mainContainer.offsetWidth;
//   const containerHeight = mainContainer.offsetHeight;
//   const size = Math.min(containerWidth, containerHeight);
//   camera.aspect = size / size;
//   camera.updateProjectionMatrix();
//   renderer.setSize(size, size);
// }
function onWindowResizePersonalise() {
  const mainContainer = document.getElementById("personalise-3d-container");
  const containerWidth = mainContainer.offsetWidth;
  const containerHeight = mainContainer.offsetHeight;

  // Calculate the aspect ratio based on container size
  const aspectRatio = containerWidth / containerHeight;

  // Adjust camera aspect and projection matrix
  camera.aspect = aspectRatio;
  camera.updateProjectionMatrix();

  // Resize the renderer to fit the new container dimensions
  renderer.setSize(containerWidth, containerHeight);
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
    console.log(selectedMesh);
    const specificMesh = scene.getObjectByName(selectedMesh);

    if (specificMesh) {
      textureLoader.load(
        "assets/3d/76_leather texture-seamless.jpg",
        (bumpMap) => {
          textureLoader.load(newUrl, (texture) => {
            const material = new THREE.MeshStandardMaterial({
              map: texture,
              // bumpMap: bumpMap,
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
    }
  }
}

async function initialize3DViewer() {
  try {
    // Wait for model data to be fetched
    await fetchModelData();

    // Proceed with initialization only if modelSource is available
    if (modelSource && selectedMesh) {
      initPersonalise();
      animate();
    } else {
      console.error("No model source found. 3D viewer initialization skipped.");
    }
  } catch (error) {
    console.error("Failed to initialize 3D viewer:", error);
  }
}
document
  .getElementById("personaliseOpenPopupBtn")
  .addEventListener("click", async () => {
    // Check if imageReplace is true before proceeding
    if (imageReplace) {
      const dummyCont = document.getElementById("personaliseImageDummyCont");
      dummyCont.style.display = "none";
      const realEditCont = document.getElementById(
        "personaliseImageUploadPopup"
      );
      realEditCont.style.display = "block";
      // Check if there is an active item
      if (activeItem) {
        try {
          const response = await fetch(activeItem.src);
          const jsonData = await response.json();
          // Load the JSON data to the canvas
          loadJSONToCanvas(jsonData);
        } catch (error) {
          console.error("Error fetching or parsing the JSON:", error);
        }
      }

      // Show the popup
      // document.getElementById("personaliseImageUploadPopup").style.visibility =
      //   "visible";
    } else {
      Swal.fire({
        title: "Select any template to use Personalise",
        icon: "warning",
        showConfirmButton: true,
        confirmButtonText: "OK",
        allowOutsideClick: true,
        allowEscapeKey: true,
      });
    }
  });

function initializeCanvas() {
  const canvasElement = document.getElementById("personaliseCanvas");
  if (!canvasElement) {
    throw new Error('Canvas element with ID "personaliseCanvas" not found');
  }

  newFabricCanvas = new fabric.Canvas(canvasElement);
  newFabricCanvas.setWidth(440);
  newFabricCanvas.setHeight(440);
}

document.getElementById("text-1").addEventListener("input", function () {
  updateCanvasText(1, this.value);
  if (activeItem) {
    const openModalBtn = document.getElementById("hexa-mini-editor-save");
    openModalBtn.style.visibility = "visible";
  }
});

document.getElementById("text-2").addEventListener("input", function () {
  updateCanvasText(2, this.value);
  if (activeItem) {
    const openModalBtn = document.getElementById("hexa-mini-editor-save");
    openModalBtn.style.visibility = "visible";
  }
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

  savedCanvasJSON = newFabricCanvas.toJSON();
  window.editedCanvasJson = savedCanvasJSON;
  const allObjects = newFabricCanvas.getObjects();

  // Save the first object (assuming it's the background image)
  const firstObject = allObjects[0];

  // Remove the first object from the canvas
  newFabricCanvas.remove(firstObject);

  // Render the canvas without the first object
  newFabricCanvas.renderAll();
  const originalWidth = newFabricCanvas.width;
  const originalHeight = newFabricCanvas.height;

  // Set the canvas dimensions to 1080x1080 for the export
  newFabricCanvas.setDimensions({
    width: 1080,
    height: 1080,
  });
  newFabricCanvas.setZoom(1080 / Math.min(originalWidth, originalHeight));

  // Convert the remaining objects on the canvas to an image
  const format = "jpeg";
  const quality = 1;
  const imgData = newFabricCanvas.toDataURL({
    format: format,
    quality: quality,
    enableRetinaScaling: false,
  });
  newFabricCanvas.setDimensions({
    width: originalWidth,
    height: originalHeight,
  });
  newFabricCanvas.setZoom(1);
  // Pass the image data to the changeTexture function
  fabricImageConverted = imgData;
  changeTexture(fabricImageConverted);

  // Add the first object back to its original position
  newFabricCanvas.insertAt(firstObject, 0);

  // Render the canvas to show all objects again
  newFabricCanvas.renderAll();

  const updatedCanvasJSON = newFabricCanvas.toJSON();
  window.editedCanvasJson = updatedCanvasJSON;
  console.log(window.editedCanvasJson);
}

// function replaceImageSrc(json, newImageSrc, callback) {
//   let imageFoundInGroup = false;

//   // Check if there are images within groups
//   json.objects.forEach((obj) => {
//     if (obj.type === "group") {
//       obj.objects.forEach((innerObj) => {
//         if (innerObj.type === "image") {
//           innerObj.src = newImageSrc;
//           imageFoundInGroup = true;
//         }
//       });
//     }
//   });

//   if (imageFoundInGroup) {
//     json.objects.forEach((obj) => {
//       if (obj.type === "group") {
//         obj.objects.forEach((innerObj) => {
//           if (innerObj.type === "image") {
//             innerObj.src = newImageSrc;
//           }
//         });
//       }
//     });
//   } else {
//     if (json.objects.length > 1 && json.objects[1].type === "image") {
//       json.objects[1].src = newImageSrc;
//     }
//     console.log("Image updated in second position or no groups found");
//   }

//   imageUpdatedJSON = json;
//   console.log(imageUpdatedJSON, "image updated json strc");
//   if (callback) callback(imageUpdatedJSON);
// }
function replaceImageSrc(json, newImageSrc, callback) {
  // Create a new image object to load the base64 image
  const img = new Image();
  img.src = newImageSrc;

  // Once the image is loaded, get its width and height
  img.onload = function () {
    const imageWidth = img.width;
    const imageHeight = img.height;

    console.log(`Image Width: ${imageWidth}, Image Height: ${imageHeight}`);

    // Find the object where obj.type === "image" and obj.src does not start with "http"
    json.objects.forEach((obj) => {
      if (obj.type === "image" && !obj.src.startsWith("http")) {
        obj.src = newImageSrc;
        obj.width = imageWidth; // Set the width and height if needed
        obj.height = imageHeight;
      }
    });

    const imageUpdatedJSON = json;
    console.log(imageUpdatedJSON, "image updated json structure");

    if (callback) callback(imageUpdatedJSON);
  };

  // Handle error if the image fails to load
  img.onerror = function () {
    console.error("Failed to load the image");
  };
}
function loadJSONToCanvas(jsonData) {
  if (!newFabricCanvas) {
    initializeCanvas();
  }

  newFabricCanvas.clear();

  const label1 = document.getElementById("label-1");
  const label2 = document.getElementById("label-2");
  const input1 = document.getElementById("text-1");
  const input2 = document.getElementById("text-2");
  label1.style.display = "none";
  label2.style.display = "none";
  input1.style.display = "none";
  input2.style.display = "none";

  // Count the number of textboxes in the JSON data
  const textBoxCount = jsonData.objects.filter(
    (obj) => obj.type === "textbox"
  ).length;

  const showImage = jsonData.objects.filter(
    (obj) => obj.customId === "clipmask"
  );
  if (showImage.length > 0) {
    const clipmaskImage = showImage[0]; // Assuming there's at least one matching image

    const miniEditorPopupImage = document.getElementById(
      "min-editor-popup-image"
    );

    // const dummyImage = document.getElementById("min-editor-dummy-image");

    // Check if the image element exists and if the clipmaskImage has a valid src
    if (miniEditorPopupImage && clipmaskImage.src) {
      // Set the src of the mini-editor-popup-image to the clipmaskImage's src
      miniEditorPopupImage.src = clipmaskImage.src;
      // dummyImage.style.width = "100%";
      // dummyImage.style.height = "100%";
      // dummyImage.style.objectFit = "cover";
      // dummyImage.src = clipmaskImage.src;
      // dummyImage.style.borderRadius = "10px";
    }
    //  else {
    //   miniEditorPopupImage.src = "../../assets/custom/no-photo.png";
    // }
  }

  // Show input fields based on the number of textboxes
  if (textBoxCount > 0) {
    label1.style.display = "block";
    input1.style.display = "block"; // Show the first input field
  }
  if (textBoxCount > 1) {
    label2.style.display = "block";
    input2.style.display = "block"; // Show the second input field if there are two or more textboxes
  }
  const replaceImgBtn = document.getElementById("replace-btn-cont");
  const imageFound = jsonData.objects.find(
    (obj) => obj.type === "image" && !obj.src.startsWith("http")
  );
  if (imageFound) {
    replaceImgBtn.style.display = "block";
  } else {
    replaceImgBtn.style.display = "none";
  }
  // Load the JSON data into the existing Fabric.js canvas
  let nextIndex = 1;
  jsonData.objects.forEach((obj) => {
    if (obj.type === "textbox") {
      // Assign a default dataIndex if not provided
      obj.dataIndex = obj.dataIndex || nextIndex++;
      const inputField = document.getElementById(`text-${obj.dataIndex}`);
      if (inputField) {
        inputField.value = obj.text || ""; // Set the input field value to the text from the JSON
      }
    }
  });
  newFabricCanvas.loadFromJSON(
    jsonData,
    function () {
      console.log(jsonData.objects);

      // Load and scale the background image if it exists
      if (jsonData.backgroundImage && jsonData.backgroundImage.src) {
        const bgImageData = jsonData.backgroundImage.src;
        fabric.Image.fromURL(bgImageData, function (bgImage) {
          // Set the background image properties
          bgImage.set({
            scaleX: 0.22, // Apply the scale factor
            scaleY: 0.22, // Apply the scale factor
            left: jsonData.backgroundImage.left,
            top: jsonData.backgroundImage.top,
            originX: "left",
            originY: "top",
          });

          newFabricCanvas.setBackgroundImage(
            bgImage,
            newFabricCanvas.renderAll.bind(newFabricCanvas)
          );
        });
      }

      // After loading the JSON, resize and reposition all objects to fit the canvas
      newFabricCanvas.getObjects().forEach((obj, index) => {
        if (index === 0) {
          // Scale down the first object
          obj.scaleX *= 0.22;
          obj.scaleY *= 0.22;
        } else {
          // Apply a different scaling factor for other objects
          obj.scaleX *= 0.22; // Adjust the scaling factor as needed
          obj.scaleY *= 0.22; // Adjust the scaling factor as needed

          // Adjust top and left properties to make the object visible
          obj.left *= 0.22; // Adjust the position as needed
          obj.top *= 0.22; // Adjust the position as needed
        }

        if (obj.clipPath) {
          obj.clipPath.set({
            scaleX: obj.clipPath.scaleX * 0.22, // Adjust the scaling factor as needed
            scaleY: obj.clipPath.scaleY * 0.22, // Adjust the scaling factor as needed
            left: obj.clipPath.left * 0.22, // Adjust the position as needed
            top: obj.clipPath.top * 0.22, // Adjust the position as needed
          });
        }

        obj.setCoords();
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

      // Force a render to ensure all objects, including clipPaths, are applied
      newFabricCanvas.renderAll();

      savedCanvasJSON = newFabricCanvas.toJSON();
      window.editedCanvasJson = savedCanvasJSON;
      const allObjects = newFabricCanvas.getObjects();

      // Save the first object (assuming it's the background image)
      const firstObject = allObjects[0];

      // Remove the first object from the canvas
      newFabricCanvas.remove(firstObject);

      // Render the canvas without the first object
      newFabricCanvas.renderAll();
      const originalWidth = newFabricCanvas.width;
      const originalHeight = newFabricCanvas.height;

      // Set the canvas dimensions to 1080x1080 for the export
      newFabricCanvas.setDimensions({
        width: 1080,
        height: 1080,
      });
      newFabricCanvas.setZoom(1080 / Math.min(originalWidth, originalHeight));

      // Convert the remaining objects on the canvas to an image
      const format = "jpeg";
      const quality = 1;
      const imgData = newFabricCanvas.toDataURL({
        format: format,
        quality: quality,
        enableRetinaScaling: false,
      });
      newFabricCanvas.setDimensions({
        width: originalWidth,
        height: originalHeight,
      });
      newFabricCanvas.setZoom(1);
      // Pass the image data to the changeTexture function
      fabricImageConverted = imgData;
      console.log("this is thefabricImageConverted", fabricImageConverted);
      if (selectedMesh) {
        changeTexture(fabricImageConverted);
      }

      // Add the first object back to its original position
      newFabricCanvas.insertAt(firstObject, 0);

      // Render the canvas to show all objects again
      newFabricCanvas.renderAll();
    },
    function (error) {
      console.error("Error loading JSON:", error);
      console.log("Loaded JSON Data:", jsonData);
    }
  );
}

function setNewImageSrc(imageSrc) {
  newImageSrc = imageSrc;

  var originalCanvasJson = window.originalCanvasJson;
  var editedCanvasJson = window.editedCanvasJson;

  // Function to overwrite the text in originalCanvasJsonwith editedCanvasJson's text
  function overwriteText(originalJSON, updatedJSON) {
    if (
      originalJSON.objects &&
      updatedJSON.objects &&
      originalJSON.objects.length === updatedJSON.objects.length
    ) {
      originalJSON.objects.forEach((obj, index) => {
        if (
          obj.type === "textbox" &&
          updatedJSON.objects[index].type === "textbox"
        ) {
          // Overwrite the text
          obj.text = updatedJSON.objects[index].text;
        }
      });
    }
  }

  // Overwrite text from editedCanvasJson to originalCanvasJson
  overwriteText(originalCanvasJson, editedCanvasJson);

  if (typeof newImageSrc !== "undefined") {
    // Replace the image source in the parsed JSON and compress it
    replaceImageSrc(originalCanvasJson, newImageSrc, (imageUpdatedJSON) => {
      // Load the updated JSON onto the canvas
      loadJSONToCanvas(imageUpdatedJSON);

      window.editedCanvasJson = imageUpdatedJSON;
      // console.log("Updated JSON with overwritten text:", imageUpdatedJSON);
    });
  } else {
    // Log the updated JSON (without changing image source) to the console
    console.log("Updated JSON with overwritten text:", originalCanvasJson);
  }
}

// Assuming the user selects an image via an input field
function handleImageUploadAlternate(event) {
  if (activeItem) {
    // const miniEditorAdjust = document.getElementById("miniE-adjust-Btn");
    // // miniEditorAdjust.style.display = "none";
    // miniEditorAdjust.classList.add("display-none-prop");
    // miniEditorAdjust.classList.remove("display-block-prop");
    const openModalBtn = document.getElementById("hexa-mini-editor-save");
    openModalBtn.style.visibility = "visible";
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      const imageSrc = e.target.result;
      setNewImageSrc(imageSrc); // Store the new image source
      // loadJSONToCanvas(savedCanvasJSON); // Reload the JSON to canvas with the new image
      const miniEditorPopupImage = document.getElementById(
        "min-editor-popup-image"
      );
      if (miniEditorPopupImage) {
        miniEditorPopupImage.src = imageSrc; // Set the new image source
      }
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  }
}
document
  .getElementById("personaliseImgUpload")
  .addEventListener("change", handleImageUploadAlternate);
// Replace image event listener

// document
//   .getElementById("personaliseClosePopupBtn")
//   .addEventListener("click", () => {
//     // Hide the popup
//     document.getElementById("personaliseImageUploadPopup").style.display =
//       "none";

//     // Clear the file input field
//     const textInput1 = document.getElementById("text-1");
//     const textInput2 = document.getElementById("text-2");
//   });
// document.getElementById("miniE-text-done-Btn").addEventListener("click", () => {
//   if (activeItem) {
//     const miniEditorCont = document.getElementById("mini-editor-Cont");
//     miniEditorImgContainerId.style.display = "flex";
//     const miniEditorImgContainerId = document.getElementById(
//       "mini-editor-img-container-id"
//     );
//     miniEditorCont.classList.add("display-none-prop");
//     miniEditorCont.classList.remove("display-block-prop");
//     if (newFabricCanvas) {
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

//       savedCanvasJSON = newFabricCanvas.toJSON();
//       window.editedCanvasJson = savedCanvasJSON;
//       console.log(window.editedCanvasJson);

//       const allObjects = newFabricCanvas.getObjects();

//       // Save the first object (assuming it's the background image)
//       const firstObject = allObjects[0];

//       // Remove the first object from the canvas
//       newFabricCanvas.remove(firstObject);

//       // Render the canvas without the first object
//       newFabricCanvas.renderAll();
//       const originalWidth = newFabricCanvas.width;
//       const originalHeight = newFabricCanvas.height;

//       // Set the canvas dimensions to 1080x1080 for the export
//       newFabricCanvas.setDimensions({
//         width: 1080,
//         height: 1080,
//       });
//       newFabricCanvas.setZoom(1080 / Math.min(originalWidth, originalHeight));

//       // Convert the remaining objects on the canvas to an image
//       const format = "jpeg";
//       const quality = 1;
//       const imgData = newFabricCanvas.toDataURL({
//         format: format,
//         quality: quality,
//         enableRetinaScaling: false,
//       });
//       newFabricCanvas.setDimensions({
//         width: originalWidth,
//         height: originalHeight,
//       });
//       newFabricCanvas.setZoom(1);
//       fabricImageConverted = imgData;
//       changeTexture(fabricImageConverted);

//       // Add the first object back to its original position
//       newFabricCanvas.insertAt(firstObject, 0);

//       // Render the canvas to show all objects again
//       newFabricCanvas.renderAll();
//     }
//   }
//   // Clear the file input field
// });

// Event listener for the "Adjust" button click

document
  .getElementById("personaliseAdjustBtn")
  .addEventListener("click", () => {
    // Display Canvas in popup
    // const miniEditorImgContainerId = document.getElementById(
    //   "mini-editor-img-container-id"
    // );
    // const miniEditorCont = document.getElementById("mini-editor-Cont");
    // miniEditorCont.classList.remove("display-none-prop");
    // miniEditorCont.classList.add("display-block-prop");
    // miniEditorImgContainerId.style.display = "none";
    // Display Done Button
    // const miniEditorDone = document.getElementById("miniE-done-Btn");
    // miniEditorDone.classList.remove("display-none-prop");
    // miniEditorDone.classList.add("display-block-prop");
    const popupMiniCanvas = document.getElementById("popup-mini-canvas");
    popupMiniCanvas.style.display = "flex";
    // // // Hide Adjust Button
    // const miniEditorAdjust = document.getElementById("miniE-adjust-Btn");
    // miniEditorAdjust.classList.add("display-none-prop");
    // miniEditorAdjust.classList.remove("display-block-prop");

    if (newFabricCanvas) {
      // Set properties for the first object in the canvas
      const objects = newFabricCanvas.getObjects();
      const targetObject = objects.find(
        (obj) => obj.type === "image" && !obj.src.startsWith("http")
      );

      if (targetObject) {
        // Set properties for the found object
        targetObject.set({
          selectable: true,
          hasControls: true,
          hasBorders: true,
          lockMovementX: false,
          lockMovementY: false,
          lockRotation: false,
          lockScalingX: false,
          lockScalingY: false,
        });
      }

      // Render the canvas after adjustments
      newFabricCanvas.renderAll();

      // Save the updated canvas state to localStorage
      savedCanvasJSON = newFabricCanvas.toJSON();
      window.editedCanvasJson = savedCanvasJSON;
    }
  });

document
  .getElementById("closePopup-mini-canvas")
  .addEventListener("click", () => {
    const popupMiniCanvas = document.getElementById("popup-mini-canvas");
    popupMiniCanvas.style.display = "none";
  });
document.getElementById("personaliseDoneBtn").addEventListener("click", () => {
  if (activeItem) {
    if (newFabricCanvas) {
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

      savedCanvasJSON = newFabricCanvas.toJSON();
      window.editedCanvasJson = savedCanvasJSON;
      console.log(window.editedCanvasJson);

      const allObjects = newFabricCanvas.getObjects();

      // Save the first object (assuming it's the background image)
      const firstObject = allObjects[0];

      // Remove the first object from the canvas
      newFabricCanvas.remove(firstObject);

      // Render the canvas without the first object
      newFabricCanvas.renderAll();
      const originalWidth = newFabricCanvas.width;
      const originalHeight = newFabricCanvas.height;

      // Set the canvas dimensions to 1080x1080 for the export
      newFabricCanvas.setDimensions({
        width: 1080,
        height: 1080,
      });
      newFabricCanvas.setZoom(1080 / Math.min(originalWidth, originalHeight));

      // Convert the remaining objects on the canvas to an image
      const format = "jpeg";
      const quality = 1;
      const imgData = newFabricCanvas.toDataURL({
        format: format,
        quality: quality,
        enableRetinaScaling: false,
      });
      newFabricCanvas.setDimensions({
        width: originalWidth,
        height: originalHeight,
      });
      newFabricCanvas.setZoom(1);
      fabricImageConverted = imgData;
      changeTexture(fabricImageConverted);

      // Add the first object back to its original position
      newFabricCanvas.insertAt(firstObject, 0);

      // Render the canvas to show all objects again
      newFabricCanvas.renderAll();
    }

    // Hide Done Button
    // const miniEditorDone = document.getElementById("miniE-done-Btn");
    // miniEditorDone.classList.add("display-none-prop");
    // miniEditorDone.classList.remove("display-block-prop");

    //Display Adjust Button

    // const miniEditorAdjust = document.getElementById("miniE-adjust-Btn");
    // miniEditorAdjust.classList.remove("display-none-prop");
    // miniEditorAdjust.classList.add("display-block-prop");

    const popupMiniCanvas = document.getElementById("popup-mini-canvas");
    popupMiniCanvas.style.display = "none";

    // Hide Canvas in popup
    // const miniEditorCont = document.getElementById("mini-editor-Cont");
    // miniEditorCont.classList.add("display-none-prop");
    // miniEditorCont.classList.remove("display-block-prop");
    // const miniEditorImgContainerId = document.getElementById(
    //   "mini-editor-img-container-id"
    // );
    // miniEditorImgContainerId.style.display = "flex";
  }
});

// Initialize the 3D viewer when the page is ready
initialize3DViewer();

(async () => {
  var container = document.getElementById("template-cont-box");
  function showSkeletonLoader() {
    const skeletonContainer = document.createElement("div");
    skeletonContainer.classList.add("skeleton-container");

    for (let i = 0; i < 10; i++) {
      const skeletonBox = document.createElement("div");
      skeletonBox.classList.add("skeleton-box");

      const skeletonText = document.createElement("div");
      skeletonText.classList.add("skeleton-text");

      skeletonBox.appendChild(skeletonText);
      skeletonContainer.appendChild(skeletonBox);
    }

    container.appendChild(skeletonContainer);
  }

  function hideSkeletonLoader() {
    const skeletonContainer = container.querySelector(".skeleton-container");
    if (skeletonContainer) {
      container.removeChild(skeletonContainer); // Remove the skeleton loader
    }
  }

  // Show the skeleton loader before fetching data
  showSkeletonLoader();

  try {
    const response = await fetch(
      "https://backend.toddlerneeds.com/api/v1/user/get/all/templates"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const dataArray = data.data; // Access the array from the data object
    console.log(dataArray);
    if (Array.isArray(dataArray)) {
      // Filter the objects with type "p2-type1"
      const urlParams = new URLSearchParams(window.location.search);
      const name = urlParams.get("name");

      const filteredData = dataArray.filter(
        (obj) => obj.type === name && obj.isPublic === true
      );
      if (filteredData.length < 10) {
        const dummyTemplateCount = 10 - filteredData.length;
        for (let i = 0; i < dummyTemplateCount; i++) {
          const dummyTemplate = {
            name: `Template ${i + 1}`,
            imageUrl: "../../assets/custom/temp_img.png",
            key: `dummy-template-${i + 1}`,
            isPublic: true,
            src: "path/to/dummy/template.json",
            isDummy: true,
          };
          filteredData.push(dummyTemplate);
        }
      }
      const personaliseButton = document.getElementById(
        "personaliseOpenPopupBtn"
      );

      // Check if the filtered data is empty, and hide the button if it is
      if (filteredData.length === 0) {
        personaliseButton.style.display = "none"; // Hide the button
      } else {
        personaliseButton.style.display = "block"; // Show the button (optional, in case it needs to be re-displayed)
      }

      // Fetch favorites to compare with
      const favoriteResponse = await fetch(
        "https://backend.toddlerneeds.com/api/v1/user/favorite/templates",
        {
          method: "GET",
          credentials: "include",
        }
      );
      const favoriteData = await favoriteResponse.json();
      hideSkeletonLoader();

      const favoriteKeys = favoriteData?.favorites?.map((fav) => fav.key);

      filteredData.forEach((item) => {
        const mainDiv = document.createElement("div");
        mainDiv.classList.add("template-main-cont");

        const imageDiv = document.createElement("div");
        imageDiv.classList.add("template-image-cont");

        const newImg = document.createElement("img");
        newImg.src = item.imageUrl;
        newImg.alt = item.name;
        newImg.classList.add("template-image-box");
        newImg.loading = "lazy";

        imageDiv.appendChild(newImg);

        const nameP = document.createElement("p");
        nameP.textContent = item.name;
        nameP.classList.add("template-name-tag");

        mainDiv.appendChild(imageDiv);
        mainDiv.appendChild(nameP);

        container.appendChild(mainDiv);
        // Favorite icon using PNGs
        if (!item.isDummy) {
          const favIcon = document.createElement("img");
          favIcon.classList.add("template-fav-icon");
          favIcon.id = "templateFavIcon";
          // Check if this template is in the favorites list
          const isFavorite = favoriteKeys?.includes(item.key);
          favIcon.src = isFavorite
            ? "../../assets/custom/heart-filled.png"
            : "../../assets/custom/heart2.png";
          favIcon.alt = isFavorite ? "Unfavorite" : "Favorite";
          favIcon.style.cursor = "pointer";

          if (!isFavorite) {
            favIcon.style.filter = "brightness(0) invert(1)"; // Make heart2.png white
          }

          favIcon.addEventListener("mouseenter", () => {
            if (isFavorite) {
              favIcon.src = "../../assets/custom/heart2.png"; // Switch to unfilled on hover
              favIcon.style.filter = "brightness(0) invert(1)"; // Make it white on hover
            } else {
              favIcon.src = "../../assets/custom/heart-filled.png"; // Switch to filled on hover
              favIcon.style.filter = ""; // Remove the filter for heart-filled
            }
          });
          favIcon.addEventListener("mouseleave", () => {
            if (isFavorite) {
              favIcon.src = "../../assets/custom/heart-filled.png"; // Return to filled if it's favorite
              favIcon.style.filter = ""; // No filter for filled heart
            } else {
              favIcon.src = "../../assets/custom/heart2.png"; // Return to unfilled if not favorite
              favIcon.style.filter = "brightness(0) invert(1)"; // Keep it white
            }
          });
          // newDiv.appendChild(favIcon);

          mainDiv.appendChild(favIcon);

          favIcon.addEventListener("click", async (e) => {
            e.stopPropagation(); // Prevents the event from triggering the mainDiv click event

            const templateKey = item.key;

            // Call the favorite toggle function
            const isSuccess = await handleFavTempllate(templateKey);

            // If the request was successful, immediately toggle the icon
            if (isSuccess) {
              const isCurrentlyFavorite =
                favIcon.src.includes("heart-filled.png");
              favIcon.src = isCurrentlyFavorite
                ? "../../assets/custom/heart2.png"
                : "../../assets/custom/heart-filled.png";
              favIcon.alt = isCurrentlyFavorite ? "Favorite" : "Unfavorite";

              const message = isCurrentlyFavorite
                ? "Removed from favorites!"
                : "Added to favorites!";

              Swal.fire({
                title: message,
                text: "Success",
                icon: "success",
              });
            } else {
              Swal.fire({
                icon: "warning",
                title: "Warning",
                text: "Please login to add template into Favorites",
              });
            }
          });
        }

        mainDiv.addEventListener("click", async () => {
          // Remove active class from previously selected item
          const previouslyActive = document.querySelector(
            ".template-image-box.active"
          );

          if (previouslyActive) {
            previouslyActive.classList.remove("active");
          }
          templateId = item.key;
          console.log("templateId", templateId);
          newImg.classList.add("active");
          activeItem = item.src; // Set the clicked item as active
          console.log(activeItem);
          try {
            const jsonResponse = await fetch(activeItem); // Assuming activeItem has a jsonUrl property
            if (!jsonResponse.ok) {
              throw new Error(`HTTP error! status: ${jsonResponse.status}`);
            }
            const jsonData = await jsonResponse.json();
            window.originalCanvasJson = jsonData;
            imageReplace = true;
            // const miniEditorAdjust =
            //   document.getElementById("miniE-adjust-Btn");
            // miniEditorAdjust.classList.add("display-none-prop");
            // miniEditorAdjust.classList.remove("display-block-prop");
            const miniEditorSaveBtnt = document.getElementById(
              "hexa-save-mini-cont"
            );
            miniEditorSaveBtnt.classList.add("display-block-prop");
            miniEditorSaveBtnt.classList.remove("display-none-prop");
            // document.getElementById("personaliseOpenPopupBtn").disabled = false;
            // const miniEditorAdjust =
            //   document.getElementById("miniE-adjust-Btn");
            // miniEditorAdjust.classList.remove("display-none-prop");
            // miniEditorAdjust.classList.add("display-block-prop");

            // Hide Canvas in popup
            // const miniEditorCont = document.getElementById("mini-editor-Cont");
            // miniEditorCont.classList.add("display-none-prop");
            // miniEditorCont.classList.remove("display-block-prop");

            const dummyCont = document.getElementById(
              "personaliseImageDummyCont"
            );
            dummyCont.style.display = "block";
            const realEditCont = document.getElementById(
              "personaliseImageUploadPopup"
            );
            realEditCont.style.display = "none";
            const imageInput = document.getElementById("personaliseImgUpload");
            imageInput.value = "";

            loadJSONToCanvas(jsonData);
            // setupEventListener();
          } catch (fetchError) {
            console.error("Error fetching JSON data:", fetchError);
          }
        });
      });
    } else {
      console.error("Error: The fetched data is not an array:", dataArray);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    hideSkeletonLoader();
  }
})();

function openModal() {
  const modal = document.getElementById("mini-editor-save-modal-cont");
  console.log("Opening modal..."); // Debugging log
  if (modal) {
    modal.style.display = "block";
  } else {
    console.error("Modal element not found!");
  }
}

// Function to close the modal
function closeModal() {
  const modal = document.getElementById("mini-editor-save-modal-cont");
  if (modal) {
    modal.style.display = "none";
    console.log("Modal closed.");
  } else {
    console.error("Modal element not found!");
  }
}

// Adding event listeners after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded.");

  // Get the button that opens the modal
  const openModalBtn = document.getElementById("hexa-mini-editor-save");
  if (openModalBtn) {
    console.log("Found the open modal button.");
    openModalBtn.addEventListener("click", openModal);
  } else {
    console.error("Open modal button not found!");
  }

  // Get the <span> element that closes the modal (fix the class here)
  const closeModalBtn = document.getElementsByClassName("close-mini-modal")[0];
  if (closeModalBtn) {
    console.log("Found the close button.");
    closeModalBtn.addEventListener("click", closeModal);
  } else {
    console.error("Close button not found!");
  }

  // Close the modal when user clicks outside the modal content
  window.addEventListener("click", function (event) {
    const modal = document.getElementById("mini-editor-save-modal-cont");
    if (event.target === modal) {
      closeModal();
    }
  });
});

async function handleSaveClick() {
  try {
    const response = await fetch(
      "https://backend.toddlerneeds.com/api/v1/protected-route",
      {
        method: "GET",
        credentials: "include", // Include credentials for backend token validation
      }
    );

    if (!response.ok) {
      throw new Error("User is not logged in.");
    }

    const data = await response.json();

    // If the user is not logged in
    if (!data.role) {
      Swal.fire({
        title: "Login Required",
        text: "Please log in to proceed.",
        icon: "warning",
        showConfirmButton: true,
        confirmButtonText: "OK",
        allowOutsideClick: true,
        allowEscapeKey: true,
      });
      console.log("User is not logged in.");
      return;
    }

    // If the user's email is not verified
    if (!data.isVerified) {
      Swal.fire({
        title: "Email Verification Required",
        text: "Please verify your email to proceed.",
        icon: "warning",
        showConfirmButton: true,
        confirmButtonText: "OK",
        allowOutsideClick: true,
        allowEscapeKey: true,
      });
      console.log("Email is not verified.");
      return;
    } else {
      openModal();
    }

    // Success action (you can add further logic here)
    console.log("API call successful", data);
  } catch (error) {
    Swal.fire({
      title: "Login Required",
      text: "Please log in to proceed.",
      icon: "warning",
      showConfirmButton: true,
      confirmButtonText: "OK",
      allowOutsideClick: true,
      allowEscapeKey: true,
    });
    console.log(error.message);
  }
}

// Add event listener to the button
// document
//   .getElementById("hexa-mini-editor-save")
//   .addEventListener("click", handleSaveClick);
function convertToDataURL(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    var reader = new FileReader();
    reader.onloadend = function () {
      callback(reader.result);
    };
    reader.readAsDataURL(xhr.response);
  };
  xhr.open("GET", url);
  xhr.responseType = "blob";
  xhr.send();
}

function displayTemplateModal() {
  const modal = document.getElementById("mini-templates-public-private-modal");
  modal.style.display = "flex"; // Show the modal
}

// Add event listener to the "Save as template" button
document
  .getElementById("mini-editor-saveTemplateBtn")
  .addEventListener("click", displayTemplateModal);

document
  .getElementById("saveAsPublicMini")
  .addEventListener("click", function () {
    console.log("function called");
    isPublic = true; // Set isPublic to true for public templates
    saveTemplate(); // Call the function to save the template
  });

// Add event listener for "Private" button
document
  .getElementById("saveAsPrivateMini")
  .addEventListener("click", function () {
    console.log("function called");
    isPublic = false; // Set isPublic to false for private templates
    saveTemplate(); // Call the function to save the template
  });
function saveTemplate() {
  var editedCanvasJson = window.editedCanvasJson;
  var originalCanvasJson = window.originalCanvasJson;
  var originalCanvasObject = originalCanvasJson;
  var editedCanvasObject = editedCanvasJson;

  // Iterate over the objects in editedCanvasObject to update properties in originalCanvasObject
  editedCanvasObject.objects.forEach((editedObj, index) => {
    if (originalCanvasObject.objects[index]) {
      var originalObj = originalCanvasObject.objects[index];

      // Iterate over properties of the originalObj and add missing ones to editedObj
      for (var key in originalObj) {
        if (originalObj.hasOwnProperty(key) && !editedObj.hasOwnProperty(key)) {
          editedObj[key] = originalObj[key];
        }
      }

      // If the object type is 'textbox', copy the 'text' key from editedObj to originalObj
      if (editedObj.type === "textbox") {
        originalObj.text = editedObj.text;
      }
      if (editedObj.type === "image" && !editedObj.src.startsWith("http")) {
        originalObj.top = editedObj.top * 4.6;
        originalObj.left = editedObj.left * 4.6;
        originalObj.scaleY = editedObj.scaleX * 4.6;
        originalObj.scaleX = editedObj.scaleY * 4.6;
      }
    }
  });

  console.log(editedCanvasObject);
  console.log(originalCanvasObject);
  const json = originalCanvasObject;
  var objects = newFabricCanvas.getObjects();
  var filteredObjects = objects.filter(function (obj) {
    return obj.customId !== "layoutImage"; // Filter out layoutImage
  });

  // Temporarily hide objects that are not filtered
  newFabricCanvas.getObjects().forEach(function (obj) {
    if (!filteredObjects.includes(obj)) {
      obj.visible = false;
    }
  });

  // Generate image URL with only visible (filtered) objects
  var canvasImageUrl = newFabricCanvas.toDataURL({
    format: "png",
    multiplier: 2,
  });

  // Restore visibility of all objects
  newFabricCanvas.getObjects().forEach(function (obj) {
    obj.visible = true;
  });

  convertToDataURL(json.backgroundImage.src, function (dataUrl) {
    json.backgroundImage.src = dataUrl; // Update the background image source in the JSON

    var template = JSON.stringify(json);

    var blob = new Blob([template], { type: "application/json" });

    var timestamp = new Date().getTime();
    var uniqueFileName = "template_" + timestamp + ".json";
    var formData = new FormData();
    formData.append("files", blob, uniqueFileName);

    var imageBlob = dataURLtoBlob(canvasImageUrl); // Convert the data URL to a Blob
    var imageFileName = "template_image_" + timestamp + ".png";
    formData.append("files", imageBlob, imageFileName);

    // Vanilla JavaScript for AJAX request (XMLHttpRequest)
    Swal.fire({
      title: "Please wait",
      text: "Your template is being saved...",
      icon: "info",
      allowOutsideClick: true,
      showCloseButton: true,
      confirmButtonText: "OK",
      allowEscapeKey: true,
      showConfirmButton: false,
    });

    var xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      "https://backend.toddlerneeds.com/api/v1/user/media/upload",
      true
    );

    xhr.onload = function () {
      if (xhr.status === 200) {
        var response = JSON.parse(xhr.responseText);
        var imageUrl = "";
        var jsonUrl = "";
        response.urls.forEach(function (url) {
          if (url.endsWith(".json")) {
            jsonUrl = url;
          } else if (
            url.endsWith(".png") ||
            url.endsWith(".jpeg") ||
            url.endsWith(".jpg")
          ) {
            imageUrl = url;
          }
        });
        const urlParams = new URLSearchParams(window.location.search);
        const modelName = urlParams.get("name");

        var key = Math.random().toString(36).substr(2, 9);
        var name = document.querySelector("#mini-editor-template-name").value;

        var data = {
          key: key,
          src: jsonUrl,
          imageUrl: imageUrl,
          name: name,
          type: modelName,
          // isPublic: isPublic, // Add public/private selection to data
          isPublic: isPublic,
        };

        // Upload the data object to the new API
        uploadData(data)
          .then(() => {
            // Display a success message using toastr after successful upload
            // toastr.success("Data uploaded successfully!", "Success");
            Swal.fire({
              title: "Success",
              text: "Data uploaded successfully!",
              icon: "success",
            });
            Swal.close();
            closeModal();
            // Close the modal after saving
            // document.querySelector(".hexa-modal").style.display = "none";
            const modal = document.getElementById(
              "mini-templates-public-private-modal"
            );
            modal.style.display = "none"; // Show the modal
          })
          .catch((error) => {
            // Display an error message using toastr if uploading fails
            // toastr.error(error.message, "Error");
            const message =
              error.message || "Something went wrong uploading, try again!";
            Swal.fire({
              icon: "error",
              title: "failed",
              text: message,
            });
          });
      } else {
        // Display an error message using toastr if the API call fails
        // toastr.error(xhr.statusText, "Error");
        const message =
          error.message ||
          error ||
          "Something went wrong uploading, try again!";
        Swal.fire({
          icon: "error",
          title: "failed",
          text: message,
        });
      }
    };

    xhr.onerror = function () {
      toastr.error("Request failed.", "Error");
    };

    xhr.send(formData);
  });
  // });
}

async function uploadData(data) {
  try {
    const response = await fetch(
      "https://backend.toddlerneeds.com/api/v1/user/file-data/upload",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Include credentials for cross-origin requests
          // Authorization: "Bearer <Your-Token>", // Use if needed for authentication, else remove
        },
        body: JSON.stringify(data),
        credentials: "include", // Equivalent to `xhrFields: { withCredentials: true }`
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to upload data");
    }

    const responseData = await response.json(); // Parse the response as JSON
    return responseData; // Resolve the data as success
  } catch (error) {
    throw error; // Reject with error message
  }
}

// Helper function to convert data URL to Blob
function dataURLtoBlob(dataurl) {
  var arr = dataurl.split(",");
  var mime = arr[0].match(/:(.*?);/)[1];
  var bstr = atob(arr[1]);
  var n = bstr.length;
  var u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

// setupEventListener();

// document
//   .getElementById("personaliseOpenPopupBtn")
//   .addEventListener("click", async () => {

//   });
//   function handleFavTempllate(templateKey) {
//     const url = `https://backend.toddlerneeds.com/api/v1/user/template/togglefavorite`;

//     fetch(url, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ templateKey }),
//         credentials: 'include'
//     })
//     .then(response => response.json())
//     .then(data => {
//         console.log('Success:', data);
//         toastr.success('Success! Template toggled.', 'success');
//     })
//     .catch((error) => {
//         console.error('Error:', error);
//         toastr.error('Error! Could not toggle template.', 'failure');
//     });
// }

async function handleFavTempllate(templateKey) {
  try {
    const response = await fetch(
      "https://backend.toddlerneeds.com/api/v1/user/template/togglefavorite",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ templateKey }),
      }
    );

    if (response.ok) {
      return true;
      // Indicate success
    } else {
      console.error(`Failed to toggle favorite for template ${templateKey}`);
      // toastr.error('Please loggin to add template to Favorite', 'Error');
      return false;
      // Indicate failure
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    const message =
      error.message ||
      error ||
      "Failed to toggling favorite, Please try again later!";
    Swal.fire({
      icon: "error",
      title: "failed",
      text: message,
    });
    return false;
    // Indicate failure
  }
}

// Get the modal
// Function to open the modal

// Function to open the modal
// Function to open the modal
// Select the necessary elements
const fullScreenButton = document.querySelector(
  ".personalise-question-fullscreen"
);
const miniEdit3DCont = document.querySelector(".mini-edit-3d-cont");

// Function to toggle fullscreen mode
function toggleFullScreen() {
  if (!document.fullscreenElement) {
    // Request fullscreen for the div
    miniEdit3DCont.requestFullscreen().catch((err) => {
      console.error(
        `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
      );
    });
  } else {
    // Exit fullscreen if already in fullscreen mode
    document.exitFullscreen();
  }
}

// Attach the event listener to the full-screen icon
fullScreenButton.addEventListener("click", toggleFullScreen);
// Select elements
// Select elements
const questionIcon = document.querySelector(".personalise-question-icon");
const overlayMessage = document.getElementById("overlay-message");
const closeOverlayButton = document.getElementById("close-overlay");

// Function to show the overlay
function showOverlay() {
  overlayMessage.classList.add("show");
}

// Function to hide the overlay
function hideOverlay() {
  overlayMessage.classList.remove("show");
}

// Attach click event listener to the question mark icon to show the overlay
questionIcon.addEventListener("click", showOverlay);

// Attach click event listener to the close button to hide the overlay
closeOverlayButton.addEventListener("click", hideOverlay);

const favIcon = document.getElementById("templateFavIcon");

favIcon.addEventListener("mouseover", () => {
  // favIcon.src = '../../assets/custom/heart-filled.png'; // On hover
  console.log("mouse hoverd");
});

// Revert the image source when mouse leaves
favIcon.addEventListener("mouseout", () => {
  // favIcon.src = '../../assets/custom/heart2.png'; // On mouse leave
  console.log("mouse out");
});
