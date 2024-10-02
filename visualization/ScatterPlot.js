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
            points: [],
            growSize,
            capacity
        })
        for (let point of series) {
            this.addPoint(point, seriesId, 0);
        }
    }

    addPoint(point, seriesId, animationMs = 200) {
        this.resizeIfNeeded(0, point.x, animationMs);
        this.resizeIfNeeded(1, point.y, animationMs);
        this.domainDefined = true;
        let series = this.series[seriesId];
        series.points.push({
            element: this.plotArea.append("circle")
                .attr("cx", this.x.scale(point.x))
                .attr("cy", this.y.scale(point.y))
                .attr("r", point.size ? point.size : 5)
                .attr("fill", point.color ? point.color : "black"),
            x: point.x,
            y: point.y,
            label: point.label ? this.plotArea.append("text")
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
                point.element.attr("r", (i + 1) / pointCount * 5);
            }
        }
    }

    resizeIfNeeded(axisId, value, animationMs = 200) {
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
            let [flipX, flipY] = [ this.flipX, this.flipY ];
            let axisScale = axis.scale;
            axisScale.domain(domain);
            axis.g.transition()
                .duration(animationMs)
                .call(axisId ? 
                    (flipX ? d3.axisRight(this.y.scale) : d3.axisLeft(this.y.scale)) :
                    (flipY ? d3.axisTop(this.x.scale) : d3.axisBottom(this.x.scale))
                );

            this.rescalePoints(animationMs, axisId);
        }
    }

    rescalePoints(animationMs, axisId) {
        let axis = axisId ? this.y : this.x;
        let axisScale = axis.scale;
        for (let series of this.series) {
            for (let point of series.points) {
                point.element.transition()
                    .duration(animationMs)
                    .attr(axisId ? "cy" : "cx", axisScale(axisId ? point.y : point.x));
                if (point.label) {
                    point.label.transition()
                        .duration(animationMs)
                        .attr(axisId ? "y" : "x", axisScale(axisId ? point.y : point.x) - (axisId ? 10 : 0));
                }
            }
        }
    }

    feed(point) {
        this.addPoint(point, this.series.length - 1);
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