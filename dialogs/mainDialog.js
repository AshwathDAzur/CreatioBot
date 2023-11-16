const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog} = require('botbuilder-dialogs');
const { ActionTypes, MessageFactory } = require('botbuilder');
const { TopLevelDialog, TOP_LEVEL_DIALOG } = require('./topLevelDialog');
const { SalesAnalysisDialog, SALES_ANALYSIS_DIALOG} = require('./SalesAnalysisDialog');


const MAIN_DIALOG = 'MAIN_DIALOG';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const USER_PROFILE_PROPERTY = 'USER_PROFILE_PROPERTY';


class MainDialog extends ComponentDialog {
    constructor(userState) {
        super(MAIN_DIALOG);
        this.userState = userState;
        this.userProfileAccessor = userState.createProperty(USER_PROFILE_PROPERTY);

        this.addDialog(new TopLevelDialog());
        this.addDialog(new SalesAnalysisDialog());
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.initialStep.bind(this),
            this.finalStep.bind(this)
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
    
        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
    
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        } else if (results.status === DialogTurnStatus.complete) {
            await dialogContext.endDialog();
        }
    }
    

    async initialStep(stepContext) {
        const userInput = stepContext.context.activity.text;
        if(userInput==="case1" || userInput==="opportunity")
        {
            return await stepContext.beginDialog(TOP_LEVEL_DIALOG);
        }
        else if (userInput === "case2")
        {
             await stepContext.beginDialog(SALES_ANALYSIS_DIALOG);
             return await stepContext.endDialog();
        }
        else
        {
            await stepContext.context.sendActivity("Sorry I cannot understand!");
            await stepContext.context.sendActivity("Things I can help you with are...");
            await this.sendSuggestedActions(stepContext.context);
            return await stepContext.endDialog();
        }
    }

    async finalStep(stepContext) {
        await stepContext.context.sendActivity("Things I can help you with are...");
        await this.sendSuggestedActions(stepContext.context);
        return await stepContext.endDialog();
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

module.exports.MainDialog = MainDialog;
module.exports.MAIN_DIALOG = MAIN_DIALOG;
