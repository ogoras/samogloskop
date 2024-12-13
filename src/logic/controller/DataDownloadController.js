import Controller from './Controller.js';
import DataDownloadView from '../../view/DataDownloadView.js';

export default class DataDownloadController extends Controller {
    init(prev) {
        super.init(prev);
        this.view = new DataDownloadView(this);
    }

    downloadData() {
        // save lsm data as JSON
        const json = this.lsm.getJSON();
        const blob = new Blob([json], { type: "application/json" });
        // begin download automatically
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "samogloskop_wyniki.json";
        a.click();
        URL.revokeObjectURL(url);
    }
}