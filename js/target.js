import * as THREE from "three";

// 원판 타겟 생성 함수
export function createTarget() {
  const geometry = new THREE.CylinderGeometry(1, 1, 0.5, 32);
  const material = new THREE.MeshStandardMaterial({ color: "white" });
  const target = new THREE.Mesh(geometry, material);
  target.rotation.x = Math.PI / 2;
  return target;
}
