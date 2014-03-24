/*

slack-notify
https://github.com/andrewchilds/slack-notify

*/

var exec = require('child_process').exec;
var _ = require('lodash');

module.exports = function (url) {
  var pub = {};

  pub.request = function (data) {
    if (!url) {
      console.log('No Slack URL configured.');
      return false;
    }

    var command = "curl -X POST --data 'payload=" + JSON.stringify(data) + "' " + url;
    exec(command, function (err, stdout, stderr) {
      if (err) {
        console.log('Error while sending Slack request:', err);
      }
    });
  };

  pub.send = function (options) {
    if (_.isString(options)) {
      options = { text: options };
    }

    var data = {
      channel: options.channel || '#general',
      username: options.username || 'Robot',
      text: options.text || '',
      icon_emoji: options.icon_emoji || ':bell:'
    };

    if (options.fields) {
      data.attachments = [{
        fallback: 'Alert details',
        fields: _.map(options.fields, function (value, title) {
          return {
            title: title,
            value: value,
            short: (value + '').length < 25
          };
        })
      }];
    }

    pub.request(data);
  };

  pub.extend = function (defaults) {
    return function (options) {
      if (_.isString(options)) {
        options = { text: options };
      }

      pub.send(_.extend(defaults, options));
    };
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
