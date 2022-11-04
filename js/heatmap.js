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
    constructor(globalData) {
        // create an xScale based on the year
        // Create a yScale based on the num_sets
        // Create a color Scale based on num_colors

        // DrawInitialRects
    }

    /**
     * A helper function that will draw the original 
     * graph that is shown on the svg before any interaction
     * @param {Object} data 
     */
    drawInitialRects(data, xScale, yScale, colorScale) {
        // Create a g for the rect
        // Bind data to each rectangle
        // .on functions to help with tooltip and popout
    }

    /**
     * A helper function that will draw the tooltip
     * to highlight the Max and Min color properties
     * per year.
     * @param {Object} data 
     */
    drawToolTipProperties(data){
        // Create a rectangle 
        // Create text that will display 
    }
}