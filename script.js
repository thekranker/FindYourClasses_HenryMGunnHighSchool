// script.js
// CREDITS ----------------------------------------------------------------------------------------------------------------------------------------

// "low poly city pack" (https://skfb.ly/oqxNP) by Igor Tretyakov is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).


// IMPORTS ----------------------------------------------------------------------------------------------------------------------------------------

// Default Imports
import { OrbitControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/loaders/GLTFLoader.js';
// import { RenderPass } from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/postprocessing/RenderPass.js';
// import { EffectComposer } from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/postprocessing/EffectComposer.js';

// // Shaders
// import { BloomPass } from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/postprocessing/BloomPass.js';
// import { ShaderPass } from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/postprocessing/ShaderPass.js';
// import { HorizontalBlurShader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/shaders/HorizontalBlurShader.js';
// import { VerticalBlurShader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/shaders/VerticalBlurShader.js';



// SETTINGS / DETAILS ------------------------------------------------------------------------------------------------------------------------------------

// Scene
const scene = new THREE.Scene(); // scene
const loader = new GLTFLoader(); // import 3d models
const fontLoader = new THREE.FontLoader(); // load fonts
const raycaster = new THREE.Raycaster(); // move arrow
const mouse = new THREE.Vector2(); // move arrow
var objectsArray = []; // for movement on campus


// Sizes
// -> Window Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
}
// -> Window Re-sizing
window.addEventListener('resize', () => {

    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update Camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix(); // Maintains sphere size when resizing window
    renderer.setSize(sizes.width, sizes.height);
});


// Light
// -> Main Light
const mainLight = new THREE.PointLight(0xffffff, 1.5, 500);
mainLight.position.set(100, 100, 100);
scene.add(mainLight); 
// -> Background Light
const bgLight = new THREE.AmbientLight( 0x404040); 
scene.add(bgLight);


// Camera
const camera = new THREE.PerspectiveCamera( // camera (fov, aspect ratio) * fov should never go above 50 [distortion]
    45, 
    sizes.width / sizes.height
); 
camera.position.z = 100;
scene.add(camera); // adds camera to scene 


// Renderer
const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height); // sets the renderer aspect ratio
renderer.setPixelRatio(2);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.render(scene, camera); // renders the scene


// Orbit Controls
const controls = new OrbitControls(camera, canvas) // enables the user to rotate the view

// -> Tilt the Camera [Main View] 
const tiltAngle = Math.PI / 3; // 60 degrees 
const distance = controls.target.distanceTo(camera.position); // preserve distance to target
const newPosition = camera.position.clone().sub(controls.target).applyAxisAngle(new THREE.Vector3(1, 0, 0), -tiltAngle).add(controls.target);
camera.position.copy(newPosition);
controls.target.copy(newPosition);

// -> Orbit Controls Settings
controls.target.set(-50, 25, -50);
controls.enabled = false;
controls.update();

controls.enableZoom = true;
controls.enableDamping = true;
controls.enablePan = false;
controls.autoRotate = true;

controls.maxDistance = 0.5;
controls.minDistance = 0.5;
controls.rotateSpeed = -0.35;
controls.autoRotateSpeed = -1;

// Positions
var defaultPos = [-50, 25, -50] // homescreen Position 
var ferrisWheelPos = [-27.001, 1, -12]; // ferris Wheel
var airportPos = [-15, 1, -120]; // airport



// OBJECTS ------------------------------------------------------------------------------------------------------------------------------------

// Background
var backgroundTexture = new THREE.TextureLoader().load("/images/sky_background.jpeg");
scene.background = backgroundTexture;


// City (Default Map)
var cityTexture;
loader.load("/3D/update_city.glb", function(glb) {
    cityTexture = glb.scene;
    cityTexture.scale.set(0.5, 0.5, 0.5);

    scene.add(cityTexture);

    cityTexture.traverse(function(node) {
        objectsArray.push(node);
    });

    console.log(glb); // console

}, function(error) {
    // Do nothing
});


