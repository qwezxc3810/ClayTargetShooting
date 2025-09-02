import * as THREE from "three";
import { createTarget } from "./target.js";
import gsap from "gsap";

export class ClayShooterGame {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    this.targetsOnScene = []; // 현제 화면에 타겟 리스트
    this.totalTargetsSpawned = 0; // 스폰된 타겟 수
    this.maxTargets = 20; // 총 타겟 수
    this.startTime = null;
    this.elapsedTime = 0; // 경과 시간
    this.isPlaying = false;
    this.scoreValue = 0;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.remaining = document.getElementById("remaining");
    this.timer = document.getElementById("timer");
    this.score = document.getElementById("score");
    this.result = document.getElementById("result");

    this.initClickListener();
  }

  // 클릭 시 Raycaster로 맞춘 타겟 제거
  initClickListener() {
    window.addEventListener("click", (e) => {
      if (!this.isPlaying) return; // 게임 중일때만 동작

      // 마우스 좌표 -1~0~1로 변환
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);

      const intersects = this.raycaster.intersectObjects(this.targetsOnScene);

      intersects.forEach(({ object }) => {
        this.scene.remove(object); // 클릭 하면 제거
        const index = this.targetsOnScene.indexOf(object);
        if (index > -1) this.targetsOnScene.splice(index, 1);

        this.scoreValue++; // 점수 증가
        this.updateUI();
      });
      this.checkGameOver();
    });
  }

  // 타겟 스폰
  spawnTarget() {
    if (this.totalTargetsSpawned >= this.maxTargets || this.gameOver) return;

    const target = createTarget();
    const x = (Math.random() - 0.5) * 20;
    const y = Math.random() * 10 + 5;
    target.position.set(x, y, this.camera.position.z - 10); // 카메라 앞

    this.scene.add(target);
    this.targetsOnScene.push(target);
    this.totalTargetsSpawned++;

    this.updateUI();

    // GSAP를 사용해 타겟 앞으로 날아가도록 애니메이션
    gsap.to(target.position, {
      z: -100,
      duration: 5,
      ease: "linear",
      onComplete: () => {
        // 아직 씬에 남아있다면(못맞추면) 정리
        if (target.parent) {
          this.scene.remove(target);
          const index = this.targetsOnScene.indexOf(target);
          if (index > -1) this.targetsOnScene.splice(index, 1); // 제거
          this.updateUI();
          this.checkGameOver();
        }
      },
    });
  }
  // UI 업데이트
  updateUI() {
    this.remaining.textContent =
      this.maxTargets - this.totalTargetsSpawned + this.targetsOnScene.length;
    this.score.textContent = this.scoreValue;
  }

  // 게임 시작
  startGame() {
    if (this.isPlaying) return; // 이미 진행중이면 무시
    this.isPlaying = true;

    this.totalTargetsSpawned = 0;
    this.targetsOnScene = [];
    this.startTime = Date.now();
    this.elapsedTime = 0;
    this.scoreValue = 0;

    this.updateUI();

    // 결과창 숨기기
    this.result.style.display = "none";

    // 일정 시간마다 랜덤으로 1~2개 타겟 스폰
    this.spawnInterval = setInterval(() => {
      const count = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < count; i++) this.spawnTarget();
    }, 1000);

    // 타이머 갱신
    this.timerInterval = setInterval(() => {
      this.elapsedTime = ((Date.now() - this.startTime) / 1000).toFixed(2);
      this.timer.textContent = this.elapsedTime;
    }, 100);
  }

  //   // 상태 초기화 (재시작)
  //   resetGameState() {
  //     this.gameOver = false;
  //     // 씬에 남아있는 타겟 정리
  //     this.targetsOnScene.forEach(
  //       (target) => target.parent && this.scene.remove(target)
  //     );
  //     this.targetsOnScene = [];
  //     this.totalTargetsSpawned = 0;
  //     if (this.spawnInterval) {
  //       clearInterval(this.spawnInterval);
  //       this.spawnInterval = null;
  //     }
  //   }

  // 게임 종료 체크
  checkGameOver() {
    if (
      this.totalTargetsSpawned >= this.maxTargets &&
      this.targetsOnScene.length === 0
    ) {
      clearInterval(this.spawnInterval);
      clearInterval(this.timerInterval);
      this.isPlaying = false;

      // 결과창 표시
      this.result.innerHTML = `
        <h2>게임 종료!</h2>
        <p>걸린 시간: ${this.elapsedTime}초</p>
        <p>점수: ${this.scoreValue}</p>
        <button id = "restartBtn">다시 시작</button>
        `;
      this.result.style.display = "block";

      document
        .getElementById("restartBtn")
        .addEventListener("click", () => this.startGame());
    }
  }
}
