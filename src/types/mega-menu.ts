/** Tabs are a fixed set; only their label, cap and item list are admin-editable. */
export type MegaMenuTabId = "product" | "concern" | "ingredient";

export type MegaMenuTargetKind =
  | "category"
  | "concern"
  | "ingredient"
  | "skinType"
  | "brand"
  | "search";

/** A destination, stored structurally; the storefront composes the URL. */
export type MegaMenuTarget = {
  kind: MegaMenuTargetKind;
  value: string;
};

export type MegaMenuItem = {
  id: string;
  label: string;
  target: MegaMenuTarget;
  /** Optional grouping label (routine step, benefit, A–Z bucket). */
  group?: string;
};

export type MegaMenuTab = {
  id: MegaMenuTabId;
  label: string;
  /** Cap the panel shows before offering "View All". */
  maxItems: number;
  grouped: boolean;
  items: MegaMenuItem[];
};

/** Admin-managed storefront "Shop" mega menu (hidden items already removed). */
export type MegaMenu = {
  tabs: MegaMenuTab[];
};
