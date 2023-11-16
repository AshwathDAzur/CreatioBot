

const { DialogBot } = require('./dialogBot');
const { ActionTypes, MessageFactory } = require('botbuilder');

class DialogAndWelcomeBot extends DialogBot {
    constructor(conversationState, userState, dialog) {
        super(conversationState, userState, dialog);

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; cnt++) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    // const reply = `Welcome to Complex Dialog Bot ${ membersAdded[cnt].name }. This bot provides a complex conversation, with multiple dialogs. Type anything to get started.`;
                    const reply = "Hai!";
                    await context.sendActivity(reply);
                    await this.sendSuggestedActions(context);
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }

    async sendSuggestedActions(turnContext) {
        const cardActions = [
            {
                type: ActionTypes.PostBack,
                title: 'Track my opportunities',
                value: 'case1',
                image: 'https://yt3.googleusercontent.com/ytc/APkrFKZgACbg3OJRRbl57caawHXmEgr0x03BoW1XMZJudg=s900-c-k-c0x00ffffff-no-rj',
                imageAltText: 'Creatio'
            },
            {
                type: ActionTypes.PostBack,
                title: 'Analyse my Sales',
                value: 'case2',
                image: 'https://yt3.googleusercontent.com/ytc/APkrFKZgACbg3OJRRbl57caawHXmEgr0x03BoW1XMZJudg=s900-c-k-c0x00ffffff-no-rj',
                imageAltText: 'Creatio'
            }
        ];
        var reply = MessageFactory.suggestedActions(cardActions);
        await turnContext.sendActivity(reply);
      }
}

module.exports.DialogAndWelcomeBot = DialogAndWelcomeBot;
