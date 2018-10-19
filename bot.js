

module.exports = (hook) => {
  const {
    env: {
    },
    params,
    req: {
      method: reqMethod,
      body: msTeamsPayload,
    },
    res,
  } = hook;
  console.log({ msTeamsPayload });

  res.statusCode(500);
  res.end();
  // Command volunteer
  // Command rsvp
  // Command rsvps
  // If run from chron run proactive mesaging routine.
};