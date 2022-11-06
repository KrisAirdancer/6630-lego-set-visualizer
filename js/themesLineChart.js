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
                        .domain([this.num_themesMin, Math.ceil(this.num_themesMax * 0.1) * 10])
                        .range([this.svgHeight - 25, 20])
    }
    
    //#region Draw basic chart

    drawLineChart() {
        this.drawAxes();
        this.drawLine();
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

    drawLine() {

    }

    processData() {

        let years = d3.groups(this.data, d => d.year);

        let themeCounts = []

        for (let i = 0; i < years.length; i++) {
            let uniqueThemes = new Set();

            years[i][1].forEach(entry => {

                uniqueThemes.add(entry.theme_name)
            });

            themeCounts.push({
                year: years[i][0],
                themes: uniqueThemes,
                num_unique_themes: uniqueThemes.size
            })
        }

        return themeCounts;
    }

    //#endregion

    //#region Tool Tip

    // TODO: Add tooltip code

    //#endregion
}