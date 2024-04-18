

document.addEventListener('DOMContentLoaded', function () {
  const cleanViewBtn = document.getElementById('cleanViewBtn');
  cleanViewBtn.addEventListener('click', function () {
    cleanView();
    app.render();
  });
});

function cleanView() {
  console.log('Clean View button clicked');
  app.cleanView()
  app.setRotateAnimationMode(false);
  app.controls.autoRotate = false;
  if (app.arrowHelper) {
    app.scene.remove(app.arrowHelper);
  }
  if (timeout_id !== null) {
    clearTimeout(timeout_id);
  }
}


document.addEventListener('DOMContentLoaded', function () {
  const uiContainer = document.querySelector('.ui-buttons-container');

  // Function to create a dropdown
  // Function to create a dropdown
  function createDropdown(title, items) {
    const dropdownDiv = document.createElement('div');
    dropdownDiv.className = 'dropdown';

    const button = document.createElement('button');
    button.className = 'btn btn-primary dropdown-toggle';
    button.setAttribute('type', 'button');
    button.setAttribute('data-toggle', 'dropdown');
    button.setAttribute('aria-haspopup', 'true');
    button.setAttribute('aria-expanded', 'false');
    button.textContent = title;

    const dropdownContent = document.createElement('div');
    dropdownContent.className = 'dropdown-menu';

    items.forEach(item => {
      const buttonItem = document.createElement('button');
      buttonItem.className = 'dropdown-item btn btn-secondary'; // Add btn classes for button styling
      buttonItem.type = 'button'; // Specify the button type
      buttonItem.textContent = item.textContent;

      // You can still use data attributes with buttons
      buttonItem.dataset.building = item.dataset.building;
      buttonItem.dataset.room = item.dataset.room;

      // Append the button to the dropdown content
      dropdownContent.appendChild(buttonItem);
    });

    dropdownDiv.appendChild(button);
    dropdownDiv.appendChild(dropdownContent);
    uiContainer.appendChild(dropdownDiv);
  }

  // Create Buildings dropdown
  const buildings = ['Building 1', 'Building 2', 'Building 3', 'Building 4', 'Building 5', 'Building 6', 'Building 7', 'Building 8'];
  const buildingDivs = buildings.map((building, index) => {
    const div = document.createElement('div');
    div.className = 'dropdown-item';
    div.textContent = building;
    div.dataset.building = index + 1; // Assuming building numbers start at 1
    return div;
  });
  createDropdown('Building', buildingDivs);

  // Populate Courses dropdown from IndexedDB
  function populateDropdownsFromIndexedDB() {
    let openRequest = indexedDB.open('CampusNavDB', 1);

    openRequest.onsuccess = function (e) {
      let db = e.target.result;
      let transaction = db.transaction(['courses'], 'readonly');
      let store = transaction.objectStore('courses');
      let request = store.getAll();

      request.onsuccess = function () {
        const courseDivs = request.result.map(course => {
          const div = document.createElement('div');
          div.className = 'dropdown-item';
          div.textContent = course.class_name;
          div.dataset.building = course.class_building;
          div.dataset.room = course.class_room_number;
          return div;
        });
        createDropdown('Sort by courses', courseDivs);
      };

      request.onerror = function () {
        console.error("Error", request.error);
      };
    };
  }

  // Call the function to populate courses dropdown from IndexedDB
  populateDropdownsFromIndexedDB();




  // Event listener for dropdown item selection
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('dropdown-item')) {
      const buildingNumber = e.target.dataset.building;
      const roomNumber = e.target.dataset.room;

      if (roomNumber !== undefined) {
        // It's a course item
        console.log('Course clicked: Building number:', buildingNumber, 'Room number:', roomNumber);
        // Call highlighting function for room
        highlightsFeature(buildingNumber, roomNumber);
      } else {
        // It's a building item
        console.log('Building clicked: Building number:', buildingNumber);
        // Handle building click (perhaps highlight the entire building or open building-specific information)
        highlightsFeature(buildingNumber, null);
      }
    }
  });
});






//UNDER CONSTERCTION
//--------------------------------

