# item-explorer
Exploring item combinations with a bar chart.
Supports column features.

- items_empty.html for loading data with XHR from Web Server
- items_example.html for reading data from 'pre' tag (no web server needed)

<h3>Format of the csv file</h3>
<p>
The file must a comma separated file with the first row containing the attribute names.
The attribute refering to the frequency has to be preceded with a "_"(underscore).
The name following the underscore is displayed for the y axis.
</p>
<p>
<h5>Column features</h5>
Features can be added in the first line of the csv file to the attributes.
Multiple features per attribute are possible. Features are specified after the corresponding attribute separated by a ":"(colon)
<br>
Example for first line of csv file with column features:
<code>_customers,item1:LN=longitem1,item2:LN=longitem2,item3:LN=longitem3</code>


<h5>Supported column features:</h5>

 -<code>CO=</code> for specifying a color in rgb. E.g: <code>CO=rgb(70 130 180)</code>. <br>Color can be used to denote certain items belonging together.
 -<code>LN=</code> for specifying a long name of an item. E.g: <code>LN=myLongItemName</code>
 -<code>DI=</code> for specifying a dimension. E.g: <code>DI=fruits</code>. <br>Dimension can be specified when certain items have a different meaning hence belonging to a different dimension. Different dimensions are drawn in separate bar charts.
<br>Note that the attribute names must be distinct, otherwise an error occurs.
</p>
