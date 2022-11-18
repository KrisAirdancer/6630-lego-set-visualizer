/**
 * This class is used to create the connected scatterplot
 * to visualization the average number of color per set by 
 * the total number of themes per year
 */
class TheSquiggler {

    /**
     * A constructor to create a squiggler object
     * @param {Object} globalData 
     */
    constructor(globalData) {
        this.clicked = 0;
        let data = [...d3.group(globalData, d => d.year)];

        this.padding ={
            top: 10,
            right: 40, 
            bottom: 40, 
            left: 40
        };

        let tempData = this.createData(data);
        this.height = parseInt(d3.select("#svg_theSquiggler").style("height"));
        this.width = parseInt(d3.select("#svg_theSquiggler").style("width"));

        this.createAxis(tempData);
        this.createConnectedGraph(tempData);
        
        d3.select("#squiggler_prev").on('click', e => this.movePrevious(e));
        d3.select("#squiggler_next").on('click', e => this.moveNext(e));

        this.createToolkit();
    }

    //#region SETUP FUNCTION

    /**
     * A helper function that will create the Axis
     * for the connected squiggler. 
     * @param {Object} tempData 
     */
    createAxis(tempData) {
        this.xScale = d3.scaleLinear()
                    .domain([0, d3.max(tempData, d => d.x)])
                    .range([this.padding.left, this.width - this.padding.right]);
        
                    
        let svg = d3.select("#svg_theSquiggler")
            .append("g")
            .attr("id", "squiggler-x-axis");
        
        svg.attr("transform", "translate("+ 0 + "," + (this.height - this.padding.bottom)  + ")")
            .call(d3.axisBottom(this.xScale));

        let axisGroup = d3.select("#svg_theSquiggler").append('g').attr("id", "squiggler_xlabel");
        axisGroup.append("text")
                .attr("text-anchor", "end")
                .attr("x", 0)
                .attr("y", 0)
                .attr('transform', `translate(${(this.width / 2) + 60}, ${this.height - 10})`)
                .text("Number of Unqiue Colors")
                .attr("font-size", 15)

        this.yScale = d3.scaleLinear()
            .domain([d3.max(tempData, d => d.y), 0])
            .range([this.padding.top, this.height - this.padding.bottom]);
        
        svg = d3.select("#svg_theSquiggler")
            .append("g")
            .attr("id", "squiggler-y-axis");
        
        svg.attr("transform", "translate("+ this.padding.left + ", 0)")
            .call(d3.axisLeft(this.yScale));

        let yGroup = d3.select("#svg_theSquiggler").append('g').attr("id", "squiggler_ylabel");
        yGroup.append("text")
                .attr("text-anchor", "end")
                .attr("x", -190)
                .attr("y", 13)
                .attr("transform", "rotate(-90)")
                .text("Number of Themes")
                .attr("font-size", 15)
    }

    /**
     * A helper function that will draw the connected 
     * scatter plot in the initial graph
     * @param {Object} tempData 
     */
    createConnectedGraph(tempData) {
        let svg = d3.select("#svg_theSquiggler")
            .append("g")
            .attr("id", "vis_path")

        svg.append("path")
            .datum(tempData)
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("d", d3.line()
                .curve(d3.curveCardinal.tension(0.5))
                .x(d => this.xScale(d.x))
                .y(d => this.yScale(d.y)))

        svg = d3.select("#svg_theSquiggler")
            .append("g")
            .attr("id", "vis_dots")
        
        svg.selectAll("circle")
            .data(tempData)
            .enter()
            .append("circle")
                .attr("cx", d => this.xScale(d.x))
                .attr("cy", d => this.yScale(d.y))
                .attr("r", 2.5)
                .attr("stroke", "black")
                .attr("stroke-width", 1)
                .attr("fill", "#FFCF04")
            .on("mouseover", (e,d) => this.mouseOverEvent(e,d))
            .on("mousemove", (e,d) => this.mouseMoveEvent(e,d))
            .on("mouseleave", (e,d) => this.mouseLeaveEvent(e,d));
            
        svg = d3.select("#svg_theSquiggler")
            .append("g")
            .attr("id", "vis_text")

        svg.selectAll("text")
            .data(tempData)
            .enter()
            .append("text")
                .attr("x", d => this.xScale(d.x) + 5)
                .attr("y", d => this.yScale(d.y))
                .attr("stroke", "black")
                .text(function(d,i) {
                    if(i % 10 == 0)
                        return d.year;
                    return "";
                })
                .attr("font-size", 10)
                .attr("opacity", "60%")
    }

