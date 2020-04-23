// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// index.js is used to setup and configure your bot

// Import required pckages
const path = require('path');
const restify = require('restify');
const BotConnector = require('botframework-connector');

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
const { BotFrameworkAdapter, ConversationState,MemoryStorage,UserState } = require('botbuilder');

const { TeamsConversationBot } = require('./bots/teamsConversationBot');

const { UserProfileDialog } = require('./dialogs/userProfileDialog');
//const { TeamsConversationBot } = require('./bots/dialogBot');

// Read botFilePath and botFileSecret from .env file.
const ENV_FILE = path.join(__dirname, '.env');
require('dotenv').config({ path: ENV_FILE });

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

BotConnector.MicrosoftAppCredentials.trustServiceUrl('https://smba.trafficmanager.net/za/');


adapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    // NOTE: In production environment, you should consider logging this to Azure
    //       application insights.
    console.error(`\n [onTurnError] unhandled error: ${ error }`);

    // Send a trace activity, which will be displayed in Bot Framework Emulator
    await context.sendTraceActivity(
        'OnTurnError Trace',
        `${ error }`,
        'https://www.botframework.com/schemas/error',
        'TurnError'
    );

    // Send a message to the user
    await context.sendActivity('The bot encountered an error or bug.');
    await context.sendActivity('To continue to run this bot, please fix the bot source code.');
};

const memoryStorage = new MemoryStorage();

 

// Create conversation state with in-memory storage provider.

const conversationState = new ConversationState(memoryStorage);

const userState = new UserState(memoryStorage);

 

// Create the main dialog.

const dialog = new UserProfileDialog(userState);

//const bot = new DialogBot(conversationState, userState, dialog);

// Create the bot that will handle incoming messages.
const bot = new TeamsConversationBot(conversationState, userState, dialog);

// Create HTTP server.
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log(`\n${ server.name } listening to ${ server.url }`);
});

// Listen for incoming requests.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        await bot.run(context);
    });
});
