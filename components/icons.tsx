import {
  House,
  BriefcaseBusiness,
  Armchair,
  Wrench,
  Store,
  UsersRound,
} from "lucide-react";
import type { CategoryKey } from "@/lib/catalog";
const icons = {
  housing: House,
  jobs: BriefcaseBusiness,
  marketplace: Armchair,
  services: Wrench,
  businesses: Store,
  community: UsersRound,
};
export function CategoryIcon({
  category,
  size = 24,
}: {
  category: CategoryKey;
  size?: number;
}) {
  const Icon = icons[category];
  return <Icon size={size} strokeWidth={1.7} aria-hidden="true" />;
}