    /**
     * A helper function that will process the 
     * data based on the attributes that are 
     * needed for the connected scatter plot
     * @param {Object} data 
     * @returns Processed Data
     */
    createData(data) {
        let squiggler = [];
        let tempData = [];

        let index = 0;
        for(let i= 0; i < data.length; i++) {
            let value = [...d3.group(data[i][1], d => d.theme_name)];
            let colors = d3.mean(data[i][1], d => d.num_color);
            let piece = d3.mean(data[i][1], d => d.num_parts);
            let set_value = [...d3.group(data[i][1], d => d.theme_name)];

            squiggler[index] = {
                year: data[i][0],
                num_theme: value.length,
                avg_color: colors,
                avg_piece: piece,
                num_sets: set_value.length
            }

            tempData[index++] = {
                year: data[i][0],
                x: colors,
                y: value.length,
                text_x: "Average Unique Colors",
                text_y: "Number of Themes",
            }
        }

        this.data = squiggler;
        return tempData;
    }
    
    //#endregion

    //#region TOOLTIP FUNCTIONS

    /**
     * A helper method that creates the rectangle for the
     * tooltip
     */
     createToolkit() {
        let toolKit = d3.select("#svg_theSquiggler")
            .append("g")
            .attr("id", "squigglerTooltip")

        toolKit.append("rect")
            .attr("id", "tooltip")
            .attr("ry", 20)
            .attr("rx", 20)
            .style("opacity", 0)
    }

    mouseOverEvent(e,d) {
        let y = (this.yScale(d.y) > this.height - 100)? 
            this.yScale(d.y) - 100 : this.yScale(d.y);
        
        let x = (this.xScale(d.x) > this.width - 350)?
            this.xScale(d.x) - 350 : this.xScale(d.x);


        d3.select("#squigglerTooltip").select("#tooltip")
            .style("opacity", "90%")
            .attr("x", x + 30)
            .attr("y", y + 10)
            .attr("rx", 20)
            .attr("ry", 20)
            
        d3.select("#squigglerTooltip")
            .raise()
            .append("text")
            .attr("id", "toolText")
            .text(d.text_x + ": " + Math.round((d.x*100))/100)
            .attr('x', x + 34)
            .attr('y', y + 30) 

        d3.select("#squigglerTooltip")
            .raise()
            .append("text")
            .attr("id", "toolText")
            .text(d.text_y + ": " + Math.round((d.y*100))/100)
            .attr('x', x + 34)
            .attr('y', y + 50)
        
        d3.select("#squigglerTooltip")
            .raise()
            .append("text")
            .attr("id", "toolText")
            .text("Year Published: " + d.year)
            .attr('x', x + 34)
            .attr('y', y + 70)
    }

    mouseMoveEvent(e,d) {
        d3.select("#squigglerTooltip").select("#tooltip")
            .style("opacity", "90%")
            .attr("rx", 20)
            .attr("ry", 20);
        
        d3.select("#squigglerTooltip").selectAll("text").style("opacity", 1);

    }

    mouseLeaveEvent(e,d) {
        d3.select("#squigglerTooltip").select("#tooltip")
                    .style("opacity", 0)
                    .attr("x", 0)
                    .attr("y", 0);
        
        d3.select("#squigglerTooltip").selectAll("text").remove()
    }

    //#endregion

    //#region EVENT HANDLERS
    
    /**
     * An event handler that will move the chart to the next
     * graph structure.
     * @param {Event} e 
     */
    moveNext(e) {
        this.clicked = (this.clicked+1)%4;
        this.switchPlot();
        this.updateAxisLabels();
    }

