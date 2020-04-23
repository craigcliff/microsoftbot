// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const {
    ActivityHandler,
    TurnContext,
    MessageFactory,
    TeamsInfo,
    TeamsActivityHandler,
    CardFactory,
    ActionTypes
} = require('botbuilder');
const TextEncoder = require('util').TextEncoder;
const WELCOMED_USER = 'welcomedUserProperty';

class TeamsConversationBot extends TeamsActivityHandler {

    /**

     *

     * @param {ConversationState} conversationState

     * @param {UserState} userState

     * @param {Dialog} dialog

     */

    constructor(conversationState, userState, dialog) {

        super();

        if (!conversationState) throw new Error('[DialogBot]: Missing parameter. conversationState is required');

        if (!userState) throw new Error('[DialogBot]: Missing parameter. userState is required');

        if (!dialog) throw new Error('[DialogBot]: Missing parameter. dialog is required');



        this.conversationState = conversationState;

        this.welcomedUserProperty = userState.createProperty(WELCOMED_USER);

        this.userState = userState;

        this.dialog = dialog;

        this.dialogState = this.conversationState.createProperty('DialogState');



        this.onMessage(async (context, next) => {



            console.log('Running dialog with Message Activity......');

            // const didBotWelcomedUser = await this.welcomedUserProperty.get(context, false);

            // if (didBotWelcomedUser === false) {
            //     // The channel should send the user name in the 'From' object

            //     const member = await TeamsInfo.getMember(context, context.activity.from.id);
            //     console.log(context.activity)
            //     console.log(member)
            //     await context.sendActivity(`Hello ${ member.givenName }, please provide the following details:`);

              
                
              
            // }
            // Set the flag indicating the bot handled the user's first message.
           // await this.welcomedUserProperty.set(context, true);
            // Run the Dialog with the new message Activity.

            await this.dialog.run(context, this.dialogState);



            await next();

        });

    }



    /**

     * Override the ActivityHandler.run() method to save state changes after the bot logic completes.

     */

    async run(context) {

        await super.run(context);



        // Save any state changes. The load happened during the execution of the Dialog.

        await this.conversationState.saveChanges(context, false);

        await this.userState.saveChanges(context, false);

    }

}

module.exports.TeamsConversationBot = TeamsConversationBot;