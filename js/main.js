/**
 * Solar System Simulation
 * An interactive 3D simulation of the Solar System using Three.js
 * 
 * This simulation features:
 * - Accurately scaled planet sizes (with SIZE_SCALE to make small planets visible)
 * - Accurately scaled distances (with DISTANCE_SCALE to fit on screen)
 * - Realistic orbital periods and rotational periods
 * - Interactive controls for camera movement
 * - Planet selection and information display
 * - Customizable simulation speed and visual settings
 */

// ------------------- GLOBAL VARIABLES -------------------

// Three.js core components
let scene, camera, renderer, controls;

// Solar system objects
let sun, planets = {}, planetData = {};

// Interaction and animation helpers
let clock = new THREE.Clock();
let selectedPlanet = null;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

// Scaling constants
const EARTH_RADIUS = 0.5;     // Base scale for planet sizes
const DISTANCE_SCALE = 10;    // Scale down the distances to fit screen
const SIZE_SCALE = 0.1;       // Scale up small planets to be visible

// ------------------- CELESTIAL BODY DATA -------------------

/**
 * Celestial body data with scientifically accurate relative sizes and distances
 * All values are relative to Earth where applicable:
 * - radius: relative to Earth's radius
 * - distance: in Astronomical Units (AU), scaled by DISTANCE_SCALE
 * - rotationPeriod: in Earth days (negative values indicate retrograde rotation)
 * - orbitPeriod: in Earth years
 * - tilt: axial tilt in degrees
 * - eccentricity: orbital eccentricity (0 = perfect circle, higher = more elliptical)
 */
