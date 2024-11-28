import Controller from "../Controller.js";
import ConsentView from "../../../view/ConsentView.js";
import proceedToController from "../proceedToController.js";

export default class ConsentController extends Controller {
    init({sm, lsm}) {
        this.sm = sm;
        this.lsm = lsm;

        this.view = new ConsentView(this);
    }

    choose(accepted) {
        this.lsm.dataConsentGiven = accepted;
        this.sm.advance();

        proceedToController(this);
    }
}