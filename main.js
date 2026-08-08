import './style.css'

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    antialias: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(0, 0, 30);

const sunTexture = new THREE.TextureLoader().load('sun.jpg');
const sun = new THREE.Mesh(
    new THREE.SphereGeometry(3, 32, 32),
    new THREE.MeshStandardMaterial({
        map: sunTexture,
        emissiveMap: sunTexture,
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: 1.0
    }));
scene.add(sun);

const texture = new THREE.TextureLoader().load('ring.png');
texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(10, 1);

const ringGeometry = new THREE.TorusGeometry(20, 2, 20, 200);
const ringMaterial = new THREE.MeshStandardMaterial({
    map: texture,
    emissiveMap: texture,
    emissive: new THREE.Color(0x000000),
    emissiveIntensity: 0.5,
    roughness: 0.3,
    transparent: true,
    opacity: 1,
});

const ring = new THREE.Mesh(ringGeometry, ringMaterial);
scene.add(ring);

const innerRingGeometry = new THREE.TorusGeometry(20, 1.9, 20, 200);
const innerRingWireframe = new THREE.WireframeGeometry(innerRingGeometry);
const innerRingMaterial = new THREE.LineBasicMaterial({ color: 'silver' });

const innerRing = new THREE.LineSegments(innerRingWireframe, innerRingMaterial);
innerRing.position.copy(ring.position);

scene.add(innerRing);

const pointLight = new THREE.PointLight(0xfff3b5);
pointLight.intensity = 20;
pointLight.decay = 1;
pointLight.castShadow = true;
pointLight.shadow.mapSize.width = 256;
pointLight.shadow.mapSize.height = 256;
pointLight.shadow.bias = -0.001;

const ambientLight = new THREE.AmbientLight(0xffffff);
ambientLight.intensity = 2;
scene.add(pointLight, ambientLight);

//const lightHelper = new THREE.PointLightHelper(pointLight);
//const gridHelper = new THREE.GridHelper(200, 50);
//scene.add(lightHelper, gridHelper);

const controls = new OrbitControls(camera, renderer.domElement);
const composer = new EffectComposer(renderer);

const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
composer.addPass(bloomPass);

function addStar(radiusStart, radiusEnd) {
    const geometry = new THREE.SphereGeometry(0.25, 24, 24);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const star = new THREE.Mesh(geometry, material);

    const radius = THREE.MathUtils.randFloat(radiusStart, radiusEnd);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    star.position.set(x, y, z);
    scene.add(star);
}

const starsRadiusStart = 500;
const starsRadiusEnd = 750;
Array(300).fill().forEach(() => addStar(starsRadiusStart, starsRadiusEnd));

const spaceTexture = new THREE.TextureLoader().load('space.jpg');
scene.background = spaceTexture;

// --- Animation speed ---
let speedMultiplier = 1.0;

// --- Window resize handler ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    requestAnimationFrame(animate);
    ring.rotation.x += 0.0001 * speedMultiplier;
    ring.rotation.y += 0.0001 * speedMultiplier;
    ring.rotation.z += 0.0002 * speedMultiplier;
    innerRing.rotation.x += 0.0001 * speedMultiplier;
    innerRing.rotation.y += 0.0001 * speedMultiplier;
    innerRing.rotation.z += 0.0002 * speedMultiplier;
    sun.rotation.z -= 0.00009 * speedMultiplier;
    controls.update();
    composer.render(scene, camera);
}

let targetCameraPosition = new THREE.Vector3();

function moveCamera() {
    const scrollPosition = document.body.getBoundingClientRect().top;
    const t = THREE.MathUtils.clamp(scrollPosition / window.innerHeight, -1, 1);

    const minZoom = 111;
    const maxZoom = 1;

    const zoomLevel = THREE.MathUtils.lerp(minZoom, maxZoom, (t + 1) / 2);

    targetCameraPosition.set(0, 0, zoomLevel);
    camera.position.lerp(targetCameraPosition, 0.1);

    sun.rotation.x += 0.05;
    sun.rotation.y += 0.075;
    sun.rotation.z += 0.05;
}

moveCamera();
document.body.onscroll = moveCamera;

// --- UI: Settings panel ---
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const textContainer = document.getElementById('text');

settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.toggle('hidden');
});

// Language buttons (EN / DE / 日本) — toggle text on/off or switch language
const langButtons = document.querySelectorAll('.lang-btn');
let currentLang = 'en';
let textVisible = true;

// Load English content on startup
fetch('content/en.html')
    .then(r => r.text())
    .then(html => {
        textContainer.innerHTML = html;
    });

langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const lang = btn.id.replace('lang-', '');

        if (lang === currentLang && textVisible) {
            textContainer.classList.add('hidden');
            textVisible = false;
            btn.classList.remove('active');
            return;
        }

        textVisible = true;
        textContainer.classList.remove('hidden');
        langButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        fetch(`content/${lang}.html`)
            .then(r => r.text())
            .then(html => {
                textContainer.innerHTML = html;
                currentLang = lang;
            });
    });
});

// Text toggle button
const textToggle = document.getElementById('text-toggle');
textToggle.addEventListener('click', () => {
    textVisible = !textVisible;
    textContainer.classList.toggle('hidden');
    textToggle.classList.toggle('active');
});

// Speed slider
const speedSlider = document.getElementById('speed-slider');
const speedValue = document.getElementById('speed-value');
speedSlider.addEventListener('input', () => {
    speedMultiplier = parseFloat(speedSlider.value);
    speedValue.textContent = speedMultiplier.toFixed(1) + '×';
});

animate();
