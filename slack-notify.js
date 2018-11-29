/*

slack-notify

https://github.com/andrewchilds/slack-notify

Usage:

var MY_SLACK_WEBHOOK_URL = 'https://myaccountname.slack.com/services/hooks/incoming-webhook?token=myToken';
var slack = require('slack-notify')(MY_SLACK_WEBHOOK_URL);

slack.alert('Something bad happened!');

slack.send({
  channel: '#myCustomChannelName',
  icon_url: 'http://example.com/my-icon.png',
  text: 'Here is my notification',
  unfurl_links: 1,
  username: 'Jimmy'
});

*/

const request = require('request');
const _ = require('lodash');

module.exports = url => {
  const pub = {};

  pub.request = (data, done) => {
    if (!url) {
      console.log('No Slack URL configured.');
      return false;
    }

    if (!_.isFunction(done)) {
      done = _.noop;
    }
    if (!_.isFunction(pub.onError)) {
      pub.onError = _.noop;
    }

    request.post(url, {
      form: {
        payload: JSON.stringify(data)
      }
    }, (err, response) => {
      if (err) {
        pub.onError(err);
        return done(err);
      }
      if (response.body !== 'ok') {
        pub.onError(new Error(response.body));
        return done(new Error(response.body));
      }

      done();
    });
  };

  pub.send = (options, done) => {
    if (_.isString(options)) {
      options = { text: options };
    }

    // Merge options with defaults
    const defaults = {
      username: 'Robot',
      text: '',
      icon_emoji: ':bell:'
    };
    const data = _.assign(defaults, options);

    // Move the fields into attachments
    if (options.fields) {
      if (!data.attachments) {
        data.attachments = [];
      }

      data.attachments.push({
        fallback: 'Alert details',
        fields: _.map(options.fields, (value, title) => ({
          title: title,
          value: value,
          short: (value + '').length < 25
        }))
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
    if (_.isString(options)) {
      options = { text: options };
    }

    pub.send(_.extend({}, defaults, options), done);
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
