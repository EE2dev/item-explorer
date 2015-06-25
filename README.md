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
_customers,item1:LN=longitem1,item2:LN=longitem2,item3:LN=longitem3

Supported column features:
<li>CO= for specifying color in rgb. E.g: CO=rgb(70, 130, 180)
<li>LN= for specifying long name of item. E.g: LN=myLongItemName
<li>GR= for specifying group. E.g: GR=1 (used for separated bar charts per group)
<br>Note that the attribute names must be distinct, other an error occurs.
</p>
