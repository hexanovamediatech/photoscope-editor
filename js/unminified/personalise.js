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
let savedCanvasJSON;
let newImageSrc = null;
let imageUpdatedJSON;
let textUpdatedJson;
let imageReplace = false;

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
  // console.log("Model name from query param is", name);

  // Set a default model or handle cases where 'name' might not be provided
  // const modelName = name ? name : "default-model";

  // // Construct the dynamic path for the GLB file using the name
  // const normalizedName = name.replace("-", "_").toUpperCase();
  let normalizedName =
    name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, "_");
  // console.log(normalizedName);
  // Use the normalizedName in the glbPath
  const glbPath = `/assets/3d/${normalizedName}.glb`;
  // const glbPath = `/assets/3d/${normalizedName}.glb`;
  // console.log(glbPath);
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
  // const normalizedName = name.replace("-", "_").toUpperCase();
  let normalizedName =
    name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, "_");
  // console.log(normalizedName);
  // Get the name from URL
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
        // console.log(jsonData);
        loadJSONToCanvas(jsonData);
      } catch (error) {
        console.error("Error fetching or parsing the JSON:", error);
      }
    }

    // Show the popup
    document.getElementById("personaliseImageUploadPopup").style.display =
      "block";
  });

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
  const format = "png";
  const quality = 1;
  const imgData = newFabricCanvas.toDataURL({
    format: format,
    quality: quality,
    enableRetinaScaling: false,
  });
  fabricImageConverted = imgData;
  changeTexture(fabricImageConverted);
  // console.log("recall again and again");
  // const updatedCanvasJSON = newFabricCanvas.toJSON();
  // textUpdatedJson= JSON.stringify(updatedCanvasJSON);
  savedCanvasJSON = newFabricCanvas.toJSON();
  localStorage.setItem("savedCanvasJSON", JSON.stringify(savedCanvasJSON));
  // return updatedCanvasJSON;
}

function replaceImageSrc(json, newImageSrc) {
  // console.log(json);
  json.objects.forEach((obj) => {
    if (obj.type === "group") {
      obj.objects.forEach((innerObj) => {
        if (innerObj.type === "image") {
          innerObj.src = newImageSrc;
        }
      });
    }
  });
  imageUpdatedJSON = json;

  console.log(imageUpdatedJSON, "image updated json strc");
}
function loadJSONToCanvas(json, format = "png", quality = 1) {
  try {
    // console.log("Received JSON data:", json);

    // Initialize the canvas if it hasn't been initialized yet
    if (!newFabricCanvas) {
      initializeCanvas();
    }

    newFabricCanvas.clear();

    // Set canvas dimensions
    const canvasWidth = 460;
    const canvasHeight = 460;
    // if (typeof newImageSrc !== "undefined") {
    //   replaceImageSrc(json, newImageSrc);
    // }
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

      savedCanvasJSON = newFabricCanvas.toJSON();
      localStorage.setItem("savedCanvasJSON", JSON.stringify(savedCanvasJSON));

      // console.log("Canvas JSON:", JSON.stringify(savedCanvasJSON));
    });
  } catch (error) {
    console.error("Error processing JSON data:", error);
  }
}

function setNewImageSrc(imageSrc) {
  newImageSrc = imageSrc;

  // Retrieve the JSON string from localStorage
  const savedOriginalCanvasJSONString = localStorage.getItem(
    "savedOriginalCanvasJSON"
  );

  // Parse the JSON string into an object
  let savedOriginalCanvasJSON = {};
  if (savedOriginalCanvasJSONString) {
    savedOriginalCanvasJSON = JSON.parse(savedOriginalCanvasJSONString);
    // console.log(savedOriginalCanvasJSON, "parsed json");
  }

  if (typeof newImageSrc !== "undefined") {
    // Replace the image source in the parsed JSON
    replaceImageSrc(savedOriginalCanvasJSON, newImageSrc);

    // Save the updated JSON back to a variable
    const imageUpdatedJSON = savedOriginalCanvasJSON;

    // Load the updated JSON to the canvas
    loadJSONToCanvas(imageUpdatedJSON);
  }
}

// Assuming the user selects an image via an input field
function handleImageUploadAlternate(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const imageSrc = e.target.result;
    setNewImageSrc(imageSrc); // Store the new image source
    // loadJSONToCanvas(savedCanvasJSON); // Reload the JSON to canvas with the new image
  };

  if (file) {
    reader.readAsDataURL(file);
  }
}

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

