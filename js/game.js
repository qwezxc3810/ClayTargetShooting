import * as THREE from "three";
import { createTarget } from "./target.js";
import gsap from "gsap";

export class ClayShooterGame {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.targetsOnScene = [];
    this.totalTargetsSpawned = 0;
    this.maxTargets = 20;
    this.maxAmmo = 20;
    this.remainingAmmo = this.maxAmmo;
    this.startTime = null;
    this.elapsedTime = 0;
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

  initClickListener() {
    window.addEventListener("click", (e) => {
      if (!this.isPlaying) return;
      if (this.remainingAmmo <= 0) return; // <- 총알 없으면 발사 불가
      this.remainingAmmo--;
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.targetsOnScene);
      intersects.forEach(({ object }) => {
        this.scene.remove(object);
        const index = this.targetsOnScene.indexOf(object);
        if (index > -1) this.targetsOnScene.splice(index, 1);
        this.scoreValue++;
        this.updateUI(); // <- 클릭 후 UI 즉시 갱신
      });
      this.checkGameOver();
    });
  }

  spawnTarget() {
    if (this.totalTargetsSpawned >= this.maxTargets || this.gameOver) return;
    const target = createTarget();
    const x = (Math.random() - 0.5) * 20;
    const y = Math.random() * 10 + 5;
    target.position.set(x, y, this.camera.position.z - 10);
    this.scene.add(target);
    this.targetsOnScene.push(target);
    this.totalTargetsSpawned++;
    this.updateUI(); // <- 스폰 직후 UI 갱신
    gsap.to(target.position, {
      z: -100,
      duration: 5,
      ease: "linear",
      onComplete: () => {
        if (target.parent) {
          this.scene.remove(target);
          const index = this.targetsOnScene.indexOf(target);
          if (index > -1) this.targetsOnScene.splice(index, 1);
          this.updateUI();
          this.checkGameOver();
        }
      },
    });
  }

  updateUI() {
    this.remaining.textContent =
      this.maxTargets - this.totalTargetsSpawned + this.targetsOnScene.length;
    this.score.textContent = this.scoreValue;
    document.getElementById("remaining-shots").textContent = this.remainingAmmo;
  }

  startGame() {
    // ------------------- 상태 초기화 -------------------
    this.isPlaying = true;
    this.totalTargetsSpawned = 0;
    this.targetsOnScene.forEach((t) => this.scene.remove(t)); // <- 기존 타겟 제거
    this.targetsOnScene = [];
    this.remainingAmmo = this.maxAmmo;
    this.scoreValue = 0;
    this.elapsedTime = 0;
    this.startTime = Date.now();
    this.updateUI(); // <- UI 갱신
    this.result.style.display = "none";
    this.gameOver = false; // <- 게임 재시작 가능

    // ------------------- 타겟 스폰 -------------------
    this.spawnInterval = setInterval(() => {
      const count = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < count; i++) this.spawnTarget();
    }, 1000);

    // ------------------- 타이머 -------------------
    this.timerInterval = setInterval(() => {
      this.elapsedTime = ((Date.now() - this.startTime) / 1000).toFixed(2);
      this.timer.textContent = this.elapsedTime;
    }, 100);
  }

  checkGameOver() {
    if (
      this.remainingAmmo <= 0 ||
      (this.totalTargetsSpawned >= this.maxTargets &&
        this.targetsOnScene.length === 0)
    ) {
      clearInterval(this.spawnInterval);
      clearInterval(this.timerInterval);
      this.isPlaying = false;
      this.gameOver = true;

      const remainingTargets = this.maxTargets - this.totalTargetsSpawned;

      this.result.innerHTML = `
        <h2>게임 종료!</h2>
        <p>걸린 시간: ${this.elapsedTime}초</p>
        <p>점수: ${this.scoreValue}</p>
        <p>남은 타겟 수: ${remainingTargets}</p>
        <button id="restartBtn">다시 도전</button>
        <button id="resetBtn">초기화면으로 돌아가기</button>
      `;
      this.result.style.display = "block";

      document.getElementById("restartBtn").addEventListener("click", () => {
        this.resetToInitialScreen(); // <- 재시작 전 상태 초기화
        this.startGame(); // <- 수정: reset 후 바로 startGame 호출
      });

      document.getElementById("resetBtn").addEventListener("click", () => {
        this.resetToInitialScreen();
      });
    }
  }

  resetToInitialScreen() {
    this.gameOver = false;
    this.isPlaying = false;
    clearInterval(this.spawnInterval);
    clearInterval(this.timerInterval);

    this.targetsOnScene.forEach((t) => t.parent && this.scene.remove(t)); // <- 남은 타겟 제거
    this.targetsOnScene = [];
    this.totalTargetsSpawned = 0;
    this.remainingAmmo = this.maxAmmo;
    this.scoreValue = 0;
    this.elapsedTime = 0;
    this.updateUI(); // <- UI 최신화

    this.result.style.display = "none";

    const startBtn = document.getElementById("start-btn");
    startBtn.style.display = "block";
    startBtn.disabled = false;
    startBtn.textContent = "게임 시작"; // <- 버튼 텍스트 초기화
  }
}