const celestialBodies = {
    sun: {
        name: "Sun",
        radius: EARTH_RADIUS * 109, // Sun is 109x Earth's radius
        distance: 0,
        color: 0xffff00,
        rotationPeriod: 27, // days
        orbitPeriod: 0,
        tilt: 7.25,
        description: "The Sun is the star at the center of the Solar System. It is a nearly perfect sphere of hot plasma, heated to incandescence by nuclear fusion reactions in its core."
    },
    mercury: {
        name: "Mercury",
        radius: EARTH_RADIUS * 0.38,
        distance: 0.39 * DISTANCE_SCALE,
        color: 0x888888,
        rotationPeriod: 58.6,
        orbitPeriod: 0.24,
        tilt: 0.03,
        eccentricity: 0.205,
        description: "Mercury is the smallest and innermost planet in the Solar System. It has no natural satellites and no substantial atmosphere."
    },
    venus: {
        name: "Venus",
        radius: EARTH_RADIUS * 0.95,
        distance: 0.72 * DISTANCE_SCALE,
        color: 0xe39e1c,
        rotationPeriod: -243, // retrograde rotation
        orbitPeriod: 0.62,
        tilt: 177.3, // retrograde rotation
        eccentricity: 0.007,
        description: "Venus is the second planet from the Sun. It is named after the Roman goddess of love and beauty and is the second-brightest natural object in Earth's night sky after the Moon."
    },
    earth: {
        name: "Earth",
        radius: EARTH_RADIUS,
        distance: 1 * DISTANCE_SCALE,
        color: 0x2222dd,
        rotationPeriod: 1,
        orbitPeriod: 1,
        tilt: 23.44,
        eccentricity: 0.017,
        description: "Earth is the third planet from the Sun and the only astronomical object known to harbor life. About 71% of Earth's surface is water-covered.",
        moons: [
            {
                name: "Moon",
                radius: EARTH_RADIUS * 0.27,
                distance: 0.1,
                color: 0xbbbbbb,
                rotationPeriod: 27.3,
                orbitPeriod: 27.3
            }
        ]
    },
    mars: {
        name: "Mars",
        radius: EARTH_RADIUS * 0.53,
        distance: 1.52 * DISTANCE_SCALE,
        color: 0xaa4444,
        rotationPeriod: 1.03,
        orbitPeriod: 1.88,
        tilt: 25.19,
        eccentricity: 0.094,
        description: "Mars is the fourth planet from the Sun. The surface of Mars is reddish due to iron oxide (rust) prevalent on its surface.",
        moons: [
            {
                name: "Phobos",
                radius: EARTH_RADIUS * 0.005,
                distance: 0.06,
                color: 0x888888,
                rotationPeriod: 0.32,
                orbitPeriod: 0.32
            },
            {
                name: "Deimos",
                radius: EARTH_RADIUS * 0.003,
                distance: 0.1,
                color: 0x777777,
                rotationPeriod: 1.26,
                orbitPeriod: 1.26
            }
        ]
    },
    jupiter: {
        name: "Jupiter",
        radius: EARTH_RADIUS * 11.2,
        distance: 5.2 * DISTANCE_SCALE,
        color: 0xd19c7c,
        rotationPeriod: 0.41,
        orbitPeriod: 11.86,
        tilt: 3.13,
        eccentricity: 0.049,
        description: "Jupiter is the fifth planet from the Sun and the largest in the Solar System. It is a gas giant with a mass one-thousandth that of the Sun, but two-and-a-half times that of all the other planets combined.",
        moons: [
            {
                name: "Io",
                radius: EARTH_RADIUS * 0.29,
                distance: 0.28,
                color: 0xffff00,
                rotationPeriod: 1.77,
                orbitPeriod: 1.77
            },
            {
                name: "Europa",
                radius: EARTH_RADIUS * 0.25,
                distance: 0.44,
                color: 0xccddee,
                rotationPeriod: 3.55,
                orbitPeriod: 3.55
            },
            {
                name: "Ganymede",
                radius: EARTH_RADIUS * 0.41,
                distance: 0.7,
                color: 0xbbbbaa,
                rotationPeriod: 7.15,
                orbitPeriod: 7.15
            },
            {
                name: "Callisto",
                radius: EARTH_RADIUS * 0.38,
                distance: 1.2,
                color: 0x777777,
                rotationPeriod: 16.69,
                orbitPeriod: 16.69
            }
        ]
    },
    saturn: {
        name: "Saturn",
        radius: EARTH_RADIUS * 9.45,
        distance: 9.54 * DISTANCE_SCALE,
        color: 0xead6b8,
        rotationPeriod: 0.44,
        orbitPeriod: 29.46,
        tilt: 26.73,
        eccentricity: 0.057,
        description: "Saturn is the sixth planet from the Sun and the second-largest in the Solar System, after Jupiter. It is a gas giant with an average radius about nine times that of Earth. It has only one-eighth the average density of Earth, but its greater volume means it is over 95 times more massive.",
        hasRings: true,
        moons: [
            {
                name: "Titan",
                radius: EARTH_RADIUS * 0.4,
                distance: 0.8,
                color: 0xcccc99,
                rotationPeriod: 15.95,
                orbitPeriod: 15.95
            },
            {
                name: "Enceladus",
                radius: EARTH_RADIUS * 0.04,
                distance: 0.3,
                color: 0xffffff,
                rotationPeriod: 1.37,
                orbitPeriod: 1.37
            },
            {
                name: "Mimas",
                radius: EARTH_RADIUS * 0.03,
                distance: 0.2,
                color: 0xbbbbbb,
                rotationPeriod: 0.94,
                orbitPeriod: 0.94
            }
        ]
    },
    uranus: {
        name: "Uranus",
        radius: EARTH_RADIUS * 4.01,
        distance: 19.18 * DISTANCE_SCALE,
        color: 0x7ca6c0,
        rotationPeriod: -0.72, // retrograde rotation
        orbitPeriod: 84.01,
        tilt: 97.77, // nearly sideways
        eccentricity: 0.046,
        description: "Uranus is the seventh planet from the Sun. It has the third-largest planetary radius and fourth-largest planetary mass in the Solar System. Uranus is similar in composition to Neptune, and both have bulk chemical compositions which differ from that of the larger gas giants Jupiter and Saturn.",
        hasRings: true
    },
    neptune: {
        name: "Neptune",
        radius: EARTH_RADIUS * 3.88,
        distance: 30.07 * DISTANCE_SCALE,
        color: 0x3355ff,
        rotationPeriod: 0.67,
        orbitPeriod: 164.8,
        tilt: 28.32,
        eccentricity: 0.011,
        description: "Neptune is the eighth and farthest known planet from the Sun in the Solar System. It is the fourth-largest planet by diameter, the third-most-massive planet, and the densest giant planet. Neptune is 17 times the mass of Earth, slightly more massive than its near-twin Uranus.",
        moons: [
            {
                name: "Triton",
                radius: EARTH_RADIUS * 0.21,
                distance: 0.5,
                color: 0xccccdd,
                rotationPeriod: -5.88, // retrograde orbit
                orbitPeriod: 5.88
            }
        ]
    },
    pluto: {
        name: "Pluto (Dwarf Planet)",
        radius: EARTH_RADIUS * 0.19,
        distance: 39.48 * DISTANCE_SCALE,
        color: 0xaa9988,
        rotationPeriod: 6.39,
        orbitPeriod: 248.59,
        tilt: 122.53,
        eccentricity: 0.244,
        description: "Pluto is a dwarf planet in the Kuiper belt, a ring of bodies beyond the orbit of Neptune. It was the first and the largest Kuiper belt object to be discovered. After Pluto was discovered, it was declared to be the ninth planet from the Sun. Beginning in the 1990s, its status as a planet was questioned, and in 2006, Pluto was reclassified as a dwarf planet."
    }
};

