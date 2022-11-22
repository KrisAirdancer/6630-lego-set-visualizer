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
            bottom: 30,
            left: 50
        };
        
        d3.select("#heatmap-select").on('change',e => this.selection_1_event(e))
        this.createSetColorData();

        let svg = d3.select("#svg_heatmap").attr("height", 500);
        svg.append("g").attr("id", "heat_tool_tip");

        this.height = parseInt(svg.style("height"))-this.padding.bottom;
        this.width = parseInt(svg.style("width")) - this.padding.right;
        
        let yearData = [...d3.group(this.completeData, d => d.year).keys()];
        let setName = [...d3.group(data, d=> d.yValue).keys()];
        setName = setName.sort((a,b) => (a>b)?-1:1);

        this.createXAxis(yearData, this.width, this.height);
        this.createYAxis(setName, this.height);
        this.createColorScale(data);  

        this.drawRect(data, this.xScale, this.yScale, this.colorScale, "Avg. Unique Colors");

        let yLabel = d3.select("#svg_heatmap").append("g").attr("id", "heatmap_ylabel");
        yLabel.append("text")
            .attr("text-anchor", "end")
            .attr("x", -this.height/2)
            .attr("y", this.width+ 30)
            .attr("transform", "rotate(-90)")
            .text("Set Piece Count")
            .attr("font-size", 15)

        let item = d3.select("#svg_heatmap").append("g").attr("id", "text_box");
        
        let value = 0;
        for(let i = 340; i < 17000; i += 340) {
            item.append("text")
                .attr("x", this.width - this.padding.right)
                .attr("y", () => {
                    let _yValue = this.yScale(value) + 13;
                    if (!isNaN(_yValue)) {
                        return _yValue
                    }
                })
                .text((i - 340) + "-" + i)
                .attr("font-size", 10)
            value++;
        }
    }

    //#region Setup
    
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
            .range(["white","#DDB000"]);
    }

    /**
     * A helper function that will create
     * the YScale Axis for the Heatmap graph
     * @param {Object} setName 
     * @param {Integer} height 
     */
    createYAxis(setName, height) {
        this.yScale = d3.scaleBand()
            .domain(setName)
            .range([this.padding.bottom, height-this.padding.bottom])
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
        this.xScale = d3.scaleBand()
            .domain(yearData)
            .range([this.padding.left, width-this.padding.right-10])
            .padding(.01);

        let xaxis = d3.axisBottom(this.xScale).tickFormat(d => {
            return "" + d;
        }).tickValues(this.xScale.domain().filter(function(d,i){ return !(i%5)}))
        
        d3.select("#svg_heatmap").append("g").attr("id", "x-axis")
            .attr("transform", "translate(0," + (height-this.padding.bottom) + ")")
            .call(xaxis);

        let xLabel = d3.select("#svg_heatmap").append("g").attr("id", "heatmap_xlabel");
        
        xLabel.append("text")
            .attr("text-anchor", "end")
            .attr("x", 0)
            .attr("y", 0)
            .attr('transform', `translate(${this.width/2}, ${this.height+10})`)
            .text("Year")
            .attr("font-size", 15)
    }

     /**
     * A helper method that creates the rectangle for the
     * tooltip
     */
      createToolkit() {
        let toolKit = d3.select("#heat_tool_tip")
            .append("g")
            .attr("id", "Heatmap_Tooltip")

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
    drawRect(data, yearScale, set_scale, colorScale, name) {
        let rec = d3.select("#heat_tool_tip").append('g').attr('id', 'heat_rect')
            .selectAll('rect')
            .data(data)
            .enter()
            .append("rect")
            
        rec.attr('x', d => yearScale(d.year))
            .attr('y', d => set_scale(d.yValue))
            .attr('width', yearScale.bandwidth())
            .attr("height", set_scale.bandwidth())
            .style('stroke', 'grey')
            .style('stroke-width', '1px')
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

        let legend = d3.legendColor()
            .scale(colorScale)
        
        d3.select("#svg_heatmap")
            .append('g')
            .attr('id', 'legend')
            .attr("transform", "translate(10,50)")
            .call(legend);

        d3.select("#svg_heatmap")
            .append("g")
            .attr("id", "legend_label")
            .append("text")
            .raise()
            .text(name)
            .attr("x", 10)
            .attr("y", 40)
            .attr("font-size", 15)
        
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
            let x = (this.xScale(d.year) < this.width-300)? 
                this.xScale(d.year) : this.xScale(d.year)-300;
            
            let y = (this.yScale(d.yValue) > this.height - 100)? 
                this.yScale(d.yValue)-100 : this.yScale(d.yValue);

            d3.select("#Heatmap_Tooltip")
                .select("#tooltip")
                .style("opacity", "90%")
                .attr("x", x + 30)
                .attr("y", y + 30)
                .attr("rx", 20)
                .attr("ry", 20)
                
            d3.select("#heat_tool_tip")
                .raise()
                .append("text")
                .attr("id", "toolText")
                .text(d.textValue)
                .attr('x', x + 34)
                .attr('y', y + 50) 

            d3.select("#heat_tool_tip")
                .raise()
                .append("text")
                .attr("id", "toolText")
                .text(d.textValue2 + d.scaleValue)
                .attr('x', x + 34)
                .attr('y', y + 70) 
            
            d3.select("#heat_tool_tip")
                .raise()
                .append("text")
                .attr("id", "toolText")
                .text("Year Published: " +  d.year)
                .attr('x', x + 34)
                .attr('y', y + 90) 
        }
        
    }

    /**
     * An Event Handler for the tooltip
     * moving across the element
     * @param {Event} e 
     * @param {Data} d 
     */
    mouseMoveEvent(e,d) {
        d3.select("#Heatmap_Tooltip")
            .select("#tooltip")
            .style("opacity", "90%")
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
        d3.select("#Heatmap_Tooltip")
            .select("#tooltip")
            .style("opacity", 0)
            .attr("x", 0)
            .attr("y", 0);
        
        d3.select("#heat_tool_tip").selectAll("text").remove();
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
        d3.select("#svg_heatmap").select("#legend").remove();
        d3.select("#svg_heatmap").select("#legend_label").remove();
        d3.select("#svg_heatmap").append("g").attr("id", "heat_tool_tip")

        let data = this.switchDataSets();

        let setName = [...d3.group(data, d=> d.yValue).keys()];
        setName = setName.sort((a,b) => (a>b)?-1:1);
        
        this.createYAxis(setName, this.height);
        this.createColorScale(data);  
        let name = (e.target.value === "num_set")? "Avg. Unique Colors" : "Frequency";
        this.drawRect(data, this.xScale, this.yScale, this.colorScale, name);
        this.addheatLabels(data);
    }

    /**
     * A helper function that will create a group labels 
     * for the heatmap
     */
    addheatLabels(data) {
        if (this.firstOption === "num_set") {
            d3.select("#svg_heatmap").select("#color_box").remove();
            let item = d3.select("#svg_heatmap").append("g").attr("id", "text_box");

            let value = 0;
            for(let i = 340; i < 17000; i += 340) {
                item.append("text")
                    .attr("x", this.width-this.padding.right)
                    .attr("y", () => {
                        let _yValue = this.yScale(value) + 13;
                        if (!isNaN(_yValue)) {
                            return _yValue
                        }
                    })
                    .text((i-340) + "-" + i)
                    .attr("font-size", 10)
                value++;
            }

        } else {
            d3.select("#svg_heatmap").select("#text_box").remove();
            let item = d3.select("#svg_heatmap").append("g").attr("id", "color_box");
            item.selectAll("rect")
                .data(data)
                .enter()
                .append("rect")
                .attr("x", this.width -this.padding.right)
                .attr("y", d => this.yScale(d.yValue))
                .attr("height", this.yScale.bandwidth)
                .attr("width", this.padding.right)
                .attr("fill", d => "#"+d.yValue)
        }
    }

    //#endregion

    //#region SELECTION Data Processing

    /**
     * A helper function that will select
     * the correct method to process the informaiton based 
     * on the two selected data points.
     * @returns Processed Data
     */
    switchDataSets() {
        d3.select("#svg_heatmap").select("#heatmap_ylabel").remove();
        let yLabel = d3.select("#svg_heatmap").append("g").attr("id", "heatmap_ylabel");
        
        if (this.firstOption === "num_set") {
            yLabel.append("text")
                .attr("text-anchor", "end")
                .attr("x", -this.height/2)
                .attr("y", this.width+ 30)
                .attr("transform", "rotate(-90)")
                .text("Pieces Per Set")
                .attr("font-size", 15)
            return this.createSetColorData();
        }
        else {
            yLabel.append("text")
                .attr("text-anchor", "end")
                .attr("x", -this.height/2)
                .attr("y", this.width+ 30)
                .attr("transform", "rotate(-90)")
                .text("Color Name")
                .attr("font-size", 15)
            return this.createColorColorData();
        }
    }

    /**
     * A helper function that will cluster the data based on 
     * the unique sets, and the average color used in 
     * that year given that theme.
     */
    createSetColorData() {
        let newData = [];
        let index = 0;
        let sorted = [...d3.group(this.completeData, d => d.year)];

        sorted.forEach(d => {
            let value = 0;
            for(let change = 340; change < 17000; change += 340) {
                let filterData = d[1].filter(f => f.num_parts >= change - 340 && f.num_parts < change);
                if(filterData.length > 0) {
                    newData[index++] = {
                        year: d[0],
                        yValue: value,
                        scaleValue: Math.round((d3.mean(filterData, f => f.num_color)*100)/100),
                        textValue: `Sets with ${change-340}-${change} pieces.`,
                        textValue2: "Number of Unique Colors: "
                    }
                } 
                value++;
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
                        yValue: color_group.get(keys[j])[0].rgb,
                        scaleValue: color_group.get(keys[j]).length,
                        textValue: `Unqiue Color name: ${color_group.get(keys[j])[0].name}.`,
                        textValue2: "Usage of Color: ",
                    }
                }
        }})
        return newData;

    }
    //#endregion
}