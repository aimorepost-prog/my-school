export interface EventPriceOption {
  id: string;
  label: string;
  description: string;
  price: number;
}

const OSARAI_PRICE_OPTIONS: EventPriceOption[] = [
  {
    id: "kiso",
    label: "基礎講座を受講済みの方",
    description: "神谷京花の基礎講座をご受講いただいた方",
    price: 1650,
  },
  {
    id: "taiken",
    label: "体験講座を受講済みの方",
    description: "神谷京花の体験講座をご受講いただいた方",
    price: 2200,
  },
];

/** 複数料金プランがある講座の設定（slug 単位） */
export function getEventPriceOptions(slug: string): EventPriceOption[] | null {
  if (slug === "osarai-kai") return OSARAI_PRICE_OPTIONS;
  return null;
}

export function hasMultiplePrices(slug: string): boolean {
  return getEventPriceOptions(slug) !== null;
}

export function resolveEventPrice(
  slug: string,
  defaultPrice: number,
  priceTierId?: string | null
):
  | { ok: true; price: number; tierId?: string; tierLabel?: string }
  | { ok: false; error: string } {
  const options = getEventPriceOptions(slug);

  if (!options) {
    return { ok: true, price: defaultPrice };
  }

  if (!priceTierId) {
    return { ok: false, error: "参加費の区分を選択してください" };
  }

  const tier = options.find((o) => o.id === priceTierId);
  if (!tier) {
    return { ok: false, error: "無効な参加費区分です" };
  }

  return {
    ok: true,
    price: tier.price,
    tierId: tier.id,
    tierLabel: tier.label,
  };
}

export function formatPriceRange(options: EventPriceOption[]): string {
  const prices = options.map((o) => o.price).sort((a, b) => a - b);
  const min = prices[0];
  const max = prices[prices.length - 1];
  if (min === max) return `¥${min.toLocaleString()}`;
  return `¥${min.toLocaleString()} / ¥${max.toLocaleString()}`;
}
