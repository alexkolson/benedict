# Benedict - The Microsoft Teams Breakfast Bot
Where I work we eat breakfast together every Friday and the preperation process goes something like this:
    - Someone volunteers to bring breakfast
    - A survey is sent out via our collaboration system by the volunteer to determine how many people are going to come to breakfast
    - The volunteer uses this information to then bring enough breakfast for everyone who signed up

As one of the main volunteers, I got tired of the repetitive task of making the survey, sending it out to everyone, and then periodically checking the survey responses in order to prepare for bringing breakfast.
I built this bot to automate the processes of volunteering & gathering RSVPs.

## Functionality
If nobody has volunteerd to bring breakfast by Thursday of the current week at 3PM, the bot posts a question the the configured
team and channel asking if anyone would like to volunteer for breakfast. Ideally, someone volunteers and the process continues.
If no one volunteers by Friday at 2AM, it is assumed that no one will be volunteering and the bot does nothing further. In the case
where someone volunteers before Friday at 2AM by using the `/volunteer` slash command or by responding to the bot's question, the bot
then sends a message to the configured channel and team asking who will be attending breakfast. All members of the team can then respond
with "yes" and, optionallly, if they will be bringing any guests. RSVP's close Friday at 2AM. The bot then sends the volunteer a personal
message containing the RSVP'd headcount Friday at 7AM.

### Commands
- Volunteer commands:
    - `volunteer` - Tell the bot you wish to volunteer to bring breakfast on the next coming Friday
    - `rsvps` - Retrieve the current RSVP count for breakfast
- Attendee commands:
    - `rsvp`- Tell the bot you are coming to breakfast on the next coming Friday. If nobody has as of yet volunteered to bring breakfast, the bot will tell you as much and this command will do nothing.
## Messages
- "Nobody has signed up to bring breakfast, would you like to?"
    - Sent to the configured team & channel on Thursday of the current week at 3PM when nobody has volunteered by using `/volunteer`.
    - Possible user responses:
        - Click on the "yes" button to tell the bot you are volunteering to bring breakfast.

- "Are you coming to breakfast tomorrow?"
    - Sent to the configured team & channel when somebody has volunteered to bring breakfast and the bot needs to gather RSVP's
    - Possible user responses:
        - Click on the "yes" button to tell the bot you are coming
        - Click on the "no" button to tell the bot you are not coming
        - If you do not click at all by Friday at 2AM it is an assumed "no" RSVP.