// Ferris-Wheel Text
fontLoader.load('/fonts/roboto.json', (font) => {
    const textGeometry = new THREE.TextGeometry("Ferris Wheel", {
        font: font,
        size: 0.3,
        height: 0.1,
        curveSegments: 12,
        bevelEnabled: false,
    });

    const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(-26, 1.35, -9);
    textMesh.scale.x = -1;

    scene.add(textMesh);
});


// Airport Text
fontLoader.load('/fonts/roboto.json', (font) => {
    const textGeometry = new THREE.TextGeometry("Airport", {
        font: font,
        size: 0.3,
        height: 0.1,
        curveSegments: 12,
        bevelEnabled: false,
    });

    const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(-14.5, 1, -118);
    textMesh.scale.x = -1;

    scene.add(textMesh);
});


// Move Arrow
var moveArrow;
loader.load("/3D/move_arrow.glb", function(glb) {
    moveArrow = glb.scene;
    moveArrow.scale.set(0.01, 0.01, 0.01);
    moveArrow.position.set(0, 0, -10);

    scene.add(moveArrow);

}, function(error) {
    // Do nothing
});



// SEARCH --------------------------------------------------------------------------------------------------------------------------------------------

updateHomeScreen();

// Status [Default: viewingHomeScreen, Other: viewingClassroom]
var status = "viewingHomeScreen";
var statusOptions = ["viewingHomeScreen", "viewingClassroom"];


// Variables
const searchedInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const searchResults = document.getElementById('search-results');
const searchLocations = ["Ferris Wheel", "Airport", "Default"];
var selectedLocation;


// Autofill
searchInput.addEventListener('input', function() {
    const searchText = searchInput.value.toLowerCase();
    const filteredItems = searchLocations.filter(item => item.toLowerCase().includes(searchText));
    
    displayAutofillResults(filteredItems);
});

// -> Display Autofill Results
function displayAutofillResults(results) {
    searchResults.innerHTML = '';
  
    results.forEach(result => {
      const suggestionItem = document.createElement('li');
      suggestionItem.classList.add('autofill-suggestion');
      if (status == statusOptions[0]) {
        suggestionItem.style.width = "310.5%";
      }
      else {
        suggestionItem.style.width = "120%";
      }
      suggestionItem.textContent = result;
      
      suggestionItem.addEventListener('click', function() {
        searchInput.value = result;
        searchResults.innerHTML = ''; // Clear suggestions <-
        searchInput.focus();
      });
  
      searchResults.appendChild(suggestionItem);
    });
}
  
// -> Close suggestions when clicking outside the search bar 
document.addEventListener('click', function(event) {
    if (!searchResults.contains(event.target) && event.target !== searchInput) {
      searchResults.innerHTML = '';
    }
});


// Search Button (Hidden)
// -> Searches when "enter" key is pressed
searchedInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent the default form submission behavior
      searchButton.click(); // Trigger the button's click event
    }
});
// -> Determines whether search is valid and searches
searchButton.addEventListener('click', () => {
    const searchTerm = searchInput.value;
    searchInput.value = "";

    // -> Determines whether the searched text is a classroom
    for (let i = 0; i < searchLocations.length; i++) {
        if (searchTerm === searchLocations[i]) {
            selectedLocation = searchLocations[i];
            break; // Exit loop <-
        }
    }

    // -> Checks if the input text matches any locations
    if (selectedLocation === "Ferris Wheel") {
        controls.target.set(ferrisWheelPos[0], ferrisWheelPos[1], ferrisWheelPos[2]);
        controls.autoRotate = false;
        controls.enabled = true;
        status = statusOptions[1];
        updateLocationsScreen();
    }
    else if(selectedLocation === "Airport") {
        controls.target.set(airportPos[0], airportPos[1], airportPos[2]);
        controls.autoRotate = false;
        controls.enabled = true;
        status = statusOptions[1];
        updateLocationsScreen();
    }
    else if (selectedLocation === "Default") {
        controls.target.set(defaultPos[0], defaultPos[1], defaultPos[2]);
        controls.autoRotate = true;
        controls.enabled = false;
        status = statusOptions[0];
        updateHomeScreen();
    }
    else {
        const errorTimeline = gsap.timeline({ defaults: { duration: 0.5 } });
        errorTimeline.fromTo(".error", { opacity: 0 }, { opacity: 1 });
        errorTimeline.to(".error", {opacity: 0 }, 3);
    }

});


