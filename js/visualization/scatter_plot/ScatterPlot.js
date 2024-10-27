import PointGroup from "./PointGroup.js";

export default class ScatterPlot {
    margin = { top: 10, right: 30, bottom: 30, left: 60 };
    domainDefined = false;
    allPointsGroup = null;
    x = {
        domain: [0, 100],
        range: [,,],
        scale: null,
        g: null
    };
    y = {
        domain: [0, 100],
        range: [,,],
        scale: null,
        g: null
    };
    svg = null;
    g = null;
    #lastSeriesId = 0;

    constructor(elementId, flip = false, unit = null) {
        let [flipX, flipY] = [ this.flipX, this.flipY ] = parseFlipParameter(flip);
        this.margin = {
            top: flipY ? 30 : 10,
            right: flipX ? 60 : 30,
            bottom: flipY ? 10 : 30,
            left: flipX ? 30 : 60
        }
        this.unit = unit ? {
            element: null,
            text: unit
        } : null;
        
        this.parent = document.getElementById(elementId);
        this.drawAxes();

        window.addEventListener("resize", () => {
            this.svg.attr("display", "none");
            this.drawAxes();
            this.svg.attr("display", "block");
            this.rescalePoints(0, 0);
            this.rescalePoints(0, 1);
        });
    }

    drawAxes() {
        let [flipX, flipY] = [ this.flipX, this.flipY ];
        this.width = this.parent.clientWidth - this.margin.left - this.margin.right;
        this.height = this.parent.clientHeight - this.margin.top - this.margin.bottom;
        
        this.svg ??= d3.select(`#${this.parent.id}`).append("svg");
        this.svg.attr("width", this.parent.clientWidth)
            .attr("height", this.parent.clientHeight)

        this.g ??= this.svg.append("g");
        this.g.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
            .attr("id", "plot");

        this.x.scale ??= d3.scaleLinear().domain(this.x.domain)
        this.x.scale.range(flipX ? [this.width, 0] : [0, this.width]);

        this.x.g ??= this.g.append("g")
        this.x.g.attr("transform", `translate(0, ${flipY ? 0 : this.height})`)
            .call(flipY ? d3.axisTop(this.x.scale) : d3.axisBottom(this.x.scale));

        this.y.scale ??= d3.scaleLinear().domain(this.y.domain)
        this.y.scale.range(flipY ? [0, this.height] : [this.height, 0]);

        this.y.g ??= this.g.append("g");
        this.y.g.attr("transform", `translate(${flipX ? this.width : 0}, 0)`)
            .call(flipX ? d3.axisRight(this.y.scale) : d3.axisLeft(this.y.scale));

        this.allPointsGroup ??= new PointGroup({g: this.g});

        if (!this.unit) return;

        this.unit.element ??= this.g.append("text")
            .attr("font-family", "Helvetica, sans-serif")
            .text(this.unit.text);
        this.unit.element.attr("transform", `translate(${flipX ? this.width + 5 : -5}, ${flipY ? -5 : this.height + 5})`)
    }

    addSeries(series, growSize = false, capacity = undefined) {
        this.insertSeries(series, this.allPointsGroup.length, growSize, capacity);
    }

    insertSeries(series, ids, growSize = false, capacity = undefined) {
        // insert series at this.series[ids[0]][ids[1]]...[ids[ids.length - 1]]
        if (typeof ids === "number") {
            ids = [ids];
        } else if (!Array.isArray(ids)) {
            throw new Error(`insertSeries: ids must be a number or an array, got ${ids} which is of type ${typeof ids} instead`);
        }
        let seriesId = ids[0];
        let group = ids.reduce((acc, id) => acc.getOrCreate(id), this.allPointsGroup);
        group.growSize = growSize;
        group.capacity = capacity;
        // this.series.splice(seriesId, 0, {
        //     g: this.plotArea.insert("g", `#id-${this.series[seriesId]?.id}`).attr("id", `id-${++this.#lastSeriesId}`),
        //     id: this.#lastSeriesId,
        //     points: [],
        //     growSize,
        //     capacity
        // });
        for (let point of series ?? []) {
            this.addPoint(point, group, 0);
        }
    }

