// Copyright (c) Microsoft Corporation. All rights reserved.

// Licensed under the MIT License.

 

const { ActionTypes, ActivityHandler, CardFactory } = require('botbuilder');

const WELCOMED_USER = 'welcomedUserProperty';

class DialogBot extends ActivityHandler {

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

            const didBotWelcomedUser = await this.welcomedUserProperty.get(context, false);

           if (didBotWelcomedUser === false) {
               // The channel should send the user name in the 'From' object
                const userName = context.activity.from.name;
                console.log(username)
                await context.sendActivity('You are seeing this message because this was your first message ever sent to this bot.');
                await context.sendActivity(`It is a good practice to welcome the user and provide personal greeting. For example, welcome ${ userName }.`);
           }
                // Set the flag indicating the bot handled the user's first message.
                await this.welcomedUserProperty.set(context, true);
            
           
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

 

module.exports.DialogBot = DialogBot;