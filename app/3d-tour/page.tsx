"use client";

import React, { useState, useMemo, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  PointerLockControls,
  Grid,
  Center,
} from "@react-three/drei";
import * as THREE from "three";
import {
  Box,
  RefreshCw,
  AlertCircle,
  Eye,
  Navigation,
  Layers,
  Lightbulb,
} from "lucide-react";

const DEFAULT_FLOORPLAN_SCHEMA: SchemaData = {
  walls: [
    { start: [0, 0], end: [10, 0] },
    { start: [10, 0], end: [10, 8] },
    { start: [10, 8], end: [0, 8] },
    { start: [0, 8], end: [0, 0] },
    { start: [5, 0], end: [5, 8] },
    { start: [0, 4], end: [5, 4] },
    { start: [5, 5], end: [10, 5] },
  ],
  doors: [
    { position: [2.5, 0] },
    { position: [5, 2] },
    { position: [2.5, 4] },
    { position: [5, 6.5] },
    { position: [7.5, 5] },
  ],
};

const WALL_HEIGHT = 2.5;
const WALL_THICKNESS = 0.15;
const DOOR_WIDTH = 0.9;
const DOOR_HEIGHT = 2.0;
const LINTEL_HEIGHT = WALL_HEIGHT - DOOR_HEIGHT;
const EYE_HEIGHT = 1.6;
const PLAYER_RADIUS = 0.35;

interface Wall {
  start: [number, number];
  end: [number, number];
}

interface Door {
  position: [number, number];
}

interface SchemaData {
  walls: Wall[];
  doors?: Door[];
}

function getSegmentProps(start: [number, number], end: [number, number]) {
  const [x1, y1] = start;
  const [x2, y2] = end;
  const length = Math.hypot(x2 - x1, y2 - y1);
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  return { length, angle, midX, midY };
}

function getClosestPointOnSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): [number, number] {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) return [x1, y1];

  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  return [x1 + t * dx, y1 + t * dy];
}

function FirstPersonController({
  active,
  collidableWalls,
  bounds,
}: {
  active: boolean;
  collidableWalls: Array<{ start: [number, number]; end: [number, number] }>;
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
}) {
  const { camera } = useThree();
  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          moveState.current.forward = true;
          break;
        case "KeyS":
        case "ArrowDown":
          moveState.current.backward = true;
          break;
        case "KeyA":
        case "ArrowLeft":
          moveState.current.left = true;
          break;
        case "KeyD":
        case "ArrowRight":
          moveState.current.right = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          moveState.current.forward = false;
          break;
        case "KeyS":
        case "ArrowDown":
          moveState.current.backward = false;
          break;
        case "KeyA":
        case "ArrowLeft":
          moveState.current.left = false;
          break;
        case "KeyD":
        case "ArrowRight":
          moveState.current.right = false;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [active]);

  useFrame((_, delta) => {
    if (!active) return;

    const speed = 3.5 * delta;
    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3();
    const sideVector = new THREE.Vector3();

    frontVector.set(
      0,
      0,
      Number(moveState.current.backward) - Number(moveState.current.forward),
    );
    sideVector.set(
      Number(moveState.current.left) - Number(moveState.current.right),
      0,
      0,
    );

    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(speed)
      .applyEuler(camera.rotation);

    let targetX = camera.position.x + direction.x;
    let targetZ = camera.position.z + direction.z;

    collidableWalls.forEach((wall) => {
      const [x1, y1] = wall.start;
      const [x2, y2] = wall.end;

      const [closestX, closestY] = getClosestPointOnSegment(
        targetX,
        targetZ,
        x1,
        y1,
        x2,
        y2,
      );
      const distX = targetX - closestX;
      const distY = targetZ - closestY;
      const dist = Math.hypot(distX, distY);

      const minDistance = PLAYER_RADIUS + WALL_THICKNESS / 2;

      if (dist < minDistance) {
        const overlap = minDistance - dist;
        if (dist > 0.0001) {
          targetX += (distX / dist) * overlap;
          targetZ += (distY / dist) * overlap;
        } else {
          targetX += minDistance;
        }
      }
    });

    const margin = PLAYER_RADIUS + WALL_THICKNESS;
    targetX = Math.max(
      bounds.minX + margin,
      Math.min(bounds.maxX - margin, targetX),
    );
    targetZ = Math.max(
      bounds.minY + margin,
      Math.min(bounds.maxY - margin, targetZ),
    );

    camera.position.x = targetX;
    camera.position.z = targetZ;
    camera.position.y = EYE_HEIGHT;
  });

  return null;
}

