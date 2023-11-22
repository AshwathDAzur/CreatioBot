
const {ComponentDialog, WaterfallDialog } = require('botbuilder-dialogs');
const {  CardFactory } = require('botbuilder');

const SALES_ANALYSIS_DIALOG  = 'SALES_ANALYSIS_DIALOG';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';


class SalesAnalysisDialog extends ComponentDialog {
    constructor() {
        super(SALES_ANALYSIS_DIALOG);

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.selectionStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async selectionStep(stepContext) {

        await this.displayOpportunityCards(stepContext);
        // await stepContext.context.sendActivity({
        //     attachments: [CardFactory.adaptiveCard(adaptiveCard)]
        // });
        return await stepContext.endDialog();
    }

    async displayOpportunityCards(step) {
            const card = this.createOpportunityCard();
            const message = { type: 'message', attachments: [card] };
            await step.context.sendActivity(message);
    }

    createOpportunityCard() {
        const adaptiveCard = CardFactory.adaptiveCard({
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "type": "AdaptiveCard",
            "version": "1.0",
            "body": [
              {
                "type": "Container",
                "items": [
                  {
                    "type": "TextBlock",
                    "text": "Approvals",
                    "weight": "bolder",
                    "size": "medium"
                  },
                  {
                    "type": "ColumnSet",
                    "columns": [
                      {
                        "type": "Column",
                        "width": "auto",
                        "items": [
                          {
                            "type": "Image",
                            "url": "https://spunknowndesign.files.wordpress.com/2020/11/kontentino_features_social_media_content_client_approvals.png",
                            "altText": "Creatio",
                            "size": "small",
                            "style": "person"
                          }
                        ]
                      },
                      {
                        "type": "Column",
                        "width": "stretch",
                        "items": [
                          {
                            "type": "TextBlock",
                            "text": "opportunity or approval title",
                            "weight": "bolder",
                            "wrap": true
                          },
                          {
                            "type": "TextBlock",
                            "spacing": "none",
                            "text": "Approval Date {{DATE(2017-02-14T06:08:39Z, SHORT)}}",
                            "isSubtle": true,
                            "wrap": true
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                "type": "Container",
                "items": [
                  {
                    "type": "TextBlock",
                    "text": "Small Description here...",
                    "wrap": true
                  },
                //   {
                //     "type": "FactSet",
                //     "facts": [
                //       {
                //         "title": "Board:",
                //         "value": "Adaptive Card"
                //       },
                //       {
                //         "title": "List:",
                //         "value": "Backlog"
                //       },
                //       {
                //         "title": "Assigned to:",
                //         "value": "Matt Hidinger"
                //       },
                //       {
                //         "title": "Due date:",
                //         "value": "Not set"
                //       }
                //     ]
                //   }
                ]
              }
            ],
            "actions": [
              {
                "type": "Action.ShowCard",
                "title": "Reject",
                "style": "destructive",
                "card": {
                  "type": "AdaptiveCard",
                  "body": [
                    {
                      "type": "Input.Text",
                      "id": "comment",
                      "isMultiline": true,
                      "placeholder": "Are you sure you want to reject the approval?"
                    }
                  ],
                  "actions": [
                    {
                      "type": "Action.Submit",
                      "title": "Reject"
                    },
                    {
                      "type": "Action.Submit",
                      "title": "Cancel"
                    }
                  ]
                }
              },
              {
                "type": "Action.Submit",
                "title": "Approve",
                "style": "positive",
              }
            ]
          }
          );
        return adaptiveCard;
    }

}

module.exports.SalesAnalysisDialog = SalesAnalysisDialog;
module.exports.SALES_ANALYSIS_DIALOG = SALES_ANALYSIS_DIALOG;
