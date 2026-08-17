import React from "react";

interface SectionHeaderProps {
  title: string;
  count: number;
  headlineClass: "headline-s1" | "headline-s2" | "headline-s3" | "headline-s4";
}

export function SectionHeader({ title, count, headlineClass }: SectionHeaderProps) {
  return (
    <div className="section-headline-wrap">
      <h2 className={headlineClass}>
        {title} <span className="headline-count">[{count}]</span>
      </h2>
    </div>
  );
}
