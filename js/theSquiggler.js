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
        let index = 0;
        for(let i= 0; i < data.length; i++) {
            let value = [...d3.group(data[i][1], d => d.theme_name)];
            let colors = d3.mean(data[i][1], d => d.num_color);
            let piece = d3.mean(data[i][1], d => d.num_parts);
            let set_value = [...d3.group(data[i][1], d => d.theme_name)];

            squiggler[index++] = {
                year: data[i][0],
                num_theme: value.length,
                avg_color: colors,
                avg_piece: piece,
                num_sets: set_value.length
            }
        }

        this.data = squiggler;
        this.height = parseInt(d3.select("#svg_theSquiggler").style("height"));
        this.width = parseInt(d3.select("#svg_theSquiggler").style("width"));

        let xScale = d3.scaleLinear()
                    .domain([0, d3.max(this.data, d => d.num_theme)])
                    .range([this.padding.left, this.width - this.padding.right]);

        this.xScale = xScale;
        
        let yScale = d3.scaleLinear()
            .domain([d3.max(this.data, d => d.avg_color), 0])
            .range([this.padding.top, this.height - this.padding.bottom]);

        this.yScale = yScale;

        let svg = d3.select("#svg_theSquiggler")
                    .append("g")
                    .attr("id", "x-axis");
        
        // Draw Axis
        svg.attr("transform", "translate("+ 0 + "," + (this.height - this.padding.bottom)  + ")")
            .call(d3.axisBottom(xScale));
        
        svg = d3.select("#svg_theSquiggler")
            .append("g")
            .attr("id", "y-axis");
        
        svg.attr("transform", "translate("+ this.padding.left + ", 0)")
            .call(d3.axisLeft(yScale));
        
        svg = d3.select("#svg_theSquiggler")
        .append("g")
        .attr("id", "vis_path")

        svg.append("path")
            .datum(this.data)
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("d", d3.line()
                .curve(d3.curveCardinal.tension(0.5))
                .x(d => xScale(d.num_theme))
                .y(d => yScale(d.avg_color)))

        svg = d3.select("#svg_theSquiggler")
            .append("g")
            .attr("id", "vis_dots")
        
        svg.selectAll("circle")
            .data(this.data)
            .enter()
            .append("circle")
                .attr("cx", d => xScale(d.num_theme))
                .attr("cy", d => yScale(d.avg_color))
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
            .data(this.data)
            .enter()
            .append("text")
                .attr("x", d => xScale(d.num_theme) + 5)
                .attr("y", d => yScale(d.avg_color))
                .attr("stroke", "black")
                .text(function(d,i) {
                    if(i % 10 == 0)
                        return d.year;
                    return "";
                })
                .attr("font-size", 10)
                .attr("opacity", "60%")
                
        d3.select("#squiggler-select-1").on('change', e => this.updateYScale(e));
        d3.select("#squiggler-select-2").on('change', e => this.updateXScale(e));
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
        let y = undefined;
        console.log("this is d in upper ", d)
        if(this.firstSelection === "uniq_color") {
            y = (this.yScale(d.avg_color) > this.height - 200)? 
            this.yScale(d.avg_color) - 200 : this.yScale(d.avg_color);
        } else if (this.firstSelection === "theme") {
            y = (this.yScale(d.num_theme) > this.height - 200)? 
            this.yScale(d.num_theme) - 200 : this.yScale(d.num_theme);
        } else {
            y = (this.yScale(d.avg_piece) > this.height - 200)? 
            this.yScale(d.avg_piece) - 200 : this.yScale(d.avg_piece);
        }

        let x = undefined;
        if(this.secondSelection === "uniq_color") {
            x = (this.xScale(d.avg_color) > this.width - 200)? 
            this.xScale(d.avg_color) - 200 : this.xScale(d.avg_color);
        } else if (this.firstSelection === "theme") {
            x = (this.xScale(d.num_theme) > this.width - 200)? 
            this.xScale(d.num_theme) - 200 : this.xScale(d.num_theme);
        } else {
            x = (this.xScale(d.avg_piece) > this.width - 200)? 
            this.xScale(d.avg_piece) - 200 : this.xScale(d.avg_piece);
        }

        d3.select("#tooltip")
            .style("opacity", "100%")
            .attr("x", x + 30)
            .attr("y", y + 10)
            .attr("rx", 20)
            .attr("ry", 20)
            
        d3.select("#squigglerTooltip")
            .raise()
            .append("text")
            .attr("id", "toolText")
            .text(function(d) {
                if(this.firstSelection === "uniq_color") {
                    return "Average Unique Color: " + d.avg_color;
                } else if (this.firstSelection === "theme") {
                    return "Number of Themes: " + d.num_theme;
                } 
                return "Average Piece Count: " + d.avg_piece;
            })
            .attr('x', x + 34)
            .attr('y', y + 40) 

        d3.select("#squigglerTooltip")
            .raise()
            .append("text")
            .attr("id", "toolText")
            .text(function(d) {
                if(this.firstSelection === "uniq_color") {
                    return "Average Unique Color: " + d.avg_color;
                } else if (this.firstSelection === "theme") {
                    return "Number of Themes: " + d.num_theme;
                } 
                return "Average Piece Count: " + d.avg_piece;
            })
            .attr('x', x + 34)
            .attr('y', y + 60) 
    }

    mouseMoveEvent(e,d) {
        d3.select("#tooltip")
            .style("opacity", "100%")
            .attr("rx", 20)
            .attr("ry", 20);
        
        d3.select("#squigglerTooltip").selectAll("text").style("opacity", 1);

    }

    mouseLeaveEvent(e,d) {
        d3.select("#tooltip")
                    .style("opacity", 0)
                    .attr("x", 0)
                    .attr("y", 0);
        
        d3.select("#squigglerTooltip").selectAll("text").remove()
    }

    updateYScale(e) {
        this.firstSelection = e.target.value;
        let selected = e.target.value;
        let xScale = this.xScale;

        switch(selected) {
            case "uniq_color":
                this.yScale = d3.scaleLinear()
                .domain([d3.max(this.data, d => d.avg_color), 0])
                .range([this.padding.top, this.height - this.padding.bottom]);

                d3.selectAll('#y-axis')
                    .transition()
                    .duration(1000)
                    .call(d3.axisLeft(this.yScale));

                d3.select("#vis_dots")
                        .selectAll("circle")
                        .transition()
                        .duration(1000)
                        .attr("cy",d => this.yScale(d.avg_color));
                
                d3.select("#vis_text")
                    .selectAll("text")
                    .transition()
                    .duration(1000)
                    .attr("y", d => this.yScale(d.avg_color));
                
                if(this.secondSelection ==="uniq_color") {
                    d3.select("#vis_path")
                    .selectAll("path")
                    .transition()
                    .duration(1000)
                    .attr("d", d3.line()
                        .curve(d3.curveCardinal.tension(0.5))
                        .x(d => xScale(d.avg_color))
                        .y(d => this.yScale(d.avg_color)));

                } else if (this.secondSelection === "theme") {
                    d3.select("#vis_path")
                    .selectAll("path")
                    .transition()
                    .duration(1000)
                    .attr("d", d3.line()
                        .curve(d3.curveCardinal.tension(0.5))
                        .x(d => xScale(d.num_theme))
                        .y(d => this.yScale(d.avg_color)));

                } else {
                    d3.select("#vis_path")
                    .selectAll("path")
                    .transition()
                    .duration(1000)
                    .attr("d", d3.line()
                        .curve(d3.curveCardinal.tension(0.5))
                        .x(d => xScale(d.avg_piece))
                        .y(d => this.yScale(d.avg_color)))
                }
                break;
            case "theme":
                this.yScale = d3.scaleLinear()
                    .domain([d3.max(this.data, d => d.num_theme), 0])
                    .range([this.padding.top, this.height - this.padding.bottom]);
                
                d3.selectAll('#y-axis')
                    .transition()
                    .duration(1000)
                    .call(d3.axisLeft(this.yScale));
                
                d3.select("#vis_dots")
                    .selectAll("circle")
                    .transition()
                    .duration(1000)
                    .attr("cy", d => this.yScale(d.num_theme));
                
                d3.select("#vis_text")
                    .selectAll("text")
                    .transition()
                    .duration(1000)
                    .attr("y", d => this.yScale(d.num_theme));

                if(this.secondSelection ==="uniq_color") {
                    d3.select("#vis_path")
                    .selectAll("path")
                    .transition()
                    .duration(1000)
                    .attr("d", d3.line()
                        .curve(d3.curveCardinal.tension(0.5))
                        .x(d => xScale(d.avg_color))
                        .y(d => this.yScale(d.num_theme)));
  
                } else if (this.secondSelection === "theme") {
                    d3.select("#vis_path")
                    .selectAll("path")
                    .transition()
                    .duration(1000)
                    .attr("d", d3.line()
                        .curve(d3.curveCardinal.tension(0.5))
                        .x(d => xScale(d.num_theme))
                        .y(d => this.yScale(d.num_theme)));

                } else {
                    d3.select("#vis_path")
                    .selectAll("path")
                    .transition()
                    .duration(1000)
                    .attr("d", d3.line()
                        .curve(d3.curveCardinal.tension(0.5))
                        .x(d => xScale(d.avg_piece))
                        .y(d => this.yScale(d.num_theme)));

                }

                break;
            case "num_piece":
                this.yScale = d3.scaleLinear()
                    .domain([d3.max(this.data, d => d.avg_piece), 0])
                    .range([this.padding.top, this.height - this.padding.bottom]);
                
                d3.selectAll('#y-axis')
                    .transition()
                    .duration(1000)
                    .call(d3.axisLeft(this.yScale));
                
                d3.select("#vis_dots")
                    .selectAll("circle")
                    .transition()
                    .duration(1000)
                    .attr("cy", d => this.yScale(d.avg_piece));
                
                d3.select("#vis_text")
                    .selectAll("text")
                    .transition()
                    .duration(1000)
                    .attr("y", d => this.yScale(d.avg_piece));

                if(this.secondSelection ==="uniq_color") {
                    d3.select("#vis_path")
                    .selectAll("path")
                    .transition()
                    .duration(1000)
                    .attr("d", d3.line()
                        .curve(d3.curveCardinal.tension(0.5))
                        .x(d => xScale(d.avg_color))
                        .y(d => this.yScale(d.avg_piece)))


                } else if (this.secondSelection === "theme") {
                    d3.select("#vis_path")
                    .selectAll("path")
                    .transition()
                    .duration(1000)
                    .attr("d", d3.line()
                        .curve(d3.curveCardinal.tension(0.5))
                        .x(d => xScale(d.num_theme))
                        .y(d => this.yScale(d.avg_piece)))

                } else {
                    d3.select("#vis_path")
                    .selectAll("path")
                    .transition()
                    .duration(1000)
                    .attr("d", d3.line()
                        .curve(d3.curveCardinal.tension(0.5))
                        .x(d => xScale(d.avg_piece))
                        .y(d => this.yScale(d.avg_piece)))
                }
                break;
        }

    }

    updateXScale(e) {
        this.secondSelection = e.target.value;
        let selected = e.target.value;
        let xScale = this.xScale;
        let yScale = this.yScale;

        if (selected === "uniq_color") {
            console.log("Unique Color");
            xScale = d3.scaleLinear()
                .domain([0,d3.max(this.data, d => d.avg_color)])
                .range([this.padding.left, this.width - this.padding.right]);
                this.xScale = xScale;

            d3.selectAll('#x-axis')
                .transition()
                .duration(1000)
                .call(d3.axisBottom().scale(xScale));

            d3.select("#vis_dots")
                    .selectAll("circle")
                    .transition()
                    .duration(1000)
                    .attr("cx", d => xScale(d.avg_color));
            
            d3.select("#vis_text")
                .selectAll("text")
                .transition()
                .duration(1000)
                .attr("x", d => xScale(d.avg_color));

                
            if(this.firstSelection ==="uniq_color") {
                d3.select("#vis_path")
                .selectAll("path")
                .transition()
                .duration(1000)
                .attr("d", d3.line()
                    .curve(d3.curveCardinal.tension(0.5))
                    .x(d => xScale(d.avg_color))
                    .y(d => yScale(d.avg_color)));

            } else if (this.firstSelection === "theme") {
                d3.select("#vis_path")
                .selectAll("path")
                .transition()
                .duration(1000)
                .attr("d", d3.line()
                    .curve(d3.curveCardinal.tension(0.5))
                    .x(d => xScale(d.avg_color))
                    .y(d => yScale(d.num_theme)));

            } else {
                d3.select("#vis_path")
                .selectAll("path")
                .transition()
                .duration(1000)
                .attr("d", d3.line()
                    .curve(d3.curveCardinal.tension(0.5))
                    .x(d => xScale(d.avg_color))
                    .y(d => yScale(d.avg_piece)))
            }
        }

        if(selected === "theme") {

            console.log(d3.max(this.data, d => d.num_theme));
            xScale = d3.scaleLinear()
                    .domain([0, d3.max(this.data, d => d.num_theme)])
                    .range([this.padding.left, this.width - this.padding.right]);
                
            this.xScale = xScale;
            
            d3.selectAll('#x-axis')
                .transition()
                .duration(1000)
                .call(d3.axisBottom().scale(xScale));
            
            d3.select("#vis_dots")
                .selectAll("circle")
                .transition()
                .duration(1000)
                .attr("cx", d => xScale(d.num_theme));
            
            d3.select("#vis_text")
                .selectAll("text")
                .transition()
                .duration(1000)
                .attr("x", d => xScale(d.num_theme));

            if(this.firstSelection ==="uniq_color") {
                d3.select("#vis_path")
                .selectAll("path")
                .transition()
                .duration(1000)
                .attr("d", d3.line()
                    .curve(d3.curveCardinal.tension(0.5))
                    .x(d => xScale(d.num_theme))
                    .y(d => yScale(d.avg_color)));

            } else if (this.firstSelection === "theme") {
                d3.select("#vis_path")
                .selectAll("path")
                .transition()
                .duration(1000)
                .attr("d", d3.line()
                    .curve(d3.curveCardinal.tension(0.5))
                    .x(d => xScale(d.num_theme))
                    .y(d => yScale(d.num_theme)));

            } else {
                d3.select("#vis_path")
                .selectAll("path")
                .transition()
                .duration(1000)
                .attr("d", d3.line()
                    .curve(d3.curveCardinal.tension(0.5))
                    .x(d => xScale(d.num_theme))
                    .y(d => yScale(d.avg_piece)));
            }
        }

        if (selected === "num_piece") {
            console.log("In num of pices");
            console.log(d3.max(this.data, d => d.avg_piece));
            console.log("Second Selection", this.secondSelection);
            xScale = d3.scaleLinear()
                    .domain([0, d3.max(this.data, d => d.avg_piece)])
                    .range([this.padding.left, this.width - this.padding.right]);
                
            this.xScale = xScale;
            d3.selectAll('#x-axis')
                .transition()
                .duration(1000)
                .call(d3.axisBottom().scale(xScale));
            
            d3.select("#vis_dots")
                .selectAll("circle")
                .transition()
                .duration(1000)
                .attr("cx", d => xScale(d.avg_piece));
            
            d3.select("#vis_text")
                .selectAll("text")
                .transition()
                .duration(1000)
                .attr("x", d => xScale(d.avg_piece));

            if(this.firstSelection ==="uniq_color") {
                console.log("enter the method")
                d3.select("#vis_path")
                .selectAll("path")
                .transition()
                .duration(1000)
                .attr("d", d3.line()
                    .curve(d3.curveCardinal.tension(0.5))
                    .x(d => xScale(d.avg_piece))
                    .y(d => yScale(d.avg_color)));

            } else if (this.firstSelection === "theme") {
                d3.select("#vis_path")
                .selectAll("path")
                .transition()
                .duration(1000)
                .attr("d", d3.line()
                    .curve(d3.curveCardinal.tension(0.5))
                    .x(d => xScale(d.avg_piece))
                    .y(d => yScale(d.num_theme)))

            } else {
                d3.select("#vis_path")
                .selectAll("path")
                .transition()
                .duration(1000)
                .attr("d", d3.line()
                    .curve(d3.curveCardinal.tension(0.5))
                    .x(d => xScale(d.avg_piece))
                    .y(d => yScale(d.avg_piece)))
            }
        }

    }


}