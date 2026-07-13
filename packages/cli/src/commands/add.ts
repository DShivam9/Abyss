import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';

// For local testing or open source repo
const REGISTRY_URL = 'https://raw.githubusercontent.com/DShivam9/Abyss/main/apps/web/public/registry';

export const addCommand = new Command()
  .command('add')
  .description('Add a component to your project')
  .argument('[components...]', 'the components to add')
  .action(async (components: string[]) => {
    try {
      // 1. Read config
      const configPath = path.join(process.cwd(), 'abyss.json');
      if (!fs.existsSync(configPath)) {
        console.error('❌ abyss.json not found. Run `npx abyss-ui init` first.');
        process.exit(1);
      }
      
      const config = await fs.readJson(configPath);
      const componentsPath = path.join(process.cwd(), config.componentsPath || 'src/components/abyss');
      
      // Ensure directory exists
      await fs.ensureDir(componentsPath);

      if (!components || components.length === 0) {
        console.error('❌ No components specified. Usage: npx abyss-ui add <component>');
        return;
      }

      for (const component of components) {
        console.log(`\nFetching ${component}...`);
        
        try {
          const res = await fetch(`${REGISTRY_URL}/${component}.json`);
          if (!res.ok) {
            console.error(`❌ Component "${component}" not found in registry.`);
            continue;
          }
          
          const data = await res.json();
          
          // Write files
          for (const file of data.files) {
            // Note: The registry JSON gives an object for files, or string if we update it.
            // Our script currently maps files to objects with `path` and `content`.
            const fileName = path.basename(file.path);
            const destPath = path.join(componentsPath, fileName);
            
            await fs.writeFile(destPath, file.content, 'utf8');
            console.log(`✅ Created ${config.componentsPath}/${fileName}`);
          }

          if (data.dependencies && data.dependencies.length > 0) {
            console.log(`\n📦 Dependencies required for ${component}:`);
            console.log(`npm install ${data.dependencies.join(' ')}`);
          }
        } catch (e) {
          console.error(`❌ Failed to process ${component}:`, e);
        }
      }
      
    } catch (error) {
      console.error('Execution failed:', error);
    }
  });
