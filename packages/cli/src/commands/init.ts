import { Command } from 'commander';
import prompts from 'prompts';
import fs from 'fs-extra';
import path from 'path';

export const initCommand = new Command()
  .command('init')
  .description('Initialize your project and install dependencies')
  .action(async () => {
    try {
      const response = await prompts([
        {
          type: 'text',
          name: 'componentsPath',
          message: 'Where would you like to install components?',
          initial: 'src/components/abyss'
        },
        {
          type: 'text',
          name: 'utilsPath',
          message: 'Where is your utils file located?',
          initial: 'src/lib/utils.ts'
        }
      ]);

      if (response.componentsPath === undefined || response.utilsPath === undefined) {
        console.log('\n❌ Initialization aborted.');
        return;
      }

      const configPath = path.join(process.cwd(), 'abyss.json');
      await fs.writeFile(
        configPath,
        JSON.stringify(
          {
            $schema: 'https://abyss-ui.dev/schema.json',
            componentsPath: response.componentsPath,
            utilsPath: response.utilsPath
          },
          null,
          2
        ),
        'utf8'
      );

      console.log('\n✅ Initialization complete. abyss.json created.');
      console.log('You can now start adding components using: npx abyss-ui add <component>');
    } catch (error) {
      console.error('Initialization failed:', error);
    }
  });
