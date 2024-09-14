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

function initPersonalise() {
  const loader = document.getElementById("mini-editor-loader-cont");

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
  new GLTFLoader().load(modelSource, function (gltf) {
    const loadedModel = gltf.scene;

    loadedModel.position.set(0, -0.11, 0);
    scene.add(gltf.scene);
    loader.classList.remove("display-block-prop");
    loader.classList.add("display-none-prop");
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
    console.log(selectedMesh);
    const specificMesh = scene.getObjectByName(selectedMesh);

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
      document.getElementById("personaliseImageUploadPopup").style.display =
        "block";
    }
  });

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

  savedCanvasJSON = newFabricCanvas.toJSON();
  window.editedCanvasJson = savedCanvasJSON;
  const allObjects = newFabricCanvas.getObjects();

  // Save the first object (assuming it's the background image)
  const firstObject = allObjects[0];

  // Remove the first object from the canvas
  newFabricCanvas.remove(firstObject);

  // Render the canvas without the first object
  newFabricCanvas.renderAll();

  // Convert the remaining objects on the canvas to an image
  const format = "png";
  const quality = 1;
  const imgData = newFabricCanvas.toDataURL({
    format: format,
    quality: quality,
    enableRetinaScaling: false,
  });

  // Pass the image data to the changeTexture function
  fabricImageConverted = imgData;
  changeTexture(fabricImageConverted);

  // Add the first object back to its original position
  newFabricCanvas.insertAt(firstObject, 0);

  // Render the canvas to show all objects again
  newFabricCanvas.renderAll();

  const updatedCanvasJSON = newFabricCanvas.toJSON();
  window.editedCanvasJson = updatedCanvasJSON;
}

function replaceImageSrc(json, newImageSrc, callback) {
  let imageFoundInGroup = false;

  // Check if there are images within groups
  json.objects.forEach((obj) => {
    if (obj.type === "group") {
      obj.objects.forEach((innerObj) => {
        if (innerObj.type === "image") {
          innerObj.src = newImageSrc;
          imageFoundInGroup = true;
        }
      });
    }
  });

  if (imageFoundInGroup) {
    json.objects.forEach((obj) => {
      if (obj.type === "group") {
        obj.objects.forEach((innerObj) => {
          if (innerObj.type === "image") {
            innerObj.src = newImageSrc;
          }
        });
      }
    });
  } else {
    if (json.objects.length > 1 && json.objects[1].type === "image") {
      json.objects[1].src = newImageSrc;
    }
    console.log("Image updated in second position or no groups found");
  }

  imageUpdatedJSON = json;
  console.log(imageUpdatedJSON, "image updated json strc");
  if (callback) callback(imageUpdatedJSON);
}

