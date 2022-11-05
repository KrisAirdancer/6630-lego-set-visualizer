// Number of pieces per set per year

// TODO: This is not a line chart. It is a scatterplot. Rename this file.
// TODO: Change the id and other naming/references to match the above filename change as well (eg. the id attribute in the HTML).

class PiecesLineChart {

    constructor(data) {
        this.data = data;
        // this.data = data.filter(d => d.num_parts > 1000);
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

        // Y-Scale
        // this.yScale = d3.scaleLog()
        this.yScale = d3.scaleLinear()
                       .domain([this.num_partsMin, Math.ceil(this.num_partsMax * 0.001) * 1000])
                       .range([this.svgHeight - 25, 20])

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
           .attr('transform', `translate(${0}, ${this.svgHeight - 25})`)
           .call(xAxis)

        // Draw yAxis
        let yAxis = d3.axisLeft()
                      .scale(this.yScale)
                      .tickValues([0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000])

        svg.append('g')
           .attr('transform', `translate(${45}, ${0})`)
           .call(yAxis)
    }

    drawDots() {
        console.log('AT: drawDots()');

        let svg = d3.select('#svg_piecesLineChart')
                    .append('g')

        svg.selectAll('dot')
           .data(this.data)
           .enter()
           .append('circle')
           .attr('cx', d => this.xScale(d.year))
           .attr('cy', d => this.yScale(d.num_parts))
           .attr('r', '2px')
           .style('fill', 'black')

        this.applyToolTip();
    }

    applyToolTip() {
        console.log('AT: applyToolTip()');

    }
}