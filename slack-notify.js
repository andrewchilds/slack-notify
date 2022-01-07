import https from 'https';
import { Buffer } from 'buffer';

const NO_URL_ERROR = 'No Slack URL configured.';

function isString(str) {
  return typeof str === 'string';
}

export default (url) => {
  const pub = {};

  pub.request = (data) => {
    return new Promise((resolve, reject) => {
      if (!url) {
        return reject(NO_URL_ERROR);
      }

      post(url, JSON.stringify(data)).then((resBody) => {
        if (resBody !== 'ok') {
          reject(resBody);
        } else {
          resolve();
        }
      }).catch(reject);
    });
  };

  pub.send = (options) => {
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

    return pub.request(data);
  };

  pub.extend = (defaults) => (options) => {
    if (isString(options)) {
      options = { text: options };
    }

    return pub.send(Object.assign({}, defaults, options));
  };

  pub.success = pub.extend({
    channel: '#alerts',
    icon_emoji: ':trophy:',
    username: 'Success'
  });

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

  return pub;
};

// Based off of https://stackoverflow.com/a/50891354
function post(url, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: 'POST' }, (res) => {
      const chunks = [];
      res.on('data', data => chunks.push(data));
      res.on('end', () => {
        let resBody = Buffer.concat(chunks).toString();

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
