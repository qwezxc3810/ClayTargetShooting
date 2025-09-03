import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Sky } from "three/addons/objects/Sky.js";
import gsap from "https://cdn.skypack.dev/gsap";
import { createNoise2D } from "https://cdn.skypack.dev/simplex-noise";
import { initCursor } from "./cursor.js";
import { createTarget } from "./target.js";
import { ClayShooterGame } from "./game.js";

// 커서 작동
initCursor();

// 1. 기본 설정
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

// 2. 하늘 (Sky)
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

// 3. 초원 (Plane)
const groundGeometry = new THREE.PlaneGeometry(200, 200);
const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x4caf50 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// 4. 구름 (cloud)

// 5. 산 (Cone)
function createMountain() {
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
    mountain.position.x = (Math.random() - 0.5) * 20;
    mountain.position.y = height / 2;
    mountain.position.z = -50 + Math.random() * 10;
    group.add(mountain);
  }
  return group;
}
const mountains1 = createMountain();
mountains1.position.set(35, 0, 0);
const mountains2 = createMountain();
mountains2.position.set(70, 0, -20);
const mountains3 = createMountain();
mountains3.position.set(-35, 0, -10);
const mountains4 = createMountain();
mountains4.position.set(-70, 0, 10);
scene.add(mountains1, mountains2, mountains3, mountains4);

// 6. 조명
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(sun.x, sun.y, sun.z);
directionalLight.castShadow = true;
scene.add(directionalLight);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

// 7. OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(initialControlsTarget);
controls.update();

// 카메라 초기화
function resetCamera() {
  camera.position.copy(initialCameraPosition);
  controls.target.copy(initialControlsTarget);
  controls.update();
}

// 8. 애니메이션
function animate() {
  requestAnimationFrame(animate);
  if (game && game.isPlaying) {
    controls.enabled = false;
  } else {
    controls.enabled = true;
    controls.update();
  }
  renderer.render(scene, camera);
}

// 게임 객체
let game = null;

// 초기화 화면 버튼 추가
function showInitialScreen() {
  resetCamera();
  if (game) {
    game.resetToInitialScreen(); // 게임 객체 내부에서 초기화
  }
  document.getElementById("result").style.display = "none";
}

// 9. 게임 시작 버튼 클릭 이벤트
document.getElementById("start-btn").addEventListener("click", () => {
  // 3 → 2 → 1 → 게임 시작 텍스트 표시 (클릭으로 총알 차감되지 않음)
  const btn = document.getElementById("start-btn");
  btn.disabled = true;
  let count = 3;
  const originalText = btn.textContent;
  const countdown = setInterval(() => {
    if (count > 0) {
      btn.textContent = count;
    } else {
      clearInterval(countdown);
      btn.textContent = "게임 시작!";
      setTimeout(() => {
        btn.style.display = "none";
        if (!game) game = new ClayShooterGame(scene, camera);
        game.startGame(); // 총알 20개 부여 포함
      }, 500);
    }
    count--;
  }, 500);
});

// 결과 화면에 초기화 및 재도전 버튼 추가
animate();
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
