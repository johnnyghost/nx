import { runTasksInSerial } from '@nrwl/workspace/src/utilities/run-tasks-in-serial';
import { Linter, lintProjectGenerator } from '@nrwl/linter';
import {
  addDependenciesToPackageJson,
  joinPathFragments,
  Tree,
  updateJson,
} from '@nrwl/devkit';
import { createReactEslintJson, extraEslintDependencies } from '@nrwl/react';
import { NormalizedSchema } from './normalize-options';

export async function addLinting(host: Tree, options: NormalizedSchema) {
  if (options.linter === Linter.None) {
    return () => {};
  }

  const lintTask = await lintProjectGenerator(host, {
    linter: options.linter,
    project: options.e2eProjectName,
    tsConfigPaths: [
      joinPathFragments(options.e2eProjectRoot, 'tsconfig.app.json'),
    ],
    eslintFilePatterns: [`${options.e2eProjectRoot}/**/*.{ts,tsx,js,jsx}`],
    skipFormat: true,
  });

  const reactEslintJson = createReactEslintJson(
    options.e2eProjectRoot,
    options.setParserOptionsProject
  );

  updateJson(
    host,
    joinPathFragments(options.e2eProjectRoot, '.eslintrc.json'),
    () => reactEslintJson
  );

  const installTask = addDependenciesToPackageJson(
    host,
    extraEslintDependencies.dependencies,
    extraEslintDependencies.devDependencies
  );

  return runTasksInSerial(lintTask, installTask);
}