// Displays
function updateHomeScreen() { // home-screen display
    // -> Search Bar
    document.getElementById('searchInput').style.padding = "12px";
    document.getElementById('searchInput').style.fontSize = "27px";
    document.getElementById('search-container').style.width = "40%";
    document.getElementById('search-container').style.marginTop = "26%";
    document.getElementById('search-container').style.marginLeft = "29.75%";
    // -> Autofill
    document.getElementById('autofill').style.top = "52.25%";
    document.getElementById('autofill').style.left = "28.25%";
    document.getElementById('autofill').style.width = "14.5%";
    // -> Adding Header
    runHomeScreenTimeline();
}

function updateLocationsScreen() { // locations-screen display
    // -> Search Bar
    document.getElementById('searchInput').style.padding = "12px";
    document.getElementById('searchInput').style.fontSize = "17px";
    document.getElementById('search-container').style.width = "20%";
    document.getElementById('search-container').style.marginTop = "0.5%";
    document.getElementById('search-container').style.marginLeft = "0.5%";
    // -> Autofill
    document.getElementById('autofill').style.top = "5.95%";
    document.getElementById('autofill').style.left = "-1.85%";
    document.getElementById('autofill').style.width = "17.75%";
    // -> Timeline
    var displayTimeline = gsap.timeline({ defaults: { duration: 0.3 } });
    displayTimeline.to(".shadow-bar", { opacity: 0 });
    displayTimeline.to(".creators", { opacity: 0 }, "<");
    displayTimeline.to(".logo img", { opacity: 0 }, "<");
    displayTimeline.to(".title p", { opacity: 0 }, "<"); 
    displayTimeline.to(".explore-button", { opacity: 1 }, "<");
    displayTimeline.set(".return-home-button", { opacity: 1 }, "<");
    
}

function updateExploreScreen() { // explore-screen display
    // -> Search Bar
    document.getElementById('searchInput').style.padding = "12px";
    document.getElementById('searchInput').style.fontSize = "17px";
    document.getElementById('search-container').style.width = "20%";
    document.getElementById('search-container').style.marginTop = "0.5%";
    document.getElementById('search-container').style.marginLeft = "0.5%";
    // -> Autofill
    document.getElementById('autofill').style.top = "5.95%";
    document.getElementById('autofill').style.left = "-1.85%";
    document.getElementById('autofill').style.width = "17.75%";
    // -> Timeline
    var displayTimeline = gsap.timeline({ defaults: { duration: 0.3 } });
    displayTimeline.to(".shadow-bar", { opacity: 0 });
    displayTimeline.to(".creators", { opacity: 0 }, "<");
    displayTimeline.to(".logo img", { opacity: 0 }, "<");
    displayTimeline.to(".title p", { opacity: 0 }, "<"); 
    displayTimeline.to(".explore-button", { opacity: 0 }, "<");
    displayTimeline.to(".return-home-button", { opacity: 1 }, "<");
    displayTimeline.to("#follow-button", { opacity: 1 }, "<");
}



// EXPLORE THE CAMPUS ------------------------------------------------------------------------------------------------------------------------------------------------

const exploreButton = document.getElementById("explore-button");
const returnHomeButton = document.getElementById("return-home-button");