function loadJSONToCanvas(jsonData) {
  if (!newFabricCanvas) {
    initializeCanvas();
  }

  newFabricCanvas.clear();

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
            scaleX: 0.225, // Apply the scale factor
            scaleY: 0.225, // Apply the scale factor
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
          obj.scaleX *= 0.225;
          obj.scaleY *= 0.225;
        } else {
          // Apply a different scaling factor for other objects
          obj.scaleX *= 0.225; // Adjust the scaling factor as needed
          obj.scaleY *= 0.225; // Adjust the scaling factor as needed

          // Adjust top and left properties to make the object visible
          obj.left *= 0.225; // Adjust the position as needed
          obj.top *= 0.225; // Adjust the position as needed
        }

        if (obj.clipPath) {
          obj.clipPath.set({
            scaleX: obj.clipPath.scaleX * 0.225, // Adjust the scaling factor as needed
            scaleY: obj.clipPath.scaleY * 0.225, // Adjust the scaling factor as needed
            left: obj.clipPath.left * 0.225, // Adjust the position as needed
            top: obj.clipPath.top * 0.225, // Adjust the position as needed
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

      // Convert the remaining objects on the canvas to an image
      const format = "png";
      const quality = 1;
      const imgData = newFabricCanvas.toDataURL({
        format: format,
        quality: quality,
        enableRetinaScaling: false,
      });

      // Pass the image data to the changeTexture function
      fabricImageConverted = imgData;
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
  const miniEditorAdjust = document.getElementById("miniE-adjust-Btn");
  miniEditorAdjust.classList.remove("display-none-prop");
  miniEditorAdjust.classList.add("display-block-prop");
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
  .getElementById("personaliseImgUpload")
  .addEventListener("change", handleImageUploadAlternate);
// Replace image event listener

document
  .getElementById("personaliseClosePopupBtn")
  .addEventListener("click", () => {
    // Hide the popup
    document.getElementById("personaliseImageUploadPopup").style.display =
      "none";

    // Clear the file input field
    const textInput1 = document.getElementById("text-1");
    const textInput2 = document.getElementById("text-2");
    if (textInput1) {
      textInput1.value = ""; // Clear the first text input
    }
    if (textInput2) {
      textInput2.value = ""; // Clear the second text input
    }
  });

// Event listener for the "Adjust" button click

document
  .getElementById("personaliseAdjustBtn")
  .addEventListener("click", () => {
    // Display Canvas in popup
    const miniEditorCont = document.getElementById("mini-editor-Cont");
    miniEditorCont.classList.remove("display-none-prop");
    miniEditorCont.classList.add("display-block-prop");
    // Display Done Button
    const miniEditorDone = document.getElementById("miniE-done-Btn");
    miniEditorDone.classList.remove("display-none-prop");
    miniEditorDone.classList.add("display-block-prop");

    // Hide Adjust Button
    const miniEditorAdjust = document.getElementById("miniE-adjust-Btn");
    miniEditorAdjust.classList.add("display-none-prop");
    miniEditorAdjust.classList.remove("display-block-prop");

    if (newFabricCanvas) {
      // Set properties for the first object in the canvas
      const objects = newFabricCanvas.getObjects();
      const targetObject = objects.find(
        (obj) => obj.type === "image" && !obj.src.startsWith("http")
      );

      // if (firstObject) {
      //   firstObject.set({
      //     selectable: true,
      //     hasControls: true,
      //     hasBorders: true,
      //     lockMovementX: false,
      //     lockMovementY: false,
      //     lockRotation: false,
      //     lockScalingX: false,
      //     lockScalingY: false,
      //   });
      // }
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
      // Handle images within groups
      // newFabricCanvas.forEachObject((obj) => {
      //   if (obj.type === "group") {
      //     obj.forEachObject((innerObj) => {
      //       if (innerObj.type === "image") {
      //         innerObj.set({
      //           selectable: true,
      //           hasControls: true,
      //           hasBorders: true,
      //           lockMovementX: false,
      //           lockMovementY: false,
      //           lockRotation: false,
      //           lockScalingX: false,
      //           lockScalingY: false,
      //         });
      //         console.log("Image within group made adjustable");
      //       }
      //     });
      //   }
      // });
      newFabricCanvas.forEachObject((obj) => {
        if (obj.type === "group") {
          // obj.forEachObject((innerObj) => {
          //   if (innerObj.type === "image") {

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
          console.log("Image within group made adjustable");
          // }
          // });
        }
      });

      // Render the canvas after adjustments
      newFabricCanvas.renderAll();

      // Save the updated canvas state to localStorage
      savedCanvasJSON = newFabricCanvas.toJSON();
      window.editedCanvasJson = savedCanvasJSON;
    }
  });

document.getElementById("personaliseDoneBtn").addEventListener("click", () => {
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

    const allObjects = newFabricCanvas.getObjects();

    // Save the first object (assuming it's the background image)
    const firstObject = allObjects[0];

    // Remove the first object from the canvas
    newFabricCanvas.remove(firstObject);

    // Render the canvas without the first object
    newFabricCanvas.renderAll();

    // Convert the remaining objects on the canvas to an image
    const format = "png";
    const quality = 1;
    const imgData = newFabricCanvas.toDataURL({
      format: format,
      quality: quality,
      enableRetinaScaling: false,
    });

    // Pass the image data to the changeTexture function
    fabricImageConverted = imgData;
    changeTexture(fabricImageConverted);

    // Add the first object back to its original position
    newFabricCanvas.insertAt(firstObject, 0);

    // Render the canvas to show all objects again
    newFabricCanvas.renderAll();
  }

  // Hide Done Button
  const miniEditorDone = document.getElementById("miniE-done-Btn");
  miniEditorDone.classList.add("display-none-prop");
  miniEditorDone.classList.remove("display-block-prop");

  //Display Adjust Button

  const miniEditorAdjust = document.getElementById("miniE-adjust-Btn");
  miniEditorAdjust.classList.remove("display-none-prop");
  miniEditorAdjust.classList.add("display-block-prop");

  // Hide Canvas in popup
  const miniEditorCont = document.getElementById("mini-editor-Cont");
  miniEditorCont.classList.add("display-none-prop");
  miniEditorCont.classList.remove("display-block-prop");
});

// Initialize the 3D viewer when the page is ready
initialize3DViewer();

(async () => {
  const loader = document.getElementById("mini-editor-loader");
  const templateListCont = document.getElementById("template-list-cont");
  // Show loader
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

      // Fetch favorites to compare with
      const favoriteResponse = await fetch(
        "https://backend.toddlerneeds.com/api/v1/user/favorite/templates",
        {
          method: "GET",
          credentials: "include",
        }
      );
      const favoriteData = await favoriteResponse.json();
      const favoriteKeys = favoriteData?.favorites?.map((fav) => fav.key);

      filteredData.forEach((item) => {
        const mainDiv = document.createElement("div");
        mainDiv.classList.add("personalise-library-main-box"); // Add a class for styling the main container

        // Create the div for the image
        const newDiv = document.createElement("div");
        newDiv.classList.add("personalise-library-box");

        // Create and set image tag inside the newDiv
        const newImg = document.createElement("img");
        newImg.src = item.imageUrl;
        newImg.alt = item.name;
        newImg.classList.add("personalise-image-template-list"); // Add a class for styling the image if needed

        // Append the image to the newDiv
        newDiv.appendChild(newImg);

        // Create a new div to hold the p tag
        const textDiv = document.createElement("div");
        textDiv.classList.add("personalise-text-container"); // Add a class for styling the text container

        // Create and set paragraph tag for the name inside the textDiv
        const newP = document.createElement("p");
        newP.textContent = item.name;
        // Favorite icon using PNGs
        const favIcon = document.createElement("img");
        favIcon.classList.add("template-fav-icon");
        favIcon.id = "templateFavIcon";
        // Check if this template is in the favorites list
        const isFavorite = favoriteKeys?.includes(item.key);
        favIcon.src = isFavorite
          ? "../../assets/custom/heart-filled.png"
          : "../../assets/custom/heart.png";
        favIcon.alt = isFavorite ? "Unfavorite" : "Favorite";
        favIcon.style.cursor = "pointer";

        newDiv.appendChild(favIcon);

        // // Attach the onclick event to the favIcon
        // favIcon.addEventListener('click', () => {
        //     const templateKey = item.key;
        //     handleFavTempllate(templateKey);
        // });

        // Attach the onclick event to the favIcon
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
              ? "../../assets/custom/heart.png"
              : "../../assets/custom/heart-filled.png";
            favIcon.alt = isCurrentlyFavorite ? "Favorite" : "Unfavorite";

            // Show toastr success message
            toastr.success(
              isCurrentlyFavorite
                ? "Removed from favorites!"
                : "Added to favorites!",
              "Success"
            );
          } else {
            // Show toastr error message if something went wrong
            toastr.error(
              "Please login to add template into Favorites",
              "Error"
            );
          }
        });

        // Append the paragraph to the textDiv
        textDiv.appendChild(newP);

        // Append both the image div and text div to the main div
        mainDiv.appendChild(newDiv);
        mainDiv.appendChild(textDiv);

        // Append the main div to the container
        container.appendChild(mainDiv);

        // Add click event listener
        mainDiv.addEventListener("click", async () => {
          // Remove active class from previously selected item
          const previouslyActive = container.querySelector(
            ".personalise-library-box.active"
          );
          if (previouslyActive) {
            previouslyActive.classList.remove("active");
          }
          templateId = item.key;
          console.log("templateId", templateId);
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
            window.originalCanvasJson = jsonData;
            imageReplace = true;

            // Pass the JSON object to loadJSONToCanvas
            loadJSONToCanvas(jsonData);
            // setupEventListener();
          } catch (fetchError) {
            console.error("Error fetching JSON data:", fetchError);
          }
        });
      });

      // console.log("Filtered data:", filteredData);
      loader.classList.remove("template-list-loader-cont");
      loader.classList.add("display-none-prop");
      templateListCont.classList.remove("display-none-prop");
      templateListCont.classList.add("display-block-prop");
    } else {
      console.error("Error: The fetched data is not an array:", dataArray);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
})();
setupEventListener();

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
    return false;
    // Indicate failure
  }
}
