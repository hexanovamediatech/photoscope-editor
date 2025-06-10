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
let linkedMeshImageData = null;
let isPublic;
const adminUrl = CONFIG.ADMIN_URL;
const baseUrl = CONFIG.BASE_URL;
let meshImageDataArray = [];
let originalFormat = {};
let editedArrayFormat = [];
let selectedModelPart = "";
let mainPart = "";
let mainPartMesh = null;
let selectedItem = null;
let lastReplacedPhotoNumber = null;
// Initialize the 3D viewer
document.addEventListener("variableReady", function (e) {
  if (scene) {
    changeTexture(e.detail.data);
  } else {
    initialize3DViewer();
  }
});

window.addEventListener("load", () => {
  const loader = document.querySelector(".fullpage-loader");

  // Hide loader after 2 seconds
  setTimeout(() => {
    if (loader) loader.style.display = "none";
  }, 1500);
});

// async function fetchModelData() {
//   try {
//     const response = await fetch(`${baseUrl}/api/v1/product/all`);
//     const data = await response.json();

//     // Extract the model source (GLB path) based on the name parameter from the URL
//     const urlParams = new URLSearchParams(window.location.search);
//     const productId = urlParams.get("id");
//     const modelName = urlParams.get("name");
//     const productNameTag = document.querySelector(
//       ".personalise-product-name-text"
//     );
//     if (productNameTag) {
//       productNameTag.textContent = modelName; // Update the product name
//     }
//     const product = data.products.find((item) => item.name === modelName);
//     console.log(product, "Product here");
//     if (product && product.modelsUrl) {
//       modelSource = product.modelsUrl; // Set the model URL
//       window.layoutSource = product.imageUrl;
//       selectedMesh = product.specificMesh;
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
    mainPart = product.mainPart.meshName;
    // Extract the model source (GLB path) based on the name parameter from the URL

    const modelName = urlParams.get("name");
    const productNameTag = document.querySelector(
      ".personalise-product-name-text"
    );

    const productDescription = document.querySelector(
      ".personalise-product-desc-text"
    );
    if (productNameTag) {
      productNameTag.textContent = modelName; // Update the product name
    }
    // const product = data.products.find((item) => item.name === modelName);
    // console.log(product, "Product here");
    console.log(product.modelUrl, "Model Url");
    if (product && product.modelUrl) {
      modelSource = product.modelUrl; // Set the model URL
      linkedMeshImageData = product.linkedMeshImageData[0];
      console.log(linkedMeshImageData);
      window.layoutSource = linkedMeshImageData.layoutUrl;
      selectedMesh = linkedMeshImageData.meshName;
      productDescription.textContent = product.description;
    } else {
      console.error("Model not found for the specified name.");
    }
  } catch (error) {
    console.error("Error fetching model data:", error);
  }
}

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
  const urlParams = new URLSearchParams(window.location.search);
  const modelName = urlParams.get("name");
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

    loadedModel.traverse((child) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((material) => {
            material.side = THREE.DoubleSide;
            if (!material.map) {
              material.map = null;
              material.color = new THREE.Color(0xffffff);
              material.needsUpdate = true;
            }
          });
        } else {
          // For single material
          child.material.side = THREE.DoubleSide;

          if (!child.material.map) {
            child.material.map = null;
            child.material.color = new THREE.Color(0xffffff);
            child.material.needsUpdate = true;
          }
        }
      }
    });
    centerModel(loadedModel, camera);
    scene.add(loadedModel);
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
  // controls.minDistance = 1;
  // controls.maxDistance = 2;
  controls.minDistance = 0.9; // 10% less than before
  controls.maxDistance = 1.8;
  controls.target.set(0, 0, 0);
  controls.update();
  onWindowResizePersonalise();
  window.addEventListener("resize", onWindowResizePersonalise);
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
  console.log(newUrl);
  if (scene) {
    const textureLoader = new THREE.TextureLoader();
    console.log(selectedMesh);
    const specificMesh = scene.getObjectByName(mainPartMesh);

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

function resetModel() {
  // Remove existing model from the scene
  scene.children.forEach((child) => {
    if (child.isGroup || child.isMesh) {
      scene.remove(child);
    }
  });

  // Reload the GLB model to restore original materials and textures
  new GLTFLoader().load(modelSource, function (gltf) {
    const loadedModel = gltf.scene;

    loadedModel.traverse((child) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((material) => {
            material.side = THREE.DoubleSide;
            if (!material.map) {
              material.color = new THREE.Color(0xffffff); // Set white for no texture
            }
            material.needsUpdate = true;
          });
        } else {
          child.material.side = THREE.DoubleSide;
          if (!child.material.map) {
            child.material.color = new THREE.Color(0xffffff); // Set white for no texture
          }
          child.material.needsUpdate = true;
        }
      }
    });

    centerModel(loadedModel, camera);
    scene.add(loadedModel);
  });

  // Clear texture data array
  meshImageDataArray = [];
}
function applyTexturesToMeshes() {
  const textureLoader = new THREE.TextureLoader();
  const appliedMeshNames = meshImageDataArray.map((d) => d.meshName);

  scene.traverse((object) => {
    if (object.isMesh) {
      const meshName = object.name;

      const meshData = meshImageDataArray.find((m) => m.meshName === meshName);

      if (meshData) {
        // New texture available — apply it
        textureLoader.load(meshData.meshImageData, (texture) => {
          const material = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 1,
            metalness: 1,
            opacity: 1,
            bumpScale: 0.5,
            side: THREE.DoubleSide,
          });

          // Apply texture transformation if needed
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
            case "P5_typ1":
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
          }

          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          object.material = material;
        });
      } else {
        // No texture provided for this mesh — reset to default
        // object.material = new THREE.MeshStandardMaterial({
        //   color: 0x000000, // default black
        //   roughness: 1,
        //   metalness: 1,
        //   side: THREE.DoubleSide,
        // });
      }
    }
  });
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
document.addEventListener("DOMContentLoaded", () => {
  const logoLink = document.getElementById("logoLink");
  if (logoLink) {
    logoLink.href = adminUrl;
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const logoLink = document.getElementById("logoLink2");
  if (logoLink) {
    logoLink.href = adminUrl;
  }
});
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
      // realEditCont.style.display = "block";
      realEditCont.style.display = "flex";
      realEditCont.style.flexDirection = "column";

      // Check if there is an active item
      // if (activeItem) {
      //   try {
      //     const response = await fetch(activeItem.src);
      //     const jsonData = await response.json();
      //     // Load the JSON data to the canvas
      //     loadJSONToCanvas(jsonData);
      //   } catch (error) {
      //     console.error("Error fetching or parsing the JSON:", error);
      //   }
      // }

      if (selectedItem) {
        try {
          // const response = await fetch(activeItem.src);
          // const jsonData = await response.json();
          // Load the JSON data to the canvas
          loadJSONToCanvas(selectedItem.jsonData);
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
  if (selectedItem) {
    const openModalBtn = document.getElementById("gauci-mini-editor-save");
    openModalBtn.style.visibility = "invisible";
  }
});

document.getElementById("text-2").addEventListener("input", function () {
  updateCanvasText(2, this.value);
  if (selectedItem) {
    const openModalBtn = document.getElementById("gauci-mini-editor-save");
    openModalBtn.style.visibility = "invisible";
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

  // // Remove the first object from the canvas
  if (
    firstObject &&
    firstObject.type === "image" &&
    firstObject.getSrc &&
    firstObject.getSrc().startsWith("http") &&
    !firstObject.clipPath
  ) {
    newFabricCanvas.remove(firstObject);
  }

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

// function replaceImageSrc(json, newImageSrc, imageIndex, callback) {
//   console.log(json);
//   console.log(newImageSrc);
//   console.log(imageIndex);

//   // Create a new image object to load the base64 image
//   const img = new Image();
//   img.src = newImageSrc;

//   // Once the image is loaded, get its width and height
//   img.onload = function () {
//     const imageWidth = img.width;
//     const imageHeight = img.height;

//     console.log(`Image Width: ${imageWidth}, Image Height: ${imageHeight}`);
//     console.log(json.objects);

//     // Find the image object at the specified index (adjusted for background image)
//     const targetIndex = imageIndex; // Since imageObjects skips index 0, imageIndex maps directly
//     if (
//       json.objects[targetIndex] &&
//       json.objects[targetIndex].type === "image"
//     ) {
//       json.objects[targetIndex].src = newImageSrc;
//       json.objects[targetIndex].width = imageWidth;
//       json.objects[targetIndex].height = imageHeight;
//     }

//     const imageUpdatedJSON = json;
//     console.log(imageUpdatedJSON, "image updated json structure");

//     if (callback) callback(imageUpdatedJSON);
//   };

//   // Handle error if the image fails to load
//   img.onerror = function () {
//     console.error("Failed to load the image");
//   };
// }

// function replaceImageSrc(json, newImageSrc, imageIndex, callback) {
//   console.log("Original JSON:", json);
//   const originalOrder = [...json.objects]; // Save original order

//   // Step 1: Separate images and non-images
//   const imageObjects = json.objects.filter((obj) => obj.type === "image");
//   const nonImageObjects = json.objects.filter((obj) => obj.type !== "image");

//   // Step 2: Reorder: images first, then others
//   json.objects = [...imageObjects, ...nonImageObjects];

//   // Step 3: Load new image to get dimensions
//   const img = new Image();
//   img.src = newImageSrc;

//   img.onload = function () {
//     const imageWidth = img.width;
//     const imageHeight = img.height;

//     console.log(`Image Width: ${imageWidth}, Image Height: ${imageHeight}`);

//     // Step 4: Replace the image at the given index
//     if (json.objects[imageIndex] && json.objects[imageIndex].type === "image") {
//       json.objects[imageIndex].src = newImageSrc;
//       json.objects[imageIndex].width = imageWidth;
//       json.objects[imageIndex].height = imageHeight;
//     } else {
//       console.warn("Target index does not have an image object");
//     }

//     // Step 5: Restore original order
//     const updatedImageObject = json.objects[imageIndex];
//     const updatedSrc = updatedImageObject?.src;

//     // Create a map of id or src (whichever is stable) to updated image
//     const updatedImages = imageObjects.map((imgObj, idx) => {
//       if (idx === imageIndex) {
//         return updatedImageObject;
//       }
//       return imgObj;
//     });

//     // Reconstruct final object list from original order
//     const restoredObjects = originalOrder.map((obj) => {
//       if (obj.type === "image") {
//         return updatedImages.shift(); // replace from updated image list
//       }
//       return obj; // return non-image as is
//     });

//     json.objects = restoredObjects;

//     console.log("Final updated JSON:", json);

//     if (callback) callback(json);
//   };

//   img.onerror = function () {
//     console.error("Failed to load the image");
//   };
// }

function replaceImageSrc(json, newImageSrc, imageIndex, callback) {
  console.log("Original JSON:", json);
  console.log("Target imageIndex:", imageIndex);

  const img = new Image();
  img.src = newImageSrc;

  img.onload = function () {
    const imageWidth = img.width;
    const imageHeight = img.height;

    console.log(`Image Width: ${imageWidth}, Image Height: ${imageHeight}`);

    // Step 1: Traverse and count only 'image' type objects
    let imageCounter = 0;
    let targetFound = false;

    for (let i = 0; i < json.objects.length; i++) {
      const obj = json.objects[i];

      if (obj.type === "image") {
        if (imageCounter === imageIndex) {
          // Found the target image to replace
          obj.src = newImageSrc;
          obj.width = imageWidth;
          obj.height = imageHeight;
          targetFound = true;
          break;
        }
        imageCounter++;
      }
    }

    if (!targetFound) {
      console.warn("No image object found at given imageIndex");
    }

    if (callback) callback(json);
  };

  img.onerror = function () {
    console.error("Failed to load the image");
  };
}

function generateImagesFromCanvasStates() {
  meshImageDataArray = [];
  meshImageDataArray.length = 0;

  Object.keys(originalFormat).forEach((tabId) => {
    const tempCanvas = new fabric.Canvas(null, {
      width: 2048,
      height: 2048,
    });

    tempCanvas.loadFromJSON(originalFormat[tabId], () => {
      tempCanvas.renderAll();

      // Get all objects from the canvas
      const objects = tempCanvas.getObjects();
      console.log(objects);

      // Remove the first object temporarily
      const firstObject = objects[0];
      if (
        firstObject &&
        firstObject.type === "image" &&
        firstObject.getSrc &&
        firstObject.getSrc().startsWith("http") &&
        !firstObject.clipPath
      ) {
        tempCanvas.remove(firstObject);
      }
      tempCanvas.renderAll(); // Render after removing the object

      try {
        const base64Image = tempCanvas.toDataURL({
          format: "jpeg",
          quality: 1,
        });

        // Push the image data to the array
        meshImageDataArray.push({
          meshName: tabId,
          meshImageData: base64Image,
        });
      } catch (error) {
        console.error(`Error generating image for Tab ID ${tabId}:`, error);
      }

      // Re-insert the removed object (if any)
      if (firstObject) {
        tempCanvas.insertAt(firstObject, 0);
      }

      tempCanvas.renderAll(); // Render after reinserting

      // Clean up
      tempCanvas.clear();
      tempCanvas.dispose();

      // Final check to call texture application
      if (meshImageDataArray.length === Object.keys(originalFormat).length) {
        console.log("Generated Images Array:", meshImageDataArray);
        applyTexturesToMeshes();
      }
    });
  });
}

function getImageObjectByLogicalIndex(objects, imageIndex) {
  let imageCounter = 0;

  for (let i = 0; i < objects.length; i++) {
    if (objects[i].type === "image") {
      if (imageCounter === imageIndex) {
        return objects[i]; // Return the actual object
      }
      imageCounter++;
    }
  }

  return null; // Not found
}

function loadJSONToCanvas(jsonData) {
  console.log(jsonData, "json data here ");
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

  // Get the container for dynamic image replace buttons
  const multiImageContainer = document.querySelector(
    ".multi-image-replace-cont"
  );
  multiImageContainer.innerHTML = ""; // Clear existing content

  // Filter images, excluding the first one (background image)
  const imageObjects = jsonData.objects.filter(
    (obj, index) => obj.type === "image" && index !== 0
  );

  // Dynamically generate image replace sections
  imageObjects.forEach((imageObj, index) => {
    const photoNumber = index + 1;
    const imageSection = document.createElement("div");
    imageSection.className = "multi-image-cont";
    imageSection.innerHTML = `
      <p class="photo-list-num">Photo ${photoNumber}</p>
      <div class="replace-image-main-box">
        <img
          src="${imageObj.src || "./assets/custom/no-temp.jpg"}"
          class="hexa-replc-img"
          alt="icon"
          id="hexa-replc-img-${photoNumber}"
        />
        <div class="replace-img-btn-cont" id="replace-btn-cont-${photoNumber}">
          <input
            type="file"
            name="gauci-file-${photoNumber}"
            id="personaliseImgUpload-${photoNumber}"
            class="gauci-hidden-file"
            accept="image/png, image/jpeg, image/webp"
          />
          <label
            for="personaliseImgUpload-${photoNumber}"
            class="gauci-btn primary gauci-lg-btn btn-full replace-btn-personalise"
          >
            <img src="./assets/custom/imgIcon.png" alt="icon" />
            <span>Replace</span>
          </label>
        </div>
      </div>
    `;
    multiImageContainer.appendChild(imageSection);
    const imageElement = document.getElementById(
      `hexa-replc-img-${photoNumber}`
    );
    if (imageElement) {
      imageElement.addEventListener("click", () => {
        updateUIImages(imageObj.src || "./assets/custom/no-temp.jpg");
      });
    }
  });

  // Add event listeners for image uploads
  imageObjects.forEach((_, index) => {
    const photoNumber = index + 1;
    const input = document.getElementById(
      `personaliseImgUpload-${photoNumber}`
    );
    if (input) {
      input.addEventListener("change", (event) =>
        handleImageUploadAlternate(event, photoNumber)
      );
    }
  });

  // const imageToShow =
  //   lastReplacedPhotoNumber !== null
  //     ? jsonData.objects[lastReplacedPhotoNumber]
  //     : jsonData.objects.find(
  //         (obj, index) => obj.type === "image" && index !== 0
  //       );
  const imageToShow =
    lastReplacedPhotoNumber !== null
      ? getImageObjectByLogicalIndex(jsonData.objects, lastReplacedPhotoNumber)
      : jsonData.objects.find(
          (obj, index) => obj.type === "image" && index !== 0
        );

  const miniEditorPopupImage = document.getElementById(
    "min-editor-popup-image"
  );
  const miniEditordummyImage = document.getElementById(
    "min-editor-dummy-image"
  );
  if (imageToShow && imageToShow.src) {
    console.log("Showing image:", imageToShow);
    if (window.innerWidth < 1024 && miniEditordummyImage) {
      miniEditordummyImage.src = imageToShow.src;
      miniEditordummyImage.style.width = "100%";
      miniEditordummyImage.classList.add("dummyImageCoverFit");
    }

    if (miniEditorPopupImage) {
      miniEditorPopupImage.src = imageToShow.src;
      if (miniEditordummyImage) {
        miniEditordummyImage.style.width = "100%";
        miniEditordummyImage.style.height = "100%";
        miniEditordummyImage.style.objectFit = "cover";
        miniEditordummyImage.src = imageToShow.src;
        miniEditordummyImage.style.borderRadius = "10px";
      }
    }
  } else {
    console.warn("No valid image found to display");
    if (miniEditorPopupImage) {
      miniEditorPopupImage.src = "./assets/custom/no-temp.jpg";
    }
    if (miniEditordummyImage) {
      miniEditordummyImage.src = "./assets/custom/no-temp.jpg";
      miniEditordummyImage.style.width = "30%";
      miniEditordummyImage.style.height = "30%";
      miniEditordummyImage.style.objectFit = "contain";
      // miniEditordummyImage.style.borderRadius = "10px";
    }
  }

  // Show input fields based on the number of textboxes
  if (textBoxCount > 0) {
    label1.style.display = "block";
    input1.style.display = "block";
  }
  if (textBoxCount > 1) {
    label2.style.display = "block";
    input2.style.display = "block";
  }

  // Show the first replace button if clipmask exists
  // const replaceImgBtn = document.getElementById("replace-btn-cont-1");
  // const imageFound = jsonData.objects.filter(
  //   (obj) => obj.customId === "clipmask"
  // );
  // if (imageFound[0] && replaceImgBtn) {
  //   replaceImgBtn.style.display = "block";
  // } else if (replaceImgBtn) {
  //   replaceImgBtn.style.display = "none";
  // }

  // Load the JSON data into the existing Fabric.js canvas
  let nextIndex = 1;
  jsonData.objects.forEach((obj) => {
    if (obj.type === "textbox") {
      obj.dataIndex = obj.dataIndex || nextIndex++;
      const inputField = document.getElementById(`text-${obj.dataIndex}`);
      if (inputField) {
        inputField.value = obj.text || "";
      }
    }
  });
  jsonData.objects.forEach((obj) => {
    if (obj.type === "image" && obj.src.startsWith("http")) {
      obj.src = `${obj.src}?t=${Date.now()}`;
    }
  });
  console.log(jsonData);
  newFabricCanvas.loadFromJSON(
    jsonData,
    function () {
      newFabricCanvas.getObjects().forEach((obj, index) => {
        obj.scaleX *= 0.215;
        obj.scaleY *= 0.215;
        obj.left *= 0.215;
        obj.top *= 0.215;

        if (obj.clipPath) {
          obj.clipPath.set({
            scaleX: obj.clipPath.scaleX * 0.215,
            scaleY: obj.clipPath.scaleY * 0.215,
            left: obj.clipPath.left * 0.215,
            top: obj.clipPath.top * 0.215,
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

      newFabricCanvas.renderAll();

      savedCanvasJSON = newFabricCanvas.toJSON();
      window.editedCanvasJson = savedCanvasJSON;
      const allObjects = newFabricCanvas.getObjects();
      console.log(allObjects);
      console.log(savedCanvasJSON);

      const firstObject = allObjects[0];
      if (
        firstObject &&
        firstObject.type === "image" &&
        firstObject.getSrc &&
        firstObject.getSrc().startsWith("http") &&
        !firstObject.clipPath
      ) {
        newFabricCanvas.remove(firstObject);
      }

      newFabricCanvas.renderAll();
      const originalWidth = newFabricCanvas.width;
      const originalHeight = newFabricCanvas.height;

      newFabricCanvas.setDimensions({
        width: 1080,
        height: 1080,
      });
      newFabricCanvas.setZoom(1080 / Math.min(originalWidth, originalHeight));

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
      console.log("this is thefabricImageConverted", fabricImageConverted);
      if (selectedMesh) {
        changeTexture(fabricImageConverted);
      }
      newFabricCanvas.insertAt(firstObject, 0);
      newFabricCanvas.renderAll();
      console.log(newFabricCanvas.toJSON());
    },
    function (error) {
      console.error("Error loading JSON:", error);
      console.log("Loaded JSON Data:", jsonData);
    }
  );
}

function updateUIImages(imageSrc) {
  const miniEditorPopupImage = document.getElementById(
    "min-editor-popup-image"
  );
  const miniEditordummyImage = document.getElementById(
    "min-editor-dummy-image"
  );

  if (imageSrc) {
    console.log("Updating UI images with src:", imageSrc);
    if (window.innerWidth < 1024 && miniEditordummyImage) {
      miniEditordummyImage.src = imageSrc;
      miniEditordummyImage.style.width = "100%";
      miniEditordummyImage.classList.add("dummyImageCoverFit");
    }

    if (miniEditorPopupImage) {
      miniEditorPopupImage.src = imageSrc;
      if (miniEditordummyImage) {
        miniEditordummyImage.style.width = "100%";
        miniEditordummyImage.style.height = "100%";
        miniEditordummyImage.style.objectFit = "cover";
        miniEditordummyImage.src = imageSrc;
        miniEditordummyImage.style.borderRadius = "10px";
      }
    }
  } else {
    console.warn("No valid image found to display");
    if (miniEditorPopupImage) {
      miniEditorPopupImage.src = "./assets/custom/no-temp.jpg";
    }
    if (miniEditordummyImage) {
      miniEditordummyImage.src = "./assets/custom/no-temp.jpg";
      miniEditordummyImage.style.width = "30%";
      miniEditordummyImage.style.height = "30%";
      miniEditordummyImage.style.objectFit = "contain";
    }
  }
}
// function setNewImageSrc(imageSrc) {
//   newImageSrc = imageSrc;

//   var originalCanvasJson = window.originalCanvasJson;
//   var editedCanvasJson = window.editedCanvasJson;

//   // Function to overwrite the text in originalCanvasJsonwith editedCanvasJson's text
//   function overwriteText(originalJSON, updatedJSON) {
//     if (
//       originalJSON.objects &&
//       updatedJSON.objects &&
//       originalJSON.objects.length === updatedJSON.objects.length
//     ) {
//       originalJSON.objects.forEach((obj, index) => {
//         if (
//           obj.type === "textbox" &&
//           updatedJSON.objects[index].type === "textbox"
//         ) {
//           // Overwrite the text
//           obj.text = updatedJSON.objects[index].text;
//         }
//       });
//     }
//   }

//   // Overwrite text from editedCanvasJson to originalCanvasJson
//   overwriteText(originalCanvasJson, editedCanvasJson);

//   if (typeof newImageSrc !== "undefined") {
//     // Replace the image source in the parsed JSON and compress it
//     replaceImageSrc(originalCanvasJson, newImageSrc, (imageUpdatedJSON) => {
//       // Load the updated JSON onto the canvas
//       loadJSONToCanvas(imageUpdatedJSON);

//       window.editedCanvasJson = imageUpdatedJSON;
//       console.log("Updated JSON with overwritten text:", imageUpdatedJSON);
//     });
//   } else {
//     // Log the updated JSON (without changing image source) to the console
//     console.log("Updated JSON with overwritten text:", originalCanvasJson);
//   }
// }

// function setNewImageSrc(imageSrc, imageIndex) {
//   newImageSrc = imageSrc;

//   var originalCanvasJson = window.originalCanvasJson;
//   var editedCanvasJson = window.editedCanvasJson;

//   console.log(originalCanvasJson);
//   console.log(editedCanvasJson);

//   // Function to overwrite the text in originalCanvasJson with editedCanvasJson's text
//   function overwriteText(originalJSON, updatedJSON) {
//     if (
//       originalJSON.objects &&
//       updatedJSON.objects &&
//       originalJSON.objects.length === updatedJSON.objects.length
//     ) {
//       originalJSON.objects.forEach((obj, index) => {
//         if (
//           obj.type === "textbox" &&
//           updatedJSON.objects[index].type === "textbox"
//         ) {
//           obj.text = updatedJSON.objects[index].text;
//         }
//       });
//     }
//   }

//   // Overwrite text from editedCanvasJson to originalCanvasJson
//   overwriteText(originalCanvasJson, editedCanvasJson);

//   if (typeof newImageSrc !== "undefined") {
//     // Replace the image source in the parsed JSON and compress it
//     replaceImageSrc(
//       originalCanvasJson,
//       newImageSrc,
//       imageIndex,
//       (imageUpdatedJSON) => {
//         // Load the updated JSON onto the canvas
//         loadJSONToCanvas(imageUpdatedJSON);
//         window.editedCanvasJson = imageUpdatedJSON;
//         console.log("Updated JSON with overwritten text:", imageUpdatedJSON);
//       }
//     );
//   } else {
//     console.log("Updated JSON with overwritten text:", originalCanvasJson);
//   }
// }

function setNewImageSrc(imageSrc, imageIndex) {
  newImageSrc = imageSrc;

  var editedCanvasJson = window.editedCanvasJson;

  console.log(editedCanvasJson);

  // Store editedCanvasJson in a new variable with a deep copy to avoid modifying the original
  var newOriginalJson = JSON.parse(JSON.stringify(editedCanvasJson));

  // Map over objects array and scale properties by 4.55
  newOriginalJson.objects = newOriginalJson.objects.map((obj) => {
    // Scale properties
    if (obj.scaleX !== undefined) obj.scaleX *= 4.76;
    if (obj.scaleY !== undefined) obj.scaleY *= 4.76;
    if (obj.left !== undefined) obj.left *= 4.65;
    if (obj.top !== undefined) obj.top *= 4.65;

    // Handle clipPath if present
    if (obj.clipPath) {
      let clip = obj.clipPath;
      if (clip.scaleX !== undefined) clip.scaleX *= 4.65;
      if (clip.scaleY !== undefined) clip.scaleY *= 4.65;
      if (clip.left !== undefined) clip.left *= 4.65;
      if (clip.top !== undefined) clip.top *= 4.65;
    }

    return obj;
  });

  if (typeof newImageSrc !== "undefined") {
    // Replace the image source in the parsed JSON
    replaceImageSrc(
      newOriginalJson, // Use the new scaled JSON
      newImageSrc,
      imageIndex,
      (imageUpdatedJSON) => {
        // Load the updated JSON onto the canvas
        loadJSONToCanvas(imageUpdatedJSON);
        window.editedCanvasJson = imageUpdatedJSON;
        console.log("Updated JSON with overwritten text:", imageUpdatedJSON);
      }
    );
  } else {
    console.log("Updated JSON with new original:", newOriginalJson);
  }
}

// Assuming the user selects an image via an input field
// function handleImageUploadAlternate(event) {
//   if (selectedItem) {
//     const openModalBtn = document.getElementById("gauci-mini-editor-save");
//     openModalBtn.style.visibility = "invisible";
//     const file = event.target.files[0];
//     const reader = new FileReader();

//     reader.onload = function (e) {
//       const imageSrc = e.target.result;
//       setNewImageSrc(imageSrc); // Store the new image source
//       // loadJSONToCanvas(savedCanvasJSON); // Reload the JSON to canvas with the new image
//       const miniEditorPopupImage = document.getElementById(
//         "min-editor-popup-image"
//       );
//       if (miniEditorPopupImage) {
//         miniEditorPopupImage.src = imageSrc; // Set the new image source
//       }
//     };

//     if (file) {
//       reader.readAsDataURL(file);
//     }
//   }
// }

// function handleImageUploadAlternate(event, photoNumber) {
//   if (selectedItem) {
//     const openModalBtn = document.getElementById("gauci-mini-editor-save");
//     if (openModalBtn) {
//       openModalBtn.style.visibility = "invisible";
//     }
//     const file = event.target.files[0];
//     const reader = new FileReader();

//     reader.onload = function (e) {
//       const imageSrc = e.target.result;
//       // Update the UI image
//       const uiImage = document.getElementById(`hexa-replc-img-${photoNumber}`);
//       if (uiImage) {
//         uiImage.src = imageSrc;
//       }
//       // Update min-editor-popup-image only for the first image (if needed)
//       if (photoNumber === 1) {
//         const miniEditorPopupImage = document.getElementById(
//           "min-editor-popup-image"
//         );
//         if (miniEditorPopupImage) {
//           miniEditorPopupImage.src = imageSrc;
//         }
//         const miniEditordummyImage = document.getElementById(
//           "min-editor-dummy-image"
//         );
//         if (miniEditordummyImage) {
//           miniEditordummyImage.src = imageSrc;
//         }
//       }
//       // Map photoNumber to the correct jsonData.objects index (skip background image at index 0)
//       const imageIndex = photoNumber; // jsonData.objects index is photoNumber (since we skip index 0)
//       setNewImageSrc(imageSrc, imageIndex);
//     };

//     if (file) {
//       reader.readAsDataURL(file);
//     }
//   }
// }

function handleImageUploadAlternate(event, photoNumber) {
  if (selectedItem) {
    const openModalBtn = document.getElementById("gauci-mini-editor-save");
    if (openModalBtn) {
      openModalBtn.style.visibility = "invisible";
    }
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      const imageSrc = e.target.result;
      // Update the UI image
      const uiImage = document.getElementById(`hexa-replc-img-${photoNumber}`);
      if (uiImage) {
        uiImage.src = imageSrc;
      }
      // Set the last replaced image
      lastReplacedPhotoNumber = photoNumber;
      updateUIImages(imageSrc);
      // Map photoNumber to the correct jsonData.objects index (skip background image at index 0)
      const imageIndex = photoNumber; // jsonData.objects index is photoNumber (since we skip index 0)
      setNewImageSrc(imageSrc, imageIndex);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  }
}

// document
//   .getElementById("personaliseImgUpload")
//   .addEventListener("change", handleImageUploadAlternate);
// Replace image event listener

// Event listener for the "Adjust" button click

// document
//   .getElementById("personaliseAdjustBtn")
//   .addEventListener("click", () => {
//     const popupMiniCanvas = document.getElementById("popup-mini-canvas");
//     popupMiniCanvas.style.display = "flex";

//     if (newFabricCanvas) {
//       // Set properties for the first object in the canvas
//       const objects = newFabricCanvas.getObjects();
//       console.log(objects);
//       // const targetObject = objects.find(
//       //   (obj) => obj.type === "image" && !obj.src.startsWith("http")
//       // );
//       const targetObject = objects.filter(
//         (obj) => obj.customId === "clipmask" && obj.type === "image"
//       );

//       console.log(targetObject);

//       if (targetObject[0]) {
//         // Set properties for the found object
//         targetObject[0].set({
//           selectable: true,
//           hasControls: true,
//           hasBorders: true,
//           lockMovementX: false,
//           lockMovementY: false,
//           lockRotation: false,
//           lockScalingX: false,
//           lockScalingY: false,
//         });
//       }

//       // Render the canvas after adjustments
//       newFabricCanvas.renderAll();

//       // Save the updated canvas state to localStorage
//       savedCanvasJSON = newFabricCanvas.toJSON();
//       window.editedCanvasJson = savedCanvasJSON;
//     }
//   });
document
  .getElementById("personaliseAdjustBtn")
  .addEventListener("click", () => {
    const popupMiniCanvas = document.getElementById("popup-mini-canvas");
    popupMiniCanvas.style.display = "flex";

    if (newFabricCanvas) {
      // Get all objects from the canvas
      const objects = newFabricCanvas.getObjects();
      console.log(objects);

      // Filter image objects, excluding the background image at index 0
      const targetObjects = objects.filter(
        (obj, index) => obj.type === "image" && index !== 0
      );

      console.log(targetObjects);

      // Make all target image objects selectable and adjustable
      targetObjects.forEach((targetObject) => {
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
      });

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
  if (selectedItem) {
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
      console.log(newFabricCanvas.toJSON());

      // Save the first object (assuming it's the background image)
      const firstObject = allObjects[0];
      console.log(firstObject);
      // Remove the first object from the canvas
      // newFabricCanvas.remove(firstObject);
      if (
        firstObject &&
        firstObject.type === "image" &&
        firstObject.getSrc &&
        firstObject.getSrc().startsWith("http") &&
        !firstObject.clipPath
      ) {
        newFabricCanvas.remove(firstObject);
      }

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

    const popupMiniCanvas = document.getElementById("popup-mini-canvas");
    popupMiniCanvas.style.display = "none";

    // Hide Canvas in popup
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
      container.removeChild(skeletonContainer);
    }
  }

  // Define the "No Template" object
  const noTemplate = {
    name: "None",
    imageUrl: "../../assets/custom/no-temp.jpg", // Replace with actual image path
    key: "no-template",
    isPublic: true,
    src: "", // Empty or placeholder, to be defined later
    isDummy: false, // Not a dummy template
    deselectId: "no-template-deselect", // Unique identifier for "No Template"
  };

  // Show the skeleton loader before fetching data
  showSkeletonLoader();

  try {
    const response = await fetch(`${baseUrl}/api/v1/user/get/all/templates`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    let dataArray = data.data; // Access the array from the data object
    console.log("dataArray", dataArray);

    if (dataArray === null) {
      hideSkeletonLoader();
      const emptyData = [noTemplate]; // Start with "No Template"
      const dummyTemplateCount = 9; // Reduced by 1 to account for "No Template"
      for (let i = 0; i < dummyTemplateCount; i++) {
        const dummyTemplate = {
          name: `Template ${i + 1}`,
          imageUrl: "../../assets/custom/dummy-temp.png",
          key: `dummy-template-${i + 1}`,
          isPublic: true,
          src: "path/to/dummy/template.json",
          isDummy: true,
        };
        emptyData.push(dummyTemplate);
      }
      console.log(emptyData);
      emptyData.forEach((item) => {
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
        if (item.name.length > 12) {
          nameP.textContent = item.name.substring(0, 12) + "...";
          nameP.setAttribute("title", item.name);
        } else {
          nameP.textContent = item.name;
        }
        nameP.classList.add("template-name-tag");

        mainDiv.appendChild(imageDiv);
        mainDiv.appendChild(nameP);

        container.appendChild(mainDiv);

        if (item.isDummy) {
          const overlay = document.createElement("img");
          overlay.classList.add("template-overlay-icon");
          overlay.id = "templateOverLay";
          overlay.src = "../../assets/custom/overlay-temp.png";
          mainDiv.appendChild(overlay);
          mainDiv.style.cursor = "default";
          mainDiv.style.pointerEvents = "none";
          return;
        }

        // Handle click for "No Template"
        if (item.deselectId === "no-template-deselect") {
          mainDiv.style.cursor = "pointer";
          mainDiv.addEventListener("click", () => {
            // Placeholder for "No Template" click handler
            console.log("No Template clicked! Implement click behavior here.");
            // Add your click logic here later
            // Example: Clear canvas, reset state, etc.
          });
          return;
        }
      });
    }

    if (Array.isArray(dataArray)) {
      const urlParams = new URLSearchParams(window.location.search);
      const name = urlParams.get("name");

      // Filter data and add "No Template" at index 0
      let filteredData = dataArray.filter(
        (obj) => obj.type === name && obj.isPublic === true
      );
      filteredData = [noTemplate, ...filteredData]; // Add "No Template" at index 0

      console.log(filteredData);
      if (filteredData.length < 10) {
        const dummyTemplateCount = 10 - filteredData.length;
        for (let i = 0; i < dummyTemplateCount; i++) {
          const dummyTemplate = {
            name: `Template ${i + 1}`,
            imageUrl: "../../assets/custom/dummy-temp.png",
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

      if (filteredData.length === 0) {
        personaliseButton.style.display = "none";
      } else {
        personaliseButton.style.display = "block";
      }

      async function fetchFavorites() {
        try {
          const response = await fetch(
            `${baseUrl}/api/v1/user/favorite/templates`,
            {
              method: "GET",
              credentials: "include",
            }
          );
          const data = await response.json();
          return data?.favorites?.map((fav) => fav.key) || [];
        } catch (error) {
          console.error("Error fetching favorites:", error);
          return [];
        }
      }

      function updateFavIcon(iconElement, isFav) {
        iconElement.src = isFav
          ? "../../assets/custom/heart-filled.png"
          : "../../assets/custom/heart2.png";
        iconElement.alt = isFav ? "Unfavorite" : "Favorite";
        iconElement.style.filter = isFav ? "" : "brightness(0) invert(1)";
      }

      hideSkeletonLoader();

      let favoriteKeys = await fetchFavorites();

      filteredData.forEach((item) => {
        const mainDiv = document.createElement("div");
        mainDiv.classList.add("template-main-cont");

        let dummyimageUrl = "../../assets/custom/dummy-temp.png";
        const imageDiv = document.createElement("div");
        imageDiv.classList.add("template-image-cont");

        const newImg = document.createElement("img");
        newImg.src = item?.imageUrl || dummyimageUrl;
        newImg.alt = item.name;
        newImg.classList.add("template-image-box");
        newImg.loading = "lazy";

        imageDiv.appendChild(newImg);

        const nameP = document.createElement("p");
        if (item.name.length > 12) {
          nameP.textContent = item.name.substring(0, 12) + "...";
          nameP.setAttribute("title", item.name);
        } else {
          nameP.textContent = item.name;
        }
        nameP.classList.add("template-name-tag");

        mainDiv.appendChild(imageDiv);
        mainDiv.appendChild(nameP);

        container.appendChild(mainDiv);

        if (item.isDummy) {
          const overlay = document.createElement("img");
          overlay.classList.add("template-overlay-icon");
          overlay.id = "templateOverLay";
          overlay.src = "../../assets/custom/overlay-temp.png";
          mainDiv.appendChild(overlay);
          mainDiv.style.cursor = "default";
          mainDiv.style.pointerEvents = "none";
          return;
        }

        // Handle "No Template" click
        // if (item.deselectId === "no-template-deselect") {
        //   mainDiv.style.cursor = "pointer";
        //   mainDiv.addEventListener("click", () => {
        //     // Placeholder for "No Template" click handler
        //     console.log("No Template clicked! Implement click behavior here.");
        //     // Add your click logic here later
        //     // Example: Clear canvas, reset state, etc.
        //   });
        //   return;
        // }

        if (item.deselectId === "no-template-deselect") {
          mainDiv.style.cursor = "pointer";
          mainDiv.addEventListener("click", () => {
            // Reset the 3D model
            resetModel(); // Defined in 3D code
            // Clear canvas-related states
            const previouslyActive = document.querySelector(
              ".template-image-box.active"
            );
            if (previouslyActive) {
              previouslyActive.classList.remove("active");
            }
            templateId = null;
            activeItem = null;
            originalFormat = null;
            window.originalFormat = null;
            editedArrayFormat = [];
            selectedItem = null;
            window.selectedOriginalJsonPart = null;
            mainPartMesh = null;
            window.originalCanvasJson = null;
            lastReplacedPhotoNumber = null;
            meshImageDataArray = []; // Clear texture data
            // Hide mini editor save button
            const miniEditorSaveBtnt = document.getElementById(
              "gauci-save-mini-cont"
            );
            miniEditorSaveBtnt.classList.add("display-none-prop");
            miniEditorSaveBtnt.classList.remove("display-block-prop");
            // Reset personalize image container
            const dummyCont = document.getElementById(
              "personaliseImageDummyCont"
            );
            dummyCont.style.display = "block";

            const dummyImageRestore = document.getElementById(
              "min-editor-dummy-image"
            );
            dummyImageRestore.src = "../../assets/custom/no-photo.png";
            dummyImageRestore.style.width = "30%";
            dummyImageRestore.style.height = "30%";

            //             if (miniEditorPopupImage && clipmaskImage.src) {
            //   // Set the src of the mini-editor-popup-image to the clipmaskImage's src
            //   miniEditorPopupImage.src = clipmaskImage.src;
            //   dummyImage.style.width = "100%";
            //   dummyImage.style.height = "100%";
            //   dummyImage.style.objectFit = "cover";
            //   dummyImage.src = clipmaskImage.src;
            //   dummyImage.style.borderRadius = "10px";
            // }
            // //  else {
            // //   miniEditorPopupImage.src = "../../assets/custom/no-photo.png";
            // // }
            const realEditCont = document.getElementById(
              "personaliseImageUploadPopup"
            );
            realEditCont.style.display = "none";
            // const imageInput = document.getElementById("personaliseImgUpload");
            // imageInput.value = "";
            imageReplace = false;
            console.log("No Template clicked! 3D model and canvas reset.");
          });
          return;
        }

        // Existing favorite icon logic
        const favIcon = document.createElement("img");
        favIcon.classList.add("template-fav-icon");
        favIcon.id = "templateFavIcon";

        let isFavorite = favoriteKeys.includes(item.key);
        updateFavIcon(favIcon, isFavorite);

        favIcon.style.cursor = "pointer";

        favIcon.addEventListener("mouseenter", () => {
          if (isFavorite) {
            favIcon.src = "../../assets/custom/heart2.png";
            favIcon.style.filter = "brightness(0) invert(1)";
          } else {
            favIcon.src = "../../assets/custom/heart-filled.png";
            favIcon.style.filter = "";
          }
        });

        favIcon.addEventListener("mouseleave", () => {
          updateFavIcon(favIcon, isFavorite);
        });

        mainDiv.appendChild(favIcon);

        favIcon.addEventListener("click", async (e) => {
          e.stopPropagation();
          const templateKey = item.key;

          const isSuccess = await handleFavTempllate(templateKey);

          if (isSuccess) {
            favoriteKeys = await fetchFavorites();
            isFavorite = favoriteKeys.includes(item.key);
            updateFavIcon(favIcon, isFavorite);

            const message = isFavorite
              ? "Added to favorites!"
              : "Removed from favorites!";

            Swal.fire({
              title: message,
              text: "Success",
              icon: "success",
            });
          } else {
            isFavorite = favoriteKeys.includes(item.key);
            updateFavIcon(favIcon, isFavorite);

            Swal.fire({
              icon: "warning",
              title: "Warning",
              text: "Please login to add template into Favorites",
            });
          }
        });

        // Existing click handler for regular templates
        mainDiv.addEventListener("click", async () => {
          const previouslyActive = document.querySelector(
            ".template-image-box.active"
          );

          if (previouslyActive) {
            previouslyActive.classList.remove("active");
          }
          templateId = item.key;
          console.log("templateId", templateId);
          newImg.classList.add("active");
          activeItem = item.src;
          originalFormat = item.src;
          window.originalFormat = originalFormat;

          console.log("this is the activeitems", activeItem);
          editedArrayFormat = Object.keys(activeItem).map((key) => ({
            part: key,
            jsonData: JSON.parse(activeItem[key]),
          }));
          console.log("edited array", editedArrayFormat);

          generateImagesFromCanvasStates();

          try {
            selectedItem =
              editedArrayFormat.find((item) => item.part === mainPart) ||
              editedArrayFormat[0];
            console.log(selectedItem);
            window.selectedOriginalJsonPart = selectedItem;
            imageReplace = true;
            mainPartMesh = selectedItem?.part;

            window.originalCanvasJson = selectedItem.jsonData;

            const miniEditorSaveBtnt = document.getElementById(
              "gauci-save-mini-cont"
            );
            miniEditorSaveBtnt.classList.add("display-block-prop");
            miniEditorSaveBtnt.classList.remove("display-none-prop");

            const dummyCont = document.getElementById(
              "personaliseImageDummyCont"
            );
            function updateDisplayStyle() {
              if (window.innerWidth < 1024) {
                dummyCont.style.display = "flex";
              } else {
                dummyCont.style.display = "block";
              }
            }

            updateDisplayStyle();
            const realEditCont = document.getElementById(
              "personaliseImageUploadPopup"
            );

            realEditCont.style.display = "none";
            // const imageInput = document.getElementById("personaliseImgUpload");
            // imageInput.value = "";
            imageReplace = true;
            loadJSONToCanvas(selectedItem.jsonData);
            // preloadAllImages(selectedItem.jsonData)
            //   .then(() => {
            //     console.log("All images preloaded");
            //     loadJSONToCanvas(selectedItem.jsonData);
            //   })
            //   .catch((err) => {
            //     console.error("Error during image preloading", err);
            //   });
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

// function preloadAllImages(objects) {
//   console.log("preloadAllImages called", objects);
//   return Promise.all(
//     objects?.objects?.map((obj) => {
//       if (obj?.src) {
//         return new Promise((resolve, reject) => {
//           const img = new Image();
//           img.crossOrigin = "anonymous";
//           img.onload = () => {
//             console.log("c", obj.src);
//             resolve();
//           };
//           img.onerror = (e) => {
//             console.error("Failed to preload image:", obj.src, e);
//             resolve();
//           };
//           img.src = obj.src;
//         });
//       } else {
//         return Promise.resolve(); // Not an image object
//       }
//     })
//   );
// }

// const partDropDownList = document.getElementById("hexa-dropdown-ul-list");

// document
//   .getElementById("hexa-drop-down-select-cont")
//   .addEventListener("click", () => {
//     partDropDownList.classList.remove("show-dropdown");
//   });

document.getElementById("mobil-cross-btn").addEventListener("click", () => {
  const popupMiniCanvas = document.getElementById(
    "personaliseImageUploadPopup"
  );

  popupMiniCanvas.style.display = "none";
  const dummyCont = document.getElementById("personaliseImageDummyCont");

  function updateDisplayStyle() {
    if (window.innerWidth < 1024) {
      dummyCont.style.display = "flex";
    } else {
      dummyCont.style.display = "block";
    }
  }

  // Initial check
  updateDisplayStyle();
});

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
  const openModalBtn = document.getElementById("gauci-mini-editor-save");
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
    const response = await fetch(`${baseUrl}/api/v1/protected-route`, {
      method: "GET",
      credentials: "include", // Include credentials for backend token validation
    });

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
//   .getElementById("gauci-mini-editor-save")
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
    xhr.open("POST", `${baseUrl}/api/v1/user/media/upload`, true);

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
            // document.querySelector(".gauci-modal").style.display = "none";
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
    const response = await fetch(`${baseUrl}/api/v1/user/file-data/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Include credentials for cross-origin requests
        // Authorization: "Bearer <Your-Token>", // Use if needed for authentication, else remove
      },
      body: JSON.stringify(data),
      credentials: "include", // Equivalent to `xhrFields: { withCredentials: true }`
    });

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
      `${baseUrl}/api/v1/user/template/togglefavorite`,
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
