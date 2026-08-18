"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { pseudoRandom } from "@/lib/random";

/**
 * 中心が明るく、外へ向かってふわりと消えていく光の画像をその場で作る。
 *
 * 画像ファイルを用意せずコードで描いているので、追加のダウンロードが発生しない。
 * ふちがはっきりした円をそのまま光らせると、画面全体が白く濁ってしまうため、
 * こうして周囲を透明にしておく必要がある。
 */
function useGlowTexture(): THREE.CanvasTexture | null {
  const texture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    gradient.addColorStop(0, "rgba(255,248,225,1)");
    gradient.addColorStop(0.25, "rgba(255,220,140,0.75)");
    gradient.addColorStop(0.55, "rgba(255,190,80,0.25)");
    gradient.addColorStop(1, "rgba(255,180,60,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    return new THREE.CanvasTexture(canvas);
  }, []);

  // 画面を離れるときにGPUのメモリを解放する
  useEffect(() => () => texture?.dispose(), [texture]);

  return texture;
}

/**
 * 3Dの宝箱と、その開封演出。
 *
 * 外部の3Dモデルファイルは使わず、箱（BoxGeometry）だけで組み立てている。
 * ダウンロードが発生せず、素材のライセンスを気にする必要もないため。
 *
 * 演出の流れ:
 *   idle  … ゆっくり浮遊して待機
 *   shake … 3段階で激しくなる振動。中の光が強まっていく
 *   burst … フタが跳ね開き、光とカードが噴き出す
 *   done  … 結果表示へ引き継ぐ
 */

/** 各段階の長さ（秒） */
export const SHAKE_DURATION = 1.6;
export const BURST_DURATION = 1.0;
export const TOTAL_DURATION = SHAKE_DURATION + BURST_DURATION;

