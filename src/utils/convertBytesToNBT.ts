import nbt from 'prismarine-nbt';

type Enchantment = {
  name: string;
  level: number;
};

type Gem = {
  slot: string;
  type: string;
  unlocked: boolean;
};

type Extra = {
  uuid: string;
  slug: string;
  modifier: string;
  rarity_upgrades: number;
  compact_blocks?: number;
  enchantments?: Enchantment[];
  gems?: Gem[];
  hot_potato_count?: number;
  dungeon_item_level?: number;
  color?: string; // Exotics
  anvil_uses?: number;
};

function parseGems(rawGems: any): Gem[] {
  const gems: Gem[] = [];

  Object.entries(rawGems).forEach(entry => {
    const [slot, gem] = entry;

    if (slot === 'unlocked_slots') {
      Object.values(gem).forEach(g => {
        gems.push({
          slot: g,
          type: 'LOCKED',
          unlocked: false,
        });
      });
    } else {
      gems.push({
        slot,
        type: gem.toString(),
        unlocked: true,
      });
    }
  });

  return gems;
}

export async function convert(data: string): Promise<Extra> {
  const buffer = Buffer.from(data, 'base64');

  const { parsed } = await nbt.parse(buffer);

  const extraAttributes = nbt.simplify(parsed).i[0].tag.ExtraAttributes;

  const gems = parseGems(extraAttributes.gems);

  return {
    uuid: extraAttributes.uuid,
    slug: extraAttributes.id,
    modifier: extraAttributes.modifier,
    rarity_upgrades: extraAttributes.rarity_upgrades,
    compact_blocks: extraAttributes.compact_blocks,
    enchantments: extraAttributes.enchantments, // Needs to be parsed separated
    hot_potato_count: extraAttributes.hot_potato_count,
    dungeon_item_level: extraAttributes.dungeon_item_level,
    color: extraAttributes.color,
    anvil_uses: extraAttributes.anvil_uses,
    gems,
  } as Extra;
}
