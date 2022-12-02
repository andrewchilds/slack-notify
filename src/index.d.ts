declare module 'slack-notify' {
  export interface SlackNotifier {
    send(args: string | SendArgs): Promise<void>;
  }

  export interface SlackNotify extends SlackNotifier {
    extend(args: string | SendArgs): SlackNotifier;
    success(args: string | SendArgs): Promise<void>;
    bug(args: string | SendArgs): Promise<void>;
    alert(args: string | SendArgs): Promise<void>;
  }

  export interface SendArgs {
    text: string;
    blocks?: any;
    channel?: string;
    icon_url?: string;
    icon_emoji?: string;
    unfurl_links?: number;
    username?: string;
    attachments?: SendAttachment[];
    fields?: { [key: string]: string };
  }

  export interface SendAttachment {
    fallback: string;
    color: string;
    fields?: SendAttachmentField[];
  }

  export interface SendAttachmentField {
    title: string;
    value: string;
    short: boolean;
  }

  export function SlackNotifyFactory(webhookUrl: string): SlackNotify;

  export default SlackNotifyFactory;
}