/** 行き過ぎてから戻る動き。フタが勢いよく開く感じを出す */
function backOut(t: number, overshoot = 1.9): number {
  const u = t - 1;
  return u * u * ((overshoot + 1) * u + overshoot) + 1;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export interface ChestProps {
  /** true になったら演出を開始する */
  running: boolean;
  /** 10連は宝箱を大きく・金色寄りにする */
  grand: boolean;
  /** 飛び出すカードの色（ジャンルのアクセント色） */
  cardColors: string[];
  /** 演出が終わったときに一度だけ呼ばれる */
  onComplete: () => void;
}

// ───────────────────────── 宝箱本体 ─────────────────────────

export function TreasureChest({
  running,
  grand,
  cardColors,
  onComplete,
}: ChestProps) {
  /*
    経過時間は state ではなく ref で持つ。
    毎フレーム setState すると1秒間に60回も画面全体を作り直すことになり、
    かえって動きがカクつくため。負の値のあいだは「待機中」を意味する。
  */
  const elapsed = useRef(-1);
  const completed = useRef(false);
  const root = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const innerLight = useRef<THREE.PointLight>(null);
  const glow = useRef<THREE.Sprite>(null);
  const glowTexture = useGlowTexture();

  // 10連は一回り大きく、木も金具も明るい色にして「特別な箱」だと分かるようにする
  const woodColor = grand ? "#8a5424" : "#6f4a28";
  const metalColor = grand ? "#ffd75e" : "#d9b444";

  useFrame((state, delta) => {
    // 時計を進める。子（光の粒・飛び出すカード）はこの値を読むだけ
    if (running) {
      if (elapsed.current < 0) elapsed.current = 0;
      // 画面を裏に回して戻ったときに一気に進まないよう、1フレームの上限を決める
      elapsed.current += Math.min(delta, 0.05);

      if (elapsed.current >= TOTAL_DURATION && !completed.current) {
        completed.current = true;
        onComplete();
      }
    }

    const t = elapsed.current;
    const g = root.current;
    const l = lid.current;
    if (!g || !l) return;

    if (t < 0) {
      // 待機中: ゆっくり上下に浮かび、わずかに回る
      const time = state.clock.elapsedTime;
      g.position.set(0, Math.sin(time * 1.2) * 0.06, 0);
      g.rotation.set(0, Math.sin(time * 0.5) * 0.18, 0);
      l.rotation.x = 0;
      if (innerLight.current) {
        innerLight.current.intensity = 1.2 + Math.sin(time * 2) * 0.5;
      }
      if (glow.current) {
        (glow.current.material as THREE.SpriteMaterial).opacity = 0;
      }
      return;
    }

    if (t < SHAKE_DURATION) {
      // ガタガタ: 3段階で振幅が増していく
      const p = t / SHAKE_DURATION;
      const step = Math.min(3, Math.floor(p * 3) + 1);
      const amp = 0.018 * step;

      g.position.x = Math.sin(t * 46) * amp;
      g.position.y = Math.abs(Math.sin(t * 23)) * amp * 0.9;
      g.rotation.z = Math.sin(t * 39) * amp * 0.9;
      g.rotation.y = Math.sin(t * 7) * 0.05;

      // フタがカタカタと浮く
      l.rotation.x = -Math.abs(Math.sin(t * 31)) * 0.05 * step;

      if (innerLight.current) {
        innerLight.current.intensity = 1.5 + p * p * 14;
      }
      return;
    }

    // パッカーン
    const bt = clamp01((t - SHAKE_DURATION) / 0.55);
    g.position.set(0, backOut(clamp01(bt * 1.6)) * 0.12, 0);
    g.rotation.z = 0;
    g.rotation.y = 0;

    // フタが弧を描いて開く（-125度くらいまで）
    l.rotation.x = -backOut(bt) * 2.18;

    const since = t - SHAKE_DURATION;
    if (innerLight.current) {
      // 開いた瞬間に最大、その後ゆるやかに減衰
      innerLight.current.intensity = 60 * Math.exp(-since * 2.2) + 4;
    }
    if (glow.current) {
      const m = glow.current.material as THREE.SpriteMaterial;
      // 開いた瞬間にぱっと光り、すぐに収まる
      m.opacity = 0.95 * Math.exp(-since * 2.6);
      const s = 1.4 + since * 1.6;
      glow.current.scale.set(s, s, 1);
    }
  });

  const scale = grand ? 1.3 : 1.05;

  return (
    <group ref={root} scale={scale}>
      {/* 中から漏れる光 */}
      <pointLight
        ref={innerLight}
        position={[0, 0.2, 0]}
        color="#ffd98a"
        distance={9}
        decay={2}
        intensity={1.2}
      />

      {/* 開いた瞬間の光。sprite は常にカメラを向くので、どの角度から見ても光って見える */}
      {glowTexture && (
        <sprite ref={glow} position={[0, 0.35, 0]} scale={[1.4, 1.4, 1]}>
          <spriteMaterial
            map={glowTexture}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            depthTest={false}
          />
        </sprite>
      )}

      {/* 箱の本体 */}
      <mesh position={[0, -0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.9, 1.1]} />
        <meshStandardMaterial color={woodColor} roughness={0.82} metalness={0.06} />
      </mesh>

      {/* 本体の金具（縦2本） */}
      {[-0.5, 0.5].map((x) => (
        <mesh key={x} position={[x, -0.05, 0]}>
          <boxGeometry args={[0.14, 0.94, 1.14]} />
          <meshStandardMaterial color={metalColor} metalness={0.55} roughness={0.3} />
        </mesh>
      ))}

      {/* 錠前 */}
      <mesh position={[0, 0.12, 0.57]}>
        <boxGeometry args={[0.26, 0.3, 0.08]} />
        <meshStandardMaterial color={metalColor} metalness={0.6} roughness={0.25} />
      </mesh>

      {/* 箱の中（開いたときに見える暗がりと光） */}
      <mesh position={[0, 0.36, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.42, 0.92]} />
        <meshBasicMaterial color="#ffcf6e" />
      </mesh>

      {/* フタ: 蝶番（箱の後ろ上端）を中心に回す */}
      <group ref={lid} position={[0, 0.4, -0.55]}>
        <mesh position={[0, 0.16, 0.55]} castShadow>
          <boxGeometry args={[1.62, 0.42, 1.12]} />
          <meshStandardMaterial color={woodColor} roughness={0.8} metalness={0.06} />
        </mesh>
        {[-0.5, 0.5].map((x) => (
          <mesh key={x} position={[x, 0.16, 0.55]}>
            <boxGeometry args={[0.14, 0.46, 1.16]} />
            <meshStandardMaterial color={metalColor} metalness={0.55} roughness={0.3} />
          </mesh>
        ))}
      </group>

      <BurstParticles elapsed={elapsed} grand={grand} />
      <FlyingCards elapsed={elapsed} colors={cardColors} />
    </group>
  );
}

// ───────────────────────── 光の粒 ─────────────────────────

function BurstParticles({
  elapsed,
  grand,
}: {
  elapsed: React.RefObject<number>;
  grand: boolean;
}) {
  const count = grand ? 900 : 400;
  const points = useRef<THREE.Points>(null);

  // 初期位置と飛び出す方向は最初に一度だけ決めておく
  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // 箱の口のあたりから出発
      positions[i * 3] = (pseudoRandom(i * 6 + 1) - 0.5) * 1.2;
      positions[i * 3 + 1] = 0.3;
      positions[i * 3 + 2] = (pseudoRandom(i * 6 + 2) - 0.5) * 0.8;

      // 上向きに広がる速度
      const angle = pseudoRandom(i * 6 + 3) * Math.PI * 2;
      const spread = 0.5 + pseudoRandom(i * 6 + 4) * 1.5;
      velocities[i * 3] = Math.cos(angle) * spread * 0.55;
      velocities[i * 3 + 1] = 1.8 + pseudoRandom(i * 6 + 5) * 2.6;
      velocities[i * 3 + 2] = Math.sin(angle) * spread * 0.55;
    }
    return { positions, velocities };
  }, [count]);

  // 描画用の配列（毎フレーム書き換える）
  const live = useMemo(() => new Float32Array(positions), [positions]);

  useFrame(() => {
    const p = points.current;
    if (!p) return;

    const t = elapsed.current;
    const since = t - SHAKE_DURATION;

    if (since < 0) {
      p.visible = false;
      return;
    }
    p.visible = true;

    const attr = p.geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const j = i * 3;
      arr[j] = positions[j] + velocities[j] * since;
      // 重力で落ちる
      arr[j + 1] =
        positions[j + 1] + velocities[j + 1] * since - 3.2 * since * since;
      arr[j + 2] = positions[j + 2] + velocities[j + 2] * since;
    }
    attr.needsUpdate = true;

    const mat = p.material as THREE.PointsMaterial;
    mat.opacity = Math.max(0, 1 - since / (BURST_DURATION * 0.95));
  });

  return (
    <points ref={points} visible={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[live, 3]}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={grand ? 0.075 : 0.06}
        color="#ffe6a8"
        transparent
        opacity={1}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ───────────────────────── 飛び出すカード ─────────────────────────

/** 箱から舞い上がるカード。引いた枚数ぶん、ジャンルの色で飛ばす */
function FlyingCards({
  elapsed,
  colors,
}: {
  elapsed: React.RefObject<number>;
  colors: string[];
}) {
  const group = useRef<THREE.Group>(null);

  const paths = useMemo(
    () =>
      colors.map((_, i) => {
        const angle = (i / Math.max(1, colors.length)) * Math.PI * 2 + 0.6;
        const radius =
          colors.length === 1 ? 0 : 0.5 + pseudoRandom(i * 4 + 1) * 0.5;
        return {
          vx: Math.cos(angle) * radius,
          vy: 2.4 + pseudoRandom(i * 4 + 2) * 1.1,
          vz: Math.sin(angle) * radius * 0.6,
          spin: (pseudoRandom(i * 4 + 3) - 0.5) * 7,
          delay: i * 0.035,
        };
      }),
    [colors]
  );

  useFrame(() => {
    const g = group.current;
    if (!g) return;

    const since = elapsed.current - SHAKE_DURATION;
    if (since < 0) {
      g.visible = false;
      return;
    }
    g.visible = true;

    g.children.forEach((child, i) => {
      const path = paths[i];
      if (!path) return;
      const t = Math.max(0, since - path.delay);

      child.position.set(
        path.vx * t,
        0.3 + path.vy * t - 2.4 * t * t,
        path.vz * t
      );
      child.rotation.set(t * path.spin * 0.5, t * path.spin, t * 0.4);

      const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      mat.opacity = Math.min(1, t * 6) * Math.max(0, 1 - t / 0.95);
    });
  });

  return (
    <group ref={group} visible={false}>
      {colors.map((color, i) => (
        <mesh key={i}>
          <planeGeometry args={[0.34, 0.48]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
