import { Command } from 'commander';
import { generateCRUD } from './utils/generate-crud';
import { removeCRUD } from './utils/remove-crud';
const program = new Command('Quick Start');

program.description('A collection of commands to get you going quickly');
program.version('1.0.0');

program.command('generate:crud')
  .alias('g:crud')
  .description('Generates a CRUD for a module')
  .argument('<module>', 'Module name to generate CRUD for in PascalCase')
  .action(generateCRUD);

program.command('remove:crud')
  .alias('r:crud')
  .description('Removed a generated CRUD for a module')
  .argument('<module>', 'Module name to generate CRUD for in PascalCase')
  .action(removeCRUD);

program.parse();
