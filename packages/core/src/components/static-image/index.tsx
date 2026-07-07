import React, { useEffect } from "react";
import { VesselComponentProps } from "../../engine/types";

export const StaticImage: React.FC<VesselComponentProps> = ({
  imageSrc,
  className = "",
  style,
  onLifecycleChange,
}) => {
  // Trigger standard vessel UI lifecycle state for static component
  useEffect(() => {
    if (onLifecycleChange) {
      onLifecycleChange("idle");
    }
  }, [onLifecycleChange]);

  return (
    <div
      className={`w-full relative overflow-hidden select-none pointer-events-auto rounded-[4px] ${className}`}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#e8e8ed",
        ...style,
      }}
    >
      <img
        src={imageSrc}
        alt="Static component preview"
        className="w-full h-auto object-cover select-none pointer-events-none"
        style={{
          display: "block",
        }}
      />
    </div>
  );
};

export default StaticImage;
