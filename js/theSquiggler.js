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

        console.log(this.data)
        console.log(d3.min(this.data, d => d.num_theme));

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
        // Create an XScale -> num of themes
        // Create an YScale -> average color/set
        
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