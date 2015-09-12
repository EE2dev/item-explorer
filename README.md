# item-explorer
Exploring item combinations with a bar chart.
Supports column features.

<li>items_empty.html for loading data with XHR from Web Server
<li>items_example.html for reading data from 'pre' tag (no web server needed)

<h3>Format of the csv file</h3>
<p>
The attribute with the frequency has to be preceded with a "_"(underscore).
The name after the underscore is displayed for the y axis.
</p>
<p>
<h5>Column features</h5>
Features can be added in the first line of the csv file to the attributes.
Multiple features per attribute are possible. Features are specified after the corresponding attribute separated by a ":"(colon)
<br>
Example for first line of csv file with column features:
<code>_customers,item1:LN=longitem1,item2:LN=longitem2,item3:LN=longitem3</code>


<h5>Supported column features:</h5>
<li><code>CO=</code> for specifying a color in rgb. E.g: <code>CO=rgb(70 130 180)</code>. Color can be used to denote items belonging the same group.
<li><code>LN=</code> for specifying a long name of an item. E.g: <code>LN=myLongItemName</code>
<li><code>DI=</code> for specifying a dimension. E.g: <code>DI=fruits</code>. Dimensions can be specified when certain items have a different meaning hance belonging to a differen dimension. Different dimensions are drawn in separate bar charts.
<br>Note that the attribute names must be distinct, otherwise an error occurs.
</p>
