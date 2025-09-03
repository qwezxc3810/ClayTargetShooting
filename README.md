# 💥 ClayTargetShooting (클레이 사격) 미니 게임

클레이 타겟 사격 게임 웹 애플리케이션입니다.  
**Three.js**를 활용하여 3D 환경에서 목표물을 맞추는 간단한 슈팅 게임으로,  
점수 집계 및 게임 UI/UX를 구현하여 사용자에게 직관적인 게임 경험을 제공합니다.

---

 🔗 **배포 주소:** [ClayTargetShooting 바로가기](https://qwezxc3810.github.io/ClayTargetShooting/)  

 🔗 **GitHub Repo:** [Github 링크](https://github.com/qwezxc3810/ClayTargetShooting)

 ---

## 💡 프로젝트 소개

- 본 프로젝트는 Three.js 기반 3D 게임 개발, 애니메이션, 이벤트 핸들링 능력을 보여주기 위해 제작했습니다.  

- 단순 클릭 게임이 아니라, 타겟 스폰, 점수 계산, 게임 진행 UI까지 포함하여 사용자 경험을 고려했습니다.

- Vanillla JS 모듈 구조로 `game.js`, `target.js`, `cursor.js`, `main.js` 분리하여 관리

---

## 📸 게임 화면
![게임 화면](./ClayTargetShooting.gif)

---

## 📂 파일 구조
```
.
├── ClayTargetShooting.gif
├── index.html
├── js
│   ├── cursor.js
│   ├── game.js
│   ├── main.js
│   └── target.js
├── node_modules
│   └── simplex-noise
│       ├── dist
│       │   ├── cjs
│       │   │   ├── simplex-noise.d.ts
│       │   │   ├── simplex-noise.js
│       │   │   └── simplex-noise.js.map
│       │   └── esm
│       │       ├── package.json
│       │       ├── simplex-noise.d.ts
│       │       ├── simplex-noise.js
│       │       └── simplex-noise.js.map
│       ├── LICENSE
│       ├── package.json
│       ├── README.md
│       └── simplex-noise.ts
├── package-lock.json
├── package.json
├── README.md
└── style.css
```

---

## ✨ 주요 기능 (Features)
### 1. 타겟 생성 및 사격

- 🎯 일정 간격으로 목표물 생성 및 랜덤 위치 배치

- 🖱 마우스 클릭으로 타겟을 맞출 수 있음

- 📈 맞춘 타겟 점수 집계 및 화면 표시

### 2. 게임 진행 및 UI

- ⏱ 정해진 탄환 내 점수 계산

- 🛠 시작/종료 버튼으로 게임 제어 (종료 버튼 구현 예정)

- 🎨 Three.js 머티리얼과 라이트로 타겟, 배경, 산, 초원 구현

### 3. 애니메이션

- 💨 타겟 출현, 이동, 파괴 시 GSAP으로 자연스러운 애니메이션 제공 예정

- 🔄 GSAP 라이브러리로 자연스러운 이동 효과

- ⚡️ 게임 인터랙션 시 부드러운 시각적 피드백 제공

### 4. 점수 및 게임 상태 관리

- 📊 타이머, 점수, 스폰 수 초기화 및 UI 실시간 갱신

- ✅ 게임 종료 시 결과 표시, 재시작 및 초기화 화면 이동 가능

### 5. 자유 시점 탐색

- 🌿 게임을 하지 않을 때는 OrbitControls로 주변 풍경 자유 탐색 가능

- - 💨 게임 시작 시 초기 시점으로 카메라 위치 및 시점 고정

---

## 🎮 게임 방법

1. 좌측 상단 **게임 시작 버튼** 클릭
2. 3, 2, 1, **게임 시작!**
3. 화면에 나타나는 목표를 클릭
4. 주어진 탄환 20발과 과녁 20개 안에서 최대 점수 달성
5. 게임 종료 후 결과 확인 및 다시 도전 가능
6. 게임 미실행 시 마우스로 풍경 자유 감상 가능

---

## 🛠️ 기술 스택
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)

- **3D 라이브러리:** [Three.js](https://threejs.org/?utm_source=chatgpt.com)

- **애니메이션:** [GSAP](https://gsap.com/?utm_source=chatgpt.com)

- **노이즈 기반 지형 생성:** [simplex-noise (createNoise2D)](https://www.npmjs.com/package/simplex-noise?utm_source=chatgpt.com)

- **배포:** GitHub Pages

---

## 🥅 프로젝트 진행 중 문제점과 해결 방법

### 1. 목표물 클릭 감지 및 커서 개선
**문제:** 
- 3D 공간에서 마우스 클릭 위치와 타겟 위치를 정확히 매칭하기 어려움  
- 기본 브라우저 커서는 시각적 피드백이 부족하여 게임 몰입도 저하
**해결 방법:**
**Raycaster로 3D 클릭 감지**
```js
this.raycaster.setFromCamera(this.mouse, this.camera);
const intersects = this.raycaster.intersectObjects(this.targetsOnScene);
intersects.forEach(({ object }) => {
  this.scene.remove(object);
  this.scoreValue++;
  this.updateUI();
});
```

**Raycaster를 활용하여 클릭과 타겟 좌표 정확히 일치시킴**

**커서 애니메이션 적용 (커스텀 커서)**
```js
const cursor = document.getElementById("cursor");
document.addEventListener("mousemove", e => {
  cursor.style.left = e.clientX + "px";
  cursor.style.top = e.clientY + "px";
});
document.addEventListener("mousedown", () => {
  gsap.to(cursor, { scale: 1.5, duration: 0.1, yoyo: true, repeat: 1 });
});
document.addEventListener("mouseup", () => {
  gsap.to(cursor, { scale: 1, duration: 0.2, ease: "elastic.out(1,0.3)" });
});
```

- **클릭 시 커서 확대/축소, 색상 변화 등 시각적 피드백 제공**

- **게임 몰입도를 높이고, 타겟을 맞췄다는 감각적인 효과 강화**

### 2. 타겟 스폰 및 애니메이션
**문제:** 여러 타겟이 동시에 생성될 때 자연스러운 이동 필요  
**해결 방법:** 

```js
gsap.to(target.position, {
  z: -100,
  duration: 5,
  ease: "linear",
  onComplete: () => { /* 타겟 제거 및 UI 갱신 */ }
});
```
**GSAP을 활용하여 자연스러운 출현/이동 애니메이션 제공**

### 3. 게임 재시작 시 초기화
**문제:** 게임 재시작 시 타겟, 점수, 시간 초기화 필요  
**해결 방법:**
```js
clearInterval(this.spawnInterval);
clearInterval(this.timerInterval);
this.targetsOnScene.forEach(t => t.parent && this.scene.remove(t));
this.targetsOnScene = [];
this.totalTargetsSpawned = 0;
this.remainingAmmo = this.maxAmmo;
this.scoreValue = 0;
this.elapsedTime = 0;
this.updateUI()
```

**이전 상태 초기화 후 새 게임 시작**

### 4. 게임 시작 준비
**문제:** 게임 시작 버튼을 누르면 바로 게임이 시작되어 준비시간 부족 및 버튼 클릭도 클릭수로 포함
**해결 방법:**
```js
let count = 3;
const countdown = setInterval(() => {
  if (count > 0) startBtn.textContent = count;
  else { clearInterval(countdown); startBtn.textContent = "게임 시작!"; }
  count--;
}, 500);
```

**3초 카운트다운 후 게임 시작으로 준비 시간 제공**

### 5. 게임 시작 시 카메라 시점 고정
**문제:** 자유 시점에서 게임 시작 시 목표물 맞추기 어려움
**해결 방법:**
```js
function resetCamera() {
  camera.position.copy(initialCameraPosition);
  controls.target.copy(initialControlsTarget);
  controls.update();
}
```
**게임 시작 전 카메라 위치와 시점을 초기화하여 목표물에 집중**

---

## 📜 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.















