// Copyright (c) Microsoft Corporation. All rights reserved.

// Licensed under the MIT License.



const {
    MessageFactory,
    TeamsInfo,
    CardFactory,
    TurnContext,
    Builder
} = require('botbuilder');

const {

    AttachmentPrompt,

    ChoiceFactory,

    ChoicePrompt,



    ComponentDialog,

    ConfirmPrompt,

    DialogSet,

    DialogTurnStatus,

    NumberPrompt,

    TextPrompt,

    WaterfallDialog

} = require('botbuilder-dialogs');

const {
    channels
} = require('botbuilder-dialogs/lib/choices/channel');

const {
    UserProfile
} = require('../userProfile');





const ATTACHMENT_PROMPT = 'ATTACHMENT_PROMPT';

const CHOICE_PROMPT = 'CHOICE_PROMPT';

const CONFIRM_PROMPT = 'CONFIRM_PROMPT';

const NAME_PROMPT = 'NAME_PROMPT';

const NUMBER_PROMPT = 'NUMBER_PROMPT';

const USER_PROFILE = 'USER_PROFILE';

const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

const WELCOMED_USER = 'welcomedUserProperty';



class UserProfileDialog extends ComponentDialog {

    constructor(userState) {

        super('userProfileDialog');



        this.userProfile = userState.createProperty(USER_PROFILE);

        this.welcomedUserProperty = userState.createProperty(WELCOMED_USER);

        this.addDialog(new TextPrompt(NAME_PROMPT));

        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));

        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));

       


        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [


            this.helloStep.bind(this),
            this.cpStep.bind(this),

            this.contactNumberStep.bind(this),



            this.choiceStep1.bind(this),

            this.choiceStep2.bind(this),

            this.ticketStep.bind(this),

            this.summaryStep.bind(this),
        


        ]));



        this.initialDialogId = WATERFALL_DIALOG;

    }



    /**

     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.

     * If no dialog is active, it will start the default dialog.

     * @param {*} turnContext

     * @param {*} accessor

     */

    async run(turnContext, accessor) {

        const dialogSet = new DialogSet(accessor);

        dialogSet.add(this);




        // const userName = turnContext.activity.from.name;
        // console.log(userName)



        // const member = await TeamsInfo.getMember(turnContext, turnContext.activity.from.id);
        // console.log(member.givenName)
        // console.log(member.email)

        // fullName = member.name
        // userEmail = member.email







        const dialogContext = await dialogSet.createContext(turnContext);



        const results = await dialogContext.continueDialog();

        if (results.status === DialogTurnStatus.empty) {

            await dialogContext.beginDialog(this.id);

        }

    }

    async helloStep(step) {

        const didBotWelcomedUser = await this.welcomedUserProperty.get(step.context, false);

        const member = await TeamsInfo.getMember(step.context, step.context.activity.from.id);
            step.values.currentID = step.context.activity.conversation.id

            step.values.name = member.name;
            step.values.email = member.email;

            console.log(member)

        if (didBotWelcomedUser === false) {
            // The channel should send the user name in the 'From' object

            

            await step.context.sendActivity(`Hello ${ member.givenName }, please provide the following details:`);

            


        }

        await this.welcomedUserProperty.set(step.context, true);

        return await step.next();











    }




    async cpStep(step) {

        console.log(`values step: ${step}`)

        // const userName2 = dialogContext.activity.from.name;
        //console.log(`Email ${member.email}`)

        //step.values.transport = step.result.value;

        return await step.prompt(NAME_PROMPT, 'Please enter your CP number.');

    }



    async contactNumberStep(step) {

        step.values.cpNumber = step.result;

        //step.values.transport = step.result.value;

        return await step.prompt(NAME_PROMPT, 'Please enter your contact number');

    }







    async choiceStep1(step) {

        step.values.contactNumber = step.result;

        console.log(step.values.contactNumber)

        // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog.

        // Running a prompt here means the next WaterfallStep will be run when the user's response is received.

        return await step.prompt(CHOICE_PROMPT, {

            prompt: 'Please select one of the following:',

            choices: ChoiceFactory.toChoices(['Troubleshooting', 'Logging a ticket', 'Other'])

        });

    }



    async choiceStep2(step) {

        step.values.choiceStep1 = step.result;

        console.log(step.values.choiceStep1)

        if (step.values.choiceStep1.value === "Logging a ticket") {

            // User said "yes" so we will be prompting for the age.

            // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog.

            return await step.prompt(CHOICE_PROMPT, {

                prompt: 'Please select one of the following options:',

                choices: ChoiceFactory.toChoices(['PC\\Laptop issues', 'Printer issues', 'Other'])

            });

        } else if (step.values.choiceStep1 === "Troubleshooting") {

            // User said "yes" so we will be prompting for the age.

            // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog.

            return await step.prompt(CHOICE_PROMPT, {

                prompt: 'Please select one of the following options:',

                choices: ChoiceFactory.toChoices(['PC\\Laptop issues', 'Printer issues', 'Other'])

            });

        } else {

            // User said "no" so we will skip the next step. Give -1 as the age.

            return await step.next(-1);

        }

    }



    async ticketStep(step) {

        step.values.choiceStep2 = step.result;

        console.log(`choice2 selection: ${step.values.choiceStep2.value}`)



        const validChoices = ['PC\\Laptop issues', 'Printer issues', 'Other'];



        if (validChoices.includes(step.values.choiceStep2.value)) {

            console.log("true")

            // User said "yes" so we will be prompting for the age.

            // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog.

            return await step.prompt(NAME_PROMPT, 'Please provide a description of the issue.');

        } else {

            console.log("false")

            // User said "no" so we will skip the next step. Give -1 as the age.

            return await step.next(-1);

        }

    }




    async troubleshootingStep(step) {

        step.values.choiceStep2 = step.result;

        console.log(`choice2 selection: ${step.values.choiceStep2.value}`)



        const validChoices = ['PC\\Laptop issues', 'Printer issues', 'Other'];



        if (validChoices.includes(step.values.choiceStep2.value)) {

            console.log("true")

            // User said "yes" so we will be prompting for the age.

            // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog.

            return await step.prompt(NAME_PROMPT, 'Please provide a description of the issue.');

        } else {

            console.log("false")

            // User said "no" so we will skip the next step. Give -1 as the age.

            return await step.next(-1);

        }

    }









    async summaryStep(step) {

        step.values.description = step.result;

        if (step.result) {

            // Get the current profile object from user state.

            const userProfile = await this.userProfile.get(step.context, new UserProfile());

            //console.log(`Email ${member.email}`)


            userProfile.name = step.values.name;
            userProfile.email = step.values.email;
            userProfile.choiceStep1 = step.values.choiceStep1;

            userProfile.choiceStep2 = step.values.choiceStep2;

            userProfile.description = step.values.description;

            userProfile.cpNumber = step.values.cpNumber;

            userProfile.contactNumber = step.values.contactNumber;

            //fullName = member.name


            // let msg = `Thank You

            // The following details will be logged: 

            // Name: ${userProfile.name}

            // CP NUMBER: ${userProfile.cpNumber}

            // EMAIL: ${userProfile.email}

            // CONTACT NUMBER: ${userProfile.contactNumber}

            // CHOICE 1: ${userProfile.choiceStep1.value}

            // CHOICE 2: ${userProfile.choiceStep2.value}

            // DESCRIPTION: ${userProfile.description}

            // `;

            //  await step.context.sendActivity(msg);

            var displayButtons = [ 

            {
                type: 'openUrl',
                title: 'Confirm',
                value: 'https://azure.microsoft.com/en-us/pricing/details/bot-service/',
                channelData: ''
            },
            {
                type: 'openUrl',
                title: 'Cancel',
                value: 'https://azure.microsoft.com/en-us/pricing/details/bot-service/'
            }]



            let heading = "Thank you, a ticket with the following information will be logged:"
            await step.context.sendActivity({
                attachments: [this.createReceiptCard(userProfile, heading)]
            });

             const teamsChannel = '19:38279f2769d34b1689c7fcbd9eefc2f4@thread.tacv2';
  //  const teamsChannel = '19:bfb91b25d0094c3d91d7862b1fd536b8@thread.tacv2';
            const serviceUrl = 'https://smba.trafficmanager.net/za/';

            step.context.activity.conversation.id = teamsChannel;
            step.context.activity.serviceUrl = serviceUrl;

            displayButtons = []
            console.log(`userPF : ${userProfile}`)
             await step.context.sendActivity({
                loggedDetails:userProfile,
                attachments: [this.createReceiptCard(userProfile, "Ticket logged with the following information:", displayButtons)]
            });
            //   await step.context.sendActivity(msg);


            //set id of channel back to original value.
            step.context.activity.conversation.id = step.values.currentID;

            await step.context.sendActivity(`Please press any key on your keyboard to initiate another chat session.`);












        } else {

            await step.context.sendActivity('An error occurred');

        }

        //return await step.next();

        return await step.endDialog();

        // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is the end.



    }

  

    createReceiptCard(userProfile, title,displayButtons) {
        return CardFactory.receiptCard({
            title: title,
            facts: [{
                    key: 'Name',
                    value: userProfile.name
                },
                {
                    key: 'Username',
                    value: userProfile.cpNumber
                },
                {
                    key: 'Email',
                    value: userProfile.email
                },
                {
                    key: 'Contact Number',
                    value: userProfile.contactNumber
                },
                {
                    key: 'Selection 1',
                    value: userProfile.choiceStep1.value
                },
                {
                    key: 'Selection 2',
                    value: userProfile.choiceStep2.value
                },
                {
                    key: 'Description',
                    value: userProfile.description
                }
            ],



            buttons: CardFactory.actions(displayButtons)
        });
    }

}



module.exports.UserProfileDialog = UserProfileDialog;