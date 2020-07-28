import Bundler from 'parcel-bundler';
import * as path from 'path';
import { output } from '../output';

export default async function serve() {
  const entryFiles = path.join(__dirname, './index.html');

  const outDir = path.join(process.env.rootDir as string, './dist');
  const cacheDir = path.join(process.env.rootDir as string, './.cache');

  const options = {
    outDir: outDir,
    outFile: 'index.html',
    cacheDir: cacheDir,
    watch: true,
  };
  const bundler = new Bundler(entryFiles, options);

  // bundler.on('buildEnd', () => {
  //   output('bundled finish', 'green');
  // });

  bundler.on('buildError', (error) => {
    console.error(error);
  });

  // const bundle = await bundler.bundle();

  bundler.serve();
}
