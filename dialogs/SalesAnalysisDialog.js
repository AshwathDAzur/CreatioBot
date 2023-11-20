
const {ComponentDialog, WaterfallDialog } = require('botbuilder-dialogs');
const {  CardFactory } = require('botbuilder');

const SALES_ANALYSIS_DIALOG  = 'SALES_ANALYSIS_DIALOG';

const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

const adaptiveCard = require('../Assets/ImageGalleryCard.json');
const sampledata = require('../Data/data.json');


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
        await stepContext.context.sendActivity({
            attachments: [CardFactory.adaptiveCard(adaptiveCard)]
        });
        return await stepContext.endDialog();
    }

    async displayOpportunityCards(step) {
            const card = this.createOpportunityCard(sampledata);
            const message = { type: 'message', attachments: [card] };
            await step.context.sendActivity(message);
    }

    createOpportunityCard(sampledata) {
        const adaptiveCard = CardFactory.adaptiveCard({
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "type": "AdaptiveCard",
            "version": "1.0",
            "body": [
              {
                "type": "TextBlock",
                "text": "Your registration is almost complete",
                "size": "medium",
                "weight": "bolder",
                "wrap": true,
                "style": "heading"
              },
              {
                "type": "TextBlock",
                "text": "What type of food do you prefer?",
                "wrap": true
              },
              {
                "type": "ImageSet",
                "imageSize": "medium",
                "images": [
                  {
                    "type": "Image",
                    "url": `${sampledata.hasMenu.hasMenuSection[0].image}`,
                    "altText": `${sampledata.hasMenu.hasMenuSection[0].name}`
                  },
                  {
                    "type": "Image",
                    "url": `${sampledata.hasMenu.hasMenuSection[0].hasMenuSection[0].image}`,
                    "altText": `${sampledata.hasMenu.hasMenuSection[0].hasMenuSection[0].name}`
                  },
                  {
                    "type": "Image",
                    "url": `${sampledata.hasMenu.hasMenuSection[0].hasMenuSection[1].image}`,
                    "altText": `${sampledata.hasMenu.hasMenuSection[0].hasMenuSection[1].name}`
                  }
                ]
              }
            ],
            "actions": [
              {
                "type": "Action.ShowCard",
                "title": `${sampledata.hasMenu.hasMenuSection[0].name}`,
                "card": {
                  "type": "AdaptiveCard",
                  "body": [
                    {
                      "type": "Input.ChoiceSet",
                      "id": "SteakTemp",
                      "style": "expanded",
                      "label": `${sampledata.hasMenu.hasMenuSection[0].description}`,
                      "isRequired": true,
                      "errorMessage": "Please select one of the above options",
                      "choices": [
                        {
                          "title": "Rare",
                          "value": "rare"
                        },
                        {
                          "title": "Medium-Rare",
                          "value": "medium-rare"
                        },
                        {
                          "title": "Well-done",
                          "value": "well-done"
                        }
                      ]
                    },
                    {
                      "type": "Input.Text",
                      "id": "SteakOther",
                      "isMultiline": true,
                      "label": "Any other preparation requests?"
                    }
                  ],
                  "actions": [
                    {
                      "type": "Action.Submit",
                      "title": "OK",
                      "data": {
                        "FoodChoice": "Steak"
                      }
                    }
                  ],
                  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json"
                }
              },
              {
                "type": "Action.ShowCard",
                "title": `${sampledata.hasMenu.hasMenuSection[0].hasMenuSection[0].name}`,
                "card": {
                  "type": "AdaptiveCard",
                  "body": [
                    {
                      "type": "Input.Toggle",
                      "id": "ChickenAllergy",
                      "valueOn": "noPeanuts",
                      "valueOff": "peanuts",
                      "title": "I'm allergic to peanuts",
                      "label": `${sampledata.hasMenu.hasMenuSection[0].hasMenuSection[0].description}`
                    },
                    {
                      "type": "Input.Text",
                      "id": "ChickenOther",
                      "isMultiline": true,
                      "label": "Any other preparation requests?"
                    }
                  ],
                  "actions": [
                    {
                      "type": "Action.Submit",
                      "title": "OK",
                      "data": {
                        "FoodChoice": "Chicken"
                      }
                    }
                  ],
                  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json"
                }
              },
              {
                "type": "Action.ShowCard",
                "title": `${sampledata.hasMenu.hasMenuSection[0].hasMenuSection[1].name}`,
                "card": {
                  "type": "AdaptiveCard",
                  "body": [
                    {
                      "type": "Input.Toggle",
                      "id": "Vegetarian",
                      "title": "Please prepare it vegan",
                      "label": `${sampledata.hasMenu.hasMenuSection[0].hasMenuSection[1].description}`,
                      "valueOn": "vegan",
                      "valueOff": "notVegan"
                    },
                    {
                      "type": "Input.Text",
                      "id": "VegOther",
                      "isMultiline": true,
                      "label": "Any other preparation requests?"
                    }
                  ],
                  "actions": [
                    {
                      "type": "Action.Submit",
                      "title": "OK",
                      "data": {
                        "FoodChoice": "Vegetarian"
                      }
                    }
                  ],
                  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json"
                }
              }
            ]
          });
        return adaptiveCard;
    }

}

module.exports.SalesAnalysisDialog = SalesAnalysisDialog;
module.exports.SALES_ANALYSIS_DIALOG = SALES_ANALYSIS_DIALOG;