function CameraManager({
  mode,
  initialPos,
}: {
  mode: "orbit" | "firstPerson";
  initialPos: [number, number, number];
}) {
  const { camera } = useThree();

  useEffect(() => {
    if (mode === "firstPerson") {
      camera.position.set(initialPos[0], EYE_HEIGHT, initialPos[1]);
      camera.lookAt(initialPos[0] + 1, EYE_HEIGHT, initialPos[1]);
    } else {
      camera.position.set(5, 8, 10);
      camera.lookAt(0, 0, 0);
    }
  }, [mode, camera, initialPos]);

  return null;
}

function useProcessedFloorPlan(data: SchemaData) {
  return useMemo(() => {
    const wallSegments: Array<{
      start: [number, number];
      end: [number, number];
    }> = [];
    const lintelsToRender: Array<{
      position: [number, number];
      angle: number;
    }> = [];

    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

    data.walls.forEach((wall) => {
      const [x1, y1] = wall.start;
      const [x2, y2] = wall.end;

      minX = Math.min(minX, x1, x2);
      maxX = Math.max(maxX, x1, x2);
      minY = Math.min(minY, y1, y2);
      maxY = Math.max(maxY, y1, y2);

      const doorsOnWall = (data.doors || []).filter((door) => {
        const [dx, dy] = door.position;
        const crossProduct = Math.abs(
          (dy - y1) * (x2 - x1) - (dx - x1) * (y2 - y1),
        );
        const minXBound = Math.min(x1, x2) - 0.01;
        const maxXBound = Math.max(x1, x2) + 0.01;
        const minYBound = Math.min(y1, y2) - 0.01;
        const maxYBound = Math.max(y1, y2) + 0.01;

        return (
          crossProduct < 0.05 &&
          dx >= minXBound &&
          dx <= maxXBound &&
          dy >= minYBound &&
          dy <= maxYBound
        );
      });

      if (doorsOnWall.length === 0) {
        wallSegments.push({ start: [x1, y1], end: [x2, y2] });
      } else {
        doorsOnWall.forEach((door) => {
          const [dx, dy] = door.position;
          const angle = Math.atan2(y2 - y1, x2 - x1);
          const halfWidth = DOOR_WIDTH / 2;

          const p1: [number, number] = [
            dx - Math.cos(angle) * halfWidth,
            dy - Math.sin(angle) * halfWidth,
          ];
          const p2: [number, number] = [
            dx + Math.cos(angle) * halfWidth,
            dy + Math.sin(angle) * halfWidth,
          ];

          wallSegments.push({ start: [x1, y1], end: p1 });
          wallSegments.push({ start: p2, end: [x2, y2] });

          lintelsToRender.push({ position: [dx, dy], angle });
        });
      }
    });

    const xCoords = Array.from(
      new Set(data.walls.flatMap((w) => [w.start[0], w.end[0]])),
    ).sort((a, b) => a - b);
    const yCoords = Array.from(
      new Set(data.walls.flatMap((w) => [w.start[1], w.end[1]])),
    ).sort((a, b) => a - b);

    const roomLights: Array<[number, number]> = [];
    for (let i = 0; i < xCoords.length - 1; i++) {
      for (let j = 0; j < yCoords.length - 1; j++) {
        const midX = (xCoords[i] + xCoords[i + 1]) / 2;
        const midY = (yCoords[j] + yCoords[j + 1]) / 2;
        roomLights.push([midX, midY]);
      }
    }

    const houseWidth = maxX - minX || 5;
    const houseHeight = maxY - minY || 5;
    const padding = 1.0;
    const floorWidth = houseWidth + padding * 2;
    const floorHeight = houseHeight + padding * 2;
    const centerX = (minX + maxX) / 2 || 0;
    const centerY = (minY + maxY) / 2 || 0;

    return {
      wallSegments,
      lintelsToRender,
      roomLights,
      bounds: {
        width: floorWidth,
        height: floorHeight,
        centerX,
        centerY,
        houseWidth,
        houseHeight,
        minX,
        maxX,
        minY,
        maxY,
      },
    };
  }, [data]);
}

