import { forwardRef } from "react";
import type { PlateItem } from "./types";
import styles from "./styles.module.css";

interface CardPlateProps {
  item: PlateItem;
  setIndex: number;
  instanceId: string;
}

export const CardPlate = forwardRef<HTMLDivElement, CardPlateProps>(
  ({ item, setIndex, instanceId }, ref) => {
    const uid = `${instanceId}-s${setIndex}-c${item.id}`;
    const dripY = item.yTop > 0 ? item.yTop : item.yBottom;

    return (
      <div ref={ref} className={styles.card} data-card-idx={item.id}>
        <svg className={styles.cardSvg} viewBox="0 0 440 720">
          <defs>
            <filter
              id={`goo-${uid}`}
              x="-20%"
              y="-40%"
              width="140%"
              height="180%"
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur
                className="m-blur"
                in="SourceGraphic"
                stdDeviation="0"
                result="blur"
              />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -9"
                result="goo"
              />
              <feComposite in="SourceGraphic" in2="goo" operator="atop" />
            </filter>
            <mask id={`mask-${uid}`} maskUnits="userSpaceOnUse">
              <g className="m-group" filter={`url(#goo-${uid})`}>
                <rect className="m-top" x="0" y="0" width="440" height="0" fill="#ffffff" />
                <text
                  className="m-txt"
                  x="220"
                  y={item.yMid}
                  textAnchor="middle"
                  dominantBaseline="central"
                  textLength={item.textLength}
                  lengthAdjust="spacing"
                  fontFamily="'Syne', sans-serif"
                  fontSize={item.fontSize}
                  fontWeight="800"
                  fill="#ffffff"
                  opacity="0"
                >
                  {item.text}
                </text>

                {/* Interactive Gooey Cursor Lens Droplets */}
                <g className="m-lens-group">
                  <circle className="m-lens-head" cx="220" cy={item.yMid} r="0" fill="#ffffff" />
                  <circle className="m-lens-core" cx="220" cy={item.yMid} r="0" fill="#ffffff" />
                  <circle className="m-lens-tail" cx="220" cy={item.yMid} r="0" fill="#ffffff" />
                </g>

                {/* Melting Dripping Border Stalactite Droplets */}
                <g className="m-drip-group">
                  <circle className="m-drip" cx="75" cy={dripY} r="0" fill="#ffffff" />
                  <circle className="m-drip" cx="165" cy={dripY} r="0" fill="#ffffff" />
                  <circle className="m-drip" cx="275" cy={dripY} r="0" fill="#ffffff" />
                  <circle className="m-drip" cx="365" cy={dripY} r="0" fill="#ffffff" />
                </g>

                <g className="m-tendrils">
                  <ellipse className="m-t" cx="75" cy={item.yMid} rx="0" ry="0" fill="#ffffff" />
                  <ellipse className="m-t" cx="145" cy={item.yMid} rx="0" ry="0" fill="#ffffff" />
                  <ellipse className="m-t" cx="220" cy={item.yMid} rx="0" ry="0" fill="#ffffff" />
                  <ellipse className="m-t" cx="295" cy={item.yMid} rx="0" ry="0" fill="#ffffff" />
                  <ellipse className="m-t" cx="365" cy={item.yMid} rx="0" ry="0" fill="#ffffff" />
                </g>
                <rect className="m-bot" x="0" y="720" width="440" height="0" fill="#ffffff" />
              </g>
            </mask>
          </defs>
          <g mask={`url(#mask-${uid})`}>
            <g className={styles.parallaxLayer}>
              <image
                href={item.src}
                x="-160"
                y="-30"
                width="760"
                height="780"
                preserveAspectRatio="xMidYMid slice"
              />
            </g>
          </g>
        </svg>
      </div>
    );
  }
);

CardPlate.displayName = "CardPlate";
