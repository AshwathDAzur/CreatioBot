const { ComponentDialog,
     NumberPrompt, 
     TextPrompt, 
     WaterfallDialog, 
     ConfirmPrompt } = require('botbuilder-dialogs');

const { CardFactory } = require('botbuilder');
const { UserChoice } = require('../userchoice');
const { Opportunity } = require('../opportunity');
const axios = require('axios');

const TOP_LEVEL_DIALOG = 'TOP_LEVEL_DIALOG';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const TEXT_PROMPT = 'TEXT_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
var Selectedoppid = "";
var changestageid = "";

class TopLevelDialog extends ComponentDialog {
    constructor() {
        super(TOP_LEVEL_DIALOG);
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.initiateopportunitytracking.bind(this),
            this.userchoiceStep.bind(this),
            this.ConfirmStep.bind(this),
            this.trackopportunityStep.bind(this),
            this.userStagechoiceStep.bind(this),
            this.ConfirmStagechangeStep.bind(this),
            this.StagechangeStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async initiateopportunitytracking(step) {
        step.values.OpportunityInfo = new Opportunity();

        const cookie = await this.getauthorizestep();
        if (cookie) {
            let bpmCsrfValue = null;
            for (const cookieValue of cookie) {
                if (cookieValue.startsWith('BPMCSRF=')) {
                    bpmCsrfValue = cookieValue.split('=')[1].split(';')[0];
                    break;
                }
            }
            if (bpmCsrfValue) {
                const response = await this.getopportunitylist(bpmCsrfValue, cookie, step);
                if (response === 'succeeded') {
                    await step.context.sendActivity('Listing your opportunities...');
                    await this.displayOpportunityCards(step);
                } else {
                    await step.context.sendActivity('Get Opportunity list failed');
                }
                return await step.next();
            } else {
                await step.context.sendActivity('BPMCSRF header not found in the response.');
            }
        } else {
            await step.context.sendActivity('BPMCSRF header not found in the response.');
        }
        // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is the end.
        return await step.endDialog();
    }

    async getauthorizestep() {
        const url = 'https://139261-crm-bundle.creatio.com/ServiceModel/AuthService.svc/Login';
        const requestBody = JSON.stringify({
            UserName: 'Supervisor',
            UserPassword: 'Ashwath@2k',
        });

        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json; charset=utf-8',
            'ForceUseSession': true
        };
        try {
            const response = await axios.post(url, requestBody, { headers });
            const responseheaders = response.headers;
            const setcookie = responseheaders['set-cookie'];
            return setcookie;
        } catch (error) {
            console.log(error);
            return 'An error occurred during the request.';
        }
    }

