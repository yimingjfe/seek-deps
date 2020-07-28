import koa from 'koa';
import serve from 'koa-static-server';
import * as path from 'path';
import opn from 'better-opn';
import getPort from 'get-port';

const app = new koa();

app.use(
  serve({
    rootDir: __dirname,
  })
);

export default async function server() {
  const port = await getPort({ port: 3000 });
  app.listen(port);
  opn(`http://localhost:${port}`);
}
