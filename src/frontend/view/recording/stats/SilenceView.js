import StatsView from "./StatsView.js";
import SilenceStackComponent from "../../../components/stack/SilenceStackComponent.js";

export default class SilenceView extends StatsView {
    constructor(controller, recorder, prev) {
        super(controller, recorder, prev);
        
        this.stackComponent = new SilenceStackComponent(this.stackComponent, controller.calibrationTime);   
    }
}