// Explore button 
exploreButton.addEventListener('click', function() {

    // -> Settings 
    controls.target.set(1, 1, -5);
    controls.autoRotate = false;
    controls.enabled = true;
    updateExploreScreen();


    // -> Navigation Button
    var mouseDownX; // store x value [ mouse pressed down]
    var mouseDownY; // store y value [ mouse pressed down]
    

    document.addEventListener('pointerdown', (event) => { // logs 'pointerdown' coordinates
        console.log('mousedown!'); // console
        mouseDownX = event.clientX;
        mouseDownY = event.clientY;
    }); 
    
    document.addEventListener('pointerup', function(event) { // handles camera movement [on click]
        if ( (Math.abs(event.clientX - mouseDownX) <= 5) && (Math.abs(event.clientY - mouseDownY) <= 5) ) {
            var mouseX = event.clientX;
            var mouseY = event.clientY;

            // 1. Normalize the 2D screen coordinates
            var mouse = new THREE.Vector2();
            mouse.x = (mouseX / window.innerWidth) * 2 - 1;
            mouse.y = - (mouseY / window.innerHeight) * 2 + 1;

            // 2. Create a Raycaster
            var raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, camera);

            var intersects = raycaster.intersectObjects(objectsArray);
            console.log(intersects); // console
            if (intersects.length > 0) {
                var intersectPoint = intersects[0].point;
                console.log("found intersection point");
                console.log(intersectPoint.x); // this is the 3d coordinate in the world

                // 3. Compute the forward direction
                var forward = new THREE.Vector3(intersectPoint.x - controls.target.x, 0, intersectPoint.z - controls.target.z);
            
                // 4. Move the camera
                function animateCameraAndControls(targetCameraPosition, targetTargetPosition, duration) {
                    const startPosition = camera.position.clone();
                    const startTarget = controls.target.clone();
                
                    new TWEEN.Tween({ x: 0 }) // using an object to hold values for interpolation
                    .to({ x: 1 }, duration)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .onUpdate((obj) => {
                        const t = obj.x;
                        controls.target.lerpVectors(startTarget, targetTargetPosition, t);
                        camera.position.lerpVectors(startPosition, targetCameraPosition, t);
                        controls.target.y = 1;
                        
                    })
                    .start();
                } 

                const targetCameraPosition = camera.position.clone().add(forward);
                const targetTargetPosition = controls.target.clone().add(forward);
                const animationDuration = 250;
                
                animateCameraAndControls(targetCameraPosition, targetTargetPosition, animationDuration);
            }
        };
    });



    // -> Move Arrow
    window.addEventListener('mousemove', (event) => {
        // Convert mouse position to normalized device coordinates
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

});



// Return home button
returnHomeButton.addEventListener('click', function() {

    // -> Settings 
    controls.target.set(defaultPos[0], defaultPos[1], defaultPos[2]);
    controls.autoRotate = true;
    controls.enabled = false;
    status = statusOptions[0];
    updateHomeScreen();
});



// ANIMATION LOOP ------------------------------------------------------------------------------------------------------------------------------------------------

const animate = () => { 

    // -> Updates
    TWEEN.update(); // update the tween.js animations


    // -> Move Arrow
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true); // calculate intersections
    if (intersects.length > 0) { // update the arrow's position to follow the cursor
        const targetPosition = intersects[0].point;
        moveArrow.position.copy(targetPosition);
    }


    // -> Controls
    controls.update();

    // -> Rendering
    renderer.render(scene,camera);
    window.requestAnimationFrame(animate)
}
animate();



// TIMELINE  ------------------------------------------------------------------------------------------------------------------------------------------------

// Home Screen ~ Timeline
function runHomeScreenTimeline() {
    var homeScreenTL = gsap.timeline({ defaults: { duration: 0.75 } });

    // -> Setting values
    homeScreenTL.set(".error", { opacity: 0 });
    homeScreenTL.set(".return-home-button", { opacity: 0 });
    homeScreenTL.set("#follow-button", { opacity: 0 });

    // -> Search Bar
    homeScreenTL.fromTo(".search-container", { y: "-1000% "}, { y: "0%" }, 0.5);

    // -> Header
    homeScreenTL.fromTo(".shadow-bar", { opacity: 0 }, { opacity: 1 });
    homeScreenTL.fromTo(".logo img", { opacity: 0 }, { opacity: 1 }, "<");
    homeScreenTL.fromTo(".title p", { opacity: 0 }, { opacity: 1 }, "<");
    homeScreenTL.fromTo(".creators", { opacity: 0 }, { opacity: 1 }, "<");
    homeScreenTL.fromTo(".explore-button", { opacity: 0 }, { opacity: 1 }, "<");
}




