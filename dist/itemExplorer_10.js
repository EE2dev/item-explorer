var itemExplorerChart = function(_myData) {
  "use strict";
    // console.time("Time for data loading");
    var firstTime = true;
    var file;
    var data;
    var groupMap = d3.map();
    var maxFrequencyOfInitialItems;
    var maxFrequencyOfCurrentItems;
    var initialFrequencyTotal = 0;
    var currentFrequencyTotal;
    var selectedItemSet = d3.map();
    var listOfAlternativeItemSets = d3.map();
    var alternativeItemSet = null;
    var altId = 0;
    var altArcMap = d3.map();
    var frequentItemOne = [];
    var frequencyName;
    var chart;
    var barWidth = 38;
    var svgLeft; 
    var svgRight;
    var y;    // y scale
    var yAxis;
    var tickFormat;
    var thousandsSeparator = ",";
    var gridLines = true;
    var createHTMLFrame = true;
    var localeFormatter = d3.locale({
      "decimal": ",",
      "thousands": ".",
      "grouping": [3],
      "currency": ["", "€"],
      "dateTime": "%a, %e %b %Y, %X",
      "date": "%d.%m.%Y",
      "time": "%H:%M:%S",
      "periods": ["", ""],
      "days": ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
      "shortDays": ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
      "months": ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
      "shortMonths": ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"]
    });

    var margin = {top: 20, right: 20, bottom: 20, left: 20},
      padding = {top: 60, right: 60, bottom: 60, left: 70},
      myOuterWidth = 960,
      myOuterHeight = 500,
      // myInnerWidth = myOuterWidth - margin.left - margin.right,
      myInnerHeight = myOuterHeight - margin.top - margin.bottom,
      // width = myInnerWidth - padding.left - padding.right,
      myHeight = myInnerHeight - padding.top - padding.bottom;

    var controlPointY = 2 * (padding.bottom - 25) - 1;  

    var altArc = d3.svg.line()
      .interpolate(function(points) {
        var mean = ((points[0][0] + points[1][0]) / 2);
        return points.join("q " + mean + "," + controlPointY +" ");})
      .x(function(d) { return d.x;})
      .y(function(d) { return d.y;});          
    
    // 0.1 functions for external access
    function IEChart(selection) {
      selection.each( function (d) {
        if (createHTMLFrame) {
          buildHTMLFrame();
        }
        console.log(d);
        console.log("_myData "+ _myData);
        if (typeof d !== 'undefined') { // data processing from outside
          createChart(selection, d);
        }
        else { // data processing here
          if (typeof _myData !== 'undefined') { 
            readData(_myData, selection);
          } 
          else {
            readData("<pre>", selection);
          }
        }
      });
    }

    IEChart.barWidth = function (_barWidth) {
      if (!arguments.length) {
        return barWidth;
      }
      barWidth = _barWidth;
      return IEChart;      
    };
    
    IEChart.barHeight = function (_barHeight) {
      if (!arguments.length) {
        return myHeight;
      }
      myHeight = _barHeight;
      return IEChart;      
    };
    
    IEChart.thousandsSeparator = function (_thousandsSeparator) {
      thousandsSeparator = _thousandsSeparator;
      return IEChart;      
    };

    IEChart.drawGridLines = function (_gridLines) {
      gridLines = _gridLines;
      return IEChart;      
    };    

    IEChart.createHTMLFrame = function (_createFrame) {
      createHTMLFrame = _createFrame;
      return IEChart;      
    };     
    
    IEChart.tickFormat = function (_tickFormat) {
      tickFormat = _tickFormat;
      return IEChart;      
    };
    
    IEChart.update = function() {
      render(false);
      return IEChart;
    };

    IEChart.resort = function() {
      sortItems();
      return IEChart;
    };
    
    IEChart.showHelp = function() {
      showHelp();
      return IEChart;
    };
    
    IEChart.removeHelp = function() {
      removeHelp();
      return IEChart;
    };
    
     // 0.2 XHR to load data   
    function readData(csvFile, selection) {
      if (csvFile !== "<pre>") {
        d3.csv(csvFile, convertToNumber, function(error, f) {
          createChart(selection, f);
        });
      } 
      else {
        file = d3.csv.parse(d3.select("pre#data").text()); 
        file.forEach( function (row) {
          convertToNumber(row);
        });
        console.log("hier");
        console.log(file);
        createChart(selection, file);
      }
    } 

    // 0.3 helper for XHR in 0.2
    function convertToNumber(d) {
      for (var perm in d) {
          if (Object.prototype.hasOwnProperty.call(d, perm)) {
            d[perm] = +d[perm];
          }
        }  
      return d;
    } 
    
    // 0.4
    function createChart(selection, _file) {
      selection.each(function() {
        file = _file; 
        parseFirstColumn(file);
        y = d3.scale.linear().range([myHeight, 0]); 
        
         if (thousandsSeparator === ",") {
          yAxis = d3.svg.axis().scale(y).orient("left").ticks(10, tickFormat);
        }
        else {// thousandsSeparator === "." 
          tickFormat = (!tickFormat) ? ",.0f" : tickFormat;
          yAxis = d3.svg.axis().scale(y).orient("left").tickFormat(localeFormatter.numberFormat(tickFormat));
        }
        var div = d3.select(this);
        chart = div.append("svg")
          .call(svgInit);
        
        var counter = 0;
        var groupArea;
        
        d3.select("g.padding").append("g")
          .attr("class", "allTooltips");
        
        groupMap.forEach(function (groupName, groupProperties){
          groupArea = d3.select("g.padding").datum(groupProperties).insert("g", "g.allTooltips")
            .attr("class", "groupBlock group" + groupName);
          
          groupArea.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + myHeight + ")"); 
            
          d3.select(groupProperties.selector + ">.x.axis").call(groupProperties.axis);

          if (counter === 0) {
            render(true, groupName);
          }
          else {
            render(false, groupName);
          }
          counter++;
        });  
      });
    } 
    
    // 0.5 main svg - called by 0.4 createChart()
    function svgInit(svg) {
      svg.attr("width", myOuterWidth)
      .attr("height", myOuterHeight)
      .attr("class", "IEChart")
      .append("g")
      .attr("class", "margin")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .append("g")
      .attr("class", "padding")
      .attr("transform", "translate(" + padding.left + "," + padding.top + ")");
    }    
        
    // 1.1 helper (parse all parts of column name) for reading data from file
    function parseFirstColumn(_file) {
      var _items = d3.keys(_file[0]).filter(function(key) { 
        if (key.substring(0,1) === "_") {
          frequencyName = key;
          return false;
        }  
        else { 
          return true;
        }
      });
      
      var itemParts; 
      var itemObject;
      data = _items.map(function(d, i){
        itemObject = {
          item: d, 
          itemShort: d, 
          itemLong: d,
          color: "rgb(70, 130, 180)",  
          frequency: 0, 
          index: i,
          group: ""
        };
        itemParts = d.split(":");
        setItemProperties( itemObject, itemParts);         
        return itemObject;
      });
      
      finishGroupProperties();
      _items = _items.map( function(d,i) {
        var itemPiece = d.split(":");
        return itemPiece[0];
        }); 
      return _items;  
    }
    
    // 1.2 helper for 1.1    
    function setItemProperties(_itemObject, _itemTokens) {
      _itemObject.itemLong = _itemTokens[0];
      _itemObject.itemShort = _itemTokens[0];
      _itemTokens.forEach( function (_token) {
        switch (_token.substring(0,3)) {
          case "CO=":
            _itemObject.color = _token.slice(3);
            if (_itemObject.color.substr(0, 3) === "rgb") {
              _itemObject.color = _itemObject.color.replace(/ /g, ",");
            }  
            break;
          case "LN=":
            _itemObject.itemLong = _token.slice(3);
            break;
          case "DI=":
            _itemObject.group = _token.slice(3).replace(/\s+/g, "_");
            break;  
        }
      });
      addGroup(_itemObject.itemShort, _itemObject.group);
    }
    
    // 1.3 helper function to map between two different column representations
    // _item: complete column name from file . @returns itemShort (just column name used for x axis)
    function mapItemToItemShort (_item) {
      return _item.split(":")[0];
    }
    
    // 1.4 helper function to map between two different column representations (for div filter)
    // _item: complete column name from file . @returns itemLong (long column name))
    function mapItemToItemLong (_item) {
      var _itemTokens = _item.split(":");
      var _longName = _itemTokens[0];
      _itemTokens.forEach( function (_token) {
        if (_token.substring(0,3) === "LN=") {
          _longName = _token.slice(3);
        }
      });
      return _longName;
    }
    
    // 1.5 helper processing function for storing properties for distinct groups
    function addGroup(itemObject, group) {
      var groupProperties;
      if (groupMap.has(group)) {
        groupProperties = groupMap.get(group);
        groupProperties.items.push(itemObject);
      } 
      else {
        groupProperties =
          {
            items: [itemObject],
            data: [],
            selector: "g.group"+group,
            width: -1,
            xScale: null, 
            axis: null,
            firstTime: true
          };
      }
      groupMap.set(group, groupProperties);
    }    
    
    // 1.6 helper processing function for adding remaining properties for distinct groups
    function finishGroupProperties() {
      groupMap.forEach(function (groupName, groupProperties){
        var newGroupProperties = groupProperties;
        newGroupProperties.width = groupProperties.items.length * barWidth;
        newGroupProperties.xScale = d3.scale.ordinal()
          .domain(newGroupProperties.items).rangeRoundBands([0, newGroupProperties.width], 0.1);
        newGroupProperties.axis = d3.svg.axis().scale(newGroupProperties.xScale).orient("bottom");
        groupMap.set(groupName, newGroupProperties);
      });  
    }
    
    // 2.1. setting up the main display (once called per group)
    function renderFirstTime(groupProperties) {
      y.domain([0, maxFrequencyOfInitialItems]);      
      
      var drawingArea = d3.select(groupProperties.selector);

      drawingArea.insert("g", "g.x.axis")
      .attr("class", "y axis")
      .append("text")
      .attr("x", -5)
      .attr("y", -14)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(frequencyName.slice(1, frequencyName.length));
      
      var bars = drawingArea.selectAll(".x>.tick").data(groupProperties.data);
      var indicator = drawingArea.select(".x.axis").selectAll('g.tick')
        .append('g')
        .attr('class', 'indicator');
      
      drawingArea.selectAll(".x.axis g.tick>text").attr("class", "unselect");
      
      indicator.append('rect')
        .attr('class', 'colorIndicator')
        .attr('x', (groupProperties.xScale.rangeBand()/2) * -1)
        .attr('y', 0)
        .attr('width', groupProperties.xScale.rangeBand())
        .attr('height', 25)
        .style("stroke","black")
        .style("stroke-width", 2)
        .style("opacity", 0);
      
      indicator.append('g')
        .attr('class', 'altIndicator')
        .style("stroke","black")
        .style("stroke-width", 2)
        .style("opacity", 0.5);
      
      drawingArea.select("g.x.axis")
        .append("text")
        .attr("x", function(d) {return d.width;})
        .attr("y", 25 + 3)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(groupProperties.selector.split("g.group")[1].replace("_", " "));

      bars.append("rect")
        .attr("class", "bar drawn")
        .attr("x", -groupProperties.xScale.rangeBand()/2)
        .attr("width", groupProperties.xScale.rangeBand())
        .attr("y", 0)
        .attr("height", 0)
        .style("fill", function(d) { return d.color;});
      
      var groupName = groupProperties.selector.split("g.")[1];   
      var selArea = d3.select("g.allTooltips")
        .append("g").attr("class", "toolTipTrans " + groupName).datum(groupProperties)
        .selectAll("g.gtooltip")
        .data(groupProperties.data, function (d) { return d.itemShort;})
        .enter()
        .append("g")
        .attr("class", "gtooltip");

      selArea.attr("transform", function (d) {
          var trans = d3.selectAll(".x>.tick").filter( function (da) { return da === d;}).attr("transform");
          if (trans === trans.split(",")[0]) { // hack for IE: transform(x) 
          	trans = trans.substr(0, trans.length-1) + ", " + myHeight + ")";
          }
          else {
          	trans = trans.split(",")[0] + ", " + myHeight + ")";
          }
          return trans;
        });

      selArea.append("rect")
        .attr("class", "selection bar unselect")
        .attr("x", -groupProperties.xScale.rangeBand()/2)
        .attr("width", groupProperties.xScale.rangeBand())
        .attr("y", function() { return -(myHeight - y(maxFrequencyOfInitialItems)); })
        .attr("height", myHeight + 20 - y(maxFrequencyOfInitialItems))
        .on("mouseover", function(d) {
          showTooltipFor(d);
          })
        .on("mouseout", function() {
          d3.selectAll(".tooltip").remove();
        })
        .on("click", function(d) {
          d3.selectAll(".tooltip").remove();
          if (d3.event.altKey) {
            updateAlternativeSelection(d.item);
          }
          else {
            updateSelection(d.item, true);
          }
        });   
      drawingArea.select(".y.axis").call(yAxis);
      makeUnselectableForOtherBrowsers();   
    }
    
    // 2.2. Main render function to display bars for current selection
    function render(reselectData, group) {
      var groupProperties;
      if (typeof group === 'undefined') {
        groupProperties = {
            items: [],
            data: data,
            selector: "g.group"
          };
      }
      else {
        groupProperties = groupMap.get(group);
      }
      
      if (reselectData) {
      	currentFrequencyTotal = 0;
        initializeFrequentItems();
        file.forEach(function(row){
        	if (firstTime) {
        		initialFrequencyTotal += row[frequencyName];
        	}
          if (rowRelevantForCurrentSelection(row)) {
          	currentFrequencyTotal += row[frequencyName];
            countFrequentItems(row);
            data.forEach(function(d, i){
              if (row[d.item] === 1){ 
                d.frequency += row[frequencyName];
              }
            });
          }
        });
      }
      groupProperties.data = data.filter(function (d) {return (groupProperties.items.indexOf(d.itemShort) !== -1);});
      
      var transition = d3.select("svg").transition().duration(750);
      
      if (firstTime) {
        maxFrequencyOfInitialItems = d3.max(data, function(d) { return d.frequency; });
        renderFirstTime(groupProperties);

        groupProperties.firstTime = false;
        groupMap.set(group, groupProperties);
                
        var finished = false;
        groupMap.forEach(function (groupName, groupProperties){
          finished = finished || groupProperties.firstTime;
        });
        firstTime = finished;
        
        if (firstTime === false) {
          var xTrans = 0;
          var xShift = 0;
          var gap = 15;
          transition.selectAll(".groupBlock").attr("transform",     
            function(d,i) { 
              var trans = xTrans;
              // Fix for IE, since the following doesn't work in IE: xTrans += this.getBBox().width + gap;
              xShift = d3.select(this).select("g.x.axis").node().getBBox().width +
                       d3.select(this).select("g.y.axis").node().getBBox().width;
              xTrans += xShift + gap;
              if (i === 0) {
                if (d3.select(this).select("g.y.axis").node().getBBox().width > padding.left) {
                  padding.left = d3.select(this).select("g.y.axis").node().getBBox().width;
                  d3.select("svg.IEChart g.padding")
                    .attr("transform", "translate(" + padding.left + ", " + padding.top + ")"); 
                }
              }
              // 3 steps to change height
              // 1 xTrans += this.getBBox().height + gap;
              var transString = "translate("+ trans + ", 0)"; 
              // 2 var transString = "translate(0, "+ trans + ")"; 
              d3.selectAll("g.toolTipTrans").filter( function (da) { return da === d;}).attr("transform", transString);
              return transString; 
            });
          // adjust SVG - minimum width is 500 to correctly display the help panel
          var svgSel = d3.select("svg.IEChart");
          var newWidth = xTrans + padding.left;
          if (newWidth < 500) {
            newWidth = 500;
            var transX = margin.left + newWidth/2 - (xTrans + padding.left)/2;           
            d3.select("svg.IEChart>g")
              .attr("transform", "translate(" + transX + ", 0)");
          }  
          svgSel.attr("width", newWidth);  
          // 3 d3.select("svg.IEChart").attr("height", xTrans + padding.top); 
          // compute borders for efficient check when displaying tooltips
          svgLeft = svgSel.node().getBoundingClientRect().left;
          svgRight = svgSel.node().getBoundingClientRect().right;
          svgSel.attr("height", myHeight + margin.top + padding.top + padding.bottom + margin.bottom);          
        }
      }
      

      if (!firstTime) {  
        maxFrequencyOfCurrentItems = (document.getElementById('update_axis').checked) ?
          d3.max(data, function(d) { return d.frequency; }) : maxFrequencyOfInitialItems;
        y.domain([0, maxFrequencyOfCurrentItems]);

        updateBars();
        showPatterns();
           
        transition.selectAll(".y.axis").call(yAxis);
        var transBars = transition.selectAll(".bar.drawn")
          .attr("y", function(d) { return -(myHeight - y(d.frequency)); })
          .attr("height", function(d) { return myHeight - y(d.frequency); });
        if (reselectData && (document.getElementById('sort').checked))  
          transBars.call(endAll, function () {
              // all transitions are finished
              sortItems();
          });  
          
        // add grid lines  
        if (gridLines) {
          d3.selectAll(".y.axis").each(function (d) 
            { var gWidth = d.width;
              d3.select(this).selectAll("g.tick")
              .filter(function (d) {return d !== 0;})
              .append("path")
              .attr("class", "horizontalGrid")
              .attr("d", "M 0 0 L " + gWidth + " 0");
            });    
        }          
      }
    }
        
    // 2.3 tooltip. argument is d - data of the corresponding bar
    function showTooltipFor (d) {
      var tooltipHeight = 41;
      var tooltipWidth;
      var topY = -(myHeight - y(d.frequency)) - tooltipHeight - 10;
      var bottomY = topY + tooltipHeight +10;
      var sel = d3.selectAll("g.gtooltip").filter( function (da, i) { return da === d;});
      var textBoxSel = sel.insert("g", ".selection.bar")
        .attr("class", "tooltip textBoxGroup");
      var textSel = textBoxSel.append("g")
        .attr("class", "tooltip textgroup");
      
      textSel.append("text")
        .attr("class", "tooltip firstLine")
        .attr("x", 0)
        .attr("y", topY + 5)
        .attr("dy", ".71em")
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .text(d.itemLong);
        
      textSel.append("text")
        .attr("class", "tooltip secondLine")
        .attr("x", 0)
        .attr("y", topY + 4 + 18)
        .attr("dy", ".71em")
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .text(frequencyName.slice(1, frequencyName.length) + ": " + formatNumber(d.frequency));

      tooltipWidth = d3.select(".tooltip.textgroup")[0][0].getBBox().width + 6;
      var rgbString = d3.selectAll(".bar.drawn").filter( function (da) {return da === d;}).style("fill");
      if (rgbString.charAt(0) === "#") { // safari stores colors in hex
        var hex = rgbString;
        rgbString = "rgb(" + hexToRgb(hex).r + ", " + hexToRgb(hex).g + ", " + hexToRgb(hex).b + ")";
      }
      textBoxSel.insert("rect", ".tooltip.textgroup")
        .attr("class", "tooltip box")
        .attr("x", -tooltipWidth/2) // a12
        .attr("y", topY)
        .attr("width", tooltipWidth)
        .attr("height", tooltipHeight)
        .style("fill", lighterRGB(rgbString))
        .style("stroke", rgbString);
        
      // check crossing edge of svg -> shift x attributes
      checkTooltipClipped(textBoxSel);        
      
      sel.insert("path", ".selection.bar")
        .attr("class", "tooltip triangle")
        .attr("d"," M 0 " + bottomY +"l -10 -10 l 20 0 l -10 10")
        .style("fill", rgbString)
        .style("stroke", rgbString);      
    }
    
    // 2.4 helper function: tooltip translated if clipped
    function checkTooltipClipped (sel) {
      var selLeft = sel.node().getBoundingClientRect().left;
      var selRight = sel.node().getBoundingClientRect().right;
      if (selLeft < (svgLeft + 2)) {
        selLeft = svgLeft + 2 - selLeft;
        sel.attr("transform", "translate (" + selLeft +" ,0)");
      } 
      else {
        if ((selRight + 2) > svgRight) {
          selRight = svgRight - (selRight + 2);  
          sel.attr("transform", "translate (" + selRight +" ,0)");
        } 
      }
    }  
    
    // 2.5 helper function: callback for when all transitions are finished, called at the end of function 2.2 render(reselectData, group)
    function endAll (transition, callback) {
      var n;
      if (transition.empty()) {
          callback();
      }
      else {
          n = transition.size();
          transition.each("end", function () {
              n--;
              if (n === 0) {
                  callback();
              }
          });
      }
    }
    
    // 3.1. check if record r satisfies all selection criteria
    function rowRelevantForCurrentSelection(r) {
      if (selectedItemSet.empty())
        return true;
      
      var ret = true;        
      selectedItemSet.forEach(function(item, value) {
        if (value.alternativeId === 0) {
          if (r[item] === value.condition) {
            ret = (true && ret);
          }
          else {
            ret = false;
          }
        } 
      });
      
      if (!listOfAlternativeItemSets.empty()) { 
        var retAlt;
        listOfAlternativeItemSets.forEach( function (key, altItemSet) {
          retAlt = false;
          altItemSet.forEach(function (item, condition) {
            if (r[item] === condition) {
              retAlt = true;
            }
            else {
              retAlt = (false || retAlt);
            }
          });
          ret = ret && retAlt;
        });
      }
      return ret;  
    }

    //4.1 process (regular) selection for given item.
    // @renderNow true if after the item selected the chart should be rerendered. 
    //            false to allow for multiple selections (from exploration table)
    function updateSelection(item, renderNow) {
      console.log("update : " + item); 
      if (null !== alternativeItemSet) {
        if (alternativeItemSet.has(item) || selectedItemSet.has(item)) {
          return;
        }
      }
    	if (selectedItemSet.has(item)) {
        var id = selectedItemSet.get(item).alternativeId;
        if (id !== 0) {
          var alItSet = listOfAlternativeItemSets.get(id);
          if (alItSet.size() <= 2) {
            listOfAlternativeItemSets.remove(id);
            d3.selectAll('.altIndicator').selectAll("path.line.altId"+(id)).remove();
          }
          else {
            alItSet.remove(item);
          }
        }
    		selectedItemSet.remove(item); 
        
        var remainingAltItems = selectedItemSet.entries().filter( function (itemObject) { 
          return (itemObject.value.alternativeId === id);});
        if (remainingAltItems.length === 1) {
          selectedItemSet.set(remainingAltItems[0].key, { 
            condition: selectedItemSet.get(remainingAltItems[0].key).condition, alternativeId: 0});
        }        
    	}
    	else {    
	      if (d3.event.shiftKey) {
          if (null !== alternativeItemSet) {
            if (!checkAlternativeSelectionWithinGroup(item)) {
              return ;
            }
            altId++;
            alternativeItemSet.set(item, 0);
            alternativeItemSet.forEach( function (key, value) {
              selectedItemSet.set(key, { condition: value, alternativeId: altId});
              });
            listOfAlternativeItemSets.set(altId, alternativeItemSet);      
            }
          else {  
            selectedItemSet.set(item, { condition: 0, alternativeId: 0}); 
          } 
	      }
	      else {
          if (null !== alternativeItemSet) {
            if (!checkAlternativeSelectionWithinGroup(item)) {
              return ;
            }
            altId++;
            alternativeItemSet.set(item, 1);
            alternativeItemSet.forEach( function (key, value) {
              selectedItemSet.set(key, { condition: value, alternativeId: altId});
              }); 
            listOfAlternativeItemSets.set(altId, alternativeItemSet); 
            }
          else {    
            selectedItemSet.set(item, { condition: 1, alternativeId: 0}); 
          } 
        }  
    	}
      alternativeItemSet = null;
      if (renderNow) {
        data.forEach(function (element){ element.frequency = 0;});
        render(true);
      }
    }
    
    //5.1. process OR selection for given item
    function updateAlternativeSelection(item) {
      if (selectedItemSet.has(item)) {
        return;
      }
      if (null === alternativeItemSet) {
        alternativeItemSet = d3.map();
      }
      // just allow alternative selections within a group
      if (!checkAlternativeSelectionWithinGroup(item)) {
        return ;
      }
      
      if (d3.event.shiftKey) {
        if (alternativeItemSet.has(item)) {
          alternativeItemSet.remove(item);
          d3.selectAll(".indicator")
            .filter(function (d) { return d.item === item;})
            .style("fill", "none")
            .style("opacity", 0);
        }
        else {
          alternativeItemSet.set(item, 0);
        }
      }
      else {
        if (alternativeItemSet.has(item)) {
          alternativeItemSet.remove(item);
          d3.selectAll(".indicator")
            .filter(function (d) { return d.item === item;})
            .style("fill", "none")
            .style("opacity", 0);
        }
        else {
          alternativeItemSet.set(item, 1);
        }
      }     
      altArcMap = getArcMap(alternativeItemSet.keys(), groupMap.get(alternativeItemSet.group).xScale );
      drawArcs(false, altId + 1);      

      d3.selectAll(".indicator")
        .each(function (d) { if (alternativeItemSet.has(d.item)) {
          d3.select(this).select(".colorIndicator").style("fill", 
            function(d) { return (alternativeItemSet.get(d.item) === 1) ? "green": "red";})
            .style("opacity", 0.5); 
        }
      });
 
      if (alternativeItemSet.empty()) {
        alternativeItemSet = null;
      }
    }
    
    // 5.2. check if alternative selection is within group
    function checkAlternativeSelectionWithinGroup(item) {
      if (!alternativeItemSet.empty()) {
        var oneAlternativeItem = alternativeItemSet.keys()[0]; 
        var currentGroup;        
        
        if (typeof alternativeItemSet.group === 'undefined') {
          data.forEach(function(_item) {
            if (_item.item === oneAlternativeItem) {
              // setting the group for the alt arcs
              alternativeItemSet.group = _item.group;
            }
            if (_item.item === item) {
              currentGroup = _item.group;
            }
          });
        }
        else {
          data.forEach(function(_item) {
            if (_item.item === item) {
              currentGroup = _item.group;
            }
          });  
        }
        return (currentGroup === alternativeItemSet.group);
      }
      else {
        data.forEach(function(_item) {
            if (_item.item === item) {
              alternativeItemSet.group = _item.group;
            }
          });  
        return true;
      }
    }       
    
    //6.1. update display of item selections and item OR selections in bar chart. Also calls function 6.2
    function updateBars() {
      var infoPercent = d3.round((currentFrequencyTotal / initialFrequencyTotal * 100), 1) + "%";
      var infos = [currentFrequencyTotal, infoPercent];
      d3.selectAll("div.info")
        .data(infos)
        .text(function(d){ return formatNumber(d);});
      
      d3.selectAll(".colorIndicator")
        .each(function (d) { if (selectedItemSet.has(d.item)) {
          d3.select(this).style("fill", 
            function(d) { return (selectedItemSet.get(d.item).condition === 1) ? "green": "red";})
            .style("opacity", 0.5);
          }
          else {
             d3.select(this).style("fill", "none")
              .style("opacity", 0);
          }
        });
    
      listOfAlternativeItemSets.forEach(function(key, value) {
        altArcMap = getArcMap(value.keys(), groupMap.get(value.group).xScale);
        drawArcs(true, key);
      });   
      updateInfoItemBox();
    }
    
    //6.2. update current filter table info
    function updateInfoItemBox() {
      var itemText = "";
      selectedItemSet.forEach(function(item, value) {
        if (value.alternativeId === 0) {
          if (value.condition === 1) {
            itemText += "+"+ mapItemToItemLong(item) + "\n";
          }
          else {
            itemText += "-"+ mapItemToItemLong(item) + "\n";
          }
        }
      });
      
      listOfAlternativeItemSets.forEach(function(aId, aiMap) {
        itemText += "(";
        aiMap.forEach(function(item, condition) {
          if (condition === 1) {
            itemText += "+"+ mapItemToItemLong(item) + " || ";
          }
          else {
            itemText += "-"+ mapItemToItemLong(item) + " || ";
          }
        });  
        itemText = itemText.substring(0, itemText.length-4); 
        itemText += ")\n";
      });
      
      var rows = itemText.split("\n");
      d3.selectAll("#selectionTable tr.content").remove();
      var tablePos;
      if (rows.length > 1) {
        for (var i=0; i < rows.length-1; i++) {
            tablePos = d3.select("#selectionTable tbody").append("tr").attr("class", "content");
            tablePos.append("td").text(rows[i]);
        }
      }
      else if (rows.length === 1){
        for (var j=0; j < 3; j++) {
            tablePos = d3.select("#selectionTable tbody").append("tr").attr("class", "content");
            tablePos.append("td").style("color", "white").text(" .");
        }
      }
    }
    
    // 7 functions for displaying arcs for alternative selections
    //7.1. Displays arcs for OR Selection altArcId
    function drawArcs(altSelectionFinished, altArcId) {
      var aId = altArcId;
      d3.selectAll('.altIndicator').selectAll("path.line.altId"+(aId)).remove();     
      d3.selectAll('.altIndicator')
        .filter(function(d) {
          return altArcMap.has(d.item);})
        .append("path")
        .attr("class", function () { return "line altId"+(aId);})
        .attr("d", function(d) {return altArc(altArcMap.get(d.item));})
        .style("opacity", 0.5)
        .style("stroke-width", function (d) { 
          return altSelectionFinished ? 3 : 2;})
        .style("stroke-dasharray", function (d) { 
          return altSelectionFinished ? "" : "2,2";});
    }
    
    //7.2. Arcs for OR Selections have to be recomputed after resorting
    function redrawArcs(altSelectionFinished, _altId, altSelectionMap) {
      var delay2 = function (d, i) {
        return (data.indexOf(d)) * 50;
      };
      
      var updateArcs;      
      var smallArc = [{x: 0, y: 25}, {x: 0, y: 0}];
      altArcMap = getArcMap(altSelectionMap.keys(), groupMap.get(altSelectionMap.group).xScale);
      
      updateArcs = d3.selectAll(".altIndicator")
        .filter ( function(d) { return altArcMap.has(d.item); 
        });
      
      updateArcs.selectAll("path.line.altId"+(_altId)).transition().delay(delay2).duration(800) 
        .attr("d", function(d) {return altArc(smallArc);})
        .transition()
        .attr("d", function(d) {return altArc(altArcMap.get(d.item));});  
      
      updateArcs.filter(function() {
        return d3.select(this).select("path.line.altId"+(_altId)).empty();
        })
        .append("path")
        .attr("class", function (d) { return "line altId"+(_altId);})
        .style("opacity", 0)
        .transition().delay(delay2).duration(800)
        .attr("d", function(d) {return altArc(smallArc);})
        .style("stroke-width", function (d) { 
          return altSelectionFinished ? 3 : 2;})
        .style("stroke-dasharray", function (d) { 
          return altSelectionFinished ? "" : "2,2";})
        .style("opacity", 0.5)
        .transition()
        .attr("d", function(d) {return altArc(altArcMap.get(d.item));});
        
      updateArcs = d3.selectAll(".altIndicator")
        .filter ( function(d) { return !altArcMap.has(d.item); 
      });
      updateArcs.selectAll("path.line.altId"+(_altId))
      .style("opacity", 0.5)
      .transition().delay(delay2).duration(750)
      .style("opacity", 0)
      .remove();      
    }
    
    //7.3. Helper function for arc selections   
    function getArcPositions(itemFrom, itemTo, xScale) {
      return [{x: 0, y: 25}, 
        {x: xScale(mapItemToItemShort(itemTo)) - xScale(mapItemToItemShort(itemFrom)), y: 0}];
    }
    
    //7.4. Helper function for arc selections: @returns arc map for corresponding items and scale 
    function getArcMap(items, _xScale) {
      var arcs = d3.map();
        if (items.length === 1) {
         arcs.set(items[0], [{x: 0, y: 25}, {x: 0, y: 0}]);
         return arcs;
      }    
      items.sort(function(a, b) {
        return d3.ascending(_xScale(mapItemToItemShort(a)), _xScale(mapItemToItemShort(b)));
      });
      items.forEach(function(d, i, arr) {
        if (i < arr.length-1) {
          arcs.set(d, getArcPositions(arr[i], arr[i+1],_xScale));
        }
      });
      return arcs;
    }
    
    //8.1. function 1 for computing frequent 2-item set
    function initializeFrequentItems() {
      for (var i = 0; i < data.length; i++) {
        var frequentItemTwo = [];
        for (var j = 0; j < data.length; j++) {
          frequentItemTwo[j] = 0;
        }
        frequentItemOne[i] = frequentItemTwo;
      }
    }
    
    //8.2. function 2 for computing frequent 2-item set
    function countFrequentItems(row) {
      var frequencyKey = -1;
      var keys = Object.keys(row).filter(function(key){
        if (key.substring(0,1) === "_") {
          frequencyKey = key;
          return false;
        } else {
          return true;
        }
      });
      var keyLength = keys.length;
      
      for (var i=0; i < keyLength; i++){
        if (row[keys[i]] === 1) {
          for (var j=i+1; j < keyLength; j++){
            if (row[keys[j]] === 1) {
              frequentItemOne[i][j] += row[frequencyKey];
            } 
          }  
        }
      }
    }
      
    //8.3. display TOP 3 frequent 2-item sets in table
    function showPatterns() {
      var patterns = [];
      for (var pa = 0; pa < 3; pa++) {
          patterns[pa] = { frequency: 0, itemOne: "None", itemTwo: "None", fullItemOne: "None", fullItemTwo: "None"};
        }
      for (var i=0; i < frequentItemOne.length; i++){
        if (selectedItemSet.has(data[i].item)) {
            continue;
          }
        for (var j=i+1; j < frequentItemOne.length; j++){
          if (selectedItemSet.has(data[j].item)) {
            continue;
          }

          for (var pat=0; pat < patterns.length; pat++) {
            if (frequentItemOne[i][j] > patterns[pat].frequency) {
              patterns.splice(pat, 0, {frequency: frequentItemOne[i][j], 
              itemOne: data[i].itemShort, itemTwo: data[j].itemShort, fullItemOne: data[i].item, fullItemTwo: data[j].item});
              patterns.pop();
              break;
            }
          }
        }
      }

      d3.selectAll("#patternTable tr.content").remove();
      for (var p=0; p < patterns.length; p++) {
          var tablePos = d3.select("#patternTable tbody").append("tr")
            .datum([patterns[p].fullItemOne, patterns[p].fullItemTwo])
            .attr("class", "content")
            .on("click", function(d, i) {
              if (d[0] !== "None") {
                updateSelection(d[0], false);
                updateSelection(d[1], true);
              }
          });  
          tablePos.append("td").text(patterns[p].itemOne);
          tablePos.append("td").text(patterns[p].itemTwo);
          tablePos.append("td").text(formatNumber((patterns[p].frequency)));
          tablePos.append("td").text(
            formatNumber(Number(patterns[p].frequency*100/initialFrequencyTotal).toFixed(1)+"%"));
      }
    }
    
    //9.1. update bar chart with new sorting order
    function sortItems() {
      var sortByFreq = document.getElementById('sort').checked;
      
      groupMap.forEach(function (group, gProperties) {
        var data_sorted = gProperties.data.slice();
        gProperties.xScale = gProperties.xScale.domain(data_sorted.sort((sortByFreq) ?
            function(a, b) { return b.frequency - a.frequency; } :
            function(a, b) { return d3.ascending(a.index, b.index); })
            .map(function(d) { return d.itemShort; }));
            
        var transition = d3.select(gProperties.selector).transition().duration(750),
            delay = function(d, i) { return i * 50; };
            
        transition.selectAll(".x>.tick")
          .delay(delay)
          .attr("transform", function(d) {
            return "translate(" + (gProperties.xScale(d.itemShort) + gProperties.xScale.rangeBand()/2) + ",0)";
          });
          
        d3.selectAll("g.toolTipTrans").filter( function (d) { return d === gProperties;})
          .selectAll(".gtooltip").attr("transform", function(d) {
            return "translate(" + (gProperties.xScale(d.itemShort) + gProperties.xScale.rangeBand()/2) + ", " + myHeight +")";
          });
      });  
        
      listOfAlternativeItemSets.forEach(function(key, value) {
        redrawArcs(true, key, value);
      }); 
      if (null !== alternativeItemSet) {
      redrawArcs(false, altId + 1, alternativeItemSet);
      }
    }
    
    //10.1. display help rectangle after "mouseover" event
    function showHelp() {
      console.log("show help");
      var top = 5-margin.top-padding.top;
      var delay = 0;
      
      d3.select("div.interaction.help")
        .style("background", "white")
        .style("border", "0px solid darkgrey");
        
      var mySvg = d3.select("svg.IEChart");
      var rect = mySvg.node().getBoundingClientRect();
      var xPosition = (rect.right - rect.left) / 2 - 200;  
      var yPosition = (rect.bottom - rect.top) / 2 - 100;  
      
      mySvg.append("rect")
        .attr("class", "helpBox")
        .attr('x', rect.right)
        .attr('y', top)
        .attr('width', 1)
        .attr('height', 1)
        .style("stroke","black")
        .style("stroke-width", 2)
        .style("fill", "white")
        .style("opacity", 0)
        .transition().delay(delay).duration(400)      
        .attr('x', xPosition)
        .attr('y', yPosition)
        .attr('width', 400)
        .attr('height', 200)
        .style("opacity", 0.9);
       
      var helpText = [];
      helpText[0] = "- to include item: click on item";
      helpText[1] = "- to exclude item: 'shift' + click on item";
      helpText[2] = "- to include item OR: 'alt' + click on item";
      helpText[3] = "- exclude item OR: 'alt' + 'shift' + click on item";
      helpText[4] = "To finish OR selections, select the last item without 'alt' ";
      helpText[6] = "Exploration table shows for the current selection";
      helpText[7] = "the TOP 3 most frequent 2-item sets";
      helpText[8] = "which don't contain the already selected items.";
    
      helpText.forEach(function (element, index){
        mySvg.append("text")
          .attr("class", "helpBox")
          .attr("x", xPosition + 25)
          .attr("y", yPosition + 20 + index*18)
          .attr("dy", ".71em")
          .attr("fill", "black")
          .text(element)
          .style("opacity", 0)
          .transition().delay(300).duration(delay)
          .style("opacity", 1);
      });
    }
    
    //10.2. remove help rectangle after "mouseout" event
    function removeHelp() {
      console.log("remove help");
      d3.select("svg.IEChart").selectAll(".helpBox").remove();
      d3.select("div.interaction.help")
        .style("background", "lightgrey")
        .style("border", "1px solid darkgrey");
    }
       
    //11.1. helper for displaying decimal point for frequency and percent with German convention
    function formatNumber(str) {
      var format = d3.format(",.0f");
      if (thousandsSeparator === ".") { // German convention
        if (+str % 1 !== 0) {
          return str.split(".").join(",");
        }
        else {
          var newStr = format(str).split(",").join(".");
          return newStr;
        }
      }
      else {    // US convention
        if (+str % 1 !== 0) { 
          return str;
        }
        else {        
          return format(str);
        }
      }
    }      
    
    //11.2. helper for create a light shade of a color - used for tooltip box background
    function lighterRGB(oldRGB) {
      oldRGB = oldRGB.substring(4, oldRGB.length-1);
      var newRGB = oldRGB.split(",");
      newRGB[0] = +newRGB[0];
      newRGB[1] = +newRGB[1];
      newRGB[2] = +newRGB[2];
      newRGB[0] = Math.round(newRGB[0] + 0.9 * (255 - newRGB[0]));
      newRGB[1] = Math.round(newRGB[1] + 0.9 * (255 - newRGB[1]));
      newRGB[2] = Math.round(newRGB[2] + 0.9 * (255 - newRGB[2]));
      return "rgb(" + newRGB[0] + ", " + newRGB[1] + ", " + newRGB[2] +")";
    }
    
    //11.3. shim for IE, Opera
    function makeUnselectableForOtherBrowsers() {
    	d3.selectAll(".x.axis g.tick>text").attr("unselectable", "on");
    	d3.selectAll(".y.axis g.tick>text").attr("unselectable", "on");
    	// above does not seem to work for shift + click
    	window.onload = function() {
			  document.onselectstart = function() {
			    return false;
			  };
			};
    }
    
    //11.4 hex to RGB converter (safari stores color in hex)
    function hexToRgb(hex) {
      // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
      var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      hex = hex.replace(shorthandRegex, function(m, r, g, b) {
          return r + r + g + g + b + b;
      });

      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
      } : null;
    }
    
    // 12.1 generate HTML frame
    function buildHTMLFrame() {
      var str = [];
      str.push('<div class="options container">');
      str.push('<h3>Info</h3>');
      str.push('<div class="header">current filter:</div>');
      str.push('<div id="selectionDiv">');
      str.push('<table id="selectionTable">');
      str.push('<tbody>');
      str.push('<tr class="content"><td><font color="white"> .</font></td></tr>');
      str.push('<tr class="content"><td><font color="white"> .</font></td></tr>');
      str.push('<tr class="content"><td><font color="white"> .</font></td></tr>');
      str.push('</tbody>');
      str.push('</table>');
      str.push('</div>');     
      str.push('<div class="break"></div>');
      str.push('<div class="colLeft" id ="itemFrequency">frequency:</div><div class="info left"></div>');
      str.push('<div class="colRight" id ="itemPercent">percent:</div><div class="info right"></div>');
      str.push('</div>');    
      str.push('<div id="empty" class="container"></div>');
      str.push('<div id="mining" class="container">');
      str.push('<h3>Exploration</h3>');
      str.push('<div id="patternDiv">');
      str.push('<table id="patternTable">');
      str.push('<thead>');
      str.push('<tr>');
      str.push('<th>item 1</th>');
      str.push('<th>item 2</th>');
      str.push('<th>frequency</th>');
      str.push('<th>percent</th>');
      str.push('</tr>');
      str.push('</thead>');
      str.push('<tbody>');
      str.push('</tbody>');
      str.push('</table>');
      str.push('</div>');
      str.push('<div class="interaction sort">');
      str.push('<input id="sort" type="checkbox">sort by frequency');
      str.push('</div>');
      str.push('<div class="interaction update">');
      str.push('<input id="update_axis" type="checkbox" name="update">update axis');
      str.push('</div>');
      str.push('<div class="interaction help">help</div>');
       
      str = str.join('');
      d3.select("body")
        .insert("div", ":first-child")
        .attr("class", "center")
        .html(str);
        
      d3.select("input#sort").on("click", IEChart.resort);
      d3.select("input#update_axis").on("click", IEChart.update);
      d3.select(".interaction.help")
        .on("mouseover", IEChart.showHelp)
        .on("mouseout", IEChart.removeHelp);  
    }
    
    return IEChart;
};
