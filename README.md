# Cloudworx Layout Editor

A small React + TypeScript 3D layout editor built for the Cloudworx frontend assessment. It allows users to place and edit industrial equipment in a room, inspect equipment properties, and view proximity warnings and a bill of materials (BOM).

The application uses React state as the source of truth. The Three.js scene renders the current layout rather than storing a separate copy of the equipment data.

## Features

- 3D room measuring 20 m × 12 m with a 0.5 m grid.
- Three equipment types: Cabinet, Machine, and Workbench.
- Add, select, move, rotate, and delete equipment.
- Edit equipment positions using numeric coordinates and movement controls.
- Snap equipment positions to the grid and keep equipment within room boundaries.
- Undo and redo layout edits.
- Synchronized 3D scene, equipment list, and properties panel.
- Bill of materials generated from the current layout.
- Proximity warnings when two equipment centres are less than 0.6 m apart.
- English and Vietnamese interface labels.

## Architecture document

The concise assessment design document is available as [`docs/cloudworx-architecture.pdf`](docs/cloudworx-architecture.pdf), with the editable Markdown source at [`docs/cloudworx-architecture.md`](docs/cloudworx-architecture.md). It separates implemented prototype behavior from proposed production architecture and unverified performance targets.

## Requirements

- Node.js version supported by the installed Vite version.
- npm.

## Run locally

Clone the repository and navigate to the project directory, then run:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite in your terminal.

## Production build

Run:

```bash
npm run build
```

The build runs TypeScript checks and creates the production assets in the `dist/` directory.

## Coordinate convention

- The floor is the **XZ plane**. The Y axis represents height.
- The origin `(0, 0, 0)` is at the centre of the room.
- The room measures **20 m × 12 m**, with X ranging from -10 to 10 and Z ranging from -6 to 6.
- An item's stored position represents the centre of its footprint and is snapped to 0.5 m increments.
- `rotationY` represents rotation around the vertical axis in degrees: 0°, 90°, 180°, or 270°.
- After a 90° or 270° rotation, width and depth are swapped for boundary clamping so the equipment remains inside the room.

## State management and data flow

1. UI interactions dispatch actions to `layoutReducer`, including `add`, `nudge`, `setPosition`, `rotate`, `delete`, `undo`, `redo`, and `select`.
2. `useReducer` manages the layout history using `past`, `present`, and `future`, along with the current items and selection.
3. `SceneCanvas`, `ItemList`, `PropertiesPanel`, and `BillOfMaterials` read from the same current layout snapshot.
4. Proximity warnings are derived using `findProximityConflicts(present.items)` rather than stored as duplicate state.
5. The language setting (`en` or `vi`) is maintained separately using `useState`, so changing languages does not alter the layout.

This approach keeps the scene, list, properties panel, and BOM synchronized with the same underlying data.

## Proximity rule

The prototype compares the centre positions of equipment items and reports a conflict when their centre-to-centre distance is below 0.6 m.

This is a simplified proximity rule, not a full industrial clearance calculation. It does not establish whether the physical edges of two differently sized or rotated pieces of equipment violate a required clearance.

## Known limitations

- The prototype uses simple 3D geometry rather than a production CAD asset pipeline.
- Equipment placement and movement use the interactions currently implemented in the UI; full drag-and-drop placement and direct 3D dragging are not included.
- Proximity detection is based on centre-to-centre distance rather than actual edge-to-edge clearance.
- The prototype does not currently provide backend persistence, autosave, multi-user collaboration, or offline synchronization.
- AI-assisted layout changes and host-application iframe embedding are not implemented.
- The current interface supports English and Vietnamese. Simplified Chinese localization is not implemented.
- Large-layout performance has not been formally benchmarked with 500 items.

## Verification status

The following core interactions have been manually checked:

- Adding all three equipment types.
- Selecting equipment in the 3D scene and item list.
- Moving equipment while respecting room boundaries.
- Rotating and deleting equipment.
- Undoing and redoing edits.
- Triggering proximity warnings.
- Updating the BOM after adding or deleting equipment.
- Switching between English and Vietnamese.

A previous development run reported a successful production build with a warning about a JavaScript bundle larger than 500 kB after minification. During the final review in this environment, dependency installation did not complete, so the current source build could not be independently re-verified. Before submission, run `npm ci`, `npm run build`, and `npm run lint` locally and report the actual results. The bundle size and large-layout frame rate have not been independently optimized or benchmarked.

## AI tool usage

AI coding assistance was used during development to help implement and review parts of the application. The resulting code was reviewed and the core interactions were manually tested. The short architecture document distinguishes between functionality present in this prototype and proposed production-system designs. Performance targets are proposals, not measured results.

The project author is responsible for understanding the submitted implementation and explaining its design decisions during the technical review.
