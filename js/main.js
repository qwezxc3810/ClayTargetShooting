import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Sky } from "three/addons/objects/Sky.js";
import gsap from "https://cdn.skypack.dev/gsap";
import { createNoise2D } from "https://cdn.skypack.dev/simplex-noise";

import { createTarget } from "./target.js";
import { ClayShooterGame } from "./game.js";

const cursor = document.getElementById("cursor");
let mouseX = 0;
let mouseY = 0;
let posX = 0;
let posY = 0;

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// 애니메이션 루프에 부드럽게 따라오도록 추가
function animateCursor() {
  posX += (mouseX - posX) * 0.2; // 부드러운 추적
  posY += (mouseY - posY) * 0.2;

  cursor.style.left = posX + "px";
  cursor.style.top = posY + "px";

  requestAnimationFrame(animateCursor);
}
animateCursor();

// 클릭 시 커서 확대
document.addEventListener("mousedown", () => {
  cursor.style.width = "36px";
  cursor.style.height = "36px";
});

document.addEventListener("mouseup", () => {
  cursor.style.width = "12px";
  cursor.style.height = "12px";
});

// 1. 기본 설정 (장면, 카메라, 렌더러)
const canvas = document.querySelector("#three-canvas");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const noise2D = createNoise2D();

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});

// 랜더러 세팅
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping; // 톤 매핑 설정 (하늘이 더 자연스럽게 보이게 함)
renderer.toneMappingExposure = 0.5; // 노출 값 조정
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// 카메라 세팅
const initialCameraPosition = new THREE.Vector3(0, 10, 100); // 카메라 위치 약간 높고 뒤로
const initialControlsTarget = new THREE.Vector3(0, 5, 0); // 카메라 원점 바라보도록 설정
camera.position.copy(initialCameraPosition);

// 2. 하늘 (Sky) 생성 및 설정
const sky = new Sky();
sky.scale.setScalar(450000); // 하늘의 크기( 장면 전체 덮도록 크게)
scene.add(sky);

const sun = new THREE.Vector3(); // 태양 위치를 위한 벡터

// 하늘 셰이더(shader)(사실적 랜더링) 전역 변수(Uniform) 설정
const skyUniforms = sky.material.uniforms;
skyUniforms["turbidity"].value = 10;
skyUniforms["rayleigh"].value = 3;
skyUniforms["mieCoefficient"].value = 0.005;
skyUniforms["mieDirectionalG"].value = 0.7;

// 태양 위치 설정 (하늘 색상에 영향)
const inclination = 0.5; // 태양 고도 (0: 지평선, 0.5: 머리 위)
const azimuth = 0.25; // 태양 방위각 (0.25: 동쪽)
const phi = THREE.MathUtils.mapLinear(1 - inclination, 0, 1, 0, Math.PI / 2); // 이해안됌;;
const theta = THREE.MathUtils.mapLinear(azimuth, 0, 1, 0, 2 * Math.PI); // 이해안됌;;
sun.setFromSphericalCoords(1, phi, theta); // 구면 좌표계로 태양 위치 설정

skyUniforms["sunPosition"].value.copy(sun); // Sky 셰이더에 태양 위치 전달
scene.environment = renderer.currentBackground = sky.material; // 배경으로 Sky 셰이더 사용

// 3. 초원 (Plane) 생성
const groundGeometry = new THREE.PlaneGeometry(200, 200); // 200 x 200 크기의 평면
const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x4caf50 }); // 초록색 머테리얼
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; // 평면을 바닥으로 눕히기 (x축으로 -90도 회전)

scene.add(ground);

// // 4. 구름 (Sphere) 생성
// function createCloud() {
//   const cloud = new THREE.Group();

//   const cloudMaterial = new THREE.MeshStandardMaterial({
//     color: 0xffffff,
//     transparent: true, // 투명도 활성화
//     opacity: 0.85, // 불투명도 60%
//     roughness: 1,
//     metalness: 0,
//   });

//   // 중심 큰 구
//   const mainSphere = new THREE.Mesh(
//     new THREE.SphereGeometry(2.5, 16, 16),
//     cloudMaterial
//   );
//   cloud.add(mainSphere);