    addPoint(point, group, animationMs = 200, rescale = true) {
        if (typeof group === "number") {
            group = this.allPointsGroup[group];
        }
        if (rescale) this.resizeIfNeeded(point, animationMs);
        group.push({
            element: group.g.append("path")
                .attr("d", d3.symbol(point.symbol ?? d3.symbolCircle).size(point.size ?? 64))
                .attr("transform", `translate(${this.x.scale(point.x)}, ${this.y.scale(point.y)})`)
                .attr("fill", point.color ? point.color : "black"),
            x: point.x,
            y: point.y,
            label: point.label ? group.g.append("text")
                .attr("font-weight", "bold")
                .attr("style", `text-shadow:${" 0 0 0.3em #fff,".repeat(5).slice(0, -1)}`)
                .attr("font-family", "Helvetica, sans-serif")
                .text(point.label)
                .attr("x", this.x.scale(point.x))
                .attr("y", this.y.scale(point.y) - 10)
                .attr("fill", point.color ? point.color : "black") : null,
        });
        
        if (group.capacity && group.length > group.capacity) {
            let removed = group.shift();
            removed.element.remove();
        }
        let pointCount = group.length;
        if (group.growSize) {
            for (let i = 0; i < pointCount; i++) {
                let point = group[i];
                point.element.attr("r", (i + 1) / pointCount * 3);
            }
        }
    }

    setSeriesSingle(point, seriesId = -1, animationMs = 50, rescale = true) {
        if (seriesId < 0) seriesId = this.allPointsGroup.length + seriesId;
        if (rescale) this.resizeIfNeeded(point, animationMs);
        let group = this.allPointsGroup[seriesId];
        if (!group.length) return this.addPoint(point, group, 0);
        group[0].element.transition()
            .duration(animationMs)
            .attr("transform", `translate(${this.x.scale(point.x)}, ${this.y.scale(point.y)})`)
            .attr("d", d3.symbol(point.symbol ?? d3.symbolCircle).size(point.size ?? 64))
            .attr("fill", point.color ? point.color : "black");
    }

    resizeIfNeeded(point, animationMs = 200) {
        let xChanged = this.resizeDomain(0, point.x);
        let yChanged = this.resizeDomain(1, point.y);
        if (xChanged || yChanged) this.transition(xChanged, yChanged, animationMs);
        this.domainDefined = true;
    }

    resizeDomain(axisId, value) {
        let axis = axisId ? this.y : this.x;
        let domain = axis.domain;
        let range = axis.range;
        let changed = false;
        if (this.domainDefined) {
            if (value < range[0]) {
                range[0] = value;
                changed = true;
            } else if (value > range[1]) {
                range[1] = value;
                changed = true;
            }
            if (changed) {
                let length = range[1] - range[0];
                domain[0] = range[0] - length * 0.1;
                domain[1] = range[1] + length * 0.1;
            }
        }
        else {
            range[0] = domain[0] = value;
            range[1] = domain[1] = value;
            changed = true;
        }
        if (changed) {
            let axisScale = axis.scale;
            axisScale.domain(domain);
        }
        return changed;
    }

    transition(xChanged, yChanged, animationMs) {
        let [flipX, flipY] = [ this.flipX, this.flipY ];
        let t = d3.transition().duration(animationMs);
        if (xChanged) this.x.g.transition(t)
                .call(flipY ? d3.axisTop(this.x.scale) : d3.axisBottom(this.x.scale));
        if (yChanged) this.y.g.transition(t)
                .call(flipX ? d3.axisRight(this.y.scale) : d3.axisLeft(this.y.scale));
        this.rescalePoints(t);
    }

    rescalePoints(t) {
        for (let group of this.allPointsGroup) {
            for (let point of group) {
                point.element.transition(t)
                    .attr("transform", `translate(${this.x.scale(point.x)}, ${this.y.scale(point.y)})`);
                point.label?.transition(t)
                    .attr("x", this.x.scale(point.x))
                    .attr("y", this.y.scale(point.y) - 10);
            }
        }
    }

    feed(point, seriesId = -1, rescale = true) {
        if (seriesId < 0) seriesId = this.allPointsGroup.length + seriesId;
        this.addPoint(point, seriesId, undefined, rescale);
    }

    clearSeries(seriesId) {
        if (seriesId < 0) seriesId = this.allPointsGroup.length + seriesId;
        if (!this.allPointsGroup[seriesId]) return;
        for (let point of this.allPointsGroup[seriesId].points) {
            point.element.remove();
            point.label?.remove();
        }
        this.allPointsGroup[seriesId].points = [];
    }

    setSeriesVisibility(visible, ...seriesIds) {
        for (let seriesId of seriesIds) {
            if (seriesId < 0) seriesId = this.allPointsGroup.length + seriesId;
            this.allPointsGroup[seriesId].g.style("display", visible ? "block" : "none");
        }
    }
}

function parseFlipParameter(flip) {
    let flipX, flipY;
    if (Array.isArray(flip)) {
        if (flip.length == 0) flipX = flipY = false;
        else if (flip.length == 1) flipX = flipY = !!flip[0];
        else {
            flipX = !!flip[0];
            flipY = !!flip[1];
        }
    }
    else if (flip.x !== undefined && flip.y !== undefined) {
        flipX = !!flip.x;
        flipY = !!flip.y;
    }
    else {
        flipX = flipY = !!flip;
    }
    return [ flipX, flipY ];
}