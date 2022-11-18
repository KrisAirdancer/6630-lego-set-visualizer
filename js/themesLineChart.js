class ThemesLineChart {

    constructor(data) { 

        this.data = data;

        this.displayed = {
            themes: true,
            colors: false,
            pieces: false,
            sets: false,
            count: 1
        }

        /* Process Data */

        this.themesData = this.processData();
        

        /* Get SVG Data */

        this.svgHeight = parseInt(d3.select('#svg_themesLineChart').style('height'))
        this.svgWidth = parseInt(d3.select('#svg_themesLineChart').style('width'))

        /* Get Data Metadata */

        this.yearMin = d3.min(this.themesData, d => d.year);
        this.yearMax = d3.max(this.themesData, d => d.year);
        this.num_unique_themesMin = d3.min(this.themesData, d=> d.num_unique_themes);
        this.num_unique_themesMax = d3.max(this.themesData, d => d.num_unique_themes);

        this.ave_num_piecesMin = d3.min(this.themesData, d => d.ave_num_pieces);
        this.ave_num_piecesMax = d3.max(this.themesData, d => d.ave_num_pieces);
        this.num_setsMin = d3.min(this.themesData, d => d.num_sets);
        this.num_setsMax = d3.max(this.themesData, d => d.num_sets);
        this.num_unique_colorsMin = d3.min(this.themesData, d => d.num_unique_colors);
        this.num_unique_colorsMax = d3.max(this.themesData, d => d.num_unique_colors);

        // Maximum and Minimum y-axis values
        this.displayedMin = 0;
        this.displayedMax;
        this.setDisplayedMax();

        /* Make Scales */

        // X-Scale
        this.xScale = d3.scaleLinear()
                        .domain([this.yearMin, this.yearMax]) // From
                        .range([45, this.svgWidth - 20]) // To

        // Y-Scale
        this.yScale = d3.scaleLinear()
                        .domain([this.displayedMin, this.displayedMax])
                        .range([this.svgHeight - 35, 20])

        this.yAxis = d3.axisLeft();

        let colorScale = d3.scaleOrdinal()
            .domain(['Theme','Sets','Pieces','Colors'])
            .range(['white','#FF5722','#90A4AE','#FFCF04']);
            
        let legend_data = ['Number of Themes','Number of Sets','Avg. Pieces per Set','Number of Unique Colors'];

        let svg = d3.select("#svg_themesLineChart")
            .append('g')
            .attr('id', 'legend')

        svg.selectAll("rect")
            .data(legend_data)
            .enter()
            .append("rect")
            .attr("x", 60 )
            .attr("y", (d,i) => 30 + i*20)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", d => colorScale(d))
            .style('stroke-width', '1.25px')
            .style('stroke', 'black')
        
        svg.selectAll("text")
            .data(legend_data)
            .enter()
            .append("text")
            .attr("x", 80)
            .attr("y", (d,i) => 42 + i*20)
            .text(d => d)
    }
    
    //#region Draw basic chart

    drawLineChart() {
        this.drawAxes();
        this.drawThemesLine();
        this.addEventHandlers();

        document.getElementById('themeChartToggle-themes').checked = true;
    }

    drawAxes() {
        let svg = d3.select('#svg_themesLineChart');

        let xLabel = svg.append('g').attr("id", "theme_xlabel");
        xLabel.append("text")
                .attr("text-anchor", "end")
                .attr("x", 0)
                .attr("y", 0)
                .attr('transform', `translate(${this.svgWidth/2}, ${this.svgHeight})`)
                .text("Year")
                .attr("font-size", 15)

        // Draw xAxis
        let xAxis = d3.axisBottom()
                      .scale(this.xScale)
                      .tickFormat(d => `${d}`)
                      .tickValues([1949, 1960, 1970, 1980, 1990, 2000, 2010, 2022])

        svg.append('g')
           .attr('id', 'themes_x-axis')
           .attr('transform', `translate(${0}, ${this.svgHeight - 35})`)
           .call(xAxis)

        let yGroup = svg.append('g').attr("id", "theme_ylabel");
        yGroup.append("text")
            .attr("text-anchor", "end")
            .attr("x", -150)
            .attr("y", 13)
            .attr("transform", "rotate(-90)")
            .text("Item Count")
            .attr("font-size", 15)
            
        // Draw yAxis
        this.yAxis.scale(this.yScale);

        svg.append('g')
           .attr('id', 'themes_y-axis')
           .attr('transform', `translate(${45}, ${0})`)
           .call(this.yAxis)
    }

    drawThemesLine() {

        let svg = d3.select('#svg_themesLineChart')
        
        svg.append('path')
           .attr('id', 'themesLine_back')
           .datum(this.themesData)
           .attr('fill', 'none')
           .attr('stroke', 'black')
           .attr('stroke-width', '3')
           .attr('d', d3.line()
                        .x(d => this.xScale(d.year))
                        .y(d => this.yScale(d.num_unique_themes))
                )
        
        svg.append('path')
           .attr('id', 'themesLine')
           .datum(this.themesData)
           .attr('fill', 'none')
           .attr('stroke', 'white')
           .attr('stroke-width', '1.5')
           .attr('d', d3.line()
                        .x(d => this.xScale(d.year))
                        .y(d => this.yScale(d.num_unique_themes))
                )
    }

    drawSetsLine() {

        let svg = d3.select('#svg_themesLineChart')
        
        svg.append('path')
           .attr('id', 'setsLine_back')
           .datum(this.themesData)
           .attr('fill', 'none')
           .attr('stroke', 'black')
           .attr('stroke-width', '3')
           .attr('d', d3.line()
                        .x(d => this.xScale(d.year))
                        .y(d => this.yScale(d.num_sets))
                )

        svg.append('path')
           .attr('id', 'setsLine')
           .datum(this.themesData)
           .attr('fill', 'none')
           .attr('stroke', '#FF5722')
           .attr('stroke-width', '1.5')
           .attr('d', d3.line()
                        .x(d => this.xScale(d.year))
                        .y(d => this.yScale(d.num_sets))
                )
    }

    // Average number of pieces per set per year
    drawPiecesLine() {

        let svg = d3.select('#svg_themesLineChart')
        
        svg.append('path')
           .attr('id', 'piecesLine_back')
           .datum(this.themesData)
           .attr('fill', 'none')
           .attr('stroke', 'black')
           .attr('stroke-width', '3')
           .attr('d', d3.line()
                        .x(d => this.xScale(d.year))
                        .y(d => this.yScale(d.ave_num_pieces))
                )
        svg.append('path')
           .attr('id', 'piecesLine')
           .datum(this.themesData)
           .attr('fill', 'none')
           .attr('stroke', '#90A4AE')
           .attr('stroke-width', '1.5')
           .attr('d', d3.line()
                        .x(d => this.xScale(d.year))
                        .y(d => this.yScale(d.ave_num_pieces))
                )
    }

    drawColorsLine() {

        let svg = d3.select('#svg_themesLineChart')
        
        svg.append('path')
           .attr('id', 'colorsLine_back')
           .datum(this.themesData)
           .attr('fill', 'none')
           .attr('stroke', 'black')
           .attr('stroke-width', '3')
           .attr('d', d3.line()
                        .x(d => this.xScale(d.year))
                        .y(d => this.yScale(d.num_unique_colors))
                )

        svg.append('path')
           .attr('id', 'colorsLine')
           .datum(this.themesData)
           .attr('fill', 'none')
           .attr('stroke', '#FFCF04')
           .attr('stroke-width', '1.5')
           .attr('d', d3.line()
                        .x(d => this.xScale(d.year))
                        .y(d => this.yScale(d.num_unique_colors))
                )
    }

    updateLines() {

        // Remove all lines

        d3.select('#colorsLine').remove();
        d3.select('#piecesLine').remove();
        d3.select('#setsLine').remove();
        d3.select('#themesLine').remove();

        d3.select('#colorsLine_back').remove();
        d3.select('#piecesLine_back').remove();
        d3.select('#setsLine_back').remove();
        d3.select('#themesLine_back').remove();

        this.displayed.count = 0;

        // Draw displayed lines

        if (this.displayed.colors) {
            this.drawColorsLine();
            this.displayed.count++;
        }

        if (this.displayed.pieces) {
            this.drawPiecesLine();
            this.displayed.count++;
            
        }

        if (this.displayed.sets) {
            this.drawSetsLine();
            this.displayed.count++;

        }

        if (this.displayed.themes) {
            this.drawThemesLine();
            this.displayed.count++;
        }
    }

    //#endregion

    //#region Process Data

    processData() {

        let years = d3.groups(this.data, d => d.year);
        let yearData = [];

        years.forEach(year => {

            yearData.push({
                year: year[0],
                unique_themes: 0,
                num_unique_themes: 0,
                ave_num_pieces: 0,
                unique_colors: 0,
                num_unique_colors: 0,
                num_sets: year[1].length
            })
        });

        // Populate yearData
        this.getUniqueThemesAndCount(years, yearData);
        this.getAverageNumOfPieces(years, yearData);
        this.getUniqueColorsAndCount(years, yearData);

        return yearData;
    }

    getUniqueThemesAndCount(years, yearData) {

        for (let i = 0; i < years.length; i++) {
            let uniqueThemes = new Set();

            years[i][1].forEach(entry => {
                uniqueThemes.add(entry.theme_name)
            });

            // Add data to yearData object
            yearData[i].num_unique_themes = uniqueThemes.size;
            yearData[i].unique_themes = Array.from(uniqueThemes);
        }

        return yearData;
    }

    getAverageNumOfPieces(years, yearData) {

        for (let i = 0; i < years.length; i++) {

            let sets = years[i][1];

            let sum = 0;

            sets.forEach(set => {
                sum += set.num_parts;
            });

            yearData[i].ave_num_pieces = Math.round((sum / sets.length) * 1) * 1;
        }
    }

    getUniqueColorsAndCount(years, yearData) {

        for (let i = 0; i < years.length; i++) {
            let uniqueColors = new Set();

            years[i][1].forEach(entry => {
                let sets = entry.colors;

                sets.forEach(color => {
                    uniqueColors.add(color.name);
                });
            });

            // Add data to yearData object
            yearData[i].num_unique_colors = uniqueColors.size;
            yearData[i].unique_colors = Array.from(uniqueColors);
        }

        return yearData;
    }

    setDisplayedMax() {

        let displayedMaxes = [];

        if (this.displayed.themes) {
            displayedMaxes.push(this.num_unique_themesMax);
        }
        if (this.displayed.colors) {
            displayedMaxes.push(this.num_unique_colorsMax)
        }
        if (this.displayed.sets) {
            displayedMaxes.push(this.num_setsMax)
        }
        if (this.displayed.pieces) {
            displayedMaxes.push(this.ave_num_piecesMax)
        }
        if (!this.displayed.themes
            && !this.displayed.colors
            && !this.displayed.sets
            && !this.displayed.pieces) { displayedMaxes.push(0); }

        this.displayedMax = d3.max(displayedMaxes);
    }

    //#endregion

    //#region Add Toggle

    addEventHandlers() {

        d3.select('#themeChartToggle-themes').on('click', e => {

            if (!this.displayed.themes) { // Activeate (draw it)

                this.displayed.themes = !this.displayed.themes;
                this.displayed.count++;

                this.updateYAxis();
                this.updateLines();

            } else { // Deactivate (remove it)

                if (this.displayed.count === 1) {

                    document.getElementById('themeChartToggle-themes').checked = true;
                    return;
                } else {

                    this.displayed.themes = !this.displayed.themes;
                    this.displayed.count--;

                    this.updateYAxis();
                    this.updateLines();
                }
            }

        })

        d3.select('#themeChartToggle-colors').on('click', e => {

            if (!this.displayed.colors) { // Activeate (draw it)

                this.displayed.colors = !this.displayed.colors;
                this.displayed.count++;

                this.updateYAxis();
                this.updateLines();

            } else { // Deactivate (remove it)

                if (this.displayed.count === 1) {

                    document.getElementById('themeChartToggle-colors').checked = true;
                    return;
                } else {

                    this.displayed.colors = !this.displayed.colors;
                    this.displayed.count--;

                    this.updateYAxis();
                    this.updateLines();
                }
            }
        })

        d3.select('#themeChartToggle-pieces').on('click', e => {

            if (!this.displayed.pieces) { // Activeate (draw it)

                this.displayed.pieces = !this.displayed.pieces;
                this.displayed.count++;

                this.updateYAxis();
                this.updateLines();

            } else { // Deactivate (remove it)

                if (this.displayed.count === 1) {

                    document.getElementById('themeChartToggle-pieces').checked = true;
                    return;
                } else {

                    this.displayed.pieces = !this.displayed.pieces;
                    this.displayed.count--;

                    this.updateYAxis();
                    this.updateLines();
                }
            }
        })

        d3.select('#themeChartToggle-sets').on('click', e => {
            
            if (!this.displayed.sets) { // Activeate (draw it)

                this.displayed.sets = !this.displayed.sets;
                this.displayed.count++;

                this.updateYAxis();
                this.updateLines();

            } else { // Deactivate (remove it)

                if (this.displayed.count === 1) {

                    document.getElementById('themeChartToggle-sets').checked = true;
                    return;
                } else {

                    this.displayed.sets = !this.displayed.sets;
                    this.displayed.count--;

                    this.updateYAxis();
                    this.updateLines();
                }
            }
        })
    }

    updateYAxis() {

        this.setDisplayedMax();

        this.yScale = d3.scaleLinear()
                        .domain([this.displayedMin, this.displayedMax])
                        .range([this.svgHeight - 35, 20])

        this.yAxis.scale(this.yScale);

        d3.select('#themes_y-axis')
          .transition()
          .duration(1000)
          .call(this.yAxis)
    }

    //#endregion
}