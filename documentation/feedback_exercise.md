
# Peer Feedback

## Feedback Notes

**Chord Diagram**
- Replacing the chord diagram with a time-series diagram (bars representing years with lines linking different elements in those bars) might make the connections and relationships between pieces/sets clearer or more interesting.
- Selected elements in the chord diagram should be highlighted. eg. They are outlined or lit up when clicked on.
    - Could grey out the other elements instead.
- Multi-select for chord diagram.
    - Allow the user to select more than one relationship line in the chord diagram at a time.
- Add a table next to the chord diagram to display the selection (pieces, sets, year, etc.)
- If available, add set popularity to the pieces over time plot.
    - Could encode this in the size of the dots.
- Could reduce the number of sets arrayed around the chord diagram by only displaying sets of a single theme or only user selected sets.
    - Could have a dropdown for the user to select the theme they want to display.
    - Could have a dropdown with search function (or other selector) to allow the user to select the sets that the user wants to display.
- Animations
    - Could animate the dots sliding up and into the pieces over time plot when the plot loads or changes data.
    - Could animate the relationship lines in the chord diagram to connect when the diagram loads or changes displayed data.
- No need for colors on the chord diagram.
- Adding a temporal component to the chord diagram, such as by turing it into a parallel lines chart (with flow lines connecting the pieces on each bar).

**Pieces Over Time Plot**
- Add an image of the set to the tooltip that pops up when a set is hovered over.
- Could do a story style version of this - multiple plots showing different variables vs time that show how legos have changed over time.
    - Would replace the chord diagram.

## Proposed Changes

- Based on the feedback we recieved, we have decided to change our project design. We will be replacing our current design with a scrolling storyboard that shows how Lego has changed over time. Specifically, we will use a series of visualizations that a user can scroll through to show the changes to Legos that have occurred over time.
    - Some of the variables we plan to show over time (per year): number of pieces per set, number of sets published, number of themes published, number of colors, number of piece categories, and number of spare pieces per set.
- All of the visualizations will have hover-over tooltips and some will have dropdown menus that allow the user to select different variables to compare (eg. number of colors per year and number of themes per year plotted on the same visualization)
- A strectch goal is to make the visualization click-through, instead of scroll-through, where the user clicks naviation buttons to be shown the different visualizations.