export class SilenceView {
    silenceStats = {
        time: {
            text: "Nagrano: ",
            unit: "s",
            stepsElapsed: 0,
            value: 0,
            roundFunction: (x) => x.toFixed(1),
        },
        min: {
            text: "Minimum: ",
            roundFunction: (x) => x ? x.toExponential(2) : "0",
            color: "rgb(80, 0, 80)"
        },
        max: {
            text: "Maksimum: ",
            roundFunction: (x) => x.toExponential(2),
            color: "rgb(128, 0, 0)"
        },
        mean: {
            text: "Średnia: ",
            roundFunction: (x) => x.toExponential(2),
            color: "rgb(104, 0, 40)"
        },
        range: {
            text: "Rozpiętość: ",
            unit: "dB",
            roundFunction: (x) => x.toFixed(2),
            color: "rgb(0, 0, 180)"
        }
    }

    constructor(div, timeRequired) {
        this.timeRequired = timeRequired;
        let divStack = div.querySelector(".center").querySelector(".stack");
        this.h2 = divStack.querySelector("h2");
        this.recordingStarted();
        // remove the p element
        divStack.querySelector("p").remove();
        let progressBar = document.createElement("div");
        progressBar.classList.add("progress-bar");
        divStack.appendChild(progressBar);
        let progress = document.createElement("div");
        progress.classList.add("progress");
        progressBar.appendChild(progress);
        this.progress = progress;
        // add multiple div.center elements to the stack
        for (let key in this.silenceStats) {
            let object = this.silenceStats[key];
            let element = object.element = document.createElement("div");
            element.classList.add("center");
            divStack.appendChild(element);
            let h3 = document.createElement("h3");
            h3.innerHTML = object.text;
            element.appendChild(h3);
            element.appendChild(document.createElement("hr"));
            let span = document.createElement("span");
            if (object.color) span.style.color = object.color
            element.appendChild(span);
            object.span = span;
            if (object.unit) {
                element.appendChild(document.createElement("hr"));
                let unit = document.createElement("span");
                if (object.color) unit.style.color = object.color
                unit.innerHTML = object.unit;
                element.appendChild(unit);
            }
        }
    }

    updateProgress(timeElapsed) {
        this.progress.style.width = timeElapsed >= this.timeRequired 
            ? "100%" 
            : (timeElapsed / this.timeRequired * 100) + "%";
    }

    recordingStarted() {
        this.h2.innerHTML = "Nagrywanie ciszy, nie odzywaj się...";
    }

    recordingStopped() {
        this.h2.innerHTML = "Nagrywanie ciszy wstrzymane.";
    }

    isNewStep(timeElapsed) {
        return 
    }

    update(intenistyStats) {
        this.silenceStats.time.value = intenistyStats.time;
        this.silenceStats.min.value = intenistyStats.zeroReached ? 0 : intenistyStats.min;
        this.silenceStats.max.value = intenistyStats.max;
        this.silenceStats.mean.value = intenistyStats.mean;
        this.silenceStats.range.value = intenistyStats.range;
        for (let key in this.silenceStats) {
            let object = this.silenceStats[key];
            object.span.innerHTML = object.roundFunction(object.value);
        }
    }
}