    /**
     * An event handler that will move the chart to the 
     * previous position
     * @param {Event} e 
     */
    movePrevious(e) {
        this.clicked = d3.min([(this.clicked-1) % 4, this.clicked-1]);
        this.clicked = (this.clicked < -3)? 0 : this.clicked;
        this.switchPlot();
        this.updateAxisLabels();
    }

    updateAxisLabels() {
        d3.select("#svg_theSquiggler").select("#squiggler_xlabel").remove();
        d3.select("#svg_theSquiggler").select("#squiggler_ylabel").remove();
        let yLabel = d3.select("#svg_theSquiggler").append('g').attr("id", "squiggler_ylabel");
        let xLabel = d3.select("#svg_theSquiggler").append('g').attr("id", "squiggler_xlabel");

        switch(this.clicked) {
            case -3: // Unique Color vs theme
                xLabel.append("text")
                    .attr("text-anchor", "end")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr('transform', `translate(${this.width/2}, ${this.height - 10})`)
                    .text("Number of Themes")
                    .attr("font-size", 15)

                yLabel.append("text")
                .attr("text-anchor", "end")
                .attr("x", -150)
                .attr("y", 13)
                .attr("transform", "rotate(-90)")
                .text("Average Number of Unique Colors")
                .attr("font-size", 15)

                break;

            case -2: // pieces vs themes
                xLabel.append("text")
                    .attr("text-anchor", "end")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr('transform', `translate(${(this.width / 2) + 60}, ${this.height - 10})`)
                    .text("Number of Themes")
                    .attr("font-size", 15);

                yLabel.append("text")
                    .attr("text-anchor", "end")
                    .attr("x", -150)
                    .attr("y", 13)
                    .text("Average Number of Pieces")
                    .attr("font-size", 15);
                break;
            
            case -1: // Theme vs pieces
                xLabel.append("text")
                    .attr("text-anchor", "end")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr('transform', `translate(${(this.width / 2) + 60}, ${this.height - 10})`)
                    .text("Average Number of Pieces")
                    .attr("font-size", 15);

                yLabel.append("text")
                    .attr("text-anchor", "end")
                    .attr("x", -150)
                    .attr("y", 13)
                    .attr("transform", "rotate(-90)")
                    .text("Number of Themes")
                    .attr("font-size", 15)
                break;

            case 0: // Theme vs color

                xLabel.append("text")
                    .attr("text-anchor", "end")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr('transform', `translate(${(this.width / 2) + 120}, ${this.height - 10})`)
                    .text("Average Number of Unique Colors")
                    .attr("font-size", 15);

                yLabel.append("text")
                    .attr("text-anchor", "end")
                    .attr("x", -190)
                    .attr("y", 13)
                    .attr("transform", "rotate(-90)")
                    .text("Number of Themes")
                    .attr("font-size", 15)
                break;
            case 1: // Theme vs pieces
                xLabel.append("text")
                    .attr("text-anchor", "end")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr('transform', `translate(${(this.width / 2) + 100}, ${this.height - 10})`)
                    .text("Average Number of Pieces")
                    .attr("font-size", 15);

                yLabel.append("text")
                    .attr("text-anchor", "end")
                    .attr("x", -190)
                    .attr("y", 13)
                    .attr("transform", "rotate(-90)")
                    .text("Number of Themes")
                    .attr("font-size", 15)
                break;
            case 2: // pieces vs themes
                xLabel.append("text")
                    .attr("text-anchor", "end")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr('transform', `translate(${(this.width / 2) + 60}, ${this.height - 10})`)
                    .text("Number of Themes")
                    .attr("font-size", 15);

                yLabel.append("text")
                    .attr("text-anchor", "end")
                    .attr("x", -170)
                    .attr("y", 13)
                    .attr("transform", "rotate(-90)")
                    .text("Average Number of Pieces")
                    .attr("font-size", 15)
                break;

            case 3: // Unique Color vs theme
                xLabel.append("text")
                    .attr("text-anchor", "end")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr('transform', `translate(${(this.width / 2) + 60}, ${this.height - 10})`)
                    .text("Number of Themes")
                    .attr("font-size", 15);

                yLabel.append("text")
                    .attr("text-anchor", "end")
                    .attr("x", -160)
                    .attr("y", 13)
                    .attr("transform", "rotate(-90)")
                    .text("Average Number of Unique Colors")
                    .attr("font-size", 15)
                break;
        }
    }

