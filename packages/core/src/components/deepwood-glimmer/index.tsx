import React, { useEffect } from "react";
import { DeepwoodGlimmerProps } from "./types";

export const DeepwoodGlimmer: React.FC<DeepwoodGlimmerProps> = ({
  imageSrc,
  className = "",
  style,
  onLifecycleChange,
}) => {
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
        alt="Deepwood Glimmer Tapestry"
        className="w-full h-auto object-cover select-none pointer-events-none"
        style={{
          display: "block",
        }}
      />
    </div>
  );
};

export default DeepwoodGlimmer;
