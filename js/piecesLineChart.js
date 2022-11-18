class PiecesLineChart {

    constructor(data) {
        this.data = data;

        // Get SVG Data
        d3.select("#svg_piecesLineChart").style("height", "1500")
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
                       .domain([this.num_partsMin, Math.ceil(this.num_partsMax * 0.001) * 1000]) // From
                       .range([60, this.svgWidth - 20]) // To

        // Y-Scale
        this.yScale = d3.scaleLinear()
                       .domain([this.yearMin, this.yearMax])
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

        // Draw xAxis
        
        // Draw yAxis
        this.xAxis = d3.axisBottom()
        .scale(this.xScale)
        .tickValues([0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000]);
        
        svg.append('g')
        .attr('id', 'x-axis')
        .attr('transform', `translate(${0}, ${this.svgHeight - 25})`)
        .call(this.xAxis)
        
        let axisGroup = svg.append('g').attr("id", "x label");
        axisGroup.append("text")
        .attr("text-anchor", "end")
        .attr("x", 0)
        .attr("y", 0)
        .attr('transform', `translate(${(this.svgWidth/2) + 25}, ${this.svgHeight})`)
        .text("Year")
        .attr("font-size", 15)
        
        this.yAxis = d3.axisLeft()
            .scale(this.yScale)
            .tickFormat(d => `${d}`)
            .tickValues([1949, 1960, 1970, 1980, 1990, 2000, 2010, 2022])
        
            svg.append('g')
           .attr('id', 'y-axis')
           .attr('transform', `translate(${60}, ${0})`)
           .call(this.yAxis)

        let yGroup = svg.append('g').attr("id", "y label");
        yGroup.append("text")
           .attr("text-anchor", "end")
           .attr("x", -150)
           .attr("y", 13)
           .attr("transform", "rotate(-90)")
           .text("Number of Pieces")
           .attr("font-size", 15)
        
    }

    drawDots() {

        let svg = d3.select('#svg_piecesLineChart')
                    .append('g')
                    .attr('id', 'dots-group')

        svg.selectAll('dot')
           .data(this.data)
           .enter()
           .append('circle')
           .attr('cy', d => {
                if(d.year === '1949')
                    return this.yScale(d.year) + Math.abs(Math.random())
                
                return this.yScale(d.year) + Math.random()*13
           })
           .attr('cx', d => this.xScale(d.num_parts))
           .attr('r', '2px')
           .style('fill', '#FFCF04')
           .style('stroke', 'black')
           .style('stroke-width', '0.75px')
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
                this.xScale = d3.scaleLog()
                                .domain([this.num_partsMin, Math.ceil(this.num_partsMax * 0.001) * 1000])
                                .range([this.svgWidth - 25, 20])
                                .nice();
            } else {

                // Y-Scale
                this.xScale = d3.scaleLinear()
                                .domain([this.num_partsMin, Math.ceil(this.num_partsMax * 0.001) * 1000])
                                .range([this.svgWidth - 25, 20])
                                .nice();
            }

            d3.select('#dots-group')
                .selectAll('circle')
                .transition()
                .duration(800)
                .attr('cy', d => this.yScale(d.year) + Math.random() * 2)
                .attr('cx', d => this.xScale(d.num_parts))

            d3.selectAll('#y-axis')
                .transition()
                .duration(800)
                .call(d3.axisBottom(this.xScale))
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

            let x = (this.xScale(d.year) < this.svgWidth - 350)? 
                this.xScale(d.year) : this.xScale(d.year) - 350;
            
            let y = (this.yScale(d.num_parts) > this.svgHeight - 100)? 
                this.yScale(d.num_parts) - 100 : this.yScale(d.num_parts);

            d3.select("#tooltip")
                .style("opacity", "90%")
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

            d3.select("#piecesLCTooltip")
                .raise()
                .append("text")
                .attr("id", "toolText")
                .text("Year Published: " + d.year)
                .attr('x', x + 34)
                .attr('y', y + 80) 
        }
        
    }

    mouseMoveEvent(e,d) {
        d3.select("#tooltip")
            .style("opacity", "90%")
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