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

    constructor(elementId, flip = false) {
        let [flipX, flipY] = [ this.flipX, this.flipY ] = parseFlipParameter(flip);
        this.margin = {
            top: flipY ? 30 : 10,
            right: flipX ? 60 : 30,
            bottom: flipY ? 10 : 30,
            left: flipX ? 30 : 60
        }
        
        this.parent = document.getElementById(elementId);
        this.width = this.parent.clientWidth - this.margin.left - this.margin.right;
        this.height = this.parent.clientHeight - this.margin.top - this.margin.bottom;
        this.svg = d3.select(`#${elementId}`)
            .append("svg")
            .attr("width", this.parent.clientWidth)
            .attr("height", this.parent.clientHeight)
            .append("g")
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

        this.x.scale = d3.scaleLinear()
            .domain(this.x.domain)
            .range(flipX ? [this.width, 0] : [0, this.width]);
        this.x.g = this.svg.append("g")
            .attr("transform", `translate(0, ${flipY ? 0 : this.height})`)
            .call(flipY ? d3.axisTop(this.x.scale) : d3.axisBottom(this.x.scale));
        
        this.y.scale = d3.scaleLinear()
            .domain(this.y.domain)
            .range(flipY ? [0, this.height] : [this.height, 0]);
        this.y.g = this.svg.append("g")
            .attr("transform", `translate(${flipX ? this.width : 0}, 0)`)
            .call(flipX ? d3.axisRight(this.y.scale) : d3.axisLeft(this.y.scale));

        this.g = this.svg.append("g");
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
            element: this.g.append("circle")
                .attr("cx", this.x.scale(point.x))
                .attr("cy", this.y.scale(point.y))
                .attr("r", point.size ? point.size : 5)
                .attr("fill", point.color ? point.color : "black"),
            x: point.x,
            y: point.y,
            label: point.label ? this.g.append("text")
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