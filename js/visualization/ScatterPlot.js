export class ScatterPlot {
    margin = { top: 10, right: 30, bottom: 30, left: 60 };
    domainDefined = false;
    series = [];
    x = {
        domain: [0, 100],
        scale: null,
        g: null
    };
    y = {
        domain: [0, 100],
        scale: null,
        g: null
    };
    svg = null;
    g = null;
    plotArea = null;

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
        
        if (!this.svg) this.svg = d3.select(`#${this.parent.id}`).append("svg");
        this.svg.attr("width", this.parent.clientWidth)
            .attr("height", this.parent.clientHeight)

        if (!this.g) this.g = this.svg.append("g");
        this.g.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

        if (!this.x.scale) this.x.scale = d3.scaleLinear().domain(this.x.domain)
        this.x.scale.range(flipX ? [this.width, 0] : [0, this.width]);

        if (!this.x.g) this.x.g = this.g.append("g")
        this.x.g.attr("transform", `translate(0, ${flipY ? 0 : this.height})`)
            .call(flipY ? d3.axisTop(this.x.scale) : d3.axisBottom(this.x.scale));

        if (!this.y.scale) this.y.scale = d3.scaleLinear().domain(this.y.domain)
        this.y.scale.range(flipY ? [0, this.height] : [this.height, 0]);

        if (!this.y.g) this.y.g = this.g.append("g");
        this.y.g.attr("transform", `translate(${flipX ? this.width : 0}, 0)`)
            .call(flipX ? d3.axisRight(this.y.scale) : d3.axisLeft(this.y.scale));

        if (!this.plotArea) this.plotArea = this.g.append("g");

        if (!this.unit) return;

        if (!this.unit.element) this.unit.element = this.g.append("text")
            .attr("font-family", "Helvetica, sans-serif")
            .text(this.unit.text);
        this.unit.element.attr("transform", `translate(${flipX ? this.width + 5 : -5}, ${flipY ? -5 : this.height + 5})`)
    }

    addSeries(series, growSize = false, capacity = undefined) {
        let seriesId = this.series.length;
        this.series.push({
            g: this.plotArea.append("g"),
            points: [],
            growSize,
            capacity
        })
        for (let point of series) {
            this.addPoint(point, seriesId, 0);
        }
    }

    addPoint(point, seriesId, animationMs = 200) {
        this.resizeIfNeeded(point, animationMs);
        let series = this.series[seriesId];
        series.points.push({
            element: series.g.append("circle")
                .attr("cx", this.x.scale(point.x))
                .attr("cy", this.y.scale(point.y))
                .attr("r", point.size ? point.size : 5)
                .attr("fill", point.color ? point.color : "black"),
            x: point.x,
            y: point.y,
            label: point.label ? series.g.append("text")
                .attr("font-weight", "bold")
                .attr("font-family", "Helvetica, sans-serif")
                .text(point.label)
                .attr("x", this.x.scale(point.x))
                .attr("y", this.y.scale(point.y) - 10)
                .attr("fill", point.color ? point.color : "black") : null,
        });
        
        if (series.capacity && series.points.length > series.capacity) {
            let removed = series.points.shift();
            removed.element.remove();
        }
        let pointCount = series.points.length;
        if (series.growSize) {
            for (let i = 0; i < pointCount; i++) {
                let point = series.points[i];
                point.element.attr("r", (i + 1) / pointCount * 3);
            }
        }
    }

    setSeriesSingle(point, seriesId = this.series.length - 1, animationMs = 50) {
        if (seriesId < 0) seriesId = this.series.length + seriesId;
        this.resizeIfNeeded(point, animationMs);
        let series = this.series[seriesId];
        if (!series.points.length) return this.addPoint(point, seriesId, 0);
        series.points[0].element.transition()
            .duration(animationMs)
            .attr("cx", this.x.scale(point.x))
            .attr("cy", this.y.scale(point.y))
            .attr("r", point.size ? point.size : 3)
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
        let changed = false;
        if (this.domainDefined) {
            if (value < domain[0]) {
                domain[0] = value - 0.1 * (domain[1] - domain[0]);
                changed = true;
            } else if (value > domain[1]) {
                domain[1] = value + 0.1 * (domain[1] - domain[0]);
                changed = true;
            }
        }
        else {
            domain[0] = value;
            domain[1] = value;
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
        for (let series of this.series) {
            for (let point of series.points) {
                point.element.transition(t)
                    .attr("cx", this.x.scale(point.x))
                    .attr("cy", this.y.scale(point.y));
                if (point.label) point.label.transition(t)
                        .attr("x", this.x.scale(point.x))
                        .attr("y", this.y.scale(point.y) - 10);
            }
        }
    }

    feed(point, seriesId = this.series.length - 1) {
        if (seriesId < 0) seriesId = this.series.length + seriesId;
        this.addPoint(point, seriesId);
    }

    clearSeries(seriesId) {
        if (seriesId < 0) seriesId = this.series.length + seriesId;
        if (!this.series[seriesId]) return;
        for (let point of this.series[seriesId].points) {
            point.element.remove();
            if (point.label) point.label.remove();
        }
        this.series[seriesId].points = [];
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