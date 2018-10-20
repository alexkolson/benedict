const { format } = require('util');

const request = require('request-promise');

const serializeError = function (err) {
  return JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)));
};

const acknowledgeRsvp = function (hook) {
};

const retrieveRsvpCount = function (hook) {

};

const acknowledgeVolunteer = function (hook) {

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
  console.log({ payload: hook.req.body });

  const command = parseCommand(message);

  if (commands.indexOf(command) === -1) {
    const unkownCommadnErr = new Error(format('command: %s not a known benedict command.', command));
    unkownCommadnErr.status = 404;
    throw unkownCommadnErr;
  }

  console.log({ command });

  const { [command]: action } = commandToActionMap;

  return action(hook)
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
