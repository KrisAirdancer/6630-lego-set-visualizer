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
        console.log(data);

        this.padding ={
            top: 10,
            right: 40, 
            bottom: 40, 
            left: 10
        };

        let squiggler = [];
        let index = 0;
        for(let i= 0; i < data.length; i++) {
            let value = [...d3.group(data[i][1], d => d.theme_name)];
            let colors = d3.mean(data[i][1], d => d.num_color);

            squiggler[index++] = {
                year: data[i][0],
                num_theme: value.length,
                avg_color: colors,
            }
        }

        this.data = squiggler;
        this.height = parseInt(d3.select("#svg_theSquiggler").style("height"));
        this.width = parseInt(d3.select("#svg_theSquiggler").style("width"));

        let xScale = d3.scaleLinear()
                    .domain([0, d3.max(this.data, d => d.num_theme)])
                    .range([this.padding.left, this.width - this.padding.right]);
        
        let yScale = d3.scaleLinear()
            .domain([d3.max(this.data, d => d.avg_color), 0])
            .range([this.padding.top, this.height - this.padding.bottom]);

        let svg = d3.select("#svg_theSquiggler")
                    .append("g")
                    .attr("id", "x-axis");
        
        // Draw Axis
        svg.attr("transform", "translate("+ this.padding.left + "," + (this.height - this.padding.bottom)  + ")")
            .call(d3.axisBottom(xScale));
        
        svg = d3.select("#svg_theSquiggler")
            .append("g")
            .attr("id", "y-axis");
        
        svg.attr("transform", "translate("+ (this.padding.left+10) + ", 0)")
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
                .x(function(d) {
                    console.log(d);
                    return xScale(d.num_theme)
                })
                .y(d => yScale(d.avg_color)))

        svg = d3.select("#svg_theSquiggler")
            .append("g")
            .attr("id", "vis_dots")
        
        svg.selectAll("dot")
            .data(this.data)
            .enter()
            .append("circle")
                .attr("cx", d => xScale(d.num_theme))
                .attr("cy", d => yScale(d.avg_color))
                .attr("r", 2)
                .attr("stroke", "#69b3a2")
                .attr("stroke-width", 3)
                .attr("fill", "white")
            
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
                
        
    }

    /**
     * A helper function that will draw the 
     * connected scatter plot for the visualizaiton
     * @param {Object} data 
     */
    drawlineChart(data) {
        // Draw a path from each data
        // .on tooltip that give the information
    }

    /**
     * A helper function that will be used to highlight some aspect
     * of the data
     */
    showStoryComponent() {

    }


}