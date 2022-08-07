declare module 'slack-notify' {
  interface SlackNofifier {
    send(args: string | SendArgs): Promise<void>;
  }

  interface SlackNotify extends SlackNofifier {
    extend(args: string | SendArgs): SlackNofifier;
    success(args: string | SendArgs): SlackNofifier;
    bug(args: string | SendArgs): SlackNofifier;
    alert(args: string | SendArgs): SlackNofifier;
  }

  interface SendArgs {
    text: string;
    channel?: string;
    icno_url?: string;
    icon_emoji?: string;
    unfurl_links?: number;
    username?: string;
    attachments?: SendAttachment[];
    fields?: { [key: string]: string }[];
  }

  interface SendAttachment {
    fallback: string;
    fields?: SendAttachmentField[];
  }

  interface SendAttachmentField {
    title: string;
    value: string;
    short: boolean;
  }

  function SlackNotifyFactory(webhookUrl: string): SlackNotify;

  export default SlackNotifyFactory;
}