function setupEventListener() {
  const uploadImage = document.getElementById("personaliseImgUpload");

  // Remove any existing event listeners
  uploadImage.removeEventListener("change", handleImageUploadmain);
  uploadImage.removeEventListener("change", handleImageUploadAlternate);

  if (imageReplace) {
    uploadImage.addEventListener("change", handleImageUploadAlternate);
  } else {
    uploadImage.addEventListener("change", handleImageUploadmain);
  }
}
function handleImageUploadmain(event) {
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
        // savedCanvasJSON = fabricCanvas.toJSON();

        // Add backgroundImage property if missing
        savedCanvasJSON.backgroundImage = savedCanvasJSON.backgroundImage || {
          angle: 0,
          scaleX: 1,
          scaleY: 1,
          originX: "center",
          originY: "center",
          src: canvas.toDataURL("image/png"),
          width: canvas.width,
          height: canvas.height,
        };
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
    if (newFabricCanvas) {
      // newFabricCanvas.forEachObject((obj) => {
      //   obj.set({
      //     selectable: true,
      //     hasControls: true,
      //     hasBorders: true,
      //     lockMovementX: false,
      //     lockMovementY: false,
      //     lockRotation: false,
      //     lockScalingX: false,
      //     lockScalingY: false,
      //   });
      // });
      const objects = newFabricCanvas.getObjects();
      const firstObject = objects[0];

      if (firstObject) {
        // Set properties for the first object
        firstObject.set({
          selectable: false,
          hasControls: false,
          hasBorders: false,
          lockMovementX: true,
          lockMovementY: true,
          lockRotation: true,
          lockScalingX: true,
          lockScalingY: true,
        });
      }

      objects.slice(1).forEach((obj) => {
        obj.set({
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
      newFabricCanvas.renderAll();
      newFabricCanvas.renderAll();
      savedCanvasJSON = newFabricCanvas.toJSON();
      localStorage.setItem("savedCanvasJSON", JSON.stringify(savedCanvasJSON));
    }
  });

document.getElementById("personaliseDoneBtn").addEventListener("click", () => {
  if (fabricCanvas) {
    // Get the image as a data URL
    const selectedImage = fabricCanvas.toDataURL("image/png");
    // Apply the selected image as a texture to your 3D model
    changeTexture(selectedImage);
    // Save the current state of the canvas as JSON
    savedCanvasJSON = fabricCanvas.toJSON();
    // Disable resizing and adjusting
    const activeObject =
      fabricCanvas.getActiveObject() || fabricCanvas.imageObject;
    if (activeObject) {
      activeObject.set("selectable", false);
      fabricCanvas.discardActiveObject(); // Deselect the object
      fabricCanvas.renderAll();
    }

    // Close the image upload popup
    // document.getElementById("personaliseImageUploadPopup").style.display =
    //   "none";
  }
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
    const format = "png";
    const quality = 1;
    const imgData = newFabricCanvas.toDataURL({
      format: format,
      quality: quality,
      enableRetinaScaling: false,
    });
    fabricImageConverted = imgData;
    changeTexture(fabricImageConverted);

    savedCanvasJSON = newFabricCanvas.toJSON();
    console.log(JSON.stringify(savedCanvasJSON));
    localStorage.setItem("savedCanvasJSON", JSON.stringify(savedCanvasJSON));
    // loadJSON(savedCanvasJSON);
  }
});

// Initialize the 3D viewer when the page is ready
initialize3DViewer();

(async () => {
  try {
    const response = await fetch(
      "https://backend.toddlerneeds.com/api/v1/user/get/all"
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
      const filteredData = dataArray.filter((obj) => obj.type === name);

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
            // console.log(jsonData);
            imageReplace = true;
            localStorage.setItem(
              "savedOriginalCanvasJSON",
              JSON.stringify(jsonData)
            );
            // console.log(fabricImageConverted);
            // Pass the JSON object to loadJSONToCanvas
            loadJSONToCanvas(jsonData);
            setupEventListener();
          } catch (fetchError) {
            console.error("Error fetching JSON data:", fetchError);
          }
        });
      });

      // console.log("Filtered data:", filteredData);
    } else {
      console.error("Error: The fetched data is not an array:", dataArray);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
})();
setupEventListener();
