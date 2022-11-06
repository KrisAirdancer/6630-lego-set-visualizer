// Number of themes per year

// TODO: Consider adding a toggle to switch between number of themes per year and number of sets per year or even both together.
// TODO: Add tooltips

class ThemesLineChart {

    constructor(data) { 

        this.data = data;
        console.log(this.data);

        /* Process Data */

        this.themesData = this.processData();
        // console.log(this.themesData)

        /* Get SVG Data */

        this.svgHeight = parseInt(d3.select('#svg_themesLineChart').style('height'))
        this.svgWidth = parseInt(d3.select('#svg_themesLineChart').style('width'))
        console.log('svgHeight: ' + this.svgHeight)
        console.log('svgWidth: '+ this.svgWidth)

        /* Get Data Metadata */

        this.yearMin = d3.min(this.themesData, d => d.year);
        this.yearMax = d3.max(this.themesData, d => d.year);
        this.num_themesMin = d3.min(this.themesData, d=> d.num_unique_themes);
        this.num_themesMax = d3.max(this.themesData, d => d.num_unique_themes);
        console.log('yearMin: ' + this.yearMin)
        console.log('yearMax: '+ this.yearMax)
        console.log('num_themesMin: ' + this.num_themesMin)
        console.log('num_themesMax: '+ this.num_themesMax)

        /* Make Scales */

        // X-Scale
        this.xScale = d3.scaleLinear()
                        .domain([this.yearMin, this.yearMax]) // From
                        .range([45, this.svgWidth - 20]) // To

        // Y-Scale
        this.yScale = d3.scaleLinear()
                        .domain([0, Math.ceil(this.num_themesMax * 0.1) * 10])
                        .range([this.svgHeight - 25, 20])
    }
    
    //#region Draw basic chart

    drawLineChart() {
        this.drawAxes();
        this.drawThemesLine();
        this.drawSetsLine();
        this.drawPiecesLine();
        this.drawColorsLine();
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

    }

    // Average number of pieces per set per year
    drawPiecesLine() {

    }

    drawColorsLine() {

    }

    processData() {

        let years = d3.groups(this.data, d => d.year);
        console.log(years)
        let yearData = [];

        years.forEach(year => {

            yearData.push({
                year: year[0],
                themes: 0,
                num_unique_themes: 0,
                ave_num_pieces: 0,
                num_colors: 0,
                num_sets: 0
            })
        });
        console.log(yearData)

        this.getUniqueThemesAndCount(years, yearData);
        this.getAverageNumOfPieces(years, yearData);

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
            yearData[i].themes = Array.from(uniqueThemes);
        }

        console.log('FINAL:')
        return yearData;
    }

    getAverageNumOfPieces(years, yearData) {

        for (let i = 0; i < years.length; i++) {

            let sets = years[i][1];

            let sum = 0;

            sets.forEach(set => {
                sum += set.num_parts;
            });

            // TODO: May want to implement rounding of the average number of sets here.
            yearData[i].ave_num_pieces = (sum / sets.length)
        }
    }

    //#endregion

    //#region Tool Tip

    // TODO: Add tooltip code

    //#endregion
}