//   // 주변 작은 구들
//   const cloudCount = 12;
//   for (let i = 0; i < cloudCount; i++) {
//     const radius = Math.random() * 1 + 0.5;
//     const smallSphere = new THREE.Mesh(
//       new THREE.SphereGeometry(radius, 16, 16),
//       cloudMaterial
//     );

//     smallSphere.position.set(
//       (Math.random() - 0.5) * 8, // x축 → 가로로 퍼지게
//       (Math.random() - 0.3) * 3, // y축 → 높이는 얇게
//       (Math.random() - 0.5) * 3 // z축 → 깊이는 거의 안 퍼지게
//     );
//     smallSphere.scale.setScalar(1 + Math.random() * 0.5); // 크기 불규칙
//     cloud.add(smallSphere);
//   }
//   return cloud;
// }
// const cloud1 = createCloud();
// cloud1.position.set(-70, 40, -70);

// const cloud2 = createCloud();
// cloud2.position.set(-60, 75, -60);

// const cloud3 = createCloud();
// cloud3.position.set(-50, 60, -50);

// const cloud4 = createCloud();
// cloud4.position.set(-30, 55, -40);

// const cloud5 = createCloud();
// cloud5.position.set(-20, 70, -30);

// const cloud6 = createCloud();
// cloud6.position.set(-10, 30, -30);

// const cloud7 = createCloud();
// cloud7.position.set(10, 60, -30);

// const cloud8 = createCloud();
// cloud8.position.set(20, 70, -30);

// const cloud9 = createCloud();
// cloud9.position.set(30, 60, -30);

// const cloud10 = createCloud();
// cloud10.position.set(50, 40, -30);

// const cloud11 = createCloud();
// cloud11.position.set(6, 50, -30);

// const cloud12 = createCloud();
// cloud12.position.set(7, 30, -30);

// scene.add(
//   cloud1,
//   cloud2,
//   cloud3,
//   cloud4,
//   cloud5,
//   cloud6,
//   cloud7,
//   cloud8,
//   cloud9,
//   cloud10,
//   cloud11,
//   cloud12
// );

// 5. 산 (Cone) 생성
function createMountain() {
  const group = new THREE.Group();

  for (let i = 0; i < 3; i++) {
    const radius = 15 + Math.random() * 10;
    const height = 20 + Math.random() * 15;
    const geometry = new THREE.ConeGeometry(radius, height, 32);
    const material = new THREE.MeshLambertMaterial({ color: 0x6b4226 });

    // 정점 변형
    const position = geometry.attributes.position;
    const Vertex = new THREE.Vector3();
    for (let j = 0; j < position.count; j++) {
      Vertex.fromBufferAttribute(position, j);

      const n = noise2D(Vertex.x * 0.1, Vertex.z * 0.1);

      // 꼭대기근처는 덜 변형, 멀수록 변형 심하게
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

// 6. 조명 추가 (햇빛 역할을 할 directionalLight)
const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // 흰색, 강도 1의 빛
directionalLight.position.set(sun.x, sun.y, sun.z); // 태양 위치와 동일하게 설정
directionalLight.castShadow = true; // 그림자 생성
scene.add(directionalLight);

// 주변광 추가 (장면 전체 부드럽게 밝히기 위함)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

// 7. OrbitControls 설정
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(initialControlsTarget); // 카메라가 초원 중앙을 바라보도록 설정
controls.update(); // 초기 업데이트

// 카메라 초기화
function resetCamera() {
  camera.position.copy(initialCameraPosition);
  controls.target.copy(initialControlsTarget);
  controls.update();
}

// 8. 애니메이션
function animate() {
  requestAnimationFrame(animate);

  // 게임 중일때는 컨트롤 잠금
  if (game && game.isPlaying) {
    controls.enabled = false;
  } else {
    controls.enabled = true;
    controls.update();
  }

  renderer.render(scene, camera); // 장면 랜더링
}

// 게임 객체
let game = null; //게임 변수 초기화

// 9. 게임 시작
document.getElementById("start-btn").addEventListener("click", () => {
  resetCamera(); // 게임 시작 시 카메라 초기 겂
  if (!game) {
    game = new ClayShooterGame(scene, camera);
  }

  game.startGame();
});
animate();

// 화면 크기 변경 시 렌더러와 카메라 업데이트
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
