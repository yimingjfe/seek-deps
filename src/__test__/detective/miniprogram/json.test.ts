import detective from '../../../detective/miniprogram/json';
import * as path from 'path';

describe('resolve json deps', () => {
  it('support usingComponents', async () => {
    const deps = await detective(path.join(__dirname, './test.json'));
    expect(deps).toEqual([
      '/components/w-action-sheet/index',
      '/components/w-popup/index',
      '/components/loginDialog/index',
    ]);
  });
});
