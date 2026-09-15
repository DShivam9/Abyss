import { MediaDef, AssetMetadata } from "./types";

export const CELL_SIZE = 3.45;
export const CARD_SIZE = 2.55;
export const FRAME_SIZE = 3.22;
export const COLS = 16;
export const ROWS = 12;

export const TOTAL_W = COLS * CELL_SIZE;
export const TOTAL_H = ROWS * CELL_SIZE;

export const DEFAULT_RADIUS_X = 14.0;
export const DEFAULT_RADIUS_Y = 7.0;

export const DEFAULT_BASE_CAM_Z = 12.8;
export const DEFAULT_ZOOM_OUT_CAM_Z = 17.0;
export const SPRING_K = 190.0;
export const SPRING_D = 27.5;

export const DEFAULT_FRICTION_PER_SEC = 4.8;

export const DEFAULT_MEDIA_DEF: MediaDef[] = [
  { file: "img-01.webp", type: "image", aspect: 0.709 }, { file: "video-01.mp4", type: "video", aspect: 1.778 },
  { file: "img-02.webp", type: "image", aspect: 0.8 },   { file: "video-02.mp4", type: "video", aspect: 1.0 },
  { file: "img-03.webp", type: "image", aspect: 0.8 },   { file: "video-03.mp4", type: "video", aspect: 0.562 },
  { file: "img-04.webp", type: "image", aspect: 0.562 }, { file: "video-04.mp4", type: "video", aspect: 1.777 },
  { file: "img-05.webp", type: "image", aspect: 0.835 }, { file: "video-05.mp4", type: "video", aspect: 0.8 },
  { file: "img-06.webp", type: "image", aspect: 0.743 }, { file: "video-06.mp4", type: "video", aspect: 1.333 },
  { file: "img-07.webp", type: "image", aspect: 0.666 }, { file: "video-07.mp4", type: "video", aspect: 1.589 },
  { file: "video-13.mp4", type: "video", aspect: 1.859 }, { file: "video-08.mp4", type: "video", aspect: 0.562 },
  { file: "img-09.webp", type: "image", aspect: 0.876 }, { file: "video-09.mp4", type: "video", aspect: 1.322 },
  { file: "img-10.webp", type: "image", aspect: 0.77 },  { file: "video-10.mp4", type: "video", aspect: 1.394 },
  { file: "img-11.webp", type: "image", aspect: 0.8 },   { file: "video-11.mp4", type: "video", aspect: 1.772 },
  { file: "img-12.webp", type: "image", aspect: 1.184 }, { file: "video-12.mp4", type: "video", aspect: 1.0 }
];

export const DEFAULT_ASSET_META: AssetMetadata[] = [
  { title: "RODEO SILHOUETTE", pill: "WESTERN" }, { title: "SPIDER-MAN", pill: "MARVEL" },
  { title: "STAGE CONCERT", pill: "LIVE" },       { title: "MECHA ROBOT", pill: "ANIME" },
  { title: "MICHAEL JORDAN", pill: "BULLS 23" },  { title: "LIONEL MESSI", pill: "UCL 2009" },
  { title: "KOBE BRYANT", pill: "NBA CLASSIC" },  { title: "OUT OF CITY", pill: "EDITORIAL" },
  { title: "BATMAN TAS", pill: "GOTHAM" },        { title: "POINT CLOUD", pill: "3D SCAN" },
  { title: "SIMON BAKER", pill: "PORTRAIT" },    { title: "PORSCHE 911", pill: "NIGHT RUNNER" },
  { title: "C. RONALDO", pill: "REAL MADRID" },   { title: "SHADOW INK", pill: "ANIMATION" },
  { title: "CIGARETTE", pill: "ANALOG LOOP" },    { title: "KOBE BRYANT", pill: "LAKERS" },
  { title: "TUPAC SHAKUR", pill: "DEATH ROW" },   { title: "DOODLE ART", pill: "SKETCH" },
  { title: "DON TOLIVER", pill: "HARDSTONE" },    { title: "AIR MAX PLUS", pill: "NIKE TN" },
  { title: "TRAVIS SCOTT", pill: "UTOPIA" },      { title: "BEAST RIDER", pill: "FANTASY" },
  { title: "ICHIGO KUROSAKI", pill: "BLEACH" },   { title: "CHROME SCULPTURE", pill: "3D ART" }
];

export const SEED_ORDER: number[] = [
  14, 3, 22, 7, 18, 1, 11, 20,
  9, 16, 5, 23, 12, 2, 19, 8,
  21, 4, 15, 10, 17, 0, 13, 6
];
