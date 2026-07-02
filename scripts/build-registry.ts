import fs from 'fs';
import path from 'path';

const CORE_DIR = path.join(process.cwd(), 'packages', 'core', 'src', 'components');
const REGISTRY_DIR = path.join(process.cwd(), 'apps', 'web', 'public', 'registry');
const BASE_SCHEMA_URL = "https://vessel-ui.dev/schema/registry-item.json";

const components = [
  {
    name: "infinite-canvas",
    title: "Infinite Canvas",
    description: "A 2D infinite workspace supporting wheel trackpad swipe panning and drag momentum physics.",
    dependencies: ["framer-motion"],
    registryDependencies: [],
    files: ["infinite-canvas.tsx"]
  }
];

async function buildRegistry() {
  if (!fs.existsSync(REGISTRY_DIR)) {
    fs.mkdirSync(REGISTRY_DIR, { recursive: true });
  }

  const index: any[] = [];

  for (const component of components) {
    const registryItem = {
      $schema: BASE_SCHEMA_URL,
      name: component.name,
      type: "registry:component",
      title: component.title,
      description: component.description,
      dependencies: component.dependencies,
      registryDependencies: component.registryDependencies,
      files: component.files.map(file => {
        const filePath = path.join(CORE_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        return {
          path: `components/vessel/${file}`,
          type: "registry:component",
          content: content
        };
      }),
      tailwind: {
        config: {}
      },
      cssVars: {}
    };

    // Write individual item JSON
    const itemPath = path.join(REGISTRY_DIR, `${component.name}.json`);
    fs.writeFileSync(itemPath, JSON.stringify(registryItem, null, 2));

    // Add to index
    index.push({
      name: component.name,
      type: "registry:component",
      title: component.title,
      description: component.description,
      dependencies: component.dependencies,
      registryDependencies: component.registryDependencies,
      files: component.files
    });
  }

  // Write master index
  fs.writeFileSync(path.join(REGISTRY_DIR, 'index.json'), JSON.stringify(index, null, 2));
  console.log('Registry built successfully!');
}

buildRegistry().catch(console.error);
