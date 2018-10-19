const request = require('request-promise');

const getBearerToken = async (authUrl, appId, appPassword) => {
  const authResponse = await request.post(authUrl, {
    form: {
      grant_type: 'client_credentials',
      client_id: appId,
      client_secfret: appPassword,
      scope: 'https://api.botframework.com/.default',
    }
  });

  console.log({ authResponse });
};

module.exports = async (hook) => {
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

  await getBearerToken(MICROSOFT_BOT_AUTH_URL, MICROSOFT_APP_ID, MICROSOFT_APP_PASSWORD);

  res.status(200);
  res.end();
  // Command volunteer
  // Command rsvp
  // Command rsvps
  // If run from chron run proactive mesaging routine.
};