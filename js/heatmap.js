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
        d3.select("#heatmap-select-2").on('change',e => this.selection_2_event(e))
        this.createSetColorData();

        let svg = d3.select("#svg_heatmap").attr("height", 500);
        svg.append("g").attr("id", "heat_tool_tip");

        this.height = parseInt(svg.style("height"))-this.padding.bottom;
        this.width = parseInt(svg.style("width")) - this.padding.right;
        
        let years = this.completeData.filter(d => parseInt(d.year) >= 1985);
        let yearData = [...d3.group(years, d => d.year).keys()];
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
        let max_color = parseInt(d3.max(data, d=> parseInt(d.scaleValue)));
        let min_color = parseInt(d3.min(data, d=> parseInt(d.scaleValue)));

        this.colorScale = d3.scaleLinear()
            .domain([min_color, max_color])
            .range(['#ffe9f2','#8b0000']);
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
                .text("Name: " + d.yValue)
                .attr('x', x + 34)
                .attr('y', y + 40) 

            d3.select("#heat_tool_tip")
                .raise()
                .append("text")
                .attr("id", "toolText")
                .text("Number: " + d.scaleValue)
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
     * the heatmap based on the selection 
     * of the frequency data.
     * @param {Event} e 
     */
    selection_2_event(e) {
        this.second_option = e.target.value;
        d3.select("#heat_tool_tip").remove();
        d3.select("#svg_heatmap").append("g").attr("id", "heat_tool_tip")
        
        let data = this.switchDataSets();

        if(data.size == 0)
            return;

        let setName = [...d3.group(data, d=> d.yValue).keys()];
        setName = setName.sort((a,b) => (a>b)?-1:1);
        
        this.createYAxis(setName, this.height);
        this.createColorScale(data);  
        this.drawRect(data, this.xScale, this.yScale, this.colorScale)
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

        let data = this.switchDataSets();

        if(data.size == 0)
            return;

        let setName = [...d3.group(data, d=> d.yValue).keys()];
        setName = setName.sort((a,b) => (a>b)?-1:1);
        
        this.createYAxis(setName, this.height);
        this.createColorScale(data);  
        this.drawRect(data, this.xScale, this.yScale, this.colorScale)
    }

    //#endregion

    switchDataSets() {
        if (this.firstOption === "num_set" && this.second_option === "uniq_color")
            return this.createSetColorData();
        else if (this.firstOption === "theme" && this.second_option === "uniq_color")
            return this.createThemColorData();
        else if (this.firstOption === "uniq_color" && this.second_option === "uniq_color")
            return this.createColorColorData();
        else if (this.firstOption === "num_set" && this.second_option === "num_piece")
            return this.createSetPieceData();
        else if (this.firstOption === "theme" && this.second_option === "num_piece")
            return this.createThemePieceData();
        
        return [];
    }

    //#endregion

    //#region SELECTION 1 DATA PROCESSES
    /**
     * A helper function that will cluster the data based on 
     * the unique sets, and the average color used in 
     * that year given that theme.
     */
    createSetColorData() {
        let newData = [];
        let index = 0;
        let sorted = [...d3.group(this.completeData, d => d.set_name)];

        sorted.forEach(d => {
            if(d[1][0].num_parts >= 2000) {
                newData[index++] = {
                    year: d[1][0].year,
                    yValue: d[1][0].set_name,
                    scaleValue: d[1][0].num_color
                }
            }
        })

        return newData;
    }


    /**
     * A helper function that will cluster the unqiue color based on
     * the unique colors, and the number of that color is used in that
     * given given time period. 
     */
    createColorColorData() {
        let newData = [];
        let index = 0;
        let sorted = [...d3.group(this.completeData, d => d.year)];

        sorted.forEach(year => {
            if(year[0] >= 1985) {
                let color = [];
                let color_value = year[1];
                
                let color_index = 0;
                for(let i = 0; i< color_value.length; i++) {
                    if(color_value[i].num_parts >= 500) {
                        let colors = color_value[i].colors;
                        let color_g = d3.group(colors, d => d.id);
                        color_g.forEach(g => {
                            color[color_index++] = g[0]
                        })
                    }
                }

                let color_group = d3.group(color, c => c.id);

                let keys = [...color_group.keys()];
                for(let j = 0; j < color_group.size; j++) { 
                    if(keys[j] !== undefined) {                     
                        newData[index++] = {
                            year: year[0],
                            yValue: color_group.get(keys[j])[0].name,
                            scaleValue: color_group.get(keys[j]).length
                        }
                    }
                }
                
        }})
        return newData;

    }

    /**
     * A helper function that will cluster the data based on 
     * the unique themes and the average color used in 
     * that year given that theme.
     * @returns 
     */
    createThemColorData() {
        let newData = [];
        let index = 0;

        let sorted = [...d3.group(this.completeData, d => d.theme_name)]

        sorted.forEach(d => {
            if(d[1][0].num_parts >= 500) {
                // grab all of the unique colors in the given year
                let year_info = [...d3.group(d[1], data => data.year)];
                year_info.forEach(c => {
                    if(c[0] >= 1985) {
                        newData[index++] = {
                            year: c[0],
                            yValue: d[1][0].theme_name,
                            scaleValue: Math.round((d3.mean(c[1], color => color.num_color)*100)/100)
                        }
                    }
                })
            }
        })

        return newData;
    }

    //#endregion

    //#region SELECTION 2 DATA PROCESSES
    /**
     * A helper function that will cluster the data based on 
     * the unique sets and the number of pieces used
     * in given that year
     */
    createSetPieceData() {
        let newData = [];
        let index = 0;
        let sorted = [...d3.group(this.completeData, d => d.set_name)];
        sorted.forEach(d => {
            if(d[1][0].num_parts >= 2000 && d[1][0].year >= '1985') {
                newData[index++] = {
                    year: d[1][0].year,
                    yValue: d[1][0].set_name,
                    scaleValue: d[1][0].num_parts
                }
            }
        })

        return newData;
    }

    /**
     * A helper function that will cluster the data baesd on 
     * the unique themes and the number of pieces used in 
     * that given theme
     * @returns grouped data
     */
    createThemePieceData() {
        let newData = [];
        let index = 0;

        let sorted = [...d3.group(this.completeData, d => d.theme_name)]

        sorted.forEach(d => {
            if(d[1][0].num_parts >= 500) {
                // grab all of the unique colors in the given year
                let year_info = [...d3.group(d[1], data => data.year)];
                year_info.forEach(c => {
                    console.log("c ", c)
                    if(c[0] >= 1985) {
                        let value = c[1];
                        for(let item = 0; item < value.length; item++) {
                            newData[index++] = {
                                year: c[0],
                                yValue: value[item].theme_name,
                                scaleValue: value[item].num_parts
                            }
                        }
                    }
                })
            }
        })

        return newData;
    }
    
    //#endregion
}