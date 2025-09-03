import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Sky } from "three/addons/objects/Sky.js";
import gsap from "https://cdn.skypack.dev/gsap";
import { createNoise2D } from "https://cdn.skypack.dev/simplex-noise";
import { initCursor } from "./cursor.js";
import { createTarget } from "./target.js";
import { ClayShooterGame } from "./game.js";

// ------------------- 커서 -------------------
initCursor();

// ------------------- 기본 설정 -------------------
const canvas = document.querySelector("#three-canvas");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const noise2D = createNoise2D();
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.5;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const initialCameraPosition = new THREE.Vector3(0, 10, 100);
const initialControlsTarget = new THREE.Vector3(0, 5, 0);
camera.position.copy(initialCameraPosition);

// ------------------- 하늘 -------------------
const sky = new Sky();
sky.scale.setScalar(450000);
scene.add(sky);
const sun = new THREE.Vector3();
const skyUniforms = sky.material.uniforms;
skyUniforms["turbidity"].value = 10;
skyUniforms["rayleigh"].value = 3;
skyUniforms["mieCoefficient"].value = 0.005;
skyUniforms["mieDirectionalG"].value = 0.7;
const inclination = 0.5;
const azimuth = 0.25;
const phi = THREE.MathUtils.mapLinear(1 - inclination, 0, 1, 0, Math.PI / 2);
const theta = THREE.MathUtils.mapLinear(azimuth, 0, 1, 0, 2 * Math.PI);
sun.setFromSphericalCoords(1, phi, theta);
skyUniforms["sunPosition"].value.copy(sun);
scene.environment = renderer.currentBackground = sky.material;

// ------------------- 초원 -------------------
const groundSize = 200;
const groundSegments = 100;
const groundGeometry = new THREE.PlaneGeometry(
  groundSize,
  groundSize,
  groundSegments,
  groundSegments
);

// Vertex Colors 추가
const colors = [];
for (let i = 0; i < groundGeometry.attributes.position.count; i++) {
  const baseGreen = 0.5 + Math.random() * 0.2; // 0.5~0.7 초록색
  const r = 0.1 + Math.random() * 0.1; // 살짝 빨강 섞어 자연스럽게
  const g = baseGreen;
  const b = 0.1 + Math.random() * 0.1; // 살짝 파랑 섞어 자연스럽게
  colors.push(r, g, b);
}
groundGeometry.setAttribute(
  "color",
  new THREE.Float32BufferAttribute(colors, 3)
);

const groundMaterial = new THREE.MeshLambertMaterial({ vertexColors: true });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// 초원 초기 높이 노이즈 적용
const originalPositions = groundGeometry.attributes.position.array.slice();
for (let i = 0; i < groundGeometry.attributes.position.count; i++) {
  const x = groundGeometry.attributes.position.getX(i);
  const z = groundGeometry.attributes.position.getZ(i);
  const y = noise2D(x * 0.05, z * 0.05) * 2; // 높이 조절
  groundGeometry.attributes.position.setY(i, y);
}
groundGeometry.computeVertexNormals();

// ------------------- 산 -------------------
function createMountain(offsetX = 0, offsetZ = 0) {
  const group = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const radius = 15 + Math.random() * 10;
    const height = 20 + Math.random() * 15;
    const geometry = new THREE.ConeGeometry(radius, height, 32);
    const material = new THREE.MeshLambertMaterial({ color: 0x6b4226 });
    const position = geometry.attributes.position;
    const Vertex = new THREE.Vector3();
    for (let j = 0; j < position.count; j++) {
      Vertex.fromBufferAttribute(position, j);
      const n = noise2D(Vertex.x * 0.1, Vertex.z * 0.1);
      const amp = (Vertex.y / height) * 0.5 + 0.5;
      Vertex.x += n * 4 * amp;
      Vertex.z += n * 4 * amp;
      position.setXYZ(j, Vertex.x, Vertex.y, Vertex.z);
    }
    geometry.computeVertexNormals();
    const mountain = new THREE.Mesh(geometry, material);
    mountain.position.x = offsetX + (Math.random() - 0.5) * 30;
    mountain.position.y = height / 2;
    mountain.position.z = offsetZ + (Math.random() - 0.5) * 30;
    group.add(mountain);
  }
  return group;
}

scene.add(
  createMountain(-60, -60),
  createMountain(-20, -10),
  createMountain(20, -60),
  createMountain(50, -30)
);

// ------------------- 조명 -------------------
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(sun.x, sun.y, sun.z);
directionalLight.castShadow = true;
scene.add(directionalLight);
scene.add(new THREE.AmbientLight(0xffffff, 0.8));

// ------------------- OrbitControls -------------------
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(initialControlsTarget);
controls.update();

// ------------------- 카메라 초기화 -------------------
function resetCamera() {
  camera.position.copy(initialCameraPosition);
  controls.target.copy(initialControlsTarget);
  controls.update();
}

// ------------------- 애니메이션 -------------------
let game = null;

function animate(time) {
  requestAnimationFrame(animate);

  // 초원 흔들림 (바람 효과)
  const positions = groundGeometry.attributes.position.array;
  for (let i = 0; i < groundGeometry.attributes.position.count; i++) {
    const x = groundGeometry.attributes.position.getX(i);
    const z = groundGeometry.attributes.position.getZ(i);
    const baseY = originalPositions[i * 3 + 1]; // 원본 높이
    const wind = noise2D(x * 0.1 + time * 0.001, z * 0.1 + time * 0.001) * 0.5;
    groundGeometry.attributes.position.setY(i, baseY + wind);
  }
  groundGeometry.attributes.position.needsUpdate = true;
  groundGeometry.computeVertexNormals();

  if (game && game.isPlaying) controls.enabled = false;
  else controls.enabled = true;
  renderer.render(scene, camera);
}

// ------------------- 초기화 화면 -------------------
function showInitialScreen() {
  resetCamera();
  if (game) game.resetToInitialScreen();
  document.getElementById("result").style.display = "none";
}

// ------------------- 게임 시작 버튼 -------------------
const startBtn = document.getElementById("start-btn");
startBtn.addEventListener("click", () => {
  startBtn.disabled = true;
  let count = 3;
  const countdown = setInterval(() => {
    if (count > 0) startBtn.textContent = count;
    else {
      clearInterval(countdown);
      startBtn.textContent = "게임 시작!";
      setTimeout(() => {
        startBtn.style.display = "none";
        resetCamera();
        if (!game) game = new ClayShooterGame(scene, camera);
        game.startGame();
      }, 500);
    }
    count--;
  }, 500);
});

// ------------------- 리사이즈 이벤트 -------------------
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
