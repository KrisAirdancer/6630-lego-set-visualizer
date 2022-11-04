// Load data with dataProcess.js
// Initialize visualization objects
    // One for each vis
    // Pass each one a copy of the data object
    // One class (.js file) for each visualization
// Call the drawX() functions for each of the visualizations

data_list = [d3.csv('./data/colors.csv'),
            d3.csv('./data/elements.csv'),
            d3.csv('./data/inventories.csv'),
            d3.csv('./data/inventory_minifigs.csv'),
            d3.csv('./data/inventory_parts.csv'),
            d3.csv('./data/inventory_sets.csv'),
            d3.csv('./data/minifigs.csv'),
            d3.csv('./data/part_categories.csv'),
            d3.csv('./data/part_relationships.csv'),
            d3.csv('./data/parts.csv'),
            d3.csv('./data/sets.csv'),
            d3.csv('./data/themes.csv')];

Promise.all(data_list).then(data => 
    {
        // Processing the data
        console.log(data);
            
    }
);

console.log("Hello, World!");

let data = processData()
console.log(data)





function processData() {
    return {
        ID: 007,
        name: "James Bond"
    }
}