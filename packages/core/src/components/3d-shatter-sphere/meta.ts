import { ComponentDetail } from "../../types/meta";

export const meta: ComponentDetail = {
  id: "62",
  label: "3d Shatter Sphere",
  filename: "components/3d-shatter-sphere/hero.webp",
  desc: "Interactive 3D geometry gallery mapped across Fibonacci sphere and cuboid shells with inertia drag rotation, cursor proximity repulsion, and explosive radial shatter animations.",
  slug: "3d-shatter-sphere",
  category: "gallery",
  subtype: "3d-interactive",
  tags: ["3D", "Sphere", "Shatter", "Explosion", "Gallery", "WebGL"],
  previewType: "gallery",
  overview: "Fibonacci-distributed 3D gallery where image panels form an orbiting spherical or cuboid shell. Users can drag to rotate the volume in 3D perspective, explore hovering tile reactions, and click to trigger a radial explosion shattering panels outward into deep space before reassembling.",
  techStack: ["React", "Three.js", "WebGL", "TypeScript"],
  useCases: [
    "Agency portfolio landing heroes where visitors drag an interactive globe of client work and shatter it to explore project tiles.",
    "Product showcase environments displaying 360-degree component explode views and modular feature highlights.",
    "Creative developer and design engineering websites turning static media libraries into an explosive 3D interactive playground."
  ],
  engineeringNotes: [
    "Maps card matrices across spherical surfaces using golden spiral Fibonacci lattices for mathematically uniform spatial distribution.",
    "Calculates explosive kinematic velocities along outward normal vectors with physics-based drag and spring reassembly.",
    "Reuses shared BufferGeometry instances and batches texture updates to sustain 60fps across high card counts."
  ],
  controls: [
    {
      type: "select",
      key: "shapeMode",
      label: "3d Geometry Shape",
      default: "sphere",
      description: "Toggles between a Fibonacci spherical shell, a 6-face cuboid monolith, and a 24-panel cuboid grid.",
      options: [
        { label: "3D Sphere Shell", value: "sphere" },
        { label: "3D Cube Monolith (6 Faces)", value: "cuboid" },
        { label: "3D Cuboid Grid (24 Panels)", value: "cuboid-grid" }
      ]
    },
    {
      type: "slider",
      key: "sphereRadius",
      label: "3D Structure Radius",
      default: 420,
      min: 200,
      max: 650,
      step: 10,
      unit: "px",
      description: "Sets the base radial dimension of the 3D structure in pixels."
    },
    {
      type: "slider",
      key: "shatterForce",
      label: "Explosion Shatter Force",
      default: 1.8,
      min: 0.5,
      max: 3.5,
      step: 0.1,
      description: "Multiplies the explosion impulse velocity sending panels outward during click interactions."
    },
    {
      type: "slider",
      key: "cardScale",
      label: "Tile Card Scale",
      default: 1.05,
      min: 0.5,
      max: 2.0,
      step: 0.05,
      description: "Adjusts the individual dimensions and footprint of each image panel."
    },
    {
      type: "slider",
      key: "itemCount",
      label: "3D Card Sphere Count",
      default: 42,
      min: 20,
      max: 60,
      step: 2,
      description: "Sets the total number of cards distributed across the spherical lattice.",
      dependsOn: { key: "shapeMode", value: "sphere" }
    },
    {
      type: "slider",
      key: "autoRotateSpeed",
      label: "Idle Spin Momentum",
      default: 0.18,
      min: 0,
      max: 2.5,
      step: 0.02,
      description: "Controls the continuous idle tumble rotation velocity of the 3D volume."
    }
  ]
};