function FloorPlanMesh({
  wallSegments,
  lintelsToRender,
  roomLights,
  bounds,
  showCeiling,
  showLights,
}: ReturnType<typeof useProcessedFloorPlan> & {
  showCeiling: boolean;
  showLights: boolean;
}) {
  return (
    <group>
      {/* Floor Base */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[bounds.centerX, -0.01, bounds.centerY]}
        receiveShadow
      >
        <planeGeometry args={[bounds.width, bounds.height]} />
        <meshStandardMaterial color="#f3f4f6" />
      </mesh>

      {/* Ceiling Plane */}
      {showCeiling && (
        <mesh
          rotation={[Math.PI / 2, 0, 0]}
          position={[bounds.centerX, WALL_HEIGHT, bounds.centerY]}
          castShadow
          receiveShadow
        >
          <planeGeometry args={[bounds.houseWidth, bounds.houseHeight]} />
          <meshStandardMaterial
            color="#e2e8f0"
            side={THREE.DoubleSide}
            roughness={0.6}
          />
        </mesh>
      )}

      {/* Interior Point Lights */}
      {showLights &&
        roomLights.map(([x, z], idx) => (
          <pointLight
            key={`light-${idx}`}
            position={[x, WALL_HEIGHT - 0.3, z]}
            intensity={12}
            distance={7}
            color="#fff1e0"
            castShadow
          />
        ))}

      {/* Wall Segments */}
      {wallSegments.map((seg, idx) => {
        const { length, angle, midX, midY } = getSegmentProps(
          seg.start,
          seg.end,
        );
        if (length < 0.01) return null;

        return (
          <mesh
            key={`wall-${idx}`}
            position={[midX, WALL_HEIGHT / 2, midY]}
            rotation={[0, -angle, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[length, WALL_HEIGHT, WALL_THICKNESS]} />
            <meshStandardMaterial color="#e5e7eb" roughness={0.4} />
          </mesh>
        );
      })}

      {/* Top Wall Lintels */}
      {lintelsToRender.map((lintel, idx) => (
        <mesh
          key={`lintel-${idx}`}
          position={[
            lintel.position[0],
            DOOR_HEIGHT + LINTEL_HEIGHT / 2,
            lintel.position[1],
          ]}
          rotation={[0, -lintel.angle, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[DOOR_WIDTH, LINTEL_HEIGHT, WALL_THICKNESS]} />
          <meshStandardMaterial color="#d1d5db" roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function FloorPlanPageContent() {
  const searchParams = useSearchParams();
  const isDebugMode =
    searchParams.get("debug") === "true" || searchParams.get("debug") === "1";

  const [jsonInput, setJsonInput] = useState<string>(
    JSON.stringify(DEFAULT_FLOORPLAN_SCHEMA, null, 2),
  );
  const [parsedData, setParsedData] = useState<SchemaData>(
    DEFAULT_FLOORPLAN_SCHEMA,
  );
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<"orbit" | "firstPerson">(
    "firstPerson",
  );
  const [showCeiling, setShowCeiling] = useState<boolean>(true);
  const [showLights, setShowLights] = useState<boolean>(true);
  const [isLocked, setIsLocked] = useState(false);

  const processedData = useProcessedFloorPlan(parsedData);

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setJsonInput(val);
    try {
      const parsed = JSON.parse(val);
      if (!parsed.walls || !Array.isArray(parsed.walls)) {
        throw new Error('Schema must contain a "walls" array.');
      }
      setParsedData(parsed);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Invalid JSON format");
    }
  };

  const handleReset = () => {
    setJsonInput(JSON.stringify(DEFAULT_FLOORPLAN_SCHEMA, null, 2));
    setParsedData(DEFAULT_FLOORPLAN_SCHEMA);
    setError(null);
  };

  const spawnPos = useMemo<[number, number, number]>(() => {
    if (!parsedData.walls || parsedData.walls.length === 0) return [1, 1, 0];
    const firstWall = parsedData.walls[0];
    return [firstWall.start[0] + 0.5, firstWall.start[1] + 0.5, 0];
  }, [parsedData]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-900 font-sans text-slate-100">
      {isDebugMode && (
        <div className="z-10 flex w-full flex-col border-r border-slate-800 bg-slate-950 p-4 shadow-xl md:w-96">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-slate-200">
              <Box className="h-5 w-5 text-indigo-400" />
              <span>Floor Plan Generator</span>
            </div>
            <button
              onClick={handleReset}
              className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
              title="Reset to Default Schema"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {/* View & Lighting Controls */}
          <div className="space-y-3 pt-4 pb-2">
            <div>
              <label className="mb-2 block font-mono text-xs tracking-wider text-slate-400 uppercase">
                Camera Mode
              </label>
              <div className="grid grid-cols-2 gap-2 rounded-lg border border-slate-800 bg-slate-900 p-1">
                <button
                  onClick={() => {
                    setViewMode("orbit");
                    setShowCeiling(false);
                  }}
                  className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-all ${
                    viewMode === "orbit"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Orbit (3rd)</span>
                </button>
                <button
                  onClick={() => {
                    setViewMode("firstPerson");
                    setShowCeiling(true);
                  }}
                  className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-all ${
                    viewMode === "firstPerson"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Navigation className="h-3.5 w-3.5" />
                  <span>Walk (1st)</span>
                </button>
              </div>
            </div>

            {/* Ceiling Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 p-2.5">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <Layers className="h-4 w-4 text-indigo-400" />
                <span>Show Ceiling</span>
              </div>
              <button
                onClick={() => setShowCeiling(!showCeiling)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  showCeiling ? "bg-indigo-600" : "bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    showCeiling ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Interior Lighting Toggle Switch */}
            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 p-2.5">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <Lightbulb className="h-4 w-4 text-amber-400" />
                <span>Interior Lights</span>
              </div>
              <button
                onClick={() => setShowLights(!showLights)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  showLights ? "bg-amber-500" : "bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    showLights ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Schema Editor */}
          <div className="flex min-h-0 flex-1 flex-col pt-2">
            <label className="mb-2 font-mono text-xs tracking-wider text-slate-400 uppercase">
              Minimal Schema (JSON)
            </label>
            <textarea
              value={jsonInput}
              onChange={handleJsonChange}
              className="w-full flex-1 resize-none rounded-lg border border-slate-800 bg-slate-900 p-3 font-mono text-xs text-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              spellCheck={false}
            />

            {error && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-800/60 bg-red-950/50 p-3 text-xs text-red-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="mt-4 border-t border-slate-800 pt-4 text-xs text-slate-500">
            <p>
              Coordinates map directly to 3D space: <code>[X, Z]</code>
            </p>
          </div>
        </div>
      )}

      {/* 3D Viewport */}
      <div className="relative h-full flex-1 bg-slate-900">
        <Canvas
          shadows
          camera={{ position: [5, 8, 10], fov: 50 }}
          className="h-full w-full cursor-pointer"
        >
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 15, 10]}
            intensity={1.0}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />

          <CameraManager mode={viewMode} initialPos={spawnPos} />

          {viewMode === "orbit" ? (
            <Center top>
              <FloorPlanMesh
                {...processedData}
                showCeiling={showCeiling}
                showLights={showLights}
              />
            </Center>
          ) : (
            <FloorPlanMesh
              {...processedData}
              showCeiling={showCeiling}
              showLights={showLights}
            />
          )}

          <Grid
            infiniteGrid
            fadeDistance={30}
            fadeStrength={1.5}
            cellSize={1}
            sectionSize={5}
            sectionColor="#475569"
            cellColor="#334155"
          />

          {viewMode === "orbit" ? (
            <OrbitControls
              makeDefault
              minDistance={2}
              maxDistance={30}
              maxPolarAngle={Math.PI / 2 - 0.05}
            />
          ) : (
            <>
              <PointerLockControls
                onLock={() => setIsLocked(true)}
                onUnlock={() => setIsLocked(false)}
              />
              <FirstPersonController
                active={isLocked}
                collidableWalls={processedData.wallSegments}
                bounds={processedData.bounds}
              />
            </>
          )}
        </Canvas>

        <div className="pointer-events-none absolute right-4 bottom-4 rounded-md border border-slate-800 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-400 backdrop-blur">
          {viewMode === "orbit" ? (
            <span>
              Left Click + Drag: Rotate | Scroll: Zoom | Right Click + Drag: Pan
            </span>
          ) : isLocked ? (
            <span>WASD / Arrows: Walk | Mouse: Look | ESC: Exit Lock</span>
          ) : (
            <span className="font-medium text-indigo-400">
              Click on viewport to start walking
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FloorPlanPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-slate-900" />}>
      <FloorPlanPageContent />
    </Suspense>
  );
}
