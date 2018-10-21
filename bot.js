'use strict';

const crypto = require('crypto');
const { format } = require('util');
const request = require('request-promise');

const encrypt = function (ivLength, method, key, text) {
  let iv = crypto.randomBytes(ivLength);
  let cipher = crypto.createCipheriv(method, new Buffer(key), iv);
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

const decrypt = function (method, key, text) {
  let textParts = text.split(':');
  let iv = new Buffer(textParts.shift(), 'hex');
  let encryptedText = new Buffer(textParts.join(':'), 'hex');
  let decipher = crypto.createDecipheriv(method, new Buffer(key), iv);
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
};

const serializeError = function (err) {
  return JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)));
};

const getBearerToken = function (hook) {
  const {
    env: {
      MICROSOFT_BOT_AUTH_URL: authUrl,
      MICROSOFT_APP_ID: appId,
      MICROSOFT_APP_PASSWORD: appPassword,
      ENCRYPTION_METHOD: encMethod,
      ENCRYPTION_KEY: encKey,
      ENCRYPTION_IV_LENGTH: encIvLength,
    },
    datastore: store,
  } = hook;

  const authDataStoreKey = 'microsoftBotAccessToken';

  return new Promise(function (resolve, reject) {
    store.get(authDataStoreKey, function (err, encryptedAuthData) {
      if (err) {
        reject(err);
      }

      resolve(encryptedAuthData);
    });
  }).then(function (encryptedAuthData) {
    if (encryptedAuthData) {
      const authData = JSON.parse(decrypt(encMethod, encKey, encryptedAuthData));

      if (new Date(authData.expiresAt).getTime() > new Date().getTime()) {
        console.log({ msg: 'getBearerToken: returning access token from storage because it is still valid' });
        return authData.access_token;
      }
    }

    return request.post(authUrl, {
      form: {
        grant_type: 'client_credentials',
        client_id: appId,
        client_secret: appPassword,
        scope: 'https://api.botframework.com/.default',
      },
      json: true,
    }).then(function (authResponse) {
      authResponse.expiresAt = new Date().getTime() + (authResponse.expires_in * 1000);
      delete authResponse.expires_in;

      const encryptedAuthResponse = encrypt(parseInt(encIvLength, 10), encMethod, encKey, JSON.stringify(authResponse));

      return new Promise(function (resolve, reject) {
        store.set(authDataStoreKey, encryptedAuthResponse, function (err) {
          if (err) {
            reject(err);
          }

          resolve(authResponse);
        })
      }).then(function (authResponse) {
        console.log({ msg: 'getBearerToken: returning fresh access token from request because old access token was expired' });
        return authResponse.access_token;
      });
    });
  })
};

const acknowledgeRsvp = function (hook) {
};

const retrieveRsvpCount = function (hook) {

};

const acknowledgeVolunteer = function (hook) {
  return getBearerToken(hook);
};

const acknowledgeUnknownCommand = function (hook) {

}

const commandToActionMap = {
  rsvp: acknowledgeRsvp,
  rsvps: retrieveRsvpCount,
  volunteer: acknowledgeVolunteer,
};

const commands = Object.keys(commandToActionMap);

const parseCommand = function (message) {
  return message.replace(/<at>Benedict<\/at>/g, '').trim();
};

const handleMessagePayload = function (hook) {
  const {
    req: {
      body: payload,
    },
  } = hook;

  const { text: message } = payload;

  const command = parseCommand(message);

  if (commands.indexOf(command) === -1) {
    const unkownCommandErr = new Error(format('command: %s not a known benedict command.', command));
    unkownCommandErr.status = 404;
    throw unkownCommandErr;
  }

  console.log({ command });

  const { [command]: action } = commandToActionMap;

  return action(hook);
};

const payloadTypeToHandlerMap = {
  message: handleMessagePayload,
};

const replyToUserBotMention = function (hook) {
  const {
    serviceUrl,
    id: messageId,
    text: message,
    conversation,
    recipient: from,
    from: recipient,
  } = hook.req.body;

  const url = [serviceUrl, 'v3/', 'conversations/', conversation.id, '/', 'activities/', messageId].join('');

  console.log({ msg: 'About to post message from replyToUserBotMention', url });

  return request.post(url, {
    json: true,
    headers: {
      authorization: 'Bearer ' + accessToken,
    },
    body: {
      type: 'message',
      from,
      conversation,
      recipient,
      text: 'Hello there <at>' + recipient.name + '</at>! Nice of you to say hello! \uD83D\uDC4B',
      replyToId: messageId,
      entities: [
        {
          mentioned: {
            id: recipient.id,
            name: recipient.name,
          },
          text: '<at>' + recipient.name + '</at>',
          type: 'mention'
        },
        {
          mentioned: {
            id: botCreatorId,
            name: botCreatorName,
          },
          text: '<at>' + botCreatorName + '</at>',
          type: 'mention'
        },
      ],
    }
  });
};

module.exports = function bot(hook) {
  const {
    req: {
      body: payload
    }
  } = hook;

  console.log({ payload });


  const { [payload.type]: handler } = payloadTypeToHandlerMap;

  if (!handler) {
    const unkownPayloadTypeErr = new Error(format('payload: %s not something benedict knows how to handle.', payload.type));
    throw unkownPayloadTypeErr;
  }

  return handler(hook)
    .then(function () {
      res.status = 200;
      res.end();
    })
    .catch(function (err) {
      console.log({ err: serializeError(err) });
      res.statusCode = err.status || 500;
      res.end();
    });

  // Command volunteer
  // Command rsvp
  // Command rsvps
  // If run from chron run proactive mesaging routine.
};