    /**
     * A helper function that will update the the data structure
     * to be able to transition the data
     */
    switchPlot() {
        let data = [];
        let index = 0;

        for(let i= 0; i < this.data.length; i++) {
            let x, y = 0;
            let text_x = undefined;
            let text_y = undefined;
            switch(this.clicked) {
                case -3: // Unique Color vs theme
                    x = this.data[i].num_theme;
                    text_x = "Number of Themes";
                    y = this.data[i].avg_color;
                    text_y = "Average Unqiue Colors Used";
                    break;

                case -2: // pieces vs themes
                    x = this.data[i].num_theme;
                    text_x = "Number of Themes";
                    y = this.data[i].avg_piece;
                    text_y = "Average Number of Pieces";
                    break;
                
                case -1: // Theme vs pieces
                    x = this.data[i].avg_piece;
                    text_x = "Average Number of Pieces";
                    y = this.data[i].num_theme;
                    text_y = "Number of Themes";
                    break;

                case 0: // Theme vs color
                    x = this.data[i].avg_color;
                    text_x = "Average Unqiue Colors Used";
                    y = this.data[i].num_theme;
                    text_y = "Number of Themes";
                    break;
                case 1: // Theme vs pieces
                    x = this.data[i].avg_piece;
                    text_x = "Average Number of Pieces";
                    y = this.data[i].num_theme;
                    text_y = "Number of Themes";
                    break;
                case 2: // pieces vs themes
                    x = this.data[i].num_theme;
                    text_x = "Number of Themes";
                    y = this.data[i].avg_piece;
                    text_y = "Average Number of Pieces";
                    break;

                case 3: // Unique Color vs theme
                    x = this.data[i].num_theme;
                    text_x = "Number of Themes";
                    y = this.data[i].avg_color;
                    text_y = "Average Unique Colors Used";
                    break;
            }

            data[index++] = {
                x:  x,
                y:  y,
                year: this.data[i].year,
                text_x: text_x,
                text_y: text_y
            };
        }

        this.updateGraph(data);

    }

    /**
     * A helper function that will transition the 
     * data using different scaling funcitons
     * @param {Object} data 
     */
    updateGraph(data){
        // Theme Y-Axis
        this.yScale = d3.scaleLinear()
            .domain([d3.max(data, d => d.y), 0])
            .range([this.padding.top, this.height - this.padding.bottom]);
        
        // Color X-Axis
        this.xScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.x)])
            .range([this.padding.left, this.width - this.padding.right]);
        
        // Change the Y-Axis
        d3.selectAll('#squiggler-y-axis')
            .transition()
            .duration(1000)
            .call(d3.axisLeft(this.yScale));

        // Change the X-Axis
        d3.selectAll('#squiggler-x-axis')
            .transition()
            .duration(1000)
            .call(d3.axisBottom(this.xScale));
        
        // Update the individual dots
        let svg = d3.select("#svg_theSquiggler")
                .data(data);
        
        let g = svg.selectAll('g')
                    .data(data)
        
        let circles = g.selectAll("circle")
                        .data(data);

        circles
            .transition()
            .duration(1000)
            .attr("cy", d => this.yScale(d.y))
            .attr("cx", d => this.xScale(d.x));
        
        // Move the Year Labels
        let text_var = svg.select("#vis_text").selectAll("text")
                        .data(data);

        text_var
            .transition()
            .duration(1000)
            .attr("x", d => this.xScale(d.x))
            .attr("y", d => this.yScale(d.y));

        let path = svg.select("#vis_path").select("path")
                .datum(data);

        // Move the path line
        path
            .transition()
            .duration(1000)
            .attr("d", d3.line()
                .curve(d3.curveCardinal.tension(0.5))
                .x(d => this.xScale(d.x))
                .y(d => this.yScale(d.y)));
    }

    //#endregion
}