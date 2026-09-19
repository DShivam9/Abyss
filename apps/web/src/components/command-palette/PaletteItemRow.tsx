import React, { ComponentType, memo } from "react";
import { LucideIcon, ArrowUpRight, ArrowRight } from "lucide-react";

interface PaletteItemRowProps {
  isSelected: boolean;
  label: string;
  icon: LucideIcon | ComponentType<{ size?: number; strokeWidth?: number; className?: string; style?: React.CSSProperties }>;
  iconType?: string;
  isPage?: boolean;
  onSelect: () => void;
  onMouseMove?: (e: React.MouseEvent) => void;
  onMouseEnter?: (e: React.MouseEvent) => void;
  activeRef?: React.Ref<HTMLButtonElement>;
}

export const PaletteItemRow = memo(function PaletteItemRow({
  isSelected,
  label,
  icon: Icon,
  iconType,
  isPage = false,
  onSelect,
  onMouseMove,
  onMouseEnter,
  activeRef,
}: PaletteItemRowProps) {
  const ArrowIcon = isPage ? ArrowUpRight : ArrowRight;
  const resolvedIconClass = iconType ? `icon-${iconType}` : (isPage ? "icon-compass" : "icon-cuboid");

  return (
    <button
      ref={activeRef}
      type="button"
      className={`result-item ${isSelected ? "selected" : ""}`}
      onClick={onSelect}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
    >
      <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: "10px" }}>
        <Icon
          size={16}
          strokeWidth={1.6}
          className={`item-icon ${resolvedIconClass}`}
          style={{
            color: isSelected ? "#9be5fb" : "var(--text-muted)",
            flexShrink: 0,
          }}
        />
        <span className="item-name">{label}</span>
      </div>
      <span className="arrow-roll-wrapper" aria-hidden="true">
        <span className={`arrow-roll-track ${isPage ? "arrow-up-right" : "arrow-right"}`}>
          <span className="arrow-slot primary">
            <ArrowIcon size={15} strokeWidth={1.6} />
          </span>
          <span className="arrow-slot secondary">
            <ArrowIcon size={15} strokeWidth={1.6} />
          </span>
        </span>
      </span>
    </button>
  );
});
