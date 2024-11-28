import Controller from "../Controller.js";
import ConsentView from "../../../view/ConsentView.js";
import proceedToController from "../procedToController.js";

export default class ConsentController extends Controller {
    init({sm, lsm}) {
        this.sm = sm;
        this.lsm = lsm;

        this.view = new ConsentView(this);
    }

    choose(accepted) {
        this.lsm.accepted = accepted;
        this.sm.advance();

        proceedToController(this);
    }
}