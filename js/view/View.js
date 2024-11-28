import Controller from "../logic/controller/Controller.js";
import Singleton from "../Singleton.js";

export default class View {
    constructor(controller) {
        // super();

        if (this.constructor === View) throw new Error("Cannot instantiate abstract class View");
        if (!controller || !(controller instanceof Controller)) throw new Error("Controller must be an instance of Controller");
        this.controller = controller;
    }
}