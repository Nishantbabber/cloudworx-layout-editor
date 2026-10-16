import { Canvas } from '@react-three/fiber'
import { Edges, Grid, Line, OrbitControls } from '@react-three/drei'
import {
  EQUIPMENT_DEFAULTS,
  ROOM_DEPTH,
  ROOM_WIDTH,
} from '../features/layout/layoutTypes'
import type { EquipmentItem } from '../features/layout/layoutTypes'

type Props = {
  items: EquipmentItem[]
  selectedId: string | null
  conflictIds: Set<string>
  onSelect: (id: string | null) => void
}

export function SceneCanvas({
  items,
  selectedId,
  conflictIds,
  onSelect,
}: Props) {
  return (
    <div className="viewport">
      <Canvas
        camera={{ position: [14, 18, 16], fov: 40, near: 0.1, far: 200 }}
        onPointerMissed={() => onSelect(null)}
      >
        <color attach="background" args={['#dbe4ee']} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[12, 20, 8]} intensity={1.1} />
        <OrbitControls makeDefault minDistance={8} maxDistance={50} />
        <RoomFloor onSelectNone={() => onSelect(null)} />
        {items.map((item) => (
          <EquipmentMesh
            key={item.id}
            item={item}
            selected={item.id === selectedId}
            conflict={conflictIds.has(item.id)}
            onSelect={() => onSelect(item.id)}
          />
        ))}
      </Canvas>
    </div>
  )
}

function RoomFloor({ onSelectNone }: { onSelectNone: () => void }) {
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        onClick={(event) => {
          event.stopPropagation()
          onSelectNone()
        }}
      >
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#f4f7fa" />
      </mesh>
      <Grid
        position={[0, 0.01, 0]}
        args={[ROOM_WIDTH, ROOM_DEPTH]}
        cellSize={0.5}
        cellThickness={0.6}
        cellColor="#9aa8b8"
        sectionSize={2}
        sectionThickness={1.1}
        sectionColor="#5b6b7c"
        fadeDistance={80}
        fadeStrength={0}
        infiniteGrid={false}
      />
      <Line
        points={[
          [-ROOM_WIDTH / 2, 0.03, -ROOM_DEPTH / 2],
          [ROOM_WIDTH / 2, 0.03, -ROOM_DEPTH / 2],
          [ROOM_WIDTH / 2, 0.03, ROOM_DEPTH / 2],
          [-ROOM_WIDTH / 2, 0.03, ROOM_DEPTH / 2],
          [-ROOM_WIDTH / 2, 0.03, -ROOM_DEPTH / 2],
        ]}
        color="#1e3a5f"
        lineWidth={2}
      />
    </group>
  )
}

function EquipmentMesh({
  item,
  selected,
  conflict,
  onSelect,
}: {
  item: EquipmentItem
  selected: boolean
  conflict: boolean
  onSelect: () => void
}) {
  const color = conflict
    ? '#c0392b'
    : selected
      ? '#2a9d8f'
      : EQUIPMENT_DEFAULTS[item.type].color

  return (
    <mesh
      position={[item.position.x, item.height / 2, item.position.z]}
      rotation={[0, (item.rotationY * Math.PI) / 180, 0]}
      onClick={(event) => {
        event.stopPropagation()
        onSelect()
      }}
    >
      <boxGeometry args={[item.width, item.height, item.depth]} />
      <meshStandardMaterial color={color} />
      <Edges color={selected ? '#083d36' : '#1b1f24'} threshold={15} />
    </mesh>
  )
}
