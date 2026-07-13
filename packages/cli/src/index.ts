#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { addCommand } from './commands/add.js';

const program = new Command();

program
  .name('abyss-ui')
  .description('CLI to add Abyss components to your project')
  .version('1.0.0');

program.addCommand(initCommand);
program.addCommand(addCommand);

program.parse();
