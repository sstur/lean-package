/* eslint-disable no-console */
import fs from 'fs/promises';
import { join } from 'path';

import { createParser, defineSchema, renderUsage } from '@sstur/clargs';

export const schema = defineSchema(({ arg, flag }) => ({
  input: arg({
    alias: 'i',
    optional: true,
    typeLabel: '<file>',
    description: 'Path to input package.json',
  }),
  output: arg({
    alias: 'o',
    optional: true,
    typeLabel: '<file>',
    description: 'Write to file instead of stdout',
  }),
  name: arg({
    alias: 'n',
    optional: true,
    typeLabel: '<name>',
    description: 'Override "name" field in the output package.json',
  }),
  description: arg({
    alias: 'd',
    optional: true,
    typeLabel: '<description>',
    description: 'Override "description" field in the output package.json',
  }),
  silent: flag({
    alias: 's',
    description: 'Do not output any extraneous messaging',
  }),
  help: flag({
    alias: 'h',
    description: 'Display this usage help',
  }),
  version: flag({
    alias: 'v',
    description: 'Show the version',
  }),
}));

// List of valid non-dev properties of package.json
// Sourced from https://docs.npmjs.com/cli/v8/configuring-npm/package-json
const copyProps = new Set([
  'author',
  'bin',
  'browser',
  'bugs',
  'config',
  'contributors',
  'cpu',
  'dependencies',
  'description',
  'directories',
  'engines',
  'exports',
  'files',
  'funding',
  'homepage',
  'keywords',
  'license',
  'main',
  'maintainers',
  'man',
  'name',
  'optionalDependencies',
  'os',
  'overrides',
  'peerDependencies',
  'peerDependenciesMeta',
  'private',
  'publishConfig',
  'repository',
  'types',
  'version',
]);

async function main() {
  const params = createParser(schema).parse(process.argv.slice(2));
  if (params.help) {
    const header = `Usage: lean-package [options...]`;
    console.log(renderUsage(schema, { header }));
    return;
  }
  if (params.version) {
    const root = __dirname.endsWith('/src') ? join(__dirname, '..') : __dirname;
    const source = await fs.readFile(join(root, 'package.json'), 'utf8');
    const parsed = JSON.parse(source);
    const version = parsed.version || '0.0.0';
    console.log(`v${version}`);
    return;
  }
  const inputPath = params.input ?? 'package.json';
  const source = await fs.readFile(inputPath, 'utf8');
  const json = JSON.parse(source);
  const result: Record<string, unknown> = {
    name: '',
    description: '',
  };
  for (const [key, value] of Object.entries(json)) {
    if (copyProps.has(key)) {
      result[key] = value;
    }
  }
  if (params.name) {
    result.name = params.name;
  }
  if (params.description) {
    result.description = params.description;
  }
  const output = JSON.stringify(result, null, 2) + '\n';
  const outputPath = params.output;
  if (outputPath) {
    await fs.writeFile(outputPath, output);
    if (!params.silent) {
      console.log(`Saved output to ${outputPath}`);
    }
  } else {
    process.stdout.write(output);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
