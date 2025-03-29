import Controller from './Controller.js';
import DataDownloadView from '../../frontend/view/DataDownloadView.js';

export default class DataDownloadController extends Controller {
    init(prev) {
        super.init(prev);
        this.view = new DataDownloadView(this);
    }

    downloadData() {
        this.lsm.saveToFile("samogloskop_wyniki.json");
    }
}