// ------------------- UI SETTINGS -------------------

/**
 * User interface settings for controlling the simulation
 */
const settings = {
    showOrbits: true,        // Show orbital paths
    rotationSpeed: 1,        // Speed of planet rotation
    orbitSpeed: 1,           // Speed of orbital movement
    followPlanet: false,     // Camera follows selected planet
    planetScale: 1,          // Scale factor for planet sizes
    distanceScale: 1,        // Scale factor for orbital distances
    showLabels: true         // Show planet name labels
};

// ------------------- INITIALIZATION FUNCTIONS -------------------

/**
 * Initialize the Three.js scene and start the simulation
 */
function init() {
    // Create the scene to hold all objects
    scene = new THREE.Scene();
    
    // Create perspective camera with initial position
    camera = new THREE.PerspectiveCamera(
        60,                                     // Field of view (degrees)
        window.innerWidth / window.innerHeight, // Aspect ratio
        0.1,                                    // Near clipping plane
        1000                                    // Far clipping plane
    );
    camera.position.set(0, 20, 50);
    
    // Configure the WebGL renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Smoother shadow edges
    document.getElementById('container').appendChild(renderer.domElement);
    
    // Add orbit controls for mouse/touch interaction
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;     // Add inertia to controls
    controls.dampingFactor = 0.25;     // Control inertia amount
    
    // Add ambient light for base illumination
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);
    
    // Create background starfield
    createStarfield();
    
    // Create all solar system objects
    createCelestialBodies();
    
    // Set up control GUI
    createGUI();
    
    // Set up event listeners
    window.addEventListener('resize', onWindowResize, false);
    renderer.domElement.addEventListener('click', onMouseClick, false);
    
    // Start animation loop
    animate();
}

/**
 * Create a random starfield as background
 * Generates 10,000 stars at random positions
 */
function createStarfield() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        sizeAttenuation: false  // Stars don't get smaller with distance
    });
    
    // Generate random star positions
    const starsVertices = [];
    for (let i = 0; i < 10000; i++) {
        const x = Math.random() * 2000 - 1000;
        const y = Math.random() * 2000 - 1000;
        const z = Math.random() * 2000 - 1000;
        starsVertices.push(x, y, z);
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);
}

/**
 * Create all celestial bodies in the solar system
 * This includes the sun, planets, moons, and orbital paths
 */
function createCelestialBodies() {
    // Create the Sun with light source
    createSun();
    
    // Create all planets (except the sun)
    createPlanets();
}

/**
 * Create the Sun with its light source
 */
function createSun() {
    const sunGeometry = new THREE.SphereGeometry(celestialBodies.sun.radius * SIZE_SCALE, 64, 64);
    const sunMaterial = new THREE.MeshBasicMaterial({
        color: celestialBodies.sun.color,
        emissive: celestialBodies.sun.color,
        emissiveIntensity: 0.7
    });
    
    sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.userData = { body: celestialBodies.sun };
    scene.add(sun);
    
    // Add point light at sun's position to illuminate the scene
    const sunLight = new THREE.PointLight(0xffffff, 2, 0, 1);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;  // Higher resolution shadows
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);
}

/**
 * Create all planets and their moons
 */
function createPlanets() {
    // Create each planet from the celestialBodies data
    for (const [key, body] of Object.entries(celestialBodies)) {
        if (key === 'sun') continue; // Skip sun as we've already created it
        
        // Create planet group (for orbit calculations)
        const planetGroup = new THREE.Group();
        scene.add(planetGroup);
        
        // Create planet geometry with minimum size for visibility
        const scaledRadius = Math.max(body.radius * SIZE_SCALE, 0.1);
        const planetGeometry = new THREE.SphereGeometry(scaledRadius, 32, 32);
        
        // Create planet material based on color
        const planetMaterial = new THREE.MeshPhongMaterial({
            color: body.color,
            shininess: 25
        });
        
        // Create the planet mesh
        const planet = new THREE.Mesh(planetGeometry, planetMaterial);
        planet.castShadow = true;
        planet.receiveShadow = true;
        
        // Set initial position based on distance from sun
        planet.position.x = body.distance;
        
        // Add planet to its orbital group
        planetGroup.add(planet);
        
        // Create rings for Saturn and Uranus
        if (body.hasRings) {
            createPlanetRings(planet, key, scaledRadius);
        }
        
        // Create orbit line showing the planet's path
        const orbitLine = createOrbitLine(body);
        scene.add(orbitLine);
        
        // Create moons if this body has them
        if (body.moons) {
            createMoons(body, planet, key);
        }
        
        // Add planet metadata
        planet.userData = { body: body };
        
        // Store references for animation updates
        planets[key] = {
            mesh: planet,
            group: planetGroup,
            orbit: orbitLine,
            data: body
        };
        
        // Create label for the planet
        createPlanetLabel(planet, body.name);
    }
}

/**
 * Create rings for planets like Saturn and Uranus
 * @param {THREE.Mesh} planet - The planet mesh
 * @param {string} planetKey - Key identifying the planet (e.g., 'saturn')
 * @param {number} scaledRadius - The scaled radius of the planet
 */
function createPlanetRings(planet, planetKey, scaledRadius) {
    const body = celestialBodies[planetKey];
    
    const ringGeometry = new THREE.RingGeometry(
        scaledRadius * 1.4,  // Inner radius
        scaledRadius * 2.5,  // Outer radius
        64                   // Segments
    );
    
    // Create ring with appropriate color and opacity based on the planet
    let ringColor, ringOpacity;
    if (planetKey === 'saturn') {
        ringColor = 0xf0e4c2;
        ringOpacity = 0.7;
    } else if (planetKey === 'uranus') {
        ringColor = 0x99ccff;
        ringOpacity = 0.5;
    }
    
    const ringMaterial = new THREE.MeshPhongMaterial({
        color: ringColor,
        side: THREE.DoubleSide,  // Visible from both sides
        transparent: true,
        opacity: ringOpacity
    });
    
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    
    // Rotate ring to lie in the x-z plane
    ring.rotation.x = Math.PI / 2;
    
    // Tilt the ring according to the planet's axial tilt
    ring.rotation.y = body.tilt * Math.PI / 180;
    
    // Add the ring to the planet
    planet.add(ring);
}

/**
 * Create orbit path line for visualizing a planet's orbit
 * @param {Object} body - The celestial body data
 * @returns {THREE.Line} - The orbit line object
 */
function createOrbitLine(body) {
    const orbitCurve = createOrbitPath(body);
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitCurve);
    const orbitMaterial = new THREE.LineBasicMaterial({
        color: 0x444444,
        transparent: true,
        opacity: 0.5
    });
    
    const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
    
    // Rotate to lie in the x-z plane
    orbitLine.rotation.x = Math.PI / 2;
    
    return orbitLine;
}

/**
 * Create moons for a planet
 * @param {Object} body - The planet data
 * @param {THREE.Mesh} planet - The planet mesh
 * @param {string} planetKey - Key identifying the planet
 */
function createMoons(body, planet, planetKey) {
    body.moons.forEach((moonData, index) => {
        const moonGroup = new THREE.Group();
        
        // Create moon with minimum size for visibility
        const moonGeometry = new THREE.SphereGeometry(
            Math.max(moonData.radius * SIZE_SCALE, 0.05),
            16, 16
        );
        
        const moonMaterial = new THREE.MeshPhongMaterial({
            color: moonData.color
        });
        
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        moon.castShadow = true;
        moon.receiveShadow = true;
        
        // Position the moon at its orbital distance
        moon.position.x = moonData.distance;
        
        // Add to moon group for independent rotation
        moonGroup.add(moon);
        
        // Create moon's orbital path visualization
        createMoonOrbit(moonGroup, moonData);
        
        // Add moon group to planet
        planet.add(moonGroup);
        
        // Store reference for animation
        if (!planetData[planetKey]) {
            planetData[planetKey] = { moons: [] };
        }
        
        planetData[planetKey].moons.push({
            mesh: moon,
            data: moonData,
            group: moonGroup
        });
    });
}

/**
 * Create a visualization of a moon's orbit
 * @param {THREE.Group} moonGroup - The moon's group object
 * @param {Object} moonData - Data for the moon
 */
function createMoonOrbit(moonGroup, moonData) {
    // Generate points for a circular orbit
    const moonOrbitPoints = [];
    const segments = 50;
    
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        moonOrbitPoints.push(new THREE.Vector3(
            Math.cos(angle) * moonData.distance,
            0,
            Math.sin(angle) * moonData.distance
        ));
    }
    
    const moonOrbitGeometry = new THREE.BufferGeometry().setFromPoints(moonOrbitPoints);
    const moonOrbitMaterial = new THREE.LineBasicMaterial({
        color: 0x444444,
        transparent: true,
        opacity: 0.3
    });
    
    const moonOrbit = new THREE.Line(moonOrbitGeometry, moonOrbitMaterial);
    moonGroup.add(moonOrbit);
}

/**
 * Create a text label for a planet
 * @param {THREE.Mesh} planet - The planet mesh
 * @param {string} name - The planet's name
 */
function createPlanetLabel(planet, name) {
    const div = document.createElement('div');
    div.className = 'planet-label';
    div.textContent = name;
    div.style.position = 'absolute';
    div.style.color = 'white';
    div.style.fontFamily = 'Arial';
    div.style.fontSize = '12px';
    div.style.fontWeight = 'bold';
    div.style.textShadow = '0 0 3px black';
    div.style.pointerEvents = 'none';  // Don't intercept mouse events
    div.style.display = settings.showLabels ? 'block' : 'none';
    
    // Store label reference in the planet's userData
    planet.userData.label = div;
    document.body.appendChild(div);
}

// ------------------- ORBIT CALCULATION FUNCTIONS -------------------

/**
 * Generate points for an elliptical orbit path
 * @param {Object} body - The celestial body data
 * @returns {Array} - Array of Vector3 points forming the orbit path
 */
function createOrbitPath(body) {
    const points = [];
    const segments = 64;
    const eccentricity = body.eccentricity || 0;
    
    // Semi-major axis (average distance from the sun)
    const a = body.distance;
    
    // Semi-minor axis
    const b = a * Math.sqrt(1 - eccentricity * eccentricity);
    
    // Focus distance from center
    const c = a * eccentricity;
    
    // Generate points along the elliptical path
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        
        // Parametric equation of ellipse
        const x = a * Math.cos(angle);
        const z = b * Math.sin(angle);
        
        // Offset by focus to position sun at the focus of the ellipse
        points.push(new THREE.Vector3(x - c, 0, z));
    }
    
    return points;
}

// ------------------- UI AND CONTROL FUNCTIONS -------------------

/**
 * Create GUI controls using dat.GUI
 */
function createGUI() {
    const gui = new dat.GUI();
    
    // Add visualization controls
    gui.add(settings, 'showOrbits').name('Show Orbits').onChange(value => {
        Object.values(planets).forEach(planet => {
            planet.orbit.visible = value;
        });
    });
    
    // Add animation speed controls
    gui.add(settings, 'rotationSpeed', 0, 5).name('Rotation Speed');
    gui.add(settings, 'orbitSpeed', 0, 5).name('Orbit Speed');
    
    // Add camera control
    gui.add(settings, 'followPlanet').name('Follow Selected Planet');
    
    // Add label visibility control
    gui.add(settings, 'showLabels').name('Show Labels').onChange(value => {
        Object.values(planets).forEach(planet => {
            if (planet.mesh.userData.label) {
                planet.mesh.userData.label.style.display = value ? 'block' : 'none';
            }
        });
    });
    
    // Add planet selection dropdown
    const planetOptions = Object.fromEntries(
        ['None', ...Object.keys(celestialBodies)].map(name => [name, name])
    );
    
    gui.add({ planet: 'None' }, 'planet', planetOptions).name('Focus on')
        .onChange(value => {
            if (value === 'None') {
                selectedPlanet = null;
                // Reset camera position
                camera.position.set(0, 20, 50);
                controls.target.set(0, 0, 0);
            } else {
                selectedPlanet = value;
                focusOnPlanet(value);
            }
        });
    
    // Minimize GUI by default for cleaner view
    gui.close();
}

/**
 * Focus camera on a specific planet
 * @param {string} planetKey - Key identifying the planet to focus on
 */
function focusOnPlanet(planetKey) {
    if (planets[planetKey]) {
        const planet = planets[planetKey].mesh;
        const planetPos = new THREE.Vector3();
        planet.getWorldPosition(planetPos);
        
        // Set controls target to planet position
        controls.target.copy(planetPos);
        
        // Move camera to a position relative to the planet
        const radius = planets[planetKey].data.radius * SIZE_SCALE;
        const distance = radius * 10;
        
        camera.position.set(
            planetPos.x + distance,
            planetPos.y + distance / 2,
            planetPos.z + distance
        );
        
        // Show info panel with planet data
        showPlanetInfo(planets[planetKey].data);
    }
}

/**
 * Handle window resize
 * Updates camera aspect ratio and renderer size
 */
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Handle mouse clicks for planet selection
 * @param {MouseEvent} event - The mouse click event
 */
function onMouseClick(event) {
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);
    
    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
        // Find the first intersected object that has planet data
        for (const intersect of intersects) {
            const object = intersect.object;
            
            if (object.userData && object.userData.body) {
                // Highlight clicked planet
                selectedPlanet = object.userData.body.name.toLowerCase();
                
                // If it's the sun, use 'sun' as the key
                const key = selectedPlanet === 'sun' ? 'sun' : selectedPlanet.split(' ')[0].toLowerCase();
                
                if (planets[key]) {
                    focusOnPlanet(key);
                    return;
                }
            }
        }
    }
}

/**
 * Update position of planet labels to follow their planets in the 2D view
 */
function updatePlanetLabels() {
    for (const [key, planetObj] of Object.entries(planets)) {
        const planet = planetObj.mesh;
        const label = planet.userData.label;
        
        if (label) {
            // Get screen position of planet
            const position = new THREE.Vector3();
            position.setFromMatrixPosition(planet.matrixWorld);
            position.project(camera);
            
            // Convert to screen coordinates
            const x = (position.x * 0.5 + 0.5) * window.innerWidth;
            const y = -(position.y * 0.5 - 0.5) * window.innerHeight;
            
            // Check if planet is in front of camera
            const isBehindCamera = position.z > 1;
            
            // Update label position
            label.style.left = x + 'px';
            label.style.top = y - 20 + 'px'; // Offset above planet
            label.style.display = settings.showLabels && !isBehindCamera ? 'block' : 'none';
        }
    }
}

/**
 * Display planet information panel with details about the selected planet
 * @param {Object} planetData - Data for the selected planet
 */
function showPlanetInfo(planetData) {
    const infoPanel = document.getElementById('planet-info');
    
    // Create HTML content
    let html = `<h2>${planetData.name}</h2>`;
    html += `<p>${planetData.description || ''}</p>`;
    html += `<p>Diameter: ${(planetData.radius * 2 / EARTH_RADIUS).toFixed(2)} Earth diameters</p>`;
    
    if (planetData.distance > 0) {
        html += `<p>Distance from Sun: ${(planetData.distance / DISTANCE_SCALE).toFixed(2)} AU</p>`;
    }
    
    if (planetData.orbitPeriod > 0) {
        html += `<p>Orbital Period: ${planetData.orbitPeriod.toFixed(2)} Earth years</p>`;
    }
    
    html += `<p>Rotation Period: ${Math.abs(planetData.rotationPeriod).toFixed(2)} Earth days`;
    if (planetData.rotationPeriod < 0) {
        html += ' (retrograde)';
    }
    html += '</p>';
    
    if (planetData.moons && planetData.moons.length > 0) {
        html += `<p>Moons: ${planetData.moons.length}</p>`;
        html += '<ul>';
        planetData.moons.forEach(moon => {
            html += `<li>${moon.name}</li>`;
        });
        html += '</ul>';
    }
    
    // Update panel content and show it
    infoPanel.innerHTML = html;
    infoPanel.style.display = 'block';
}

// ------------------- ANIMATION FUNCTIONS -------------------

/**
 * Main animation loop
 * Updates planet positions, rotations, and renders the scene
 */
function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();         // Time since last frame
    const elapsedTime = clock.getElapsedTime();  // Total elapsed time
    
    // Update planet positions and rotations
    updatePlanets(delta, elapsedTime);
    
    // Follow selected planet if enabled
    if (settings.followPlanet && selectedPlanet) {
        const planet = planets[selectedPlanet].mesh;
        const planetPos = new THREE.Vector3();
        planet.getWorldPosition(planetPos);
        controls.target.copy(planetPos);
    }
    
    // Update planet labels
    updatePlanetLabels();
    
    // Update controls
    controls.update();
    
    // Render scene
    renderer.render(scene, camera);
}

/**
 * Update positions and rotations of all planets and moons
 * @param {number} delta - Time since last frame
 * @param {number} elapsedTime - Total elapsed time
 */
function updatePlanets(delta, elapsedTime) {
    Object.entries(planets).forEach(([key, planetObj]) => {
        const planet = planetObj.mesh;
        const planetGroup = planetObj.group;
        const planetData = planetObj.data;
        
        // Update orbital position (elliptical orbit)
        updatePlanetOrbit(planetGroup, planet, planetData, elapsedTime);
        
        // Update planet rotation
        updatePlanetRotation(planet, planetData, delta);
        
        // Apply axial tilt
        planet.rotation.x = planetData.tilt * Math.PI / 180;
        
        // Update moons if any
        updateMoons(key, delta);
    });
}

/**
 * Update a planet's orbital position
 * @param {THREE.Group} planetGroup - The planet's group object
 * @param {THREE.Mesh} planet - The planet mesh
 * @param {Object} planetData - The planet data
 * @param {number} elapsedTime - Total elapsed time
 */
function updatePlanetOrbit(planetGroup, planet, planetData, elapsedTime) {
    // Calculate orbital progress based on orbital period
    const orbitProgress = (elapsedTime * settings.orbitSpeed) / (planetData.orbitPeriod * 20);
    const orbitAngle = orbitProgress * Math.PI * 2;
    
    // Calculate elliptical orbit position if eccentricity exists
    if (planetData.eccentricity) {
        const a = planetData.distance;
        const e = planetData.eccentricity;
        const b = a * Math.sqrt(1 - e * e);
        const c = a * e;
        
        // Position the sun at one focus of the ellipse
        planetGroup.position.x = c;
        
        // Calculate position on elliptical orbit
        planet.position.x = a * Math.cos(orbitAngle) - c;
        planet.position.z = b * Math.sin(orbitAngle);
    } else {
        // Circular orbit (simplified)
        planet.position.x = Math.cos(orbitAngle) * planetData.distance;
        planet.position.z = Math.sin(orbitAngle) * planetData.distance;
    }
}

/**
 * Update a planet's rotation around its axis
 * @param {THREE.Mesh} planet - The planet mesh
 * @param {Object} planetData - The planet data
 * @param {number} delta - Time since last frame
 */
function updatePlanetRotation(planet, planetData, delta) {
    if (planetData.rotationPeriod !== 0) {
        // Calculate rotation speed based on period
        const rotationSpeed = (delta * settings.rotationSpeed) / (Math.abs(planetData.rotationPeriod) / 10);
        
        // Apply rotation (handling retrograde rotation with negative period)
        planet.rotation.y += planetData.rotationPeriod > 0 ? rotationSpeed : -rotationSpeed;
    }
}

/**
 * Update all moons for a planet
 * @param {string} planetKey - The planet key
 * @param {number} delta - Time since last frame
 */
function updateMoons(planetKey, delta) {
    if (planetData[planetKey] && planetData[planetKey].moons) {
        planetData[planetKey].moons.forEach((moon) => {
            const moonObj = moon.mesh;
            const moonGroup = moon.group;
            const moonData = moon.data;
            
            // Update orbital position
            const moonOrbitSpeed = (delta * settings.orbitSpeed) / (moonData.orbitPeriod / 2);
            moonGroup.rotation.y += moonOrbitSpeed;
            
            // Update moon rotation
            if (moonData.rotationPeriod !== 0) {
                const moonRotationSpeed = (delta * settings.rotationSpeed) / (Math.abs(moonData.rotationPeriod) / 10);
                moonObj.rotation.y += moonData.rotationPeriod > 0 ? moonRotationSpeed : -moonRotationSpeed;
            }
        });
    }
}

// Start the application when the window loads
window.onload = init;