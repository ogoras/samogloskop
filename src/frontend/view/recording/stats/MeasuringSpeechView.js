import StatsView from './StatsView.js';
import MeasuringStackComponent from '../../../components/stack/MeasuringStackComponent.js';
import { assertTrue } from '../../../../logic/util/asserts.js';

export default class MeasuringSpeechView extends StatsView {
     /**
     * @param {boolean} value
     */
     set speechDetected(value) {
        this.stackComponent.speechDetected = value;
        this.recordingStarted();
    }

    constructor(controller, recorder, prev) {
        super(controller, recorder, prev);

        const recycle = prev instanceof StatsView;
        let stateToRecycle = null;
        if (recycle) {
            stateToRecycle = controller.sm.state;
        } else {
            assertTrue(controller.sm.state.is("SPEECH_MEASURED"), `Restoring ${this.constructor.name} with state ${controller.sm.state} is not supported`);
        }

        this.stackComponent = new MeasuringStackComponent(this.stackComponent, controller.calibrationTime, stateToRecycle);
    }

    finish() {
        this.stackComponent.finish();
    }

    destroy() {
        this.stackComponent.removeAllExceptH2();
    }
}