    async getopportunitylist(BPMCSRF, cookie, step) {
        const cookiesString = cookie.join(';');
        const url = 'https://139261-crm-bundle.creatio.com/0/odata/opportunity';
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: url,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'ForceUseSession': 'true',
                'BPMCSRF': BPMCSRF,
                'Cookie': cookiesString
            },
        };
        try {
            const response = await axios.request(config);
            if (response.status === 200) {
                const opportunities = response.data.value;
                opportunities.forEach(opp => {
                    step.values.OpportunityInfo.opportunities.push(opp);
                });
                return 'succeeded';
            } else {
                console.log(`Request failed with status code: ${response.status}`);
                return 'Get Opportunity list failed';
            }
        } catch (error) {
            console.log(error);
            return 'An error occurred during the request.';
        }
    }

    async displayOpportunityCards(step) {
        const opportunities = step.values.OpportunityInfo.opportunities;
        if (opportunities && opportunities.length > 0) {
            const card = this.createOpportunityCard(opportunities);
            const message = { type: 'message', attachments: [card] };
            await step.context.sendActivity(message);
        } else {
            await step.context.sendActivity('No opportunities found.');
        }
    }

    createOpportunityCard(opportunities) {
        const body = opportunities.map(opp => ({
            "type": "ActionSet",
            "actions": [
                {
                    "type": "Action.Submit",
                    "title": opp.Title,
                    "data": opp.Title
                }
            ]
        }));
        const adaptiveCard = CardFactory.adaptiveCard({
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "type": "AdaptiveCard",
            "version": "1.0",
            "body": body,
        });
        return adaptiveCard;
    }

    async userchoiceStep(stepContext) {
        stepContext.values.userInfo = new UserChoice();
        const promptOptions = { prompt: 'Please Select the Opportunity to track...' };
        return await stepContext.prompt(TEXT_PROMPT, promptOptions);
    }

    async ConfirmStep(stepContext) {
        console.log(stepContext.result);
        stepContext.values.userInfo.oppchoice = stepContext.result;
        return await stepContext.prompt(CONFIRM_PROMPT, `Do you want to proceed tracking **${stepContext.values.userInfo.oppchoice}**`, ['Yes', 'No']);
    }

    async trackopportunityStep(stepContext) {
        const dispchoice = stepContext.result;
        if(dispchoice)
        {
            stepContext.values.OpportunityInfo.opportunities.forEach( opp =>{
                if(opp.Title===stepContext.values.userInfo.oppchoice)
                {
                    Selectedoppid = opp.Id;
                    const curstage = this.getcurrentstage(opp)
                    const card = this.createSelectedOpportunityCard(opp,curstage);
                    const message = { type: 'message', attachments: [card] };
                    stepContext.context.sendActivity(message);
                }
            })
        }
        else
        {
            await stepContext.context.sendActivity("Oho");
        }
        return await stepContext.next();
    }

    getcurrentstage(opp){
        let curstage = "";
        switch(opp.StageId)
        {
            case '241ade6b-4256-4947-ba8a-7d96988a97b6':
                curstage = "Proposal development";
                break;
            case '2a6de0f7-44d9-4b8a-bce6-acddb7ed8915':
                curstage = "Needs analysis";
                break;
            case '325f0619-0ee0-df11-971b-001d60e938c6':
                curstage = "Presentation";
                break;
            case '423774cb-5ae6-df11-971b-001d60e938c6':
                curstage = "Proposal";
                break;
            case '60d5310c-5be6-df11-971b-001d60e938c6':
                curstage = "Closed won";
                break;
            case '736f54fd-e240-46f8-8c7c-9066c30aff59':
                curstage = "Closed rejected";
                break;
            case '9abf243c-fc00-45cf-8e28-cdb66c9208b0':
                curstage = "Closed rerouted";
                break;
            case 'a9aafdfe-2242-4f42-8cd5-2ae3b9556d79':
                curstage = "Closed lost";
                break;
            case 'c2067b11-0ee0-df11-971b-001d60e938c6':
                curstage = "Qualification";
                break;
            case 'd2bd3194-7bf1-4431-89fb-1bee03425270':
                curstage = "Proposal development";
                break;
            case 'f4e4a00b-ec48-46d0-9ea0-c2b502165ee9':
                curstage = "Id. decision makers";
                break;
            case 'f808c955-c5aa-4aba-95c0-ba7d584d2f32':
                curstage = "Negotiations";
                break;               
            case 'fb563df2-5ae6-df11-971b-001d60e938c6':
                curstage = "Contracting";
                break;
        }
        return  curstage;
    }

    createSelectedOpportunityCard(opp, curstage) {
        const adaptiveCard = CardFactory.adaptiveCard({
          "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
          "type": "AdaptiveCard",
          "version": "1.0",
          "body": [
            {
              "speak": "Tom's Pie is a Pizza restaurant which is rated 9.3 by customers.",
              "type": "ColumnSet",
              "columns": [
                {
                  "type": "Column",
                  "width": 2,
                  "items":  [
                    {
                      "type": "TextBlock",
                      "text": "Opportunity Overview",
                      "weight": "bolder",
                      "size": "extraLarge",
                      "spacing": "none"
                    },
                    {
                      "type": "TextBlock",
                      "text": opp.Title
                    },
                    {
                      "type": "TextBlock",
                      "text": `Current Stage: **${curstage}**`,
                      "weight": "bolder",
                      "spacing": "none"
                    }
                  ]
                },
                {
                  "type": "Column",
                  "width": 1,
                  "items": [
                    {
                      "type": "Image",
                      "url": "https://yt3.googleusercontent.com/ytc/APkrFKZgACbg3OJRRbl57caawHXmEgr0x03BoW1XMZJudg=s900-c-k-c0x00ffffff-no-rj",
                      "size": "auto"
                    }
                  ]
                }
              ]
            }
          ],
          "actions": [
            {
              "type": "Action.Submit",
              "title":"Qualification",
              "data": "Qualification"
            },
            {
                "type": "Action.Submit",
                "title":"Presentation",
                "data": "Presentation"
            },
            {
                "type": "Action.Submit",
                "title":"Proposal",
                "data": "Proposal"
            },
            {
                "type": "Action.Submit",
                "title":"Contracting",
                "data": "Contracting"
            },
            {
                "type": "Action.Submit",
                "title":"Closed won",
                "data": "Closed won"
            },
            {
                "type": "Action.Submit",
                "title":"Closed lost",
                "data": "Closed lost"
            }
          ]
        });
        return adaptiveCard;
      }

    async userStagechoiceStep(stepContext) {
        stepContext.values.userInfo = new UserChoice();
        const promptOptions = { prompt: 'Opportunity Tracked...' };
        return await stepContext.prompt(TEXT_PROMPT, promptOptions);
    }

    async ConfirmStagechangeStep(stepContext) {
        console.log(stepContext.result);
        stepContext.values.userInfo.oppchoice = stepContext.result;
        changestageid = this.getstageid(stepContext.values.userInfo.oppchoice);
        // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog.
        return await stepContext.prompt(CONFIRM_PROMPT, `Do you want to change the stage to **${stepContext.values.userInfo.oppchoice}**`, ['Yes', 'No']);
    }

     getstageid(stagename){
        let cid = "";
        switch(stagename)
        {
            case 'Qualification':
                cid = "c2067b11-0ee0-df11-971b-001d60e938c6";
                break;
            case 'Presentation':
                cid = "325f0619-0ee0-df11-971b-001d60e938c6";
                break;
            case 'Proposal':
                cid = "423774cb-5ae6-df11-971b-001d60e938c6";
                break;
            case 'Contracting':
                cid = "fb563df2-5ae6-df11-971b-001d60e938c6";
                break;
            case 'Closed won':
                cid = "60d5310c-5be6-df11-971b-001d60e938c6";
                break;
            case 'Closed lost':
                cid = "a9aafdfe-2242-4f42-8cd5-2ae3b9556d79";
                break;
        }
        return  cid;
    }

    async StagechangeStep(stepContext) {
        const dispchoice = stepContext.result;
        if(dispchoice)
        {
            const cookie = await this.getauthorizestep();
            if (cookie) {
                let bpmCsrfValue = null;
                for (const cookieValue of cookie) {
                    if (cookieValue.startsWith('BPMCSRF=')) {
                        bpmCsrfValue = cookieValue.split('=')[1].split(';')[0];
                        break;
                    }
                }
                if (bpmCsrfValue) {
                    const response = await this.changestage(bpmCsrfValue, cookie);
                    if (response === 'succeeded') {
                        await stepContext.context.sendActivity("Opportunity stage changed...");
                    } else {
                        await stepContext.context.sendActivity('Change Opportunity stage failed');
                    }
                    return await stepContext.next();
                } else {
                    await stepContext.context.sendActivity('BPMCSRF header not found in the response.');
                }
            } else {
                await stepContext.context.sendActivity('BPMCSRF header not found in the response.');
            }
        }
        else
        {
            await stepContext.context.sendActivity("Oho");
        }
        return await stepContext.next();
    }

    async changestage(BPMCSRF, cookie)
    {
       const cookiesString = cookie.join(';');

       let data = JSON.stringify({
        "StageId": changestageid
         });

        let config = {
           method: 'patch',
           maxBodyLength: Infinity,
           url: `https://139261-crm-bundle.creatio.com/0/odata/opportunity(${Selectedoppid})`,
           headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'ForceUseSession': 'true',
            'BPMCSRF': BPMCSRF,
            'Cookie': cookiesString
            },
            data : data
        };
        try {
            const response = await axios.request(config);
            if (response.status === 204) {
                return 'succeeded';
            } else {
                console.log(`Request failed with status code: ${response.status}`);
                return 'Change opportunity stage failed';
            }
        } catch (error) {
            console.log(error);
            return 'An error occurred during the request.';
        }
    }

}

module.exports.TopLevelDialog = TopLevelDialog;
module.exports.TOP_LEVEL_DIALOG = TOP_LEVEL_DIALOG;
