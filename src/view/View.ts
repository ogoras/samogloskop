import Controller from "../logic/controller/Controller.js";

export default class View {
    controller: Controller;

    constructor(controller: Controller) {
        if (this.constructor === View) throw new Error("Cannot instantiate abstract class View");
        if (!controller || !(controller instanceof Controller)) throw new Error("Controller must be an instance of Controller");
        this.controller = controller;
    }

    destroy?(): void;
}