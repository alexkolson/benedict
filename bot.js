const request = require('request-promise');

const getBearerToken = function (authUrl, appId, appPassword) {
  return request.post(authUrl, {
    form: {
      grant_type: 'client_credentials',
      client_id: appId,
      client_secret: appPassword,
      scope: 'https://api.botframework.com/.default',
    },
    json: true,
  }).then(function (authResponse) {
    return authResponse.access_token;
  });
};

const replyToUserBotMention = function (accessToken, serviceUrl, conversation, messageId, from, recipient) {
  const url = [serviceUrl, 'apis/v3/', 'conversations/', encodeURIComponent(conversation.id), '/', 'activities/', messageId].join('');

  console.log({ msg: 'About to post message from replyToUserBotMention', url });

  return request.post(url, {
    json: true,
    headers: {
      authorization: 'bearer ' + accessToken,
    },
    body: {
      type: 'message',
      from,
      conversation,
      recipient,
      text: 'Hello there @' + recipient.name + '! \uD83D\uDC4B I am currently still under construction. @Alex Olson is working on me I promise! I will soon be a good breakfast bot! The very best I can be! \uD83D\uDCAA',
      replyToId: messageId,
    }
  });
};

module.exports = function (hook) {
  const {
    env: {
      MICROSOFT_APP_ID,
      MICROSOFT_APP_PASSWORD,
      MICROSOFT_BOT_AUTH_URL,
    },
    params,
    req: {
      method: reqMethod,
      body: msTeamsPayload,
    },
    res,
  } = hook;

  console.log({ msTeamsPayload });

  getBearerToken(MICROSOFT_BOT_AUTH_URL, MICROSOFT_APP_ID, MICROSOFT_APP_PASSWORD)
    .then(function (accessToken) {
      // Reply to user and tell them we are stil being built...
      const {
        serviceUrl,
        id: messageId,
        conversation,
        recipient: from,
        from: recipient,
      } = msTeamsPayload;

      return replyToUserBotMention(accessToken, serviceUrl, conversation, messageId, from, recipient);
    })
    .then(function () {
      res.status = 200;
      res.end();
    })
    .catch(function (err) {
      console.log({ err: err.message });
      res.statusCode = 500;
      res.end();
    })

  // Command volunteer
  // Command rsvp
  // Command rsvps
  // If run from chron run proactive mesaging routine.
};