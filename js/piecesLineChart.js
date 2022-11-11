// Number of pieces per set per year

// TODO: This is not a line chart. It is a scatterplot. Rename this file.
// TODO: Change the id and other naming/references to match the above filename change as well (eg. the id attribute in the HTML).

class PiecesLineChart {

    constructor(data) {
        this.data = data;

        // Get SVG Data
        this.svgHeight = parseInt(d3.select('#svg_piecesLineChart').style('height'))
        this.svgWidth = parseInt(d3.select('#svg_piecesLineChart').style('width'))

        // Get Data Metadata

        this.yearMin = d3.min(this.data, d => d.year);
        this.yearMax = d3.max(this.data, d => d.year);
        this.num_partsMin = d3.min(this.data, d=> d.num_parts);
        this.num_partsMax = d3.max(this.data, d => d.num_parts);

        // Make Scales

        // X-Scale
        this.xScale = d3.scaleLinear()
                       .domain([this.yearMin, this.yearMax]) // From
                       .range([45, this.svgWidth - 20]) // To

        // Y-Scale
        this.yScale = d3.scaleLinear()
                       .domain([this.num_partsMin, Math.ceil(this.num_partsMax * 0.001) * 1000])
                       .range([this.svgHeight - 25, 20])

        this.yAxis = undefined;

    }

    //#region Draw Basic Chart

    drawLineChart() {

        this.drawAxes(false);
        this.drawDots();
        this.toggleLogScale();
    }

    drawAxes() {

        let svg = d3.select('#svg_piecesLineChart');

        // Draw Axes
        // console.log('this.svgHeight: ' + this.svgHeight)

        // Draw xAxis
        let xAxis = d3.axisBottom()
                      .scale(this.xScale)
                      .tickFormat(d => `${d}`)
                      .tickValues([1949, 1960, 1970, 1980, 1990, 2000, 2010, 2022])

        svg.append('g')
           .attr('id', 'x-axis')
           .attr('transform', `translate(${0}, ${this.svgHeight - 25})`)
           .call(xAxis)

        // Draw yAxis
        this.yAxis = d3.axisLeft()
                      .scale(this.yScale)
                      .tickValues([0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000]);

        svg.append('g')
           .attr('id', 'y-axis')
           .attr('transform', `translate(${45}, ${0})`)
           .call(this.yAxis)
    }

    drawDots() {

        let svg = d3.select('#svg_piecesLineChart')
                    .append('g')
                    .attr('id', 'dots-group')

        svg.selectAll('dot')
           .data(this.data)
           .enter()
           .append('circle')
           .attr('cx', d => this.xScale(d.year))
           .attr('cy', d => this.yScale(d.num_parts))
           .attr('r', '2px')
           .style('fill', 'black')
           .on("mouseover", (e,d) => this.mouseOverEvent(e,d))
           .on("mousemove", (e,d) => this.mouseMoveEvent(e,d))
           .on("mouseleave", (e,d) => this.mouseLeaveEvent(e,d));  

        this.applyToolTip();
    }

    //#endregion

    //#region Linear-to-Log Scale Change

    toggleLogScale() {

        d3.select('#lineChart-log-toggle').on('click', e => {

            if (e.target.checked) {

                // Change yScale
                this.yScale = d3.scaleLog()
                                .domain([this.num_partsMin, Math.ceil(this.num_partsMax * 0.001) * 1000])
                                .range([this.svgHeight - 25, 20])
                
                this.yAxis.tickValues([0, 10, 100, 1000, 10000, 12000])
                          .scale(this.yScale);

            } else {

                // Y-Scale
                this.yScale = d3.scaleLinear()
                                .domain([this.num_partsMin, Math.ceil(this.num_partsMax * 0.001) * 1000])
                                .range([this.svgHeight - 25, 20])

                this.yAxis.tickValues([0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000])
                          .scale(this.yScale);

            }

            // TODO: This is throwing the following error when the log scale is activated: "Error: <g> attribute transform: Trailing garbage, "translate(0,NaN)""
            d3.select('#dots-group')
                .selectAll('circle')
                .transition()
                .duration(1000)
                .attr('cx', d => this.xScale(d.year))
                .attr('cy', d => this.yScale(d.num_parts))

            d3.select('#y-axis')
              .transition()
              .duration(1000)
              .call(this.yAxis)

        })
    }

    //#endregion
    
    //#region Tooltip Logic

    applyToolTip() {
        this.createToolkit();
    }

    /**
     * A helper method that creates the rectangle for the
     * tooltip
     */
    createToolkit() {
        let toolKit = d3.select("#svg_piecesLineChart")
            .append("g")
            .attr("id", "piecesLCTooltip")

        toolKit.append("rect")
            .attr("id", "tooltip")
            .attr("ry", 20)
            .attr("rx", 20)
            .style("opacity", 0)
    }

    mouseOverEvent(e,d) {
        if(d.year != undefined && d.set_name != undefined) {
            console.log(d.year)

            let x = (this.xScale(d.year) < this.width - 200)? 
                this.xScale(d.year) : this.xScale(d.year) - 200;
            
            let y = (this.yScale(d.num_parts) > this.height - 200)? 
                this.yScale(d.num_parts) - 200 : this.yScale(d.num_parts);

            d3.select("#tooltip")
                .style("opacity", "100%")
                .attr("x", x + 30)
                .attr("y", y + 10)
                .attr("rx", 20)
                .attr("ry", 20)
                
            d3.select("#piecesLCTooltip")
                .raise()
                .append("text")
                .attr("id", "toolText")
                .text("Set Name: " + d.set_name)
                .attr('x', x + 34)
                .attr('y', y + 40) 

            d3.select("#piecesLCTooltip")
                .raise()
                .append("text")
                .attr("id", "toolText")
                .text("Number of Pieces: " + d.num_parts)
                .attr('x', x + 34)
                .attr('y', y + 60) 
        }
        
    }

    mouseMoveEvent(e,d) {
        d3.select("#tooltip")
            .style("opacity", "100%")
            .attr("rx", 20)
            .attr("ry", 20);
        
        d3.select("#piecesLCTooltip").selectAll("text").style("opacity", 1);

    }

    mouseLeaveEvent(e,d) {
        d3.select("#tooltip")
                    .style("opacity", 0)
                    .attr("x", 0)
                    .attr("y", 0);
        
        d3.select("#piecesLCTooltip").selectAll("text").remove()
    }

    //#endregion
}