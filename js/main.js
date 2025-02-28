// Global variables
let scene, camera, renderer, controls;
let sun, planets = {}, planetData = {};
let clock = new THREE.Clock();
let selectedPlanet = null;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
const EARTH_RADIUS = 0.5; // Base scale
const DISTANCE_SCALE = 10; // Scale down the distances to fit screen
const SIZE_SCALE = 0.1; // Scale up small planets to be visible

// Planet data with accurate relative sizes and distances (scaled)
const celestialBodies = {
    sun: {
        name: "Sun",
        radius: EARTH_RADIUS * 109, // Sun is 109x Earth's radius
        distance: 0,
        color: 0xffff00,
        rotationPeriod: 27, // days
        orbitPeriod: 0,
        tilt: 7.25,
        // Use color instead of texture
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

// UI settings
const settings = {
    showOrbits: true,
    rotationSpeed: 1,
    orbitSpeed: 1,
    followPlanet: false,
    planetScale: 1,
    distanceScale: 1,
    showLabels: true
};

// Initialize Three.js scene
function init() {
    // Create scene
    scene = new THREE.Scene();
    
    // Create camera
    camera = new THREE.PerspectiveCamera(
        60, // FOV
        window.innerWidth / window.innerHeight, // aspect ratio
        0.1, // near clipping plane
        1000 // far clipping plane
    );
    camera.position.set(0, 20, 50);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('container').appendChild(renderer.domElement);
    
    // Add orbit controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    
    // Add ambient light for base illumination
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);
    
    // Add starfield background
    createStarfield();
    
    // Create celestial bodies
    createCelestialBodies();
    
    // Set up GUI
    createGUI();
    
    // Event listeners
    window.addEventListener('resize', onWindowResize, false);
    renderer.domElement.addEventListener('click', onMouseClick, false);
    
    // Start animation loop
    animate();
}

// Create a random starfield background
function createStarfield() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        sizeAttenuation: false
    });
    
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

// Create all celestial bodies
function createCelestialBodies() {
    // Create sun with light source
    const sunGeometry = new THREE.SphereGeometry(celestialBodies.sun.radius * SIZE_SCALE, 64, 64);
    const sunMaterial = new THREE.MeshBasicMaterial({
        color: celestialBodies.sun.color,
        emissive: celestialBodies.sun.color,
        emissiveIntensity: 0.7
    });
    
    sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.userData = { body: celestialBodies.sun };
    scene.add(sun);
    
    // Add point light at sun's position
    const sunLight = new THREE.PointLight(0xffffff, 2, 0, 1);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);
    
    // Create other planets
    for (const [key, body] of Object.entries(celestialBodies)) {
        if (key === 'sun') continue; // Skip sun as we've already created it
        
        // Create planet group (for orbit calculations)
        const planetGroup = new THREE.Group();
        scene.add(planetGroup);
        
        // Create planet geometry
        const scaledRadius = Math.max(body.radius * SIZE_SCALE, 0.1); // Minimum size for visibility
        const planetGeometry = new THREE.SphereGeometry(scaledRadius, 32, 32);
        
        // Create planet material based on color
        const planetMaterial = new THREE.MeshPhongMaterial({
            color: body.color,
            shininess: 25
        });
        
        // Create planet mesh
        const planet = new THREE.Mesh(planetGeometry, planetMaterial);
        planet.castShadow = true;
        planet.receiveShadow = true;
        
        // Set initial position based on distance from sun
        planet.position.x = body.distance;
        
        // Add planet to its orbital group
        planetGroup.add(planet);
        
        // Create rings for Saturn and Uranus
        if (body.hasRings) {
            const ringGeometry = new THREE.RingGeometry(
                scaledRadius * 1.4,
                scaledRadius * 2.5,
                64
            );
            
            // Create ring texture based on planet
            let ringColor, ringOpacity;
            if (key === 'saturn') {
                ringColor = 0xf0e4c2;
                ringOpacity = 0.7;
            } else if (key === 'uranus') {
                ringColor = 0x99ccff;
                ringOpacity = 0.5;
            }
            
            const ringMaterial = new THREE.MeshPhongMaterial({
                color: ringColor,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: ringOpacity
            });
            
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            ring.rotation.y = body.tilt * Math.PI / 180;
            planet.add(ring);
        }
        
        // Create orbit line
        const orbitCurve = createOrbitPath(body);
        const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitCurve);
        const orbitMaterial = new THREE.LineBasicMaterial({
            color: 0x444444,
            transparent: true,
            opacity: 0.5
        });
        const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
        orbitLine.rotation.x = Math.PI / 2;
        scene.add(orbitLine);
        
        // Create moons if this body has them
        if (body.moons) {
            body.moons.forEach((moonData, index) => {
                const moonGroup = new THREE.Group();
                
                // Create moon
                const moonGeometry = new THREE.SphereGeometry(
                    Math.max(moonData.radius * SIZE_SCALE, 0.05), // Minimum size for visibility
                    16, 16
                );
                
                const moonMaterial = new THREE.MeshPhongMaterial({
                    color: moonData.color
                });
                
                const moon = new THREE.Mesh(moonGeometry, moonMaterial);
                moon.castShadow = true;
                moon.receiveShadow = true;
                
                // Position the moon
                moon.position.x = moonData.distance;
                
                // Add to moon group
                moonGroup.add(moon);
                
                // Create moon orbit
                const moonOrbitPoints = [];
                for (let i = 0; i <= 50; i++) {
                    const angle = (i / 50) * Math.PI * 2;
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
                
                // Add moon group to planet
                planet.add(moonGroup);
                
                // Store reference
                if (!planetData[key]) {
                    planetData[key] = { moons: [] };
                }
                planetData[key].moons.push({
                    mesh: moon,
                    data: moonData,
                    group: moonGroup
                });
            });
        }
        
        // Add planet metadata
        planet.userData = { body: body };
        
        // Store references
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

// Create orbit path based on planet data, including eccentricity
function createOrbitPath(body) {
    const points = [];
    const segments = 64;
    const eccentricity = body.eccentricity || 0;
    
    // Semi-major axis
    const a = body.distance;
    // Semi-minor axis
    const b = a * Math.sqrt(1 - eccentricity * eccentricity);
    // Focus distance from center
    const c = a * eccentricity;
    
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        
        // Parametric equation of ellipse
        const x = a * Math.cos(angle);
        const z = b * Math.sin(angle);
        
        // Offset by focus
        points.push(new THREE.Vector3(x - c, 0, z));
    }
    
    return points;
}

