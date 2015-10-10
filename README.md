# item-explorer
Exploring combinatorial questions with a bar chart. There are many applications with combinatorial questions such as discovering frequent combinations of items bought in a store (market basket analysis) or exploring what web pages do users visit on a certain web site.
Item explorer follows the [d3.js reusable charts pattern](http://bost.ocks.org/mike/chart/) to let you customize the chart.

### Examples

One example is here.
Complete list of examples:

1. Data formatting
  * basic data structure
  * basic data structure with added colors
  * basic data structure with long names
  * basic data structure with dimensions
  * basic data structure with all column features

2. Including data
  * [standard reference to csv file](http://bl.ocks.org/ee2dev/3bb8a779948659a5b101)
  * [reference to data embedded in html file](http://bl.ocks.org/ee2dev/07bbe91f368e5ce0b180)
  * [preprocessing csv file before passing it on](http://bl.ocks.org/ee2dev/a5e1b098533228613f28)
  * [preprocessing embedded data before passing it on](http://bl.ocks.org/ee2dev/de4a9e0010795ace76b8)

3. Visualization options
  * standard reference to csv file
  * preprocessing csv file before passing it to on
  * reference to data embedded in html file
  * preprocessing embedded data before passing it to on

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
Dimensions can be specified when certain items have a different meaning hence belonging to different dimensions. Different dimensions are drawn in separate bar charts and sorted separately
.

Example for a csv file with column features:
```
_customers,item1:LN=longitem1,item2:LN=longitem2,item3:LN=longitem3,item4
1378,1,0,0,0
6352,0,1,0,0
435,1,1,1,0
...
```

### 2. Including data

When a csv file with data in the correct format exists, the typical call of item explorer looks as follows:

```javascript
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
`myData` | contains the data to be visualized
`barWidth` | sets the width of one bar in pixels. The default is 38px.
