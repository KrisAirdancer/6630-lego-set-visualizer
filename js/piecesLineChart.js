class PiecesLineChart {

    constructor(data) {
        this.data = data;
        this.clicked = false;
        this.average = [];
        let index = 0;

        // Used to draw the mean line. 
        let yearData = [...d3.group(data, d => d.year)];
        yearData.forEach(year => {
            // let avg = d3.quantile(year[1], .95, d => d.num_parts);
            let avg = d3.mean(year[1], d => d.num_parts);
            this.average[index++] = {
                year: year[0],
                piece: avg,
            };
        })


        
        // Get SVG Data
        d3.select('#svg_piecesLineChart').append("g").attr("id", "average_path");
        let textBox = d3.select('#svg_piecesLineChart').append("g").attr("id", "text_box");
        d3.select('#svg_piecesLineChart').append("g").attr("id", "histograms");
        this.svgHeight = parseInt(d3.select('#svg_piecesLineChart').style('height'))
        this.svgWidth = parseInt(d3.select('#svg_piecesLineChart').style('width'))
        
        textBox.append("text")
                .attr("x", "200")
                .attr("y", "200")
                .attr("id", "explainBox")
                .text("The mean line might not look like there is");
        textBox.append("text")
                .attr("x", "200")
                .attr("y", "220")
                .attr("id", "explainBox")
                .text("a large difference between each year.")
        textBox.append("text")
                .attr("x", "200")
                .attr("y", "240")
                .attr("id", "explainBox")
                .text("Click the log button to get a better view.")

        // Get Data Metadata
        
        this.yearMin = d3.min(this.data, d => d.year);
        this.yearMax = d3.max(this.data, d => d.year);
        this.num_partsMin = d3.min(this.data, d=> d.num_parts);
        this.num_partsMax = d3.max(this.data, d => d.num_parts);
        
        // Create a data structure for the histograms
        this.hisX1 = d3.scaleLinear()
                .domain([this.yearMin, 1973])    
                .range([0, this.svgWidth/3 - 10]);
        
        this.hisX2 = d3.scaleLinear()
            .domain([1974, 1998])    
            .range([this.svgWidth/3, 2*this.svgWidth/3 - 10]);
        
        this.hisX2 = d3.scaleLinear()
            .domain([1999, this.yearMax])    
            .range([2*this.svgWidth/3, this.svgWidth - 10]);
        // Make Scales

        // X-Scale
        this.xScale = d3.scaleLinear()
                       .domain([this.yearMin, this.yearMax]) // From
                       .range([60, this.svgWidth - 20]) // To

        // Y-Scale
        this.yScale = d3.scaleLinear()
                       .domain([this.num_partsMin, Math.ceil(this.num_partsMax * 0.001) * 1000])
                       .range([this.svgHeight - 25, 20])

        this.yAxis = undefined;
    }

    //#region ANIMATE MEAN VALUE
    draw_average() {
        console.log(this.average);
        let svg = d3.select('#svg_piecesLineChart').select("#average_path");

        svg.selectAll("path").remove();
        
        var path = svg.append("path")
            .datum(this.average)
            .attr("d", d3.line()
                .curve(d3.curveCardinal.tension(0.5))
                .x(d => this.xScale(d.year))
                .y(d => this.yScale(d.piece)))
            .attr("stroke", "black")
            .attr("stroke-width", "2")
            .attr("fill", "none");

        var totalLength = path.node().getTotalLength();

        path.attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(4000)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0)
            .on("end", d => d.year == "2022");
    }
    //#endregion

    //#region Draw Basic Chart

    drawLineChart() {

        this.drawAxes(false);
        this.drawDots();
        this.toggleLogScale();
    }

    drawAxes() {

        let svg = d3.select('#svg_piecesLineChart');

        // Draw xAxis
        let xAxis = d3.axisBottom()
                      .scale(this.xScale)
                      .tickFormat(d => `${d}`)
                      .tickValues([1949, 1960, 1970, 1980, 1990, 2000, 2010, 2022])

        svg.append('g')
           .attr('id', 'x-axis')
           .attr('transform', `translate(${0}, ${this.svgHeight - 25})`)
           .call(xAxis)

        let axisGroup = svg.append('g').attr("id", "x label");
        axisGroup.append("text")
                .attr("text-anchor", "end")
                .attr("x", 0)
                .attr("y", 0)
                .attr('transform', `translate(${(this.svgWidth/2) + 25}, ${this.svgHeight})`)
                .text("Year")
                .attr("font-size", 15)

        // Draw yAxis
        this.yAxis = d3.axisLeft()
                      .scale(this.yScale)
                      .tickValues([0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000]);

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

        this.draw_average()
        
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
           .style('fill', '#FFCF04')
           .style('stroke', 'black')
           .style('stroke-width', '0.75px');  
    }

    //#endregion

    //#region Linear-to-Log Scale Change

    toggleLogScale() {
        // d3.select('#svg_piecesLineChart').select("#text_box").remove();

        d3.select('#lineChart-log-toggle').on('click', e => {
            // Change text and position for the log scale
            if (e.target.checked) {
                d3.select('#svg_piecesLineChart').select("#text_box").remove();
                let textBox = d3.select('#svg_piecesLineChart').append("g").attr("id", "text_box")

                textBox.append("text")
                    .attr("x", "100")
                    .attr("y", "50")
                    .attr("id", "explainBox")
                    .style("opacity", "0")
                    .text("There is a slight increase in the number")
                    .transition()
                    .duration(3000)
                    .style("opacity", 1);
                textBox.append("text")
                    .attr("x", "100")
                    .attr("y", "70")
                    .attr("id", "explainBox")
                    .style("opacity", "0")
                    .text("of pieces with each year")
                    .transition()
                    .duration(3000)
                    .style("opacity", 1);

                // Change yScale
                this.yScale = d3.scaleLog()
                                .domain([this.num_partsMin, Math.ceil(this.num_partsMax * 0.001) * 1000])
                                .range([this.svgHeight - 25, 20])
                                .nice();
            } else {
                d3.select('#svg_piecesLineChart').select("#text_box").remove();
                let textBox = d3.select('#svg_piecesLineChart').append("g").attr("id", "text_box")

                textBox.append("text")
                    .attr("x", "100")
                    .attr("y", "200")
                    .attr("id", "explainBox")
                    .style("opacity", "0")
                    .text("The mean line might not look like there is")
                    .transition()
                    .duration(3000)
                    .style("opacity", 1);
                textBox.append("text")
                    .attr("x", "100")
                    .attr("y", "220")
                    .attr("id", "explainBox")
                    .style("opacity", "0")
                    .text("a large difference between each year.")
                    .transition()
                    .duration(3000)
                    .style("opacity", 1);
                textBox.append("text")
                    .attr("x", "100")
                    .attr("y", "240")
                    .attr("id", "explainBox")
                    .style("opacity", "0")
                    .text("Click the log button to get a better view.")
                    .transition()
                    .duration(3000)
                    .style("opacity", 1);
                // Change text and position 

                // Y-Scale
                this.yScale = d3.scaleLinear()
                                .domain([this.num_partsMin, Math.ceil(this.num_partsMax * 0.001) * 1000])
                                .range([this.svgHeight - 25, 20])
                                .nice();
            }

            d3.select('#dots-group')
                .selectAll('circle')
                .transition()
                .duration(800)
                .attr('cx', d => this.xScale(d.year))
                .attr('cy', d => this.yScale(d.num_parts))

            d3.selectAll('#y-axis')
                .transition()
                .duration(800)
                .call(d3.axisLeft(this.yScale))

            this.draw_average();
        })

    }
    //#endregion

    //#region TRANSFER TO HISTORGRAMS

    //#endregion

}