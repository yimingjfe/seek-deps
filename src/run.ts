import inquirer from 'inquirer';
import * as path from 'path';
import resolve from 'resolve';
import yargs from 'yargs';
import { seek } from './';

export async function run() {
  const argv = yargs
    .scriptName('seek-deps')
    .usage('Usage: $0 [options]')
    .example('$0 --entry ./index.js --context ../ --mp true', 'show dep graph')
    .option('entry', {
      alias: 'e',
      describe: '查找依赖的入口文件',
    })
    .option('context', {
      alias: 'c',
      describe: '项目的目录',
    })
    .help('h')
    .alias('h', 'help').argv;

  let { entry, context, mp } = argv;

  if (!entry) {
    const indexFile = path.join(process.cwd(), './index');
    try {
      entry = resolve.sync(indexFile, {
        basedir: process.cwd(),
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
      });
    } catch (error) {
      entry = null;
    }
    if (entry) {
      const isEntry = await inquireIsEntry(entry as string);
      if (!isEntry) {
        entry = await inquireEntry();
      }
    } else {
      entry = await inquireEntry();
    }
  }

  if (!path.isAbsolute(entry as string)) {
    entry = path.resolve(process.cwd(), entry as string);
  }

  if (!context) {
    context = process.cwd();
    if (!(await inquireIsContext(context as string))) {
      context = await inquireContext();
    }
  }

  if (typeof mp === 'undefined') {
    mp = await inquireIsMp();
  }

  seek({
    entry,
    context,
    miniProgram: mp,
    exclude: ['**/node_modules/**'],
  });
}

async function inquireIsEntry(entry: string) {
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'isEntry',
      message: `entry的路径是${entry}吗`,
    },
  ]);

  return answers['isEntry'];
}

async function inquireEntry() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'entry',
      message: `请输入entry的路径`,
    },
  ]);

  return answers['entry'];
}

async function inquireIsContext(context: string) {
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'isContext',
      message: `项目的根目录是${context}吗`,
    },
  ]);

  return answers['isContext'];
}

async function inquireContext() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'context',
      message: `请输入项目的根目录`,
    },
  ]);

  return answers['context'];
}

async function inquireIsMp() {
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'mp',
      message: `项目是小程序吗`,
    },
  ]);

  return answers['mp'];
}
