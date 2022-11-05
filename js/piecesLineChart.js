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
        console.log("height: " + this.svgHeight)
        this.svgWidth = parseInt(d3.select('#svg_piecesLineChart').style('width'))
        console.log('width: ' + this.svgWidth)

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

    //#region Draw Basic Chart

    drawLineChart() {
        console.log('AT: drawLineChart()');

        this.drawAxes(false);
        this.drawDots();
        this.toggleLogScale();
    }

    drawAxes(drawLogrithmic) {
        console.log('AT: drawAxes()');

        let svg = d3.select('#svg_piecesLineChart');

        // Draw Axes
        console.log('this.svgHeight: ' + this.svgHeight)

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
        let yAxis = d3.axisLeft()
                      .scale(this.yScale)
        
        if (drawLogrithmic) {
            yAxis.tickValues([0, 10, 100, 1000, 10000, 12000]);
        } else {
            yAxis.tickValues([0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000]);
        }


        // TODO: A "<g> attribute trnasform: Trailing garbage, "translate(0,NaN)" error is being thrown near here when the log scale is toggled. It doesn't seem to be breaking anything, but fix it anyway.
        svg.append('g')
           .attr('id', 'y-axis')
           .attr('transform', `translate(${45}, ${0})`)
           .call(yAxis)
    }

    drawDots() {
        console.log('AT: drawDots()');

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

    // TODO: If time permits, add transistions to the log-to-linear scale transitions.
    toggleLogScale() {

        d3.select('#lineChart-log-toggle').on('click', e => {

            console.log(e)

            if (e.target.checked) {

                console.log('HERE')

                // TODO: Add more meaningful y-axis labels by passing true/false to the drawAxes() method to determine what axis labels to apply.

                // Change yScale
                this.yScale = d3.scaleLog()
                                .domain([this.num_partsMin, Math.ceil(this.num_partsMax * 0.001) * 1000])
                                .range([this.svgHeight - 25, 20])

                // Remove old elements
                d3.select('#dots-group').remove();
                d3.select('#y-axis').remove();
                d3.select('#piecesLCTooltip').remove();

                // Redraw new elements
                this.drawAxes(true);
                this.drawDots();

            } else {

                // X-Scale
                this.xScale = d3.scaleLinear()
                                .domain([this.yearMin, this.yearMax]) // From
                                .range([45, this.svgWidth - 20]) // To

                // Y-Scale
                this.yScale = d3.scaleLinear()
                                .domain([this.num_partsMin, Math.ceil(this.num_partsMax * 0.001) * 1000])
                                .range([this.svgHeight - 25, 20])

                // Remove old elements
                d3.select('#dots-group').remove();
                d3.select('#y-axis').remove();
                d3.select('#piecesLCTooltip').remove();

                // Redraw new elements
                this.drawAxes();
                this.drawDots();

            }

        })
    }

    //#endregion
    
    //#region Tooltip Logic

    // TODO: Tooltips are getting cut off by the the rigth side and bottom of the SVG. Need to add checks to keep them from getting cut off.

    applyToolTip() {
        console.log('AT: applyToolTip()');
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