import Component from "../Component.js";
import DAILY_TARGET from "../../../const/TIME.js";
import convertSecondsToTimeString from "../../../logic/util/timeToString.js";

export default class TimeTableComponent extends Component {
    constructor(container, lsm) {
        super("time-table", null, container, "table");

        const tableHeader = document.createElement("tr");
        const dateHeader = document.createElement("th");
        dateHeader.innerHTML = "Data";
        const timeHeader = document.createElement("th");
        timeHeader.innerHTML = "Czas";
        tableHeader.appendChild(dateHeader);
        tableHeader.appendChild(timeHeader);
        this.appendChild(tableHeader);

        const timeSpent = lsm.timeSpentInTraining;
        const datesTrackedSoFar = Object.keys(timeSpent);
        datesTrackedSoFar.sort();
        for (const dateString of datesTrackedSoFar) {
            const time = timeSpent[dateString];
            const todayString = lsm.dateToString(new Date());
            const row = document.createElement("tr");
            const dateCell = document.createElement("td");
            dateCell.innerHTML = dateString;
            const timeCell = document.createElement("td");
            timeCell.innerHTML = `${convertSecondsToTimeString(Math.floor(time / 1000))}`;
            row.appendChild(dateCell);
            row.appendChild(timeCell);
            this.appendChild(row);
        }
    }
}