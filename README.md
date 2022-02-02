# slack-notify

![Build Status](https://travis-ci.org/andrewchilds/slack-notify.svg?branch=master)

A simple, flexible, zero-dependency Node.js wrapper around the [Slack webhook API](https://api.slack.com). Makes it easy to send notifications to Slack from your application.

### Installation

```sh
npm install slack-notify
```

### Usage

```js

// Import module:

import SlackNotify from 'slack-notify';
const MY_SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/RANDOMCHARS';
const slack = SlackNotify(MY_SLACK_WEBHOOK_URL);

// Example sending just text, using the Slack-provided configuration:

slack.send('Hello!')
  .then(() => {
    console.log('done!');
  }).catch((err) => {
    console.error(err);
  });

// The Slack-provided configuration can be overridden:

slack.send({
  channel: '#myCustomChannelName',
  icon_url: 'http://example.com/my-icon.png',
  text: 'Here is my notification',
  unfurl_links: 1,
  username: 'Jimmy'
});

// Roll your own notification type:

var statLog = slack.extend({
  channel: '#statistics',
  icon_emoji: ':computer:',
  username: 'Statistics'
});

statLog({
  text: 'Current server statistics',
  fields: {
    'CPU usage': '7.51%',
    'Memory usage': '254mb'
  }
});

// Promises are supported:

slack.send('Hello!').then(() => {
  console.log('Done!');
}).catch((err) => {
  console.error('API error:', err);
})

// Three pre-configured methods are provided:

// Posts to #bugs by default:
slack.bug('Something broke!');

// Posts to #alerts by default:
slack.success('Something happened correctly!');
slack.alert('Something important!');

// Send custom fields which are nicely displayed by the Slack client:

slack.alert({
  text: 'Current server stats',
  fields: {
    'CPU usage': '7.51%',
    'Memory usage': '254mb'
  }
});

// The `fields` object is custom shorthand for the `attachments` array, which is also supported.

slack.alert({
  text: 'Current server stats',
  attachments: [
    {
      fallback: 'Required Fallback String',
      fields: [
        { title: 'CPU usage', value: '7.51%', short: true },
        { title: 'Memory usage', value: '254mb', short: true }
      ]
    }
  ]
});

```

### Running the Test Suite

```sh
npm install
npm test
```

### CJS / ESM support

This library supports CommonJS and ES Modules.

```js
// Require as Common JS:
const SlackNotify = require('slack-notify');

// Import as ES Module:
import SlackNotify from 'slack-notify';

// Either:
const slack = SlackNotify(MY_SLACK_WEBHOOK_URL);
```

### License

MIT. Copyright &copy; 2014-2022 Andrew Childs
