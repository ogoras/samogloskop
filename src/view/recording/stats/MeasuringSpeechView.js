import StatsView from './StatsView.js';
import MeasuringStackComponent from '../../components/stack/MeasuringStackComponent.js';
import { assertTrue } from '../../../logic/util/asserts.js';

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
        if (recycle) {
            const state = "WAITING_FOR_SPEECH";
            assertTrue(controller.sm.state.is(state), `Recycling ${StatsView.name} into ${this.constructor.name} assumes the state is ${state}`);
        } else {
            assertTrue(controller.sm.state.is("SPEECH_MEASURED"), `Restoring ${this.constructor.name} with state ${controller.sm.state} is not supported`);
        }

        this.stackComponent = new MeasuringStackComponent(this.stackComponent, controller.calibrationTime, recycle);
    }

    finish() {
        this.stackComponent.finish();
    }

    destroy() {
        this.stackComponent.removeAllExceptH2();
    }
}