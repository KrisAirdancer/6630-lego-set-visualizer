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
        this.firstOption = "num_set";
        this.second_option = "uniq_color";
        this.completeData = data;
        data = this.createSetColorData();
        
        this.padding = {
            top: 10,
            right: 50,
            bottom: 50,
            left: 50
        };
        
        d3.select("#heatmap-select-1").on('change',e => this.selection_1_event(e))
        this.createSetColorData();

        let svg = d3.select("#svg_heatmap").attr("height", 500);
        svg.append("g").attr("id", "heat_tool_tip");

        this.height = parseInt(svg.style("height"))-this.padding.bottom;
        this.width = parseInt(svg.style("width")) - this.padding.right;
        
        let yearData = [...d3.group(data, d => d.year).keys()];
        let setName = [...d3.group(data, d=> d.yValue).keys()];
        setName = setName.sort((a,b) => (a>b)?-1:1);

        this.createXAxis(yearData, this.width, this.height);
        this.createYAxis(setName, this.height);
        this.createColorScale(data);  

        this.drawRect(data, this.xScale, this.yScale, this.colorScale);
    }

    //#region Setup
    /**
     * A helper function that will create all of the scalling for
     * the heatmap visualization.
     * @param {Objecy} data 
     * @param {int} height 
     * @param {int} width 
     */
    createScaling(data, height, width) {
         
    }

    /**
     * A helper function for creating the color scale 
     * for the heatmap
     * @param {Object} data 
     */
    createColorScale(data) {
        console.log(data[0])
        let max_color = parseInt(d3.max(data, d=> parseInt(d.scaleValue)));
        let min_color = parseInt(d3.min(data, d=> parseInt(d.scaleValue)));

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
    createXAxis(yearData, width, height) {
        // Create the X-Scale
        this.xScale = d3.scaleBand()
            .domain(yearData)
            .range([this.padding.left, width - this.padding.right])
            .padding(.01);

        let xaxis = d3.axisBottom(this.xScale).tickFormat(d => {
            return "" + d;
        }).tickValues(this.xScale.domain().filter(function(d,i){ return !(i%5)}))
        
        d3.select("#svg_heatmap").append("g").attr("id", "x-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xaxis);
    }

     /**
     * A helper method that creates the rectangle for the
     * tooltip
     */
      createToolkit() {
        let toolKit = d3.select("#heat_tool_tip")

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
    drawRect(data, yearScale, set_scale, colorScale) {
        let rec = d3.select("#heat_tool_tip").append('g').attr('id', 'heat_rect')
            .selectAll('rect')
            .data(data)
            .enter()
            .append("rect")
            
        rec.attr('x', d => yearScale(d.year))
            .attr('y', d => set_scale(d.yValue))
            .attr('width', yearScale.bandwidth())
            .attr("height", set_scale.bandwidth())
            .style("fill", d => {
                if(d.scaleValue == undefined)
                    return 'gray'
                else
                    return colorScale(parseInt(d.scaleValue))
            })
            .on("mouseover", (e,d) => this.mouseOverEvent(e,d))
            .on("mousemove", (e,d) => this.mouseMoveEvent(e,d))
            .on("mouseleave", (e,d) => this.mouseLeaveEvent(e,d));  
        
        this.createToolkit();
    }
    
    //#endregion

    //#region Event Handlers

    /**
     * An Event handler for a tool tip that
     * enters the rect nodes on the heatmap.
     * @param {Event} e 
     * @param {Data} d 
     */
    mouseOverEvent(e,d) {
        if(d.year != undefined && d.yValue != undefined) {

            let x = (this.xScale(d.year) < this.width-200)? 
                this.xScale(d.year) : this.xScale(d.year)-200;
            
            let y = (this.yScale(d.yValue) > this.height - 100)? 
                this.yScale(d.yValue)-100 : this.yScale(d.yValue);

            d3.select("#tooltip")
                .raise()
                .style("opacity", "80%")
                .attr("x", x + 30)
                .attr("y", y + 10)
                .attr("rx", 20)
                .attr("ry", 20)
                
            d3.select("#heat_tool_tip")
                .raise()
                .append("text")
                .attr("id", "toolText")
                .text("Set Name: " + d.yValue)
                .attr('x', x + 34)
                .attr('y', y + 40) 

            d3.select("#heat_tool_tip")
                .raise()
                .append("text")
                .attr("id", "toolText")
                .text("Number of Color: " + d.scaleValue)
                .attr('x', x + 34)
                .attr('y', y + 60) 
        }
        
    }

    /**
     * An Event Handler for the tooltip
     * moving across the element
     * @param {Event} e 
     * @param {Data} d 
     */
    mouseMoveEvent(e,d) {
        d3.select("#tooltip")
            .style("opacity", "80%")
            .attr("rx", 20)
            .attr("ry", 20);
        
        d3.select("#heat_tool_tip").selectAll("text").style("opacity", 1);

    }

    /**
     * An Event Handler for the tooltip 
     * leaving the node event
     * @param {Event} e 
     * @param {Data} d 
     */
    mouseLeaveEvent(e,d) {
        d3.select("#tooltip")
                    .style("opacity", 0)
                    .attr("x", 0)
                    .attr("y", 0);
        
        d3.select("#heat_tool_tip").selectAll("text").remove()
    }

    /**
     * An event handler that will update
     * the heatmap based on the selection of 
     * data
     * @param {Event} e 
     */
    selection_1_event(e) {
        // Remove previous data
        this.firstOption = e.target.value;
        d3.select("#heat_tool_tip").remove();
        d3.select("#svg_heatmap").append("g").attr("id", "heat_tool_tip")

        // Grab the second data value
        let second_option ;
        console.log(second_option);
        switch(e.target.value) {
            case "num_set":
                let data = this.switchDataSets();
                let setName = [...d3.group(data, d=> d.yValue).keys()];
                setName = setName.sort((a,b) => (a>b)?-1:1);

                this.createYAxis(setName, this.height);
                this.createColorScale(data);  
                this.drawRect(data, this.xScale, this.yScale, this.colorScale)
                break;
            case "uniq_color":
                break;
            case "theme":
                break;
            case "pieces":
               break;
        };
    }

    //#endregion

    switchDataSets() {
        if(this.firstOption === "num_set" && this.second_option === "uniq_color")
            return this.createSetColorData();

    }

    /**
     * A helper function that will create a 
     * data structure that has yValue = set_name, 
     * scaleValue = num_value
     */
    createSetColorData() {
        let newData = [];
        let index = 0;
        let sorted = [...d3.group(this.completeData, d => d.set_name)];
        sorted.forEach(d => {
            if(d[1][0].num_parts >= 2500) {
                newData[index++] = {
                    year: d[1][0].year,
                    yValue: d[1][0].set_name,
                    scaleValue: d[1][0].num_color
                }
            }
        })

        return newData;
    }



}