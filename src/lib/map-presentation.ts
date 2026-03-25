import type { FactionRecord } from "@/data/schemas";

const STRONGHOLD_LOCATION_IDS = new Set([
  "winterfell",
  "kings-landing",
  "dragonstone",
  "castle-black",
  "the-wall",
  "eyrie",
  "casterly-rock",
  "highgarden",
  "riverrun",
  "the-twins",
  "pyke",
  "dragonpit",
  "dorne",
  "water-gardens",
  "harrenhal",
  "the-dreadfort",
  "citadel",
  "horn-hill",
  "meereen",
  "yunkai",
  "astapor",
  "qarth",
  "volantis",
  "oldtown",
  "eastwatch-by-the-sea",
  "runestone",
  "last-hearth",
]);

const CITY_LOCATION_IDS = new Set([
  "braavos",
  "pentos",
  "blackwater-bay",
  "vaes-dothrak",
  "old-valyria",
  "house-of-black-and-white",
  "baelor-great-sept",
]);

const LOCATION_CONTROL_CANDIDATES: Record<string, string[]> = {
  winterfell: ["stark", "bolton"],
  "kings-landing": ["lannister", "targaryen", "baratheon"],
  "blackwater-bay": ["lannister", "targaryen", "baratheon"],
  dragonpit: ["lannister", "targaryen", "baratheon"],
  "baelor-great-sept": ["lannister", "baratheon", "targaryen"],
  "casterly-rock": ["lannister"],
  highgarden: ["tyrell", "lannister"],
  riverrun: ["stark", "frey", "lannister"],
  "the-twins": ["frey", "lannister"],
  harrenhal: ["lannister", "stark", "littlefinger-vale"],
  dragonstone: ["baratheon-stannis", "targaryen"],
  "castle-black": ["night-watch"],
  "the-wall": ["night-watch"],
  "eastwatch-by-the-sea": ["night-watch"],
  pyke: ["greyjoy", "greyjoy-yara-theon"],
  "iron-islands": ["greyjoy", "greyjoy-yara-theon"],
  "old-wyk": ["greyjoy", "greyjoy-yara-theon"],
  dorne: ["martell", "ellaria-dorne"],
  "water-gardens": ["martell", "ellaria-dorne"],
  meereen: ["targaryen"],
  yunkai: ["targaryen"],
  astapor: ["targaryen"],
  "daznaks-pit": ["targaryen"],
  "the-dreadfort": ["bolton"],
  "bear-island": ["stark"],
  "last-hearth": ["stark"],
  eyrie: ["arryn", "littlefinger-vale"],
  runestone: ["arryn", "littlefinger-vale"],
  hardhome: ["wildlings", "white-walkers"],
  "beyond-the-wall-haunted-forest": ["white-walkers", "wildlings"],
  "land-of-always-winter": ["white-walkers"],
  "fist-of-the-first-men": ["night-watch", "white-walkers"],
  "horn-hill": ["tarly"],
};

export type MapPinKind = "stronghold" | "city" | "waypoint";

export function getMapPinKind(locationId: string): MapPinKind {
  if (STRONGHOLD_LOCATION_IDS.has(locationId)) {
    return "stronghold";
  }

  if (CITY_LOCATION_IDS.has(locationId)) {
    return "city";
  }

  return "waypoint";
}

export function resolveMapLocationController(
  locationId: string,
  factionRankings: Array<{
    faction: FactionRecord;
    latestPower: { power: number; summary: string };
  }>,
) {
  const candidates = LOCATION_CONTROL_CANDIDATES[locationId];

  if (!candidates) {
    return null;
  }

  return (
    factionRankings.find((entry) => candidates.includes(entry.faction.id))?.faction ?? null
  );
}
