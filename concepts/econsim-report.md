# Bronze & Blood — Economy Simulator Report (design test, not the game)

Files: `concepts/econsim.html` (interactive, single file), `/workspace/tmp/econsim-run.js` (headless; `node econsim-run.js one '{"tithe":0.3}'` or `sweep`), sweep data `/workspace/tmp/econsim-sweep.json`, shots `shots/econsim-{default,hightithe,lowtithe,militarist,mercantile}.png`.
Sim core lives between `SIM CORE START/END` markers in the HTML; edit source `concepts/econsim-core.txt` + rebuild with `/workspace/tmp/build.sh`.

## Model
Daily steps across a 60-day year with four 15-day seasons. Steads have a land type (river, hills, forest, clay, flax). Spring labour sows, and autumn harvests. The tithe is a percentage of the year's production value, paid in the stead's main item first. It is carried physically to the **Imperial Holding** building: carriers are away for 2× the distance (2–7 days), and a donkey or cart cuts how many are needed. The Holding is the treasury and has a storage cap, so anything over it spoils. Serf surplus is bartered into goods-savings, which decay 8% a year. Skill plus savings plus unmet demand turns one adult into a **crafter household that moves to the town** (palace, storage and military area). Town housing has a cap, and crowding above 85% cuts output. Crafters earn silver, buy food, and buy ore from the Holding or a licensee. A crafter can become a merchant house only with a **charter** (a slider sets how many are allowed). Refused crafters lose 15% output and may leave with their silver. Regional trade is a **STUB**: each house exports up to 600 value a year at fixed foreign price × a slider.

## Sweep (30 yrs, tithe 5–60 × merchant tax 0–50 × kept/mixed/licensed × 4 seeds = 864 runs; town 150, storage 60k)
| Tithe | Result |
|---|---|
| 5% | Treasury collapse every run (Holding can't feed retainers + royal miners); happiest, most people |
| 10% | Borderline: treasury runs short in some seeds; merchants arrive late (~yr 8) |
| **15–25%** | **Healthy**: crafters by yr 3, merchants yr 5–7, happiness 57–65, no failures |
| 30–40% | Works but sags: merchants delayed to yr 9–19, pop −20–35%, Holding overflows storage |
| 45%+ | Starvation spiral + unrest; ≥55% no merchants ever (stagnation) |

Merchant tax: 0–30% barely changes anything. At 40–50%, some merchant houses leave the region (count drops 4.5 → 3.5) and treasury income falls, a Laffer peak near 30%. (Original run, now obsolete) Mine licensing hardly changed outcomes in this model. Licensing saves royal food and earns fees, but licensees mark ore up 1.8× and merchants are few. Licensing only matters once merchants are many and ore is scarce.

Default run (tithe 20, tax 20, 40 families): first crafter in yr 3, first merchant in yr 5–6, pop 220 → ~570 by yr 20, happiness ~60. The town fills its 60 slots around yr 20. The Holding's 15k storage overflows from about yr 10.

## Regional trade sensitivity (the most important finding)
| Foreign price × | 30-yr outcome |
|---|---|
| 0–0.8 | Trade is unprofitable. Merchants form late (yr 13), treasury 15–40k, and starvation risk goes up |
| 1.0 | Healthy (treasury ~90k, merchant wealth ~20k) |
| 1.3 | Merchant wealth 260k > treasury: **runaway** |
| 2.0 | Merchants 37M: exponential blow-up |
The economy is extremely sensitive. A foreign margin above about 25–30% compounds without limit. **The caravan design must deliver:** a hard per-house volume cap or saturating foreign demand, costs and risk per trip (bandits, losses), and a margin of roughly 10–25%. Without those, merchants will out-earn the throne.

## Recommended defaults
Tithe 20% (healthy range 15–25%), merchant tax 20–30%, 6 charters (about 1 per 8–12 steads), town housing ≥ 2× expected crafters (start 60, expandable), Holding storage expandable from ~15k. Keep mines royal early and license later.

## Failure modes found
1. Tithe too low → treasury can't feed the court and miners.
2. Tithe too high → starvation spiral, unrest, no risers.
3. Uncapped regional trade → runaway merchants.
4. Holding storage overflow at mid or high tithe → waste (needs storehouse building or spending sinks).
5. Town housing cap blocks risers.
6. Charter cap → denied crafters leave with their silver.
Crafter exodus never depopulated steads, because only one riser per craft per year is allowed and steads need ≥3 adults to lose one.


## Update: Holding spending sinks (army, training grounds, household, mines, patronage) + licensing scrapped
All mines are now royal, and the license toggles are gone. New controls: army target, royal mine upgrade level (0–3), crafter patronage (buys crafter goods at 1.5×), household upkeep, and preset policies Mercantile, Balanced and Militarist.

Strategy sweep (30 yrs, 4 seeds, tax 20%):
| Policy | Tithe | Soldiers / strength | Ore/yr | Crafters / merchants (first) | Pop | Happy | Failures |
|---|---|---|---|---|---|---|---|
| Mercantile (army 10, mines 0, patronage 0.4) | 15% | 10 / 10 | 60 | 10 / 6 (yr 5) | 853 | 65 | none |
| Balanced (20, 1, 0.2) | 20% | 20 / 20 | 102 | 10 / 6 (yr 6) | 759 | 60 | none |
| Militarist (80, 3, 0.1) | 35–40% | 80 / 76 | 186 | 6 / 4.5 (yr 23+) | 420–455 | 40–44 | rare |
| Militarist | ≤30% | 62–80, with desertion | 76–186 | 5–7 | 350–500 | 49–60 | treasury collapse, desertion |

- **The healthy range shifts up by about 5 points to 15–30%.** Spending now soaks up tithe, so storage overflow starts at 35% instead of 25%.
- **High-tithe militarism is viable, but only at 35–40% tithe.** You get 4× the army and 3× the ore, at the cost of about 45% fewer people, merchants roughly 18 years later, and happiness in the low 40s. **Low-tithe mercantile** (15%) gives the most people, early merchants and happy steads, but a token army. That is a real tradeoff.
- **New failure modes:**
  1. *Overextended army*: a big army target on a tithe of 30% or less causes treasury collapse, unpaid soldiers desert, and the cycle repeats.
  2. *Draft drain*: every soldier is taken from a stead, so crafters starve and go bust over and over.
  3. *Ore glut*: upgraded mines pile up ore that crafters can't afford, so ore needs a use (weapons for the army, or exports).
- **New questions:** Should soldiers be drafted serfs or paid volunteers? What should the army actually do (raids that return loot as silver, conquest of land for steads)? Should ore feed the army directly?

## Open design questions for you
1. ~~Treasury sinks~~ decided and modelled (see update above).
2. **Regional trade:** set its margin, volume caps, risk, and whether foreign demand saturates (see the table above).
3. **Merchant tax collection:** should merchants be able to leave or evade at high tax (modelled as leaving above 30%)?
4. ~~Licensing~~ scrapped: all mines are royal.
5. **Charters:** should a denied crafter leave, sulk, or petition again? Can charters be revoked?
6. **Town growth:** does the player build housing, or does the town grow itself like markets? What is the cost of crowding?
7. **Storage:** does overflow spoil, or are deliveries refused at the gate (which hurts happiness)?
8. **Tithe arrears:** what happens when a stead can't pay (debt, punishment, eviction)?
9. **Distance:** should far steads pay a lower tithe, or is a Holding-near-farmland placement the player's job?

Caveats: all numbers are placeholders. Price formation is crude. Merchant counts at 6 are pinned by the charter cap in the sweep.

## Update 2: spoilage, storage, selling surplus to merchants, in-kind wages
**What changed:**
- Perishables spoil everywhere. Holding grain spoils 7% a season with no storage, down to 1.2% at storage level 3. Stead food spoils about 9% a year and market food 15% a season. Wood, stone and ore never spoil.
- Anything over storage capacity loses 50% a season.
- A new *sell surplus above X% of storage* policy sells Holding goods to merchant houses at 0.8 silver per unit. Merchants export them as cargo, capped at 600 a year per house. Spare ore sells at 5.
- Royal jobs (soldiers, miners, household, training grounds) are paid in grain and goods first. Buying from crafters is paid in silver first.
- The royal armoury turns up to 2 ore per soldier a year into weapons.
- **Soldiers come straight from the population:** each recruit is one adult taken from a stead, so the stead loses a worker. A smaller army target sends soldiers back to the steads.

**Results (tithe sweep 864 runs, strategy sweep 144 runs):**
- **Healthy range is now about 10–25%.** A 10% tithe no longer collapses, because wages paid in goods stretch the tithe. Above 25%, spoilage climbs to 5–13k value a year in Mercantile and Balanced, so over-taxing is now visibly wasteful.
- **Spoilage fixes the pile of goods, but the pile turns into silver.** The treasury still reaches 60–80k by year 30, mostly silver. Silver needs sinks: buildings, wages, or tribute and diplomacy.
- **Merchants do not get too rich.** Their wealth holds around 3.3k because they can't afford all the surplus: sales are about 3.5k silver a year, and the rest spoils. The old runaway shows up only at a 5% tithe (when the treasury is tiny). The catch is that merchant buying power, not the threshold, limits how much the player can sell.
- **Storage is worth investing in at moderate tithes.** At 20%, going from level 0 to 3 cuts spoilage from 3.1k to 0.9k a year and raises the treasury by 41%. At 35% it barely helps, because the surplus overflows any storage.
- **Ore glut is fixed only for Militarist.** The armoury uses up its ore. Balanced at 30% or more still piles up ore, because merchants lack the silver to buy it. Mine upgrades should match army and crafter demand, or ore needs more uses.
- **Militarist:** 80 soldiers and 186 ore a year at 35–40% tithe. Population is about 420, happiness is 40, and merchants come around year 20. At 25–30% the treasury still collapses in some runs. **Mercantile at 15%:** about 780 people, happiness 64, merchants around year 5.
- **First merchant** is now around years 6–9 under Balanced, a bit later than the target of 5–8.
- **New watch item:** occasional starvation spirals at 20–35% tithe (1–3 of 72 runs). Spoiling stead food combined with the army draft can tip poor steads over.

**New questions:**
1. What can the player spend silver on?
2. Should merchant buying be limited by their silver (it is now), or can they buy on credit?
3. Should storage be buildings the player places (granary, storehouse), or a Holding upgrade?
4. Should the Holding warn when grain is about to spoil?

## Update 3: silver sinks (civic works, mercenaries, imperial upgrades, foreign-relations stub)
**What changed:**
- **Civic works** (parks, fountains, temples and palaces, festivals) take a percentage of spare silver and build prestige, which fades 10% a year. Prestige adds up to +15 stead happiness and lowers the savings a crafter needs to rise.
- **Mercenaries** cost 30 silver to hire and 15 a year, give 1.2 strength each, and draft no serfs. If unpaid, 40% leave and pillage the Holding.
- **Imperial upgrades** take a percentage of spare silver and add up to +100% mine output and storage, with diminishing returns.
- **Foreign relations** is a stub: tribute only moves a meter.
- New preset: **Mercenary** (25% tithe, 20 drafted soldiers, 60 mercenaries).

**Results (tithe sweep 864 runs, strategy sweep 192 runs):**
- **The silver pile-up is solved.** Silver held at year 30 dropped from about 37k to 2–4k under Mercantile and Balanced. The treasury still looks large, but that is now mostly **ore**. Imperial upgrades raise mine output, which makes the ore glut worse: at 25% tithe or more, nearly every run piles up ore.
- **Civic works add about 3–5 happiness** at the same tithe (Balanced at 20%: 63 vs 60).
- **Mercenaries remove the draft-driven starvation spiral.** The Mercenary preset at 15–40% tithe has no starvation spirals and reaches strength 92 with about 690–830 people and happiness 57–66. Militarist at 35% reaches strength 103 with about 436 people and happiness 43. **New balance problem: mercenaries dominate drafting,** so Militarist is now a strictly worse choice. Mercenaries need downsides: loyalty or betrayal, limited supply, rising cost, or weakness at defence.
- Unpaid mercenaries never pillaged in the presets because reserves covered them. The risk exists if silver income stops, for example when merchants leave over high taxes.
- **Healthy range is now 15–25%.** At 10% or below, runaway merchants and collapse still happen, and Militarist still collapses below a 25% tithe.

**New questions:**
1. What downsides should mercenaries have, so drafting stays a real choice?
2. What should ore be used for (export via caravans, a bronze army, monuments)? It is now the main thing piling up.
3. Should prestige do more than raise happiness, such as attracting migrant families or specialists?
4. Foreign relations: what should tribute buy (peace, trade access, regional price)? It is a stub for now.

## Update 4: challenging world (hazards, layout, setbacks, death spirals)
Design goals, as set: *there is always something to work on*, *a good ruler weathers any storm (set back a little or a lot)*, and *mediocre or badly laid-out cities can spiral and fall*.

**What changed:**
- **Yearly hazards, each with random severity:**
  - Drought (crops −45% × severity), which clusters across years.
  - Poor harvest.
  - Harsh winter (+35% food need).
  - Plague: 4–30% die, more when people are hungry or the town is crowded. More likely after a famine.
  - Fire: burns stores. Better storage protects them, poor layout spreads it.
  - Summer raids: size grows with year, wealth and rival pressure (a placeholder), and raids are more likely in drought years.
- **Losing a raid** means looted stores, deaths and burned steads.
- **A city falls** when population drops below 40% of its peak or under 70, after 3 years of happiness below 25 (revolt), or after repeated sackings.
- **Mercenary downsides:** limited supply (about 12 a year), costs that rise with numbers, at most 75% loyalty in defence, and they desert or pillage when paid late and flee after defeats.
- **Ore uses:** weapons and armour (up to +80% soldier strength), monuments that add prestige, and export as a stub.
- **Layout quality** (0 = poor, 1 = good) stands in for the map layout. It affects:
  - How far steads haul tithe to the Holding (delivery days and food lost on the way).
  - Where storage sits (Holding spoilage ×1.4 down to ×0.6).
  - Roads and fords (stead output).
  - How easily crafters reach the market (craft output).
  - Defensible approaches (defence ×0.8 up to ×1.4).
  - How fast fire spreads.
- **Adaptive ruler AI** (a heuristic stand-in for a decent player):
  - Raises the tithe when food is short, and lowers it when people are unhappy.
  - Raises the army (drafting up to 10% of the population) and hires mercenaries when threatened.
  - Builds storage after a sacking.
  - Spends more on civic works when happiness is low.
- **Pressure events per year** are counted: shortages, raids, unrest, spoilage, labour gaps, unpaid soldiers, ore glut and charter petitions.

**Survival over 30 years (100 seeds per cell):**
| Management \\ Layout | Good (0.85) | Average (0.5) | Poor (0.15) |
|---|---|---|---|
| Adaptive | **94%** | 91% | 72% |
| Passive (fixed defaults) | 84% | 81% | 71% |

- **Extreme strategies:** Militarist (45% tithe) survives 0% and falls to revolt by year 5. Mercantile (10% tithe, almost no army) survives 43% and falls to raids. Mercenary-only survives 57%. Adaptive with drafting only survives 78%, so drafting is still a usable option.
- **Pressure:** about 3.5–4.4 problems a year. The most common are food shortages (about 0.8 a year), crop failures (0.35), raids (0.3–0.4), labour gaps (0.4) and unrest (0.8 for the adaptive AI, since it drafts). Poor layouts see more problems each year.
- **Setbacks for good cities** (good layout + adaptive, survivors):
  - About 1.3 population drops of 10% or more per run. The median drop is 21%, the worst is 54%, and median recovery is 8 years.
  - About 2.5 treasury drops of 30% or more per run (median 69%), with about 4 years to recover.
  - About 1.3 happiness drops of 12+ points per run (median 19 points).
  - Many setbacks had not recovered by year 30, because raids keep growing late in the game.
- **How cities die:** almost always a late (year 20+) chain of raids that grows bigger than defence. Typical sequences: drought, then a lost raid, then plague after hunger, then a raid against weakened defence. Mercenaries fleeing after a loss is a common accelerant. Famine and revolt deaths happen mostly with poor layout.
- **Gap against your target:** good management with good layout is **94%, not about 100%**. The deaths are late runaway raids. The draft cap (10% of population) plus a mercenary supply of about 12 a year can't keep up with raids that grow with year and wealth. The heuristic AI is also crude, and a human would do better. To make it about 100% for good play, give good rulers scalable defensive tools: walls or forts (a layout investment), alliances or tribute under foreign relations, or raids sized against the *rival's* strength rather than the clock. The current settings are hazards ×1.1, raid growth 1.3 per year, wealth factor 0.2, and 5 sackings to fall.

**New questions:**
1. What defensive tool lets a good ruler hold off late-game raids (walls, forts, alliances, tribute)?
2. Should raids scale with time, or with a rival nation's actual strength?
3. Should losing a city end the game, or carry on in a reduced state (vassal, exile)?
4. How should the layout factor map onto the real map (measured haul distance, storage near fields, fords and roads)?

## Update 5: threats rebuilt (walls, tactics, allies; raiders fade; rival wars)
**Model:**
- **Defence** = (army × weapons/armour + loyal mercenaries) × walls (+40% per level; build 700×level, upkeep 40×level, walls decay if unpaid) × tactics (0.8–1.3) × layout (0.65–1.35), **plus allies in the field**. Allies come from tribute (the foreign-relations stub); they help fully in wars and partly against raiders.
- **Raiders** are not a difficulty clock. The chance of a raid depends on how tempting the city's wealth looks compared with its perceived defence. Each raid rolls a tier: band (60%+, size 12–28), warband (about 30%, 30–65) or horde (80–150, starting at 10% and shrinking as deterrence builds). Repelled raids and a strong standing defence build deterrence, so raiders fade as the city becomes established.
- **Rival nations** (placeholder, 2 by default) grow toward their own size cap with good and bad years. From year 8 they may declare war when they outmatch you (less likely if relations are good). A war lasts 1–3 years with varied severity, and losing one cedes 6% of steads.
- **Ruler skill** (the adaptive AI's reaction rate plus tactics): 1 = good, 0.25 = mediocre, 0 = neglectful (fixed defaults). The good AI builds walls when threatened, drafts up to 10% of the population, hires mercenaries and pays tribute when a rival outmatches it.
- **Default rival pressure is now 0.75.**

**Survival over 30 years (100 seeds per cell):**
| Ruler \\ Layout | Good | Average | Poor |
|---|---|---|---|
| Good | **100%** | 99% | 83% |
| Mediocre | 100% | 88% | 74% |
| Neglectful | 72% | 19% | – |

**Setbacks for a good ruler with a good layout (100 runs):**
- About 1.4 population drops of 10% or more per run. The median drop is 19%, the worst 47%, and median recovery is 7 years.
- About 2.5 treasury drops of 30% or more per run (median 60%), recovering in about 4 years.
- About 1.2 happiness drops of 12+ points per run (median 19 points).
- About 3.2 pressure events a year.

**Threat arc (per run, by decade 1 / 2 / 3):**
- **Good ruler:** raids 3.1 / 2.4 / 1.2, of which raids lost 0.6 / 0 / 0. War-years 0.1 / 0.4 / 0.3, with none lost. Early raids hurt, raiders fade, and later threats are wars that a prepared city wins.
- **Neglectful ruler (average layout):** raids 5.8 / 5.4 / 2.3, of which 2.5 / 2.4 / 1.1 lost. War-years 0.6 / 2.8 / 1.5, almost all lost. Weak cities invite raids, then wars finish them.

**Notes and caveats:**
- In this model, good rulers never lose a war. Wars may be too easy for them. Options: a war-loss setback that isn't fatal, sieges, or harder occasional "great wars".
- Deaths for mediocre rulers or poor layouts are mostly war/raid spirals, with some famine.
- The old "runaway merchants" and "treasury collapse" warning badges are now noisy, because a lean treasury is normal under threat. Treat them as hints.
- **Tuning knobs** (all in the sim core defaults): `rivalPressure` 0.75, `raidW` 0.2, wall bonus 0.4 per level, tactics 0.8–1.3, layout 0.65–1.35, horde rate 0.1·e^(−deterrence/4), war chance 0.02 + 0.1·(ratio − 0.8), and `sackLimit` 5.

**New questions:**
1. What should losing a war cost: steads (as now), tribute, or vassalage?
2. Should allies be real AI nations with their own interests?
3. Should walls be laid out on the map, so wall length and cost scale with city size?
4. Are tactics a commander pawn's skill, or a policy?
