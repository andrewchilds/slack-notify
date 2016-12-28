/*

 slack-notify

 https://github.com/andrewchilds/slack-notify

 Usage:

 var MY_SLACK_WEBHOOK_URL = 'https://myaccountname.slack.com/services/hooks/incoming-webhook?token=myToken';
 var SLACK_CHANNEL = '#project_name';
 var USERNAME = '#bot_name';

 var slack = require('slack-notify')(MY_SLACK_WEBHOOK_URL)(SLACK_CHANNEL)(USERNAME);

 slack.critical('Something bad happened!');

 slack.send({
 channel: '#myCustomChannelName',
 icon_url: 'http://example.com/my-icon.png',
 text: 'Here is my notification',
 unfurl_links: 1,
 username: 'Jimmy'
 });

*/

var request = require('request');
var _ = require('lodash');

module.exports = function (url, slackChannel, username) {
    var pub = {};

    pub.request = function (data, done) {
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
        }, function(err, response) {
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

    pub.send = function (options, done) {
        if (_.isString(options)) {
            options = { text: options };
        }

        // Merge options with defaults
        var defaults = {
            username: 'Robot',
            text: '',
            icon_emoji: ':bell:'
        };
        var data = _.assign(defaults, options);

        // Move the fields into attachments
        if (options.fields) {
            if (!data.attachments) {
                data.attachments = [];
            }

            data.attachments.push({
                fallback: 'Alert details',
                fields: _.map(options.fields, function (value, title) {
                    return {
                        title: title,
                        value: value,
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

    pub.extend = function (defaults) {
        return function (options, done) {
            if (_.isString(options)) {
                options = { text: options };
            }

            pub.send(_.extend(defaults, options), done);
        };
    };

    /**
     * CRITICAL: Critical conditions. Exceptions.
     */
    pub.critical = pub.extend({
        channel: slackChannel,
        icon_emoji: ':fire_engine:',
        username: username
    });

    /**
     * WARNING: Exceptional occurrences that are not errors.
     */
    pub.warning = pub.extend({
        channel: slackChannel,
        icon_emoji: ':warning:',
        username: username
    });

    /**
     * INFO: Interesting events.
     */
    pub.info = pub.extend({
        channel: slackChannel,
        icon_emoji: ':information_source:',
        username: username
    });

    /**
     * DEBUG: Detailed debug information.
     */
    pub.debug = pub.extend({
        channel: slackChannel,
        icon_emoji: ':bug:',
        username: username
    });

    return pub;
};
