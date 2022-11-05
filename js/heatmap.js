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
        this.completeData = data;
        console.log(data);
        data = data.filter(d => d.num_parts >= 2500);

        this.padding = {
            top: 10,
            right: 50,
            bottom: 30,
            left: 50
        };

        this.updateHeatmap(data)

        this.createToolkit();
    }

    //#region Setup
    /**
     * A helper function that will create all of the scalling for
     * the heatmap visualization.
     * @param {Objecy} data 
     * @param {int} height 
     * @param {int} width 
     */
    createScaling(data, height, width, svg) {
        let yearData = [...d3.group(data, d => d.year).keys()];
        let setName = [...d3.group(data, d=> d.set_name).keys()];
        setName = setName.sort((a,b) => (a>b)?-1:1);

        this.createXAxis(yearData, width, height, svg);
        this.createYAxis(setName, height);
        this.createColorScale(data);   
    }

    /**
     * A helper function for creating the color scale 
     * for the heatmap
     * @param {Object} data 
     */
    createColorScale(data) {
        let max_color = parseInt(d3.max(data, d=> d.num_color));
        let min_color = parseInt(d3.min(data, d=> d.num_color))

        this.colorScale = d3.scaleLinear()
            .domain([min_color, max_color])
            .range(['white', "#F9A900"]);
    }

    /**
     * A helper function that will create
     * the YScale Axis for the Heatmap graph
     * @param {Object} setName 
     * @param {Integer} height 
     */
    createYAxis(setName, height) {
        // Create Y-Scale
        this.yScale = d3.scaleBand()
            .domain(setName)
            .range([this.padding.top, height - this.padding.bottom])
            .padding(.01);
    }

    /**
     * A helper function that will draw the x-axis
     * on the heat map
     * @param {Object} yearData 
     * @param {Integer} width 
     * @param {Html element} svg 
     */
    createXAxis(yearData, width, height, svg) {
        // Create the X-Scale
        this.xScale = d3.scaleBand()
            .domain(yearData)
            .range([this.padding.left, width - this.padding.right])
            .padding(.01);

        let xaxis = d3.axisBottom(this.xScale).tickFormat(d => {
            return "" + d;
        }).tickValues(this.xScale.domain().filter(function(d,i){ return !(i%5)}))
        
        svg.append("g").attr("id", "x-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xaxis);
    }

     /**
     * A helper method that creates the rectangle for the
     * tooltip
     */
      createToolkit() {
        let toolKit = d3.select("#svg_heatmap")
            .append("g")
            .attr("id", "#heat_tool_tip")

        toolKit.append("rect")
            .attr("id", "tooltip")
            .attr("ry", 20)
            .attr("rx", 20)
            .style("opacity", 0)
    }
    
    //#endregion


    //#region DRAWING HEATMAP
    
    /**
     * A helper function that will draw the Rect on 
     * the heat map
     * @param {Objecy} data 
     * @param {Function} yearScale 
     * @param {Function} set_scale 
     * @param {Function} colorScale 
     * @param {HTML element} svg 
     */
    drawRect(data, yearScale, set_scale, colorScale, svg) {
        let rec = svg.append('g').attr('id', 'heat_rect')
            .selectAll('rect')
            .data(data)
            .enter()
            .append("rect")
            
        rec.attr('x', d => yearScale(d.year))
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
    }
    
    //#endregion

    //#region Event Handlers
    mouseOverEvent(e,d) {
        if(d.year != undefined && d.set_name != undefined) {
            console.log(d.year)

            let x = (this.xScale(d.year) < this.width-200)? 
                this.xScale(d.year) : this.xScale(d.year)-200;
            
            let y = (this.yScale(d.set_name) > this.height - 100)? 
                this.yScale(d.set_name)-100 : this.yScale(d.set_name);

            d3.select("#tooltip")
                .style("opacity", "10%")
                .attr("x", x + 30)
                .attr("y", y + 10)
                .attr("rx", 20)
                .attr("ry", 20)
                
            d3.select("#heat_tool_tip")
                .raise()
                .append("text")
                .attr("id", "toolText")
                .text("Set Name: " + d.set_name)
                .attr('x', x + 34)
                .attr('y', y + 40) 

            d3.select("#heat_tool_tip")
                .raise()
                .append("text")
                .attr("id", "toolText")
                .text("Number of Color: " + d.num_color)
                .attr('x', x + 34)
                .attr('y', y + 60) 
        }
        
    }

    mouseMoveEvent(e,d) {
        d3.select("#tooltip")
            .style("opacity", "10%")
            .attr("rx", 20)
            .attr("ry", 20);
        
        d3.select("#heat_tool_tip").selectAll("text").style("opacity", 1);

    }

    mouseLeaveEvent(e,d) {
        d3.select("#tooltip")
                    .style("opacity", 0)
                    .attr("x", 0)
                    .attr("y", 0);
        
        d3.select("#heat_tool_tip").selectAll("text").remove()
    }

    //#endregion

    /**
     * A helper function that will handle updating the table 
     * based on the informaiton that is given.
     */
    updateHeatmap(data) {
        let svg = d3.select("#svg_heatmap").attr("height", 700);
        svg.append("g").attr("id", "heat_tool_tip");

        this.height = parseInt(svg.style("height"))-this.padding.bottom;
        this.width = parseInt(svg.style("width")) - this.padding.right;
        
        this.createScaling(data, this.height, this.width, svg);
        this.drawRect(data, this.xScale, this.yScale, this.colorScale, svg);

    }

}