import Controller from "../Controller.js";
import ConsentView from "../../../view/ConsentView.js";
import nextController from "../nextController.js";

export default class ConsentController extends Controller {
    init({sm, lsm}) {
        this.sm = sm;
        this.lsm = lsm;

        this.view = new ConsentView(this);
    }

    choose(accepted) {
        this.lsm.dataConsentGiven = accepted;
        this.sm.advance();

        nextController(this);
    }
}