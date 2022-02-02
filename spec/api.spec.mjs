import SlackNotify from '../src/esm/index.mjs';

let slack = null;

describe('No URL passed in', () => {
  beforeEach(() => {
    slack = SlackNotify();
  });

  it('should catch that no URL is present', (done) => {
    slack.send('Hello!').catch((err) => {
      expect(err).toBe('No Slack URL configured.');
      done();
    });
  });
});

describe('API', () => {
  const url = 'https://myaccountname.slack.com/services/hooks/incoming-webhook?token=myToken';

  beforeEach(() => {
    slack = SlackNotify(url);
    spyOn(slack, 'request');
  });

  it('slack.send', () => {
    slack.send('Hello!')
    expect(slack.request).toHaveBeenCalledWith({
      text: 'Hello!',
    });
  });

  it('slack.success', () => {
    slack.success('foobar')
    expect(slack.request).toHaveBeenCalledWith({
      channel: '#alerts',
      icon_emoji: ':trophy:',
      username: 'Success',
      text: 'foobar'
    });
  });

  it('slack.bugs', () => {
    slack.bug('Oh no!')
    expect(slack.request).toHaveBeenCalledWith({
      channel: '#bugs',
      icon_emoji: ':bomb:',
      username: 'Bug',
      text: 'Oh no!'
    });
  });

  it('slack.alerts', () => {
    slack.alert('Foo!')
    expect(slack.request).toHaveBeenCalledWith({
      channel: '#alerts',
      icon_emoji: ':warning:',
      username: 'Alert',
      text: 'Foo!'
    });
  });

  it('slack.alerts with extra fields', () => {
    slack.alert({
      text: 'Hello!',
      fields: {
        IP: '123.123.123.123',
        sha: '2fd4e1c67a2d28fced849ee1bb76e7391b93eb12'
      }
    });

    expect(slack.request).toHaveBeenCalledWith({
      channel: '#alerts',
      username: 'Alert',
      text: 'Hello!',
      icon_emoji: ':warning:',
      attachments: [
        {
          fallback: 'Alert details',
          fields: [
            { title: 'IP', value: '123.123.123.123', short: true },
            { title: 'sha', value: '2fd4e1c67a2d28fced849ee1bb76e7391b93eb12', short: false }
          ]
        }
      ]
    });
  });

  it('slack.extend', () => {
    let foo = slack.extend({
      channel: '#foo',
      icon_emoji: ':saxophone:',
      username: 'Foo'
    });

    foo('Hello!');
    expect(slack.request).toHaveBeenCalledWith({
      channel: '#foo',
      icon_emoji: ':saxophone:',
      username: 'Foo',
      text: 'Hello!'
    });
  });

  it('slack.send with icon_url', () => {
    slack.send({
      text: 'Hello!',
      icon_url: 'http://something.com/icon.png'
    });

    expect(slack.request).toHaveBeenCalledWith({
      text: 'Hello!',
      icon_url: 'http://something.com/icon.png'
    });
  });

  it('slack.send with attachments and extra fields', () => {
    slack.send({
      text: 'Hello!',
      attachments: [
        {
          fallback: 'Fallback',
          fields: [
            { title: 'CPU %', value: '90%', short: true },
            { title: 'RAM %', value: '47%', short: true }
          ]
        }
      ],
      fields: {
        IP: '123.123.123.123',
        sha: '2fd4e1c67a2d28fced849ee1bb76e7391b93eb12'
      }
    });

    expect(slack.request).toHaveBeenCalledWith({
      text: 'Hello!',
      attachments: [
        {
          fallback: 'Fallback',
          fields: [
            { title: 'CPU %', value: '90%', short: true },
            { title: 'RAM %', value: '47%', short: true }
          ]
        },
        {
          fallback: 'Alert details',
          fields: [
            { title: 'IP', value: '123.123.123.123', short: true },
            { title: 'sha', value: '2fd4e1c67a2d28fced849ee1bb76e7391b93eb12', short: false }
          ]
        }
      ]
    });
  });
});
