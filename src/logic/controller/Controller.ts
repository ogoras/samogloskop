import Singleton from "../../Singleton.js";
import StateMachine from "../StateMachine.js";
import LocalStorageMediator from "../../model/LocalStorageMediator.js";

export default class Controller extends Singleton {
    sm?: StateMachine;
    lsm?: LocalStorageMediator;
    [index: string]: any;

    get state () {
        return this.sm?.state;
    }

    get stateName() {
        return this.sm?.state?.name;
    }

    constructor() {
        super();

        if (this.constructor === Controller) {
            throw new Error("Controller is an abstract class and cannot be instantiated directly.");
        }
    }

    init({sm, lsm}: {sm?: StateMachine, lsm?: LocalStorageMediator}, ...args: any[]) {
        if (!sm || !lsm) throw new Error("StateMachine and LocalStorageMediator are required");
        this.sm = sm;
        this.lsm = lsm;
    }

    protected validate() {
        if (!this.sm) {
            throw new Error("StateMachine not initialized");
        } else if (!this.state) {
            throw new Error("State not found");
        } else if (!this.stateName) {
            throw new Error("State name not found");
        }
        if (!this.lsm) throw new Error("LocalStorageMediator not initialized");
    }
}