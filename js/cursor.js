import gsap from "https://cdn.skypack.dev/gsap";

export function initCursor() {
  const cursor = document.getElementById("cursor");
  const crossLines = cursor.querySelectorAll(".cross");
  const dot = cursor.querySelector(".dot");

  let mouseX = 0,
    mouseY = 0,
    posX = 0,
    posY = 0;

  // 마우스 위치 갱신
  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // 부드러운 추적
  function animateCursor() {
    posX += (mouseX - posX) * 0.2;
    posY += (mouseY - posY) * 0.2;

    cursor.style.left = posX + "px";
    cursor.style.top = posY + "px";

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // 클릭 애니메이션
  document.addEventListener("mousedown", () => {
    gsap.to(cursor, {
      scale: 1.5,
      x: "+=2",
      y: "+=2",
      duration: 0.1,
      repeat: 1,
      yoyo: true,
    });
    gsap.to([...crossLines, dot], { backgroundColor: "red", duration: 0.1 });
  });

  document.addEventListener("mouseup", () => {
    gsap.to(cursor, {
      scale: 1,
      x: 0,
      y: 0,
      duration: 0.2,
      ease: "elastic.out(1,0.3)",
    });
    gsap.to([...crossLines, dot], { backgroundColor: "white", duration: 0.2 });
  });
}
