// Load data with dataProcess.js
// Initialize visualization objects
    // One for each vis
    // Pass each one a copy of the data object
    // One class (.js file) for each visualization
// Call the drawX() functions for each of the visualizations

data_list = [
            d3.csv('./data/inventories.csv'), // used
            d3.csv('./data/inventory_parts.csv'), // used
            d3.csv('./data/parts.csv'), //used
            d3.csv('./data/colors.csv'), // used
            d3.csv('./data/inventory_sets.csv'), // used
            d3.csv('./data/sets.csv'), // used
            d3.csv('./data/themes.csv') ]; // used

Promise.all(data_list).then(data => {
        data = processData(data);
        data = data.filter(d => d.num_parts > 0);
        let piecesLineChart = new PiecesLineChart(data);
        piecesLineChart.drawLineChart();
});


/**
 * Processes the data to only include only the 
 * informaiton that is nesscary for the visualizations.
 * @param {Array} data 
 * @returns Processed Data
 */
function processData(data) {
    let years = acendingYearData(data);
    let parts = d3.group(data[1], d => d.inventory_id);
    let group_inv = d3.group(data[0], d => d.set_num);
    
    // Create a data structure to store the information
    let processData = [];
    let pIndex = 0;

    // Adding the data to the years
    for( let [key, value] of years) {
        for (let index = 0; index < value.length; index++) {
            processData[pIndex++] = {
                year: value[index].year,
                set_name: value[index].name,
                theme_name: getTheme_id(data[6], value[index]),
                num_parts: parseInt(value[index].num_parts),
                num_color: getNum_Colors(parts, group_inv, data[4], value[index].set_num)
            };
        }
    }

    return processData;
}

/**
 * A helper function that will sort the data based on years in
 * Acending Order 
 * @param {Array} data 
 * @returns data grouped by year in acending order
 */
function acendingYearData(data) {
    // Sort the data based on the year in acending 
    let sorted_sets = data[5].sort((a,b) => {
        return (a.year > b.year)? 1: -1;
    });

    return d3.group(sorted_sets, d => d.year);
}

/**
 * A helper function that will pull all of the 
 * @param {Array} themes 
 * @param {Object} set 
 * @returns Theme name associated with the set
 */
function getTheme_id(themes, set) {
    let theme_index = themes.findIndex(d => d.id == set.theme_id);
    return themes[theme_index].name;
}

/**
 * A helper function that will count the number of 
 * unique colors within each set.
 * @param {Array} colors 
 * @param {Object} set 
 */
function getNum_Colors(inv_part, inv, inv_set, set_num) {
    let inv_id = inv.get(set_num);
    
    let unique_colors = new Set();
    for(let index = 0; index < inv_id.length; index++) {
        let value = inv_id[index];
        let parts = inv_part.get(value.id);
        if(parts !== undefined) {
            let colors = d3.group(parts, d => d.color_id);
            for([key, value] of colors) {
                unique_colors.add(colors.get(key));
            }
        }
    }
    return unique_colors.size;
}