# Item explorer
Exploring combinatorial questions with a bar chart. There are many applications with combinatorial questions such as discovering frequent combinations of items bought in a store (market basket analysis) or exploring what web pages do users visit on a certain web site.
Item explorer is build using the [d3-template](https://github.com/EE2dev/d3-template) which implements the reusable charts pattern to let you customize the chart.

[Here](https://youtu.be/B8a2O6L31_w) is a link to a video explaining how to use item explorer with your own data and [here](http://www.ankerst.de/Mihael/proj/mbc/) is a web site introducing item explorer.

### Examples

[The main example is here](http://bl.ocks.org/EE2dev/raw/a3ee04578325668bd3f8/).

Complete list of examples:

1. Data formatting
  * [basic data structure](http://bl.ocks.org/ee2dev/5a4ab3ca8b3b7b57d234)
  * [basic data structure with added colors](http://bl.ocks.org/ee2dev/0f7abbfc6ab01513d89a)
  * [basic data structure with long names](http://bl.ocks.org/ee2dev/d9ad0499316f09c598a3)
  * [basic data structure with dimensions](http://bl.ocks.org/ee2dev/2a7a31815153d26b39f6)
  * [basic data structure with all column features](http://bl.ocks.org/ee2dev/69c42b901d0ed52d480a)

2. Including data
  * [standard reference to csv file](http://bl.ocks.org/ee2dev/3bb8a779948659a5b101)
  * [reference to data embedded in html file](http://bl.ocks.org/ee2dev/07bbe91f368e5ce0b180)
  * [preprocessing csv file before passing it on](http://bl.ocks.org/ee2dev/a5e1b098533228613f28)
  * [preprocessing embedded data before passing it on](http://bl.ocks.org/ee2dev/de4a9e0010795ace76b8)

3. Visualization options
  * [changing the thousands separator and the tick format](http://bl.ocks.org/EE2dev/131ad62a0ef5a8e6968b/)

### 1. Data formatting

The file must be a comma separated file with the first row containing the attribute names.
The attribute refering to the frequency has to be preceded with a `_`(*underscore*).
The name following the *underscore* is displayed as the label for the y axis. Note that the attribute names must be distinct, otherwise an error occurs.
All other rows contain a comma separated list of the frequency and `0`'s or `1`'s for each attribute depending on if it applies or not. 

####Column features

Features can be added to the attributes in the first line of the csv file.
Multiple features per attribute are possible. Features are specified after the corresponding attribute separated by a `:`(colon).

#####Supported column features:

- `CO=` for specifying a color in rgb. E.g: `CO=rgb(70 130 180)`. Color can be used to denote certain items belonging together.
- `LN=` for specifying a long name of an item. E.g: `LN=myLongItemName`.
- `DI=` for specifying a dimension. E.g: `DI=fruits`. 
Dimensions can be specified when certain items have a different meaning hence belonging to different dimensions. Different dimensions are drawn in separate bar charts and sorted separately.

Example of a csv file with column features:
```
_customers,item1:LN=longitem1,item2:LN=longitem2,item3:LN=longitem3,item4
1378,1,0,0,0
6352,0,1,0,0
435,1,1,1,0
...
```

### 2. Including data

If a csv file with data in the correct format exists, the typical call of item explorer looks as follows:

```javascript
    ...
    // include the following three files:
    <link rel="stylesheet" type="text/css" href="http://www.ankerst.de/lib/itemExplorer_10.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.6/d3.min.js"></script>
    <script src="http://www.ankerst.de/lib/itemExplorer_10.min.js"></script>
    ...
    // setup a chart with a csv file and add the visualization to a DOM element
    var myIEChart = itemExplorerChart("items.csv");
    showChart(); 
    
    function showChart() {
      d3.select("body")
        .append("div")
        .attr("class", "chart")
        .call(myIEChart);
    }  
```

### 3. Visualization options

function | explanation
------------ | -------------
`barWidth()` | sets the width of each bar in pixels. The default value is 38.
`barHeight()` | sets the maximum height of the bars in pixels. The default value is 340.
`thousandsSeparator()` | sets the thousands separator and will be applied to the y axis, the info and exploration panels and the tooltip. The default value is "," (e.g. leading to 1,000) with the decimal separator being ".". The only other choice is "." (e.g. leading to 1.000) leading to the decimal separator ",".
`tickFormat()` | sets the [tick format](https://github.com/mbostock/d3/wiki/SVG-Axes#tickFormat) for the y axis. The default value is ",.0f".
`drawGridLines()` | draws the grid lines. The default value is true.
