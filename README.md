# slack-notify

![Build Status](https://travis-ci.org/andrewchilds/slack-notify.png?branch=master)

A simple, flexible Node.js wrapper around the [Slack webhook API](https://api.slack.com). Makes it easy to send notifications to Slack from your application.

### Installation

```sh
npm install slack-notify
```

### Usage

```js

// Require module:

var MY_SLACK_WEBHOOK_URL = 'https://myaccountname.slack.com/services/hooks/incoming-webhook?token=myToken';
var slack = require('slack-notify')(MY_SLACK_WEBHOOK_URL);

// Included notification types:

slack.bug('Something bad happened!'); // Posts to #bugs by default

slack.success('Something good happened!'); // Posts to #alerts by default

slack.alert('Something important happened!'); // Posts to #alerts by default

slack.note('Here is a note.'); // Posts to #alerts by default

// Send custom fields which are nicely displayed by the Slack client:

slack.alert({
  text: 'Current server stats',
  fields: {
    'CPU usage': '7.51%',
    'Memory usage': '254mb'
  }
});

// Everything is overridable:

slack.send({
  channel: '#myCustomChannelName',
  icon_emoji: ':zap:',
  text: 'Here is my notification',
  username: 'Jimmy'
});

// Or roll your own notification type:

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

```

### Running the Test Suite

```sh
npm install
npm test
```

### License

MIT. Copyright &copy; 2014 Andrew Childs.
