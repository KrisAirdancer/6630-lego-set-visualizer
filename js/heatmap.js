// Number of colors per set per year
/**
 * This class is used to visualize the color over the total number of sets per
 * year, which is visualized using a heat map
 */
class Heatmap {

    /**
     * Constructs a heatmap visualizaiton object
     * @param {Array Object} globalData 
     */
    constructor(data) {
        data = data.filter(d => d.num_parts >= 2500);
        console.log(data);

        this.padding = {
            top: 10,
            right: 50,
            bottom: 30,
            left: 50
        };

        let yearData = [...d3.group(data, d => d.year).keys()];
        let setName = [...d3.group(data, d=> d.set_name).keys()];
        setName = setName.sort((a,b) => (a>b)?-1:1);

        let svg = d3.select("#svg_heatmap").attr("height", 700);
        svg.append("g").attr("id", "heat_tool_tip");

        let height = parseInt(svg.style("height"))-this.padding.bottom;
        let width = parseInt(svg.style("width")) - this.padding.right;
        
        // Create the X-Scale
        let yearScale = d3.scaleBand()
            .domain(yearData)
            .range([this.padding.left, width - this.padding.right])
            .padding(.01);

        this.xScale = yearScale;

        let xaxis = d3.axisBottom(yearScale).ticks(8).tickFormat(d => {
            return "" + d;
        }).tickValues(yearScale.domain().filter(function(d,i){ return !(i%10)}))
        
        svg.append("g").attr("id", "x-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xaxis);
        
        // Create Y-Scale
        let set_scale = d3.scaleBand()
            .domain(setName)
            .range([this.padding.top, height - this.padding.bottom])
            .padding(.01);
        
        this.yScale = set_scale;

        let max_color = parseInt(d3.max(data, d=> d.num_color));
        let min_color = parseInt(d3.min(data, d=> d.num_color))

        let colorScale = d3.scaleLinear()
            .domain([min_color, max_color])
            .range(['white', "#FFCF04"]);
        
        svg.append('g').attr('id', 'rect')
            .selectAll('rect')
            .data(data)
            .enter()
            .append("rect")
                .attr('x', d => yearScale(d.year))
                .attr('y', d => set_scale(d.set_name))
                .attr('width', yearScale.bandwidth())
                .attr("height", set_scale.bandwidth())
                .style("fill", d => {
                    if(d.num_color == undefined)
                        return 'gray'
                    else
                        return colorScale(parseInt(d.num_color))
                })
                .on("mouseover", (e,d) => this.mouseOverEvent(e,d))
                .on("mousemove", (e,d) => this.mouseMoveEvent(e,d))
                .on("mouseleave", (e,d) => this.mouseLeaveEvent(e,d));      
        
        this.createToolkit();
    }

    /**
     * A helper method that creates the rectangle for the
     * tooltip
     */
     createToolkit() {
        let toolKit = d3.select("svg_heatmap")
            .append("g")
            .attr("id", "#heat_tool_tip")
    
        toolKit.append("rect")
            .attr("class", "tool_tip")
            .attr("ry", -20)
            .attr("rx", -20)
            .attr("height", 100)
            .attr("width", 100)
            .attr("fill", "white")
            .attr("stroke", "black")
            .style("opacity", 0)
    }

    mouseOverEvent(e,d) {
        d3.select(".tool_tip")
            .style("opacity", "80%")
            .attr('x', this.xScale(d.year) + 30)
            .attr('y', this.yScale(d.setName));

        d3.select("#heat_tool_tip")
            .append("text")
            .attr("id", "toolText")
            .text("Set Name: " + d.set_name)
            .attr('x', this.xScale(d.year) + 34)
            .attr('y', this.yScale(d.set_name) + 20) 
            .attr("font-weight", "bold")
            .attr("font-size", 10)

        d3.select("#heat_tool_tip").append("text")
            .attr("id", "toolText")
            .text("Number of Color: " + d.num_color)
            .attr('x', this.xScale(d.year) + 34)
            .attr('y', this.yScale(d.set_name) + 40) 
            .attr("font-weight", "bold")
            .attr("font-size", 10)
        
    }

    mouseMoveEvent(e,d) {
        d3.select("#heat_tool_tip").style("opacity", "80%");
        
        d3.select("#heat_tool_tip").selectAll("text").style("opacity", 1);

    }

    mouseLeaveEvent(e,d) {
        d3.select(".tool_tip")
                    .style("opacity", 0)
                    .attr("x", "1000px")
                    .attr("y", "1000px");
        
        d3.select("#heat_tool_tip").selectAll("text").remove()
    }
}