// Number of pieces per set per year

// TODO: This is not a line chart. It is a scatterplot. Rename this file.
// TODO: Change the id and other naming/references to match the above filename change as well (eg. the id attribute in the HTML).

class PiecesLineChart {

    constructor(data) {
        this.data = data;
        console.log(this.data);

        // Get SVG Data
        this.svgHeight = parseInt(d3.select('#svg_piecesLineChart').style('height'))
        console.log(this.svgHeight)
        this.svgWidth = parseInt(d3.select('#svg_piecesLineChart').style('width'))
        console.log(this.svgWidth)

        // Get Data Metadata

        this.yearMin = d3.min(this.data, d => d.year);
        console.log(this.yearMin)
        this.yearMax = d3.max(this.data, d => d.year);
        console.log(this.yearMax)
        this.num_partsMin = d3.min(this.data, d=> d.num_parts);
        console.log(this.num_partsMin)
        this.num_partsMax = d3.max(this.data, d => d.num_parts);
        console.log(this.num_partsMax)

        // console.log(this.data.filter(d => d.year > 2022))

        // Make Scales

        // X-Scale
        this.xScale = d3.scaleLinear()
                       .domain([this.yearMin, this.yearMax]) // From
                       .range([45, this.svgWidth - 20]) // To
                    //    .nice();

        // Y-Scale
        this.yScale = d3.scaleLinear()
                       .domain([this.num_partsMin, this.num_partsMax])
                       .range([this.svgHeight - 20, 20])
                    //    .nice();
    }

    drawLineChart() {
        console.log('AT: drawLineChart()');

        this.drawAxes();
        this.drawDots();
    }

    drawAxes() {
        console.log('AT: drawAxes()');

        let svg = d3.select('#svg_piecesLineChart');

        // Draw Axes

        // Draw xAxis
        let xAxis = d3.axisBottom()
                      .scale(this.xScale)
                      .tickFormat(d => `${d}`)
                      .tickValues([1949, 1960, 1970, 1980, 1990, 2000, 2010, 2022])

        svg.append('g')
           .attr('transform', `translate(${0}, ${this.svgHeight - 20})`)
           .call(xAxis)

        // Draw yAxis
        let yAxis = d3.axisLeft()
                      .scale(this.yScale)
                    //   .ticks(10)
                    //   .tickFormat(d => `${d}`)
                    //   .tickValues([1949, 1960, 1970, 1980, 1990, 2000, 2010, 2022])

        svg.append('g')
           .attr('transform', `translate(${45}, ${0})`)
           .call(yAxis)
    }

    drawDots() {
        console.log('AT: drawDots()');

        this.applyToolTip();
    }

    applyToolTip() {
        console.log('AT: applyToolTip()');

    }
}