# Building redesign: shapes and interiors (per building)

Sheet: shots/buildings-compare.png (top = before, bottom = after). Counts come from instrumented rendering (shots/building-check: /workspace/tmp/sheet2.js). Reachable = every footprint tile connects to the outside (4-neighbour) - automatic check.

| Building | Before | After (shape, size) | Beds | Seats/work spots | Racks | Reachable |
|---|---|---|---|---|---|---|
| house | square (legacy) 7×7, beds 5 | Family compound, 9×9 | 5 | 0 | 0 | ok |
| stead | square (legacy) 2×2, beds 0 | Farmstead with byre and grain dome, 7×7 | 5 | 0 | 0 | ok |
| craft | square (legacy) 2×2, beds 9 | Town house with workshop, 7×7 | 5 | 0 | 0 | ok |
| holding | square (legacy) 3×3, beds 0 | Treasury compound round a court, 8×8 | 0 | 2 | 0 | ok |
| gatherhut | square (legacy) 4×4, beds 0 | L-shaped gatherers' shed, 6×6 | 0 | 2 | 0 | ok |
| lodge | square (legacy) 6×6, beds 0 | Oval lodge, 6×6 | 0 | 2 | 1 | ok |
| bakery | square (legacy) 6×6, beds 0 | Bakehouse with dome oven, 7×7 | 0 | 2 | 0 | ok |
| brewery | square (legacy) 6×6, beds 0 | Brewhouse and mash yard, 7×7 | 0 | 2 | 0 | ok |
| storehouse | square (legacy) 6×6, beds 0 | Long store with tally room, 8×8 | 0 | 1 | 0 | ok |
| granary | square (legacy) 7×7, beds 0 | Beehive silos, 8×8 | 0 | 0 | 0 | ok |
| smelter | square (legacy) 7×7, beds 0 | Round kiln house, 7×7 | 0 | 0 | 0 | ok |
| quarry | square (legacy) 6×6, beds 0 | Mason's shed and stone yard, 6×6 | 0 | 0 | 0 | ok |
| copper | square (legacy) 6×6, beds 0 | Miners' hut and ore yard, 6×6 | 0 | 0 | 1 | ok |
| tin | square (legacy) 6×6, beds 0 | Round miners' hut and ore yard, 6×6 | 0 | 0 | 1 | ok |
| barracks | square (legacy) 8×8, beds 8 | Long barracks, 10×10 | 5 | 0 | 2 | ok |
| trainingcamp | square (legacy) 7×7, beds 4 | Hut and drill ground, 7×7 | 0 | 0 | 1 | ok |
| spearschool | square (legacy) 6×6, beds 3 | Spear hall and yard, 6×6 | 0 | 0 | 3 | ok |
| archery | square (legacy) 7×7, beds 4 | Bow shed and range, 7×7 | 0 | 0 | 2 | ok |
| slingfield | square (legacy) 6×6, beds 3 | Round hut and sling field, 6×6 | 0 | 0 | 0 | ok |
| axehall | square (legacy) 6×6, beds 3 | Axe hall and sparring ring, 6×6 | 0 | 0 | 2 | ok |
| stables | square (legacy) 7×7, beds 0 | L stables round a paddock, 7×7 | 0 | 0 | 1 | ok |
| tavern | square (legacy) 6×6, beds 4 | Tavern with drinking yard, 8×8 | 0 | 12 | 0 | ok |
| shrine | square (legacy) 1×1, beds 0 | Round shrine and forecourt, 1×1 | 0 | 0 | 0 | ok |
| statue | square (legacy) 2×2, beds 0 | Round plinth, 3×3 | 0 | 0 | 0 | ok |
| temple | square (legacy) 12×12, beds 0 | Temple with forecourt, 12×12 | 0 | 0 | 0 | ok |
| palace | square (legacy) 12×12, beds 2 | Megaron long hall, 12×12 | 0 | 0 | 0 | ok |
| market | square (legacy) 8×8, beds 0 | Clustered stalls, 8×8 | 0 | 0 | 0 | ok |
| lumber | square (legacy) 6×6, beds 0 | Oval sawyard, 6×6 | 0 | 0 | 0 | ok |
## How footprints work
- Every building type with a shape now has a shape-mask footprint (rects, circles, ellipses, domes, open courts). Placement checks, occupancy (collision) and pathing (A* uses occupancy) only block the masked tiles; courts and cut-away corners stay walkable ground.
- Buildings without a chosen variant (auto-placed steads, town houses, Holding, old-save buildings) pick a stable per-instance shape, rotation and mirror from their position, so neighbours differ.
- Per-tribe materials come from the existing tribe wall/floor palettes (civA()).

## Known gaps
- One shape per new type (houses, granary, barracks, smelter, palace have 2-4 already); multiple validated variants per type is the next task.
- Stead sleeps 5-8 depending on rotation; big families (10-14) are short of beds. Barracks shows 5 bunks.
- Quarry, smelter, slingfield: no seats (work is standing/at the kiln); mines' work bench didn't fit in the hut at this size.
- Shrine BLD is 1x1 (hidden, deleted size) - shape defined but tiny. Garden, well, campfire, plaza, senet, walls, bridges keep their open/legacy art (no interior).
- Old saves: enlarged buildings may overlap their neighbours visually (occupancy is recomputed, no crash).
- Doors on some rotations sit at a gap between rooms rather than on a wall face.
