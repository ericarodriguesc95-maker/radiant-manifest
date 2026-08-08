export interface HighlightColor {
  key: string;
  label: string;
  chip: string;
  bg: string;
}

export const highlightColors: HighlightColor[] = [
  { key: "gold", label: "Dourado", chip: "bg-amber-300", bg: "bg-amber-200/40" },
  { key: "rose", label: "Rosa", chip: "bg-rose-300", bg: "bg-rose-200/40" },
  { key: "mint", label: "Verde", chip: "bg-emerald-300", bg: "bg-emerald-200/40" },
  { key: "sky", label: "Azul", chip: "bg-sky-300", bg: "bg-sky-200/40" },
  { key: "lilac", label: "Lilás", chip: "bg-violet-300", bg: "bg-violet-200/40" },
];

export const colorBg = (key: string) =>
  highlightColors.find((c) => c.key === key)?.bg ?? "bg-amber-200/40";

export const colorChip = (key: string) =>
  highlightColors.find((c) => c.key === key)?.chip ?? "bg-amber-300";
