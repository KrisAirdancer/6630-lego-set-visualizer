// Number of themes per year

// TODO: Consider adding a toggle to switch between number of themes per year and number of sets per year or even both together.
// TODO: Add tooltips
// TODO: May want to cut 1949 out of this visualization b/c it is such an outlier. The vis isn't wrong, it was just a year that they released mostly sets with lots of pieces, and 1950 was a year of sets with just a few (literally) pieces.
// TODO: Add a color legend to this vis.

/* NEXT STEPS:
 * - In the event handler functions, set the appropriate variables in the this.displayed object.
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

        console.log('yearMin: ' + this.yearMin)
        console.log('yearMax: ' + this.yearMax)
        console.log('num_themesMin: ' + this.num_unique_themesMin)
        console.log('num_themesMax: ' + this.num_unique_themesMax)
        console.log('ave_num_piecesMin: ' + this.ave_num_piecesMin)
        console.log('ave_num_piecesMax: ' + this.ave_num_piecesMax)
        console.log('num_setsMin: ' + this.num_setsMin)
        console.log('num_setsMax: ' + this.num_setsMax)
        console.log('num_unique_colorsMin: ' + this.num_unique_colorsMin)
        console.log('num_unique_colorsMax: ' + this.num_unique_colorsMax)

        this.displayedMin = d3.min([this.num_unique_themesMin, this.ave_num_piecesMin, this.num_setsMin, this.num_unique_colorsMin]);
        this.displayedMax = d3.max([this.num_unique_themesMax, this.ave_num_piecesMax, this.num_setsMax, this.num_unique_colorsMax]);
        console.log(`globalMin: ${this.displayedMin}, globalMax: ${this.displayedMax}`);

        /* Make Scales */

        // X-Scale
        this.xScale = d3.scaleLinear()
                        .domain([this.yearMin, this.yearMax]) // From
                        .range([45, this.svgWidth - 20]) // To

        // Y-Scale
        this.yScale = d3.scaleLinear()
                        // .domain([0, Math.ceil(this.num_unique_themesMax * 0.1) * 10])
                        .domain([this.displayedMin, this.displayedMax])
                        .range([this.svgHeight - 25, 20])
    }
    
    //#region Draw basic chart

    drawLineChart() {
        this.drawAxes();
        this.drawThemesLine();
        this.drawSetsLine();
        this.drawPiecesLine();
        this.drawColorsLine();
        this.addEventHandlers();
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
        this.yAxis = d3.axisLeft()
                      .scale(this.yScale)

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

    //#endregion

    //#region Add Toggle

    addEventHandlers() {
        console.log('AT: addEventHandlers()');

        d3.select('#themeChartToggle-themes').on('click', e => {
            console.log('AT: themes handler')
            console.log(e.target.checked)
        })

        d3.select('#themeChartToggle-colors').on('click', e => {
            console.log('AT:  colors')
            console.log(e.target.checked)
        })

        d3.select('#themeChartToggle-pieces').on('click', e => {
            console.log('AT:  pieces')
            console.log(e.target.checked)
        })

        d3.select('#themeChartToggle-sets').on('click', e => {
            console.log('AT:  sets')
            console.log(e.target.checked)
        })
    }

    addToggle() {

    }

    determineAxisScaling() {
        // Loop over all min and max values for all plotted lines and select the largest and smallest among them.
    }

    //#endregion

    //#region Tool Tip

    // TODO: Add tooltip code

    //#endregion
}