let timeout_id = null; // global for last timeout id to be cleared
let app = window.Q3D.application;
// Clears any ongoing highlights or animations
function resetHighlights() {
  // Reset the rotation speed to default before applying new value
  app.controls.autoRotateSpeed = 0; // Reset to halt any ongoing rotation quickly
  app.renderer.render(app.scene, app.camera); // Immediate render to apply the reset
  if (app && app.scene && app.arrowHelper) {
    app.scene.remove(app.arrowHelper);
    app.arrowHelper = null;
  }

  if (timeout_id !== null) {
    clearTimeout(timeout_id);
  }

  app.setRotateAnimationMode(false); // Ensure no orbit animation is running
  app.controls.autoRotate = false; // Disable auto-rotate
}


// Finds and returns the object with matching building and room number
function findObjectToHighlight(buildingNumber, roomNumber) {
  let objectToHighlight = null;

  app.scene.traverse(function (object) {
    if (object.isMesh && object.userData && object.userData.properties) {
      let properties = object.userData.properties;
      if (properties[2] == buildingNumber && (!roomNumber || properties[5] == roomNumber)) {
        objectToHighlight = object;
        return true; // Found the object, stop traversing
      }
    }
  });

  return objectToHighlight;
}

function setupArrowHelper(objectToHighlight) {
  let center = objectToHighlight.geometry.boundingSphere.center;
  let heightAboveObject = 75; // Adjust as needed
  let arrowDirection = new THREE.Vector3(0, 0, -0.5); // Direction pointing downwards
  let arrowPosition = new THREE.Vector3(center.x, center.y + 1, center.z + 40).add(arrowDirection.clone().multiplyScalar(-heightAboveObject));
  let arrowLength = heightAboveObject * 0.5;
  let headLength = arrowLength * 0.4;
  let headWidth = headLength * 0.5;

  app.arrowHelper = new THREE.ArrowHelper(
    new THREE.Vector3(0, 0, -1), // Pointing down
    arrowPosition,
    arrowLength,
    0x00018F, // Color
    headLength,
    headWidth
  );
  app.scene.add(app.arrowHelper);
}

function highlightsFeature(buildingNumber, roomNumber) {
  resetHighlights(); // Clear previous highlights and animations
  let objectToHighlight = findObjectToHighlight(buildingNumber, roomNumber);

  if (objectToHighlight) {
    highlightAndFocusOnObject(objectToHighlight);
  } else {
    console.log("No matching object found.");
  }
};

function highlightAndFocusOnObject(objectToHighlight) {
  let center = objectToHighlight.geometry.boundingSphere.center;
  let distance = app.scene.userData.baseExtent.width * 0.28;
  app.cameraAction.zoom(center.x, center.y, center.z, distance);

  setupArrowHelper(objectToHighlight);

  // Start orbiting
  app.setRotateAnimationMode(true);
  app.controls.autoRotate = true;
  app.controls.autoRotateSpeed = 1.2;
  app.cameraAction.orbit(center.x, center.y, center.z);

  // Highlight the building/room
  app.highlightFeature(objectToHighlight);
  app.renderer.render(app.scene, app.camera);

  // Set a timeout to stop orbiting after 10 seconds
  timeout_id = setTimeout(function () {
    stopOrbiting(objectToHighlight, center, distance);
  }, 10000);
}

function stopOrbiting(objectToHighlight, center, distance) {
  console.log(`Stopped orbiting with timeout_id: ${timeout_id}`);
  app.setRotateAnimationMode(false);
  app.controls.autoRotate = false;
  app.renderer.render(app.scene, app.camera);
  console.log("Camera has stopped orbiting.");

  // Re-center on object at the end of orbit animation
  app.cameraAction.zoom(center.x, center.y, center.z, distance);
  app.highlightFeature(objectToHighlight);
}





// first try of creating a marker for studnets location
// function createMarkerMaterial() {
//   console.log("Creating marker material...");
//   const geometry = new THREE.SphereGeometry(5.05, 32, 32);
//   const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
//   return new THREE.Mesh(geometry, material);
// }
console.log("Setting up projections and materials...");
// Setting up projections outside to be accessible by all functions
const sourceProjection = proj4('EPSG:4326'); // WGS 84
const destProjection = proj4('EPSG:3857');  // WGS 84 / Pseudo-Mercator



function getLocation() {
  console.log("Attempting to fetch the user's location...");
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    console.error("Geolocation is not supported by this browser.");
  }
}

// Fetch user location and check against plane bounds
function showPosition(position) {
  const { latitude, longitude } = position.coords;
  const convertedCoords = proj4(sourceProjection, destProjection, [longitude, latitude]);
  //const userLocationVector = new THREE.Vector3(convertedCoords[0], convertedCoords[1], 4.7);
  const userLocationVector = new THREE.Vector3(4000000.42, 4000000.57, 4.7);//Debugging outside of plane boundries
  //const userLocationVector = new THREE.Vector3(3871293.42, 3765441.57, 4.7); //Debugging  - use fixed coordinates instead of GPS data
  const planeConfig = getPlaneConfig();
  if (planeConfig && isWithinPlaneBounds(userLocationVector, planeConfig)) {
    console.log("User is within the plane bounds.");
    addUserModel(userLocationVector);
  } else {
    console.log("User is outside the plane bounds.");
    showNotification("You are outside the plane bounds.");
  }
}

function showNotification(message) {
  document.getElementById('notification-message').innerText = message;
  document.getElementById('notification-popup').style.display = 'block';
}

function closeNotification() {
  document.getElementById('notification-popup').style.display = 'none';
}

// Add event listeners once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('close-notification-btn').addEventListener('click', closeNotification);
});

// Check if user location is within plane bounds
function isWithinPlaneBounds(userLocationVector, planeConfig) {
  const halfWidth = planeConfig.width / 2;
  const halfHeight = planeConfig.height / 2;
  const centerX = planeConfig.center[0];
  const centerY = planeConfig.center[1];

  return (
    userLocationVector.x >= centerX - halfWidth && userLocationVector.x <= centerX + halfWidth &&
    userLocationVector.y >= centerY - halfHeight && userLocationVector.y <= centerY + halfHeight
  );
}

function addUserModel(userLocationVector) {
  // Load the student model and add it to the scene
  const loader = new THREE.GLTFLoader();
  loader.load('student_icon.glb', function (gltf) {
    const model = gltf.scene;
    model.scale.set(10, 10, 10); // Adjust scale as needed
    model.rotation.x = Math.PI / 2; // Adjust rotation as needed to stand upright
    model.position.copy(userLocationVector); // Position the model
    Q3D.application.scene.add(model);
    console.log("Student model added to the scene");

    Q3D.application.render(); // Ensure the scene is updated
    console.log("Scene rendered with the student model");
  }, undefined, function (error) {
    console.error('An error happened while loading the model', error);
  });
}

function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      console.error("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      console.error("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      console.error("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      console.error("An unknown error occurred.");
      break;
  }
}

// Get Plane Configuration with correct transformations
function getPlaneConfig() {
  let layer7 = null;
  let flatPlaneLayer = null;

  Q3D.application.scene.traverse(function (object) {
    if (object.isMesh) {
      if (object.userData.layerId === 7) {
        layer7 = object;
      }
      if (object.userData.layerId === 30) {
        flatPlaneLayer = object;
      }
    }
  });

  if (!layer7 || !flatPlaneLayer) {
    console.error("Required layers not found.");
    return null;
  }
  console.log(layer7);
  const layer7Center = getObjectCenter(layer7);
  const flatPlaneWidth = flatPlaneLayer.geometry.parameters.width;
  const flatPlaneHeight = flatPlaneLayer.geometry.parameters.height;

  return {
    width: flatPlaneWidth,
    height: flatPlaneHeight,
    center: [layer7Center.x, layer7Center.y],
    zScale: 1 // Assuming no vertical scaling for simplicity
  };
}

function getObjectCenter(object) {
  if (object.geometry && object.geometry.boundingSphere) {
    const center = object.geometry.boundingSphere.center.clone(); // Cloning to avoid direct reference changes
    return center;
  } else {
    console.error('Bounding sphere not found for the object');
    return new THREE.Vector3(); // Return a default center if not found
  }
}

document.addEventListener('DOMContentLoaded', function () {
  Q3D.application.addEventListener("sceneLoaded", function () {
    console.log("Scene fully loaded, now fetching user location...");
    getLocation();
  });
});

