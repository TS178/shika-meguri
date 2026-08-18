"use client";

import { Canvas } from "@react-three/fiber";
import { TreasureChest } from "./TreasureChest";

/**
 * 宝箱の3Dシーン。
 *
 * このファイルは next/dynamic の ssr:false 経由でのみ読み込む。
 * 静的書き出しのビルド時にはWebGLが存在しないため、
 * サーバー側で実行されないようにする必要がある。
 */
export default function ChestScene({
  running,
  grand,
  cardColors,
  onComplete,
}: {
  running: boolean;
  grand: boolean;
  cardColors: string[];
  onComplete: () => void;
}) {
  return (
    <Canvas
      // 端末の解像度が高すぎると重くなるので上限を2倍までにする
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      // 斜め上から見下ろす構図。フタが開いたときに箱の中が見えるようにしている
      camera={{ position: [1.6, 1.7, 4.0], fov: 42 }}
      onCreated={({ camera }) => camera.lookAt(0, 0.1, 0)}
      style={{ touchAction: "none" }}
    >
      {/*
        金属は本来まわりの景色を映して光る。
        映り込む景色が無い3D空間では真っ黒になってしまうため、
        上下から色の違う光を当てて金属らしい明暗を作っている。
      */}
      <hemisphereLight args={["#ffe9c4", "#243040", 1.1]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[3.5, 5, 3]} intensity={1.6} color="#fff4e0" />
      {/* 手前から当てて正面を明るくする */}
      <directionalLight position={[0, 1.5, 5]} intensity={0.8} color="#ffffff" />
      {/* 輪郭を出すための後ろからの光 */}
      <directionalLight position={[-3, 2, -4]} intensity={0.7} color="#7fd0e8" />

      <TreasureChest
        running={running}
        grand={grand}
        cardColors={cardColors}
        onComplete={onComplete}
      />
    </Canvas>
  );
}
