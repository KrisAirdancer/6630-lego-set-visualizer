// Connected scatterplot - The Squiggler

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
        this.firstSelection = "uniq_color";
        this.secondSelection = "theme";
        console.log(data);

        this.padding ={
            top: 10,
            right: 40, 
            bottom: 40, 
            left: 40
        };

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
            }
        }

        this.data = squiggler;
        console.log(tempData);


        this.height = parseInt(d3.select("#svg_theSquiggler").style("height"));
        this.width = parseInt(d3.select("#svg_theSquiggler").style("width"));

        let xScale = d3.scaleLinear()
                    .domain([0, d3.max(tempData, d => d.x)])
                    .range([this.padding.left, this.width - this.padding.right]);

        this.xScale = xScale;
        
        let yScale = d3.scaleLinear()
            .domain([d3.max(tempData, d => d.y), 0])
            .range([this.padding.top, this.height - this.padding.bottom]);

        this.yScale = yScale;

        let svg = d3.select("#svg_theSquiggler")
                    .append("g")
                    .attr("id", "squiggler-x-axis");
        
        // Draw Axis
        svg.attr("transform", "translate("+ 0 + "," + (this.height - this.padding.bottom)  + ")")
            .call(d3.axisBottom(xScale));
        
        svg = d3.select("#svg_theSquiggler")
            .append("g")
            .attr("id", "squiggler-y-axis");
        
        svg.attr("transform", "translate("+ this.padding.left + ", 0)")
            .call(d3.axisLeft(yScale));
        
        svg = d3.select("#svg_theSquiggler")
        .append("g")
        .attr("id", "vis_path")

        svg.append("path")
            .datum(tempData)
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("d", d3.line()
                .curve(d3.curveCardinal.tension(0.5))
                .x(d => xScale(d.x))
                .y(d => yScale(d.y)))

        svg = d3.select("#svg_theSquiggler")
            .append("g")
            .attr("id", "vis_dots")
        
        svg.selectAll("circle")
            .data(tempData)
            .enter()
            .append("circle")
                .attr("cx", d => xScale(d.x))
                .attr("cy", d => yScale(d.y))
                .attr("r", 2)
                .attr("stroke", "#69b3a2")
                .attr("stroke-width", 3)
                .attr("fill", "white")
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
                .attr("x", d => xScale(d.x) + 5)
                .attr("y", d => yScale(d.y))
                .attr("stroke", "black")
                .text(function(d,i) {
                    if(i % 10 == 0)
                        return d.year;
                    return "";
                })
                .attr("font-size", 10)
                .attr("opacity", "60%")
                
        d3.select("#squiggler_prev").on('click', e => this.movePrevious(e));
        d3.select("#squiggler_next").on('click', e => this.moveNext(e));
    }

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
        // Need to update the tool tip based on the selected values
        // let y = undefined;
        // console.log("this is d in upper ", d)
        // if(this.firstSelection === "uniq_color") {
        //     y = (this.yScale(d.avg_color) > this.height - 200)? 
        //     this.yScale(d.avg_color) - 200 : this.yScale(d.avg_color);
        // } else if (this.firstSelection === "theme") {
        //     y = (this.yScale(d.num_theme) > this.height - 200)? 
        //     this.yScale(d.num_theme) - 200 : this.yScale(d.num_theme);
        // } else {
        //     y = (this.yScale(d.avg_piece) > this.height - 200)? 
        //     this.yScale(d.avg_piece) - 200 : this.yScale(d.avg_piece);
        // }

        // let x = undefined;
        // if(this.secondSelection === "uniq_color") {
        //     x = (this.xScale(d.avg_color) > this.width - 200)? 
        //     this.xScale(d.avg_color) - 200 : this.xScale(d.avg_color);
        // } else if (this.firstSelection === "theme") {
        //     x = (this.xScale(d.num_theme) > this.width - 200)? 
        //     this.xScale(d.num_theme) - 200 : this.xScale(d.num_theme);
        // } else {
        //     x = (this.xScale(d.avg_piece) > this.width - 200)? 
        //     this.xScale(d.avg_piece) - 200 : this.xScale(d.avg_piece);
        // }

        // d3.select("#tooltip")
        //     .style("opacity", "100%")
        //     .attr("x", x + 30)
        //     .attr("y", y + 10)
        //     .attr("rx", 20)
        //     .attr("ry", 20)
            
        // d3.select("#squigglerTooltip")
        //     .raise()
        //     .append("text")
        //     .attr("id", "toolText")
        //     .text(function(d) {
        //         if(this.firstSelection === "uniq_color") {
        //             return "Average Unique Color: " + d.avg_color;
        //         } else if (this.firstSelection === "theme") {
        //             return "Number of Themes: " + d.num_theme;
        //         } 
        //         return "Average Piece Count: " + d.avg_piece;
        //     })
        //     .attr('x', x + 34)
        //     .attr('y', y + 40) 

        // d3.select("#squigglerTooltip")
        //     .raise()
        //     .append("text")
        //     .attr("id", "toolText")
        //     .text(function(d) {
        //         if(this.firstSelection === "uniq_color") {
        //             return "Average Unique Color: " + d.avg_color;
        //         } else if (this.firstSelection === "theme") {
        //             return "Number of Themes: " + d.num_theme;
        //         } 
        //         return "Average Piece Count: " + d.avg_piece;
        //     })
        //     .attr('x', x + 34)
        //     .attr('y', y + 60) 
    }

    mouseMoveEvent(e,d) {
        // d3.select("#tooltip")
        //     .style("opacity", "100%")
        //     .attr("rx", 20)
        //     .attr("ry", 20);
        
        // d3.select("#squigglerTooltip").selectAll("text").style("opacity", 1);

    }

    mouseLeaveEvent(e,d) {
        // d3.select("#tooltip")
        //             .style("opacity", 0)
        //             .attr("x", 0)
        //             .attr("y", 0);
        
        // d3.select("#squigglerTooltip").selectAll("text").remove()
    }

    moveNext(e) {
        this.clicked = (this.clicked+1)%5;
        this.switchPlot();
    }

    movePrevious(e) {
        this.clicked = d3.min([(this.clicked-1) % 5, this.clicked-1]);
        this.clicked = (this.clicked < -4)? 0 : this.clicked;
        this.switchPlot();
    }

    switchPlot() {
        let data = [];
        let index = 0;

        for(let i= 0; i < this.data.length; i++) {
            let x, y = 0;
            switch(Math.abs(this.clicked)) {
                case 0: // Theme vs color
                    console.log("Case 0")
                    x = this.data[i].avg_color;
                    y = this.data[i].num_theme;
                    break;
                case 1: // Theme vs pieces
                    console.log("Case 1")
                    x = this.data[i].avg_piece;
                    y = this.data[i].num_theme;
                    break;
                case 2: // pieces vs themes
                    console.log("Case 2")
                    x = this.data[i].num_theme;
                    y = this.data[i].avg_piece;
                    break;
                case 3: // Unique Color vs piece
                    console.log("Case 3")
                    x = this.data[i].avg_piece;
                    y = this.data[i].avg_color;
                    break;
                case 4: // Unique Color vs theme
                    console.log("Case 4")
                    x = this.data[i].num_theme;
                    y = this.data[i].avg_color;
                    break;
            }

            data[index++] = {
                x:  x,
                y:  y,
                year: this.data[i].year,
            };
        }

        console.log(data);

        this.updateGraph(data);

    }

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

        let path = g.select("#vis_path").selectAll("path")
                .data(data);

        // Move the path line
        path
            .transition()
            .duration(1000)
            .attr("d", d3.line()
                .curve(d3.curveCardinal.tension(0.5))
                .x(d => this.xScale(d.x))
                .y(d => this.yScale(d.y)));
    }


}