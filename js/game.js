// game.js
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
    this.maxAmmo = 20; // 총알 수 추가
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
      if (this.remainingAmmo <= 0) return; // 총알 없으면 발사 불가
      this.remainingAmmo--; // 총알 차감

      // 마우스 좌표 변환
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.targetsOnScene);
      intersects.forEach(({ object }) => {
        this.scene.remove(object);
        const index = this.targetsOnScene.indexOf(object);
        if (index > -1) this.targetsOnScene.splice(index, 1);
        this.scoreValue++;
        this.updateUI();
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
    this.updateUI();
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
    document.getElementById("remaining-shots").textContent = this.remainingAmmo; // 총알 UI 추가
  }

  startGame() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.totalTargetsSpawned = 0;
    this.targetsOnScene = [];
    this.remainingAmmo = this.maxAmmo; // 총알 초기화
    this.startTime = Date.now();
    this.elapsedTime = 0;
    this.scoreValue = 0;
    this.updateUI();
    this.result.style.display = "none";

    // 타겟 스폰
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

  checkGameOver() {
    if (
      this.remainingAmmo <= 0 || // 총알 없으면
      (this.totalTargetsSpawned >= this.maxTargets &&
        this.targetsOnScene.length === 0) // 모든 타겟 제거 완료
    ) {
      clearInterval(this.spawnInterval);
      clearInterval(this.timerInterval);
      this.isPlaying = false;
      this.gameOver = true;

      // 남은 타겟 수 계산 (씬에서 제거된 타겟 때문에 바뀌지 않도록 수정)
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

      document
        .getElementById("restartBtn")
        .addEventListener("click", () => this.startGame());

      document.getElementById("resetBtn").addEventListener("click", () => {
        this.resetToInitialScreen();
      });
    }
  }

  // 게임 초기화 화면으로 돌아가기
  resetToInitialScreen() {
    this.gameOver = false;
    this.isPlaying = false;
    clearInterval(this.spawnInterval);
    clearInterval(this.timerInterval);

    // 남은 타겟 제거
    this.targetsOnScene.forEach(
      (target) => target.parent && this.scene.remove(target)
    );
    this.targetsOnScene = [];
    this.totalTargetsSpawned = 0;
    this.remainingAmmo = this.maxAmmo;
    this.updateUI();

    // 결과창 숨기기 (수정된 부분)
    this.result.style.display = "none";

    // 시작 버튼 표시
    const startBtn = document.getElementById("start-btn");
    startBtn.style.display = "block";
    startBtn.disabled = false;
  }
}
