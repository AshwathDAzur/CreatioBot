
const {ComponentDialog, WaterfallDialog } = require('botbuilder-dialogs');
const {  CardFactory } = require('botbuilder');

const SALES_ANALYSIS_DIALOG  = 'SALES_ANALYSIS_DIALOG';

const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const adaptiveCard = require('../Assets/Creatio.json');
const adaptiveCard1 = require('../Assets/FlightItineraryCard.json');
const adaptiveCard2 = require('../Assets/ImageGalleryCard.json');
const adaptiveCard3 = require('../Assets/LargeWeatherCard.json');
const adaptiveCard4 = require('../Assets/SolitaireCard.json');

class SalesAnalysisDialog extends ComponentDialog {
    constructor() {
        super(SALES_ANALYSIS_DIALOG);

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.selectionStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async selectionStep(stepContext) {
        await stepContext.context.sendActivity({
            attachments: [CardFactory.adaptiveCard(adaptiveCard2)]
        });
        return await stepContext.endDialog();
    }

}

module.exports.SalesAnalysisDialog = SalesAnalysisDialog;
module.exports.SALES_ANALYSIS_DIALOG = SALES_ANALYSIS_DIALOG;
