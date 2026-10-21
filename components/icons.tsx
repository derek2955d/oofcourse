import {
  Home,
  Headphones,
  Blocks,
  Baby,
  Sparkles,
  TentTree,
  PawPrint,
  ShoppingBag,
} from "lucide-react";
export function CategoryIcon({
  name,
  size = 27,
}: {
  name: string;
  size?: number;
}) {
  const Icon =
    (
      {
        home: Home,
        tech: Headphones,
        toys: Blocks,
        baby: Baby,
        beauty: Sparkles,
        outdoors: TentTree,
        pets: PawPrint,
        essentials: ShoppingBag,
      } as const
    )[name as "home"] || ShoppingBag;
  return <Icon size={size} strokeWidth={1.7} />;
}
