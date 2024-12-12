import Controller from './Controller.js';
import DataDownloadView from '../../view/DataDownloadView.js';
export default class DataDownloadController extends Controller {
    init(prev) {
        super.init(prev);
        this.view = new DataDownloadView(this);
    }
}
