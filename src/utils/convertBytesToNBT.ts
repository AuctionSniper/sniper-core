import nbt from 'prismarine-nbt';

import { calculatePetLevel } from './calculatePetLevel';

type Enchantment = {
  name: string;
  level: number;
};

type Gem = {
  slot: string;
  type: string; // JASPER, JADE, ...
  tier: string; // PERFECT, FLAWLESS, ...
};

type PetInfo = {
  type: string;
  tier: string;
  level: number;
  heldItem?: string;
  candyUsed: number;
};

type Extra = {
  uuid: string;
  modifier?: string;
  rarity_upgrades?: number;
  compact_blocks?: number;
  enchantments?: Enchantment[];
  gems?: Gem[];
  unlockedSlots: string[];
  hot_potato_count?: number;
  dungeon_item_level?: number;
  power_ability_scroll?: string;
  color?: string; // Exotics
  pet_info?: PetInfo;
  anvil_uses?: number;
  art_of_war_count?: number; // Only one can be applied per weapon, so instead of number (can be 1 or undefined with the raw value of art_of_war_count), will be a boolean.
  ethermerge?: number; // For AOTV and AOTE (57 blocks/61 with tuned transmission), as it can be 1 or undefined, will be a boolean.
  tuned_transmission?: number; // For AOTV and AOTE (12/61 blocks), for 12/61 blocks will be 4 as it is glitched and each tuned tranmission adds 2.
  new_years_cake?: number; // New Year Cake year
  year_obtained?: number; // Century Cake Year (100/200)
};

type ParseGemsResponseType = [gems: Gem[], slots: string[]];

function parseGems(rawGems): ParseGemsResponseType {
  if (rawGems === undefined) return [undefined, undefined];

  const gems: Gem[] = [];
  const slots: string[] = [];

  Object.entries(rawGems).forEach(entry => {
    const [key, value] = entry;

    if (key.endsWith('_gem')) return;

    if (key === 'unlocked_slots') {
      Object.values(value).forEach(slot => {
        slots.push(slot);
      });
    } else {
      let type = rawGems[`${key}_gem`];

      if (type === undefined) type = key.slice(0, -2);

      gems.push({
        slot: key,
        type,
        tier: value as string,
      });
    }
  });

  return slots.length === 0 ? [undefined, undefined] : [gems, slots];
}

function parseEnchantments(rawEnchantments): Enchantment[] {
  if (rawEnchantments === undefined) return undefined;

  const enchantments: Enchantment[] = [];

  Object.entries(rawEnchantments).forEach(entry => {
    const [name, level] = entry;

    if (typeof level === 'number') {
      enchantments.push({
        name,
        level,
      });
    }
  });

  return enchantments.length === 0 ? undefined : enchantments;
}

function parsePetInfo(rawPetInfoJson): PetInfo {
  if (rawPetInfoJson === undefined) return undefined;

  const rawPetInfo = JSON.parse(rawPetInfoJson);

  return {
    type: rawPetInfo.type,
    level: calculatePetLevel(rawPetInfo.tier, rawPetInfo.exp),
    tier: rawPetInfo.tier,
    heldItem: rawPetInfo.heldItem,
    candyUsed: rawPetInfo.candyUsed,
  };
}

type ResponseType = [slug: string, extra: Extra];

export async function convert(data: string): Promise<ResponseType> {
  const buffer = Buffer.from(data, 'base64');

  const { parsed } = await nbt.parse(buffer);

  const extraAttributes = nbt.simplify(parsed).i[0].tag.ExtraAttributes;

  const [gems, unlockedSlots] = parseGems(extraAttributes.gems);

  return [
    extraAttributes.id,
    {
      uuid: extraAttributes.uuid,
      modifier: extraAttributes.modifier,
      rarity_upgrades: extraAttributes.rarity_upgrades,
      compact_blocks: extraAttributes.compact_blocks,
      hot_potato_count: extraAttributes.hot_potato_count,
      dungeon_item_level: extraAttributes.dungeon_item_level,
      power_ability_scroll: extraAttributes.power_ability_scroll,
      color: extraAttributes.color,
      anvil_uses: extraAttributes.anvil_uses,
      art_of_war_count: extraAttributes.art_of_war_count,
      tuned_transmission: extraAttributes.tuned_transmission,
      ethermerge: extraAttributes.ethermerge,
      pet_info: parsePetInfo(extraAttributes.petInfo),
      gems,
      unlockedSlots,
      enchantments: parseEnchantments(extraAttributes.enchantments),
      new_years_cake: extraAttributes.new_years_cake,
      year_obtained: extraAttributes.yearObtained,
    },
  ];
}
