declare module 'better-opn';
declare module 'vis-network';

interface PostHtmlElem {
  tag: string;
  attrs?: {
    [key: string]: any;
  };
  content?: Array<string | PostHtmlElem>;
}
