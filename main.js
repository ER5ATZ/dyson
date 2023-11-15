import './style.css'

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    antialias: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(0, 0, 30);

renderer.render(scene, camera);

const sunTexture = new THREE.TextureLoader().load('sun.jpg');
const normalTexture = new THREE.TextureLoader().load('sunno.jpg');
const sun = new THREE.Mesh(
    new THREE.SphereGeometry(3, 32, 32),
    new THREE.MeshStandardMaterial({
        map: sunTexture,
        normalMap: normalTexture
    }));
scene.add(sun);

const customUniforms = {
    opacityMap: { value: new THREE.TextureLoader().load('rineg.png') },
    time: { value: 0.0 }
};
const customMaterial = new THREE.ShaderMaterial({
    uniforms: customUniforms,
    vertexShader: `
            uniform float time;
            varying vec2 vUv;
            void main() {
                vUv = uv;
                float offset = sin(time * 2.0) * 0.1;
                vUv.x += offset;
                vUv.y += offset;
                vec3 newPosition = position.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
            }
        `,
    fragmentShader: `
            uniform sampler2D opacityMap;
            varying vec2 vUv;
            void main() {
                vec4 opacityMapSample = texture2D(opacityMap, vUv);
                float opacity = opacityMapSample.r;
                gl_FragColor = vec4(1.0, 1.0, 1.0, opacity);
            }
        `,
    transparent: true
});

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

function animate() {
    requestAnimationFrame(animate);
    customMaterial.uniforms.time.value += 0.01;
    const time = customMaterial.uniforms.time.value;
    ring.rotation.x += 0.0001;
    ring.rotation.y += 0.0001;
    ring.rotation.z += 0.0002;
    innerRing.rotation.x += 0.0001;
    innerRing.rotation.y += 0.0001;
    innerRing.rotation.z += 0.0002;
    sun.rotation.z -= 0.00009;
    controls.update();
    composer.render(scene, camera);
}

let targetCameraPosition = new THREE.Vector3();
let targetCameraRotation = new THREE.Euler();

function moveCamera() {
    const scrollPosition = document.body.getBoundingClientRect().top;
    const t = THREE.MathUtils.clamp(scrollPosition / window.innerHeight, -1, 1);

    const minZoom = 111;
    const maxZoom = 1;

    const zoomLevel = THREE.MathUtils.lerp(minZoom, maxZoom, (t + 1) / 2);

    targetCameraPosition.set(0, 0, zoomLevel);
    targetCameraRotation.set(0, 0, 0);

    camera.position.lerp(targetCameraPosition, 0.1);
    camera.rotation.y = targetCameraRotation.y;

    sun.rotation.x += 0.05;
    sun.rotation.y += 0.075;
    sun.rotation.z += 0.05;
}

moveCamera();
document.body.onscroll = moveCamera;

const toggle = document.getElementById('toggle');
const textContainer = document.getElementById('text');
let isVisible = true;
toggle.addEventListener('click', () => {
    textContainer.classList.toggle('hidden');
});

animate();
//console.log(scene);
document.body.appendChild(renderer.domElement);
