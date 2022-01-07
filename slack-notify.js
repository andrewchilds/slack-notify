/*

slack-notify

https://github.com/andrewchilds/slack-notify

Usage:

import SlackNotify from 'slack-notify';
const MY_SLACK_WEBHOOK_URL = 'https://myaccountname.slack.com/services/hooks/incoming-webhook?token=myToken';
const slack = SlackNotify(MY_SLACK_WEBHOOK_URL);

slack.alert('Something bad happened!');

slack.send({
  channel: '#myCustomChannelName',
  icon_url: 'http://example.com/my-icon.png',
  text: 'Here is my notification',
  unfurl_links: 1,
  username: 'Jimmy'
});

*/

import https from 'https';
import { Buffer } from 'buffer';

function isFunction(fn) {
  return typeof fn === 'function';
}

function isString(str) {
  return typeof str === 'string';
}

function noop() {
}

export default (url) => {
  const pub = {};

  pub.request = (data, done) => {
    if (!isFunction(done)) {
      done = noop;
    }

    if (!url) {
      console.error('No Slack URL configured.');
      return done('No Slack URL configured.');
    }

    if (!isFunction(pub.onError)) {
      pub.onError = noop;
    }

    post(url, JSON.stringify(data)).then((resBody) => {
      if (resBody !== 'ok') {
        pub.onError(new Error(resBody));
        return done(new Error(resBody));
      }
      done();
    }).catch((err) => {
      pub.onError(err);
      done(err);
    });
  };

  pub.send = (options, done) => {
    if (isString(options)) {
      options = { text: options };
    }

    const data = Object.assign({}, options);

    // Move the fields into attachments
    if (options.fields) {
      if (!data.attachments) {
        data.attachments = [];
      }

      data.attachments.push({
        fallback: 'Alert details',
        fields: Object.values(options.fields).map((value, index) => {
          const title = Object.keys(options.fields)[index];

          return {
            title,
            value,
            short: (value + '').length < 25
          };
        })
      });

      delete(data.fields);
    }

    // Remove the default icon_emoji if icon_url was set in options. Otherwise the default emoji will always override the url
    if (options.icon_url && !options.icon_emoji) {
      delete(data.icon_emoji);
    }

    pub.request(data, done);
  };

  pub.extend = defaults => (options, done) => {
    if (isString(options)) {
      options = { text: options };
    }

    pub.send(Object.assign({}, defaults, options), done);
  };

  pub.bug = pub.extend({
    channel: '#bugs',
    icon_emoji: ':bomb:',
    username: 'Bug'
  });

  pub.alert = pub.extend({
    channel: '#alerts',
    icon_emoji: ':warning:',
    username: 'Alert'
  });

  pub.note = pub.extend({
    channel: '#alerts',
    icon_emoji: ':bulb:',
    username: 'Note'
  });

  pub.success = pub.extend({
    channel: '#alerts',
    icon_emoji: ':trophy:',
    username: 'Hoorah'
  });

  return pub;
};

// Based off of https://stackoverflow.com/a/50891354
function post(url, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: 'POST' }, (res) => {
      const chunks = [];
      res.on('data', data => chunks.push(data));
      res.on('end', () => {
        let resBody = Buffer.concat(chunks);
        switch (res.headers['content-type']) {
          case 'application/json':
            resBody = JSON.parse(resBody);
            break;
          }
        resolve(resBody);
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(body);
    }
    req.end();
  });
}
