import detective from '../../../detective/miniprogram/wxml';

describe('wxml works', () => {
  it('support include tag', () => {
    const template = `
      <import src="a.wxml"/>
      <template name="B">
        <text> B template </text>
      </template>
    `;
    const deps = detective(template);
    expect(deps).toEqual(['a.wxml']);
  });

  it('support include tag', () => {
    const template = `
    <include src="header.wxml"/>
    <view> body </view>
    <include src="footer.wxml"/>
    `;
    const deps = detective(template);
    expect(deps).toEqual(['header.wxml', 'footer.wxml']);
  });

  it('support wxs tag', () => {
    const template = `
      <view> {{tools.msg}} </view>
      <view> {{tools.bar(tools.FOO)}} </view>
      <wxs src="./../tools.wxs" module="tools" />
      <wxs module="foo">
        var some_msg = "hello world";
        module.exports = {
          msg : some_msg,
        }
      </wxs>
    `;
    const deps = detective(template);
    expect(deps).toEqual(['./../tools.wxs']);
  });
});
