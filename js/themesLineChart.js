// Number of themes per year

// TODO: Add tooltips. Maybe...
// TODO: Add a color legend to this vis.

/* NEXT STEPS:
 * - Call the updateVis() method.
 *     - This method should look at the this.displayed object and transition the lines set to 'true' onto the vis and transition the lines set to 'false' off of the vis.
 */

class ThemesLineChart {

    constructor(data) { 

        this.data = data;
        console.log(this.data);

        this.displayed = {
            themes: true,
            colors: false,
            pieces: false,
            sets: false
        }

        /* Process Data */

        this.themesData = this.processData();
        console.log('THEMESDATA:')
        console.log(this.themesData)

        /* Get SVG Data */

        this.svgHeight = parseInt(d3.select('#svg_themesLineChart').style('height'))
        this.svgWidth = parseInt(d3.select('#svg_themesLineChart').style('width'))
        console.log('svgHeight: ' + this.svgHeight)
        console.log('svgWidth: '+ this.svgWidth)

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

        // TODO: Set to round displayedMax to the next highest MSD. Ex. if max = 192, round to 200; of max = 2878, round to 3000; if max = 2023, round to what?
        // Maximum and Minimum y-axis values
        this.displayedMin = 0;
        this.displayedMax;
        this.setDisplayedMax();
        console.log(`globalMin: ${this.displayedMin}, globalMax: ${this.displayedMax}`);

        /* Make Scales */

        // X-Scale
        this.xScale = d3.scaleLinear()
                        .domain([this.yearMin, this.yearMax]) // From
                        .range([45, this.svgWidth - 20]) // To

        // Y-Scale
        this.yScale = d3.scaleLinear()
                        // .domain([0, Math.ceil(this.num_unique_themesMax * 0.1) * 10]) // TODO: Round the axis labels somehow
                        .domain([this.displayedMin, this.displayedMax])
                        .range([this.svgHeight - 25, 20])

        this.yAxis = d3.axisLeft();
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

        // Draw xAxis
        let xAxis = d3.axisBottom()
                      .scale(this.xScale)
                      .tickFormat(d => `${d}`)
                      .tickValues([1949, 1960, 1970, 1980, 1990, 2000, 2010, 2022])

        svg.append('g')
           .attr('id', 'x-axis')
           .attr('transform', `translate(${0}, ${this.svgHeight - 25})`)
           .call(xAxis)

        // Draw yAxis
        this.yAxis.scale(this.yScale);

        svg.append('g')
           .attr('id', 'y-axis')
           .attr('transform', `translate(${45}, ${0})`)
           .call(this.yAxis)
    }

    drawThemesLine() {

        let svg = d3.select('#svg_themesLineChart')
        
        svg.append('path')
           .attr('id', 'themesLine')
           .datum(this.themesData)
           .attr('fill', 'none')
           .attr('stroke', 'black')
           .attr('stroke-width', '1.5')
           .attr('d', d3.line()
                        .x(d => this.xScale(d.year))
                        .y(d => this.yScale(d.num_unique_themes))
                )
    }

    drawSetsLine() {

        let svg = d3.select('#svg_themesLineChart')
        
        svg.append('path')
           .attr('id', 'setsLine')
           .datum(this.themesData)
           .attr('fill', 'none')
           .attr('stroke', 'red')
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
           .attr('id', 'piecesLine')
           .datum(this.themesData)
           .attr('fill', 'none')
           .attr('stroke', 'blue')
           .attr('stroke-width', '1.5')
           .attr('d', d3.line()
                        .x(d => this.xScale(d.year))
                        .y(d => this.yScale(d.ave_num_pieces))
                )
    }

    drawColorsLine() {

        let svg = d3.select('#svg_themesLineChart')
        
        svg.append('path')
           .attr('id', 'colorsLine')
           .datum(this.themesData)
           .attr('fill', 'none')
           .attr('stroke', 'green')
           .attr('stroke-width', '1.5')
           .attr('d', d3.line()
                        .x(d => this.xScale(d.year))
                        .y(d => this.yScale(d.num_unique_colors))
                )
    }

    updateLines() {

        if (this.displayed.colors) {
        }
        if (this.displayed.pieces) {
            
        }
        if (this.displayed.sets) {
            
        }
        if (this.displayed.themes) {
            this.drawThemesLine();
        } else {
            d3.select('#themesLine').remove();
        }
    }

    //#endregion

    //#region Process Data

    processData() {

        let years = d3.groups(this.data, d => d.year);
        console.log('YEARS:')
        console.log(years)
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

        console.log('YEARDATA:')
        console.log(yearData)
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
        console.log('AT: setDisplayedMax()');

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
        console.log(displayedMaxes)

        this.displayedMax = d3.min(displayedMaxes);        
    }

    //#endregion

    //#region Add Toggle

    addEventHandlers() {
        console.log('AT: addEventHandlers()');

        d3.select('#themeChartToggle-themes').on('click', e => {
            console.log('AT: themes event handler');

            this.displayed.themes = !this.displayed.themes;

            this.updateYAxis();
            this.updateLines();
        })

        d3.select('#themeChartToggle-colors').on('click', e => {

            if (!this.displayed.colors) {
                this.drawColorsLine();
                this.displayed.colors = true;
            } else {
                d3.select('#colorsLine').remove();
                this.displayed.colors = false;
            }
        })

        d3.select('#themeChartToggle-pieces').on('click', e => {

            if (!this.displayed.pieces) {
                this.drawPiecesLine();
                this.displayed.pieces = true;
            } else {
                d3.select('#piecesLine').remove();
                this.displayed.pieces = false;
            }
        })

        d3.select('#themeChartToggle-sets').on('click', e => {

            if (!this.displayed.sets) {
                this.drawSetsLine();
                this.displayed.sets = true;
            } else {
                d3.select('#setsLine').remove();
                this.displayed.sets = false;
            }
        })
    }

    updateYAxis() {
        console.log('AT: updateYAxis()');

        this.setDisplayedMax();

        this.yScale = d3.scaleLinear()
                        .domain([this.displayedMin, this.displayedMax])
                        .range([this.svgHeight - 25, 20])

        this.yAxis.scale(this.yScale);

        d3.select('#y-axis')
          .transition()
          .duration(1000)
          .call(this.yAxis)
    }

    //#endregion

    //#region Tool Tip

    // TODO: Add tooltip code

    //#endregion
}