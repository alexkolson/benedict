const request = require('request-promise');
const cheerio = require('cheerio');

const parseCommand = function (message) {
  const $ = cheerio.load(message);
  console.log({ $: $.html(), $a: $('at').html() });
};

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

const replyToUserBotMention = function (accessToken, serviceUrl, conversation, messageId, from, recipient, botCreatorId, botCreatorName) {
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
      text: 'Hello there <at>' + recipient.name + '</at>! Nice of you to say hello! \uD83D\uDC4B I am currently still under construction. <at>' + botCreatorName + '</at> is working on me I promise! I will soon be a good breakfast bot! The very best I can be! \uD83D\uDCAA',
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

module.exports = function (hook) {
  const {
    env: {
      MICROSOFT_APP_ID,
      MICROSOFT_APP_PASSWORD,
      MICROSOFT_BOT_AUTH_URL,
      BOT_CREATOR_ID,
      BOT_CREATOR_NAME,
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
        text: message,
        conversation,
        recipient: from,
        from: recipient,
      } = msTeamsPayload;

      return parseCommand(message);
      // return replyToUserBotMention(accessToken, serviceUrl, conversation, messageId, from, recipient, BOT_CREATOR_ID, BOT_CREATOR_NAME);
    })
    .then(function () {
      res.status = 200;
      res.end();
    })
    .catch(function (err) {
      console.log({ err });
      res.statusCode = 500;
      res.end();
    })

  // Command volunteer
  // Command rsvp
  // Command rsvps
  // If run from chron run proactive mesaging routine.
};
