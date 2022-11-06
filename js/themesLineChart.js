// Number of themes per year

class ThemesLineChart {

    constructor(data) { 

        this.data = data;
        console.log(this.data);

        /* Process Data */

        this.themesData = this.processData();
        // console.log(this.themesData)
        

    }
    
    //#region Draw basic chart

    drawLineChart() {

    }

    drawAxes() {

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