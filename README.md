# item-explorer
Exploring item combinations with a bar chart.
Supports column features.

### Examples

One example is here.
Other examples are:

| topic  | example |
| ------------- | ------------- |
| data format  | basic data structure  |
| data format  | added colors  |
| data format  | added long names  |
| data format  | added dimensions |
| data format  | using all column features  |
| including data | standard reference to csv file  |
| including data | reference to csv file, with preprocessing |
| including data | reference to data in `<pre>` tag  |
| including data | reference to data in `<pre>` tag,  with preprocessing |
| vis options | standard reference to csv file  |
| vis options | standard reference to csv file  |
| vis options | standard reference to csv file  |
| vis options | standard reference to csv file  |
| vis options | standard reference to csv file  |
| vis options | standard reference to csv file  |

List of Examples:

Data formatting:
* basic data structure
* basic data structure with added colors
* basic data structure with long names
* basic data structure with dimensions
* basic data structure with all column features

Including data
* standard reference to csv file
* preprocessing csv file before passing it to on
* reference to data embedded in html file
* preprocessing embedded data before passing it to on
* preprocessing embedded data before passing it to on

* basic data structure with long names
* basic data structure with dimensions
* basic data structure with all column features

### Format of the csv file

The file must be a comma separated file with the first row containing the attribute names.
The attribute refering to the frequency has to be preceded with a `_`(*underscore*).
The name following the *underscore* is displayed as the label for the y axis. Note that the attribute names must be distinct, otherwise an error occurs.

####Column features

Features can be added to the attributes in the first line of the csv file.
Multiple features per attribute are possible. Features are specified after the corresponding attribute separated by a ":"(colon).

Example for first line of csv file with column features:
`_customers,item1:LN=longitem1,item2:LN=longitem2,item3:LN=longitem3`

#####Supported column features:

- `CO=` for specifying a color in rgb. E.g: `CO=rgb(70 130 180)`. Color can be used to denote certain items belonging together.
- `LN=` for specifying a long name of an item. E.g: `LN=myLongItemName`.
- `DI=` for specifying a dimension. E.g: `DI=fruits`. 
Dimension can be specified when certain items have a different meaning hence belonging to a different dimension. Different dimensions are drawn in separate bar charts and sorted separately
.