// Create text label for a planet
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
    div.style.pointerEvents = 'none';
    div.style.display = settings.showLabels ? 'block' : 'none';
    
    planet.userData.label = div;
    document.body.appendChild(div);
}

// Update position of planet labels
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

// Create GUI controls
function createGUI() {
    const gui = new dat.GUI();
    
    // Add general controls
    gui.add(settings, 'showOrbits').name('Show Orbits').onChange(value => {
        Object.values(planets).forEach(planet => {
            planet.orbit.visible = value;
        });
    });
    
    gui.add(settings, 'rotationSpeed', 0, 5).name('Rotation Speed');
    gui.add(settings, 'orbitSpeed', 0, 5).name('Orbit Speed');
    gui.add(settings, 'followPlanet').name('Follow Selected Planet');
    gui.add(settings, 'showLabels').name('Show Labels').onChange(value => {
        Object.values(planets).forEach(planet => {
            if (planet.mesh.userData.label) {
                planet.mesh.userData.label.style.display = value ? 'block' : 'none';
            }
        });
    });
    
    // Add planet selection
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
    
    // Minimize GUI by default
    gui.close();
}

// Focus camera on a specific planet
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

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Handle mouse clicks for planet selection
function onMouseClick(event) {
    // Calculate mouse position in normalized device coordinates
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

// Display planet information panel
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

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();
    
    // Update planet positions and rotations
    Object.entries(planets).forEach(([key, planetObj]) => {
        const planet = planetObj.mesh;
        const planetGroup = planetObj.group;
        const planetData = planetObj.data;
        
        // Update orbital position (elliptical orbit)
        const orbitProgress = (elapsedTime * settings.orbitSpeed) / (planetData.orbitPeriod * 20);
        const orbitAngle = orbitProgress * Math.PI * 2;
        
        // Calculate elliptical orbit position if eccentricity exists
        if (planetData.eccentricity) {
            const a = planetData.distance;
            const e = planetData.eccentricity;
            const b = a * Math.sqrt(1 - e * e);
            const c = a * e;
            
            planetGroup.position.x = c;
            planet.position.x = a * Math.cos(orbitAngle) - c;
            planet.position.z = b * Math.sin(orbitAngle);
        } else {
            // Circular orbit
            planet.position.x = Math.cos(orbitAngle) * planetData.distance;
            planet.position.z = Math.sin(orbitAngle) * planetData.distance;
        }
        
        // Update planet rotation
        if (planetData.rotationPeriod !== 0) {
            const rotationSpeed = (delta * settings.rotationSpeed) / (Math.abs(planetData.rotationPeriod) / 10);
            planet.rotation.y += planetData.rotationPeriod > 0 ? rotationSpeed : -rotationSpeed;
        }
        
        // Apply axial tilt
        planet.rotation.x = planetData.tilt * Math.PI / 180;
        
        // Update moons if any
        if (planetData.moons && planetData[key] && planetData[key].moons) {
            planetData[key].moons.forEach((moon, index) => {
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
    });
    
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

// Start the application
window.onload = init;