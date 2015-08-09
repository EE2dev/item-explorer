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
    var drawingArea;
    // var currentGroupSelector;

    var margin = {top: 20, right: 20, bottom: 20, left: 20},
      padding = {top: 60, right: 60, bottom: 60, left: 70},
      myOuterWidth = 960,
      myOuterHeight = 500,
      myInnerWidth = myOuterWidth - margin.left - margin.right,
      myInnerHeight = myOuterHeight - margin.top - margin.bottom,
      width = myInnerWidth - padding.left - padding.right,
      myHeight = myInnerHeight - padding.top - padding.bottom;
     
    // delete
    var x; // set by current groups scale with alt selections 4.2. checkAlternativeSelectionWithinGroup(item)
    //    = d3.scale.ordinal().rangeRoundBands([0, width], 0.1);
    var y = d3.scale.linear().range([myHeight, 0]);
    var xAxis = d3.svg.axis().scale(x).orient("bottom");     
    var yAxis = d3.svg.axis().scale(y).orient("left");
    // delete until here
    
    /*
    var xMap = d3.map(); 
    // var y = d3.scale.linear().range([myHeight, 0]);   
    var xAxisMap = d3.map();   
    var yAxisMap = d3.map(); 
    */
    
    var controlPointY = 2 * (padding.bottom - 25) - 1;  

    var altArc = d3.svg.line()
      .interpolate(function(points) {
        var mean = ((points[0][0] + points[1][0]) / 2);
        return points.join("q " + mean + "," + controlPointY +" ");})
      .x(function(d) { return d.x})
      .y(function(d) { return d.y});      
    
    var getArcPositions = function (itemFrom, itemTo) {
      return [{x: 0, y: 25}, 
        {x: x(mapItemToItemShort(itemTo)) - x(mapItemToItemShort(itemFrom)), y: 0}];
    }
    
    var getArcMap = function (items) {
      var arcs = d3.map();
        if (items.length === 1) {
         arcs.set(items[0], [{x: 0, y: 25}, {x: 0, y: 0}]);
         return arcs;
      }    
      items.sort(function(a, b) {
        return d3.ascending(x(mapItemToItemShort(a)), x(mapItemToItemShort(b)));
      });
      items.forEach(function(d, i, arr) {
        if (i < arr.length-1) {
          arcs.set(d, getArcPositions(arr[i], arr[i+1]));
        }
      });
      return arcs;
    }
    
    // 0.0 functions for external access
    function IEChart(selection) {
      console.log("_myData "+ _myData);
      if (typeof _myData !== 'undefined') {
        readData(_myData, selection);
      } 
      else {
        // else if data is processed in html file
        selection.each(function(data) {
          var div = d3.select(this);
          file = data; 
          chart = div.selectAll("svg").data([file]);
          chart = chart.enter()
            .append("svg")
            .call(svgInit);
          initialSetup();  
        });
      }
    }
    
    IEChart.myData = function (_myData) {
      if (!arguments.length) {
        return file;
      }
      file = _myData;
      return IEChart;      
    }    
    
    IEChart.update = function() {
      render(false);
      return IEChart;
    }

    IEChart.resort = function() {
      sortItems();
      return IEChart;
    }
    
    IEChart.showHelp = function() {
      showHelp();
      return IEChart;
    }
    
    IEChart.removeHelp = function() {
      removeHelp();
      return IEChart;
    }
    
    /*
    IEChart.paddingLeft = function(padLeft) {
      if (!arguments.length) {
        return padding.left;
      }
      padding.left = padLeft;
      return IEChart;      
    }  
    */
        
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
        createChart(selection, file);
      }
    } 

    function convertToNumber(d) {
      for (var perm in d) {
          if (Object.prototype.hasOwnProperty.call(d, perm)) {
            d[perm] = +d[perm];
          }
        }  
      return d;
    } 
    
    function createChart(selection, _file) {
      selection.each(function(data) {
        file = _file; 
        var items = parseFirstColumn(file);
        console.log(groupMap);
        
        var div = d3.select(this);
        chart = div.append("svg")
          .call(svgInit);
        
        var counter = 0;
        var xAxis;
        var groupArea;
        
        groupMap.forEach(function (groupName, groupProperties){
          groupArea = d3.select("g.padding").append("g")
            .attr("class", "groupBlock group" + groupName)
           // .attr("transform", "translate("+ counter * 167 + ", 0)"); 
          
          groupArea.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + myHeight + ")"); 
            
          // d3.select("group" + group + ">.x.axis").call(xAxis);
          d3.select(groupProperties.selector + ">.x.axis").call(groupProperties.axis);
          
          // currentGroupSelector = "g.group"+group;
          if (counter === 0) {
            render(true, groupProperties);
          }
          else {
            render(false, groupProperties);
          }
          counter++;
        });  
        // render(true);   
      });
    } 
    
    // 1.0 main svg - called by IEChart()
    function svgInit(svg) {
      svg = svg.attr("width", myOuterWidth)
      .attr("height", myOuterHeight)
      .append("g")
      .attr("class", "margin")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
      drawingArea = svg.append("g")
        .attr("class", "padding")
        .attr("transform", "translate(" + padding.left + "," + padding.top + ")");
      
      /*
      drawingArea.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + myHeight + ")"); 
        */
    }    
        
    // 1.3 helper (parse all parts of column name) for reading data from file
    function parseFirstColumn(_file) {
      var _items = d3.keys(_file[0]).filter(function(key) { 
        if (key.substring(0,1) === "_") {
          // frequencyName = key.slice(1, key.length);
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
      
      finishGroupProperties(_items.length);
      _items = _items.map( function(d,i) {
        var itemPiece = d.split(":");
        return itemPiece[0];
        }); 
      return _items;  
    }
    
    // 1.4 helper for 1.3    
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
          case "GR=":
            _itemObject.group = _token.slice(3);
            break;  
        }
      });
      addGroup(_itemObject.itemShort, _itemObject.group);
    }
    
    // 1.5 helper function to map between two different column representations
    // _item: complete column name from file . @returns itemShort (just column name used for x axis)
    function mapItemToItemShort (_item) {
      return _item.split(":")[0];
    }
    
    // 1.6 helper function to map between two different column representations (for div filter)
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
    
    // 1.7 helper processing function for storing properties for distinct groups
    function addGroup(itemObject, group) {
      var groupProperties;
      if (groupMap.has(group)) {
        groupProperties = groupMap.get(group)
        groupProperties.items.push(itemObject);
      } 
      else {
        groupProperties =
          {
            items: [itemObject],
            data: [],
            selector: "g.group"+group,
            width: -1,
            x: null, // the scale
            axis: null,
            firstTime: true
          };
      }
      groupMap.set(group, groupProperties);
    }    
    
    // 1.7 helper processing function for adding remaining properties for distinct groups
    function finishGroupProperties(numberOfItems) {
      groupMap.forEach(function (groupName, groupProperties){
        var newGroupProperties = groupProperties;
        newGroupProperties.width = width * groupProperties.items.length / numberOfItems;
        newGroupProperties.x = d3.scale.ordinal()
          .domain(newGroupProperties.items).rangeRoundBands([0, newGroupProperties.width], .1);
        newGroupProperties.axis = d3.svg.axis().scale(newGroupProperties.x).orient("bottom");

        groupMap.set(groupName, newGroupProperties);
      });  
    }
    
    // 2.1. setting up the main display
    function renderFirstTime(group) {
      y.domain([0, maxFrequencyOfInitialItems]);      
      
      drawingArea = d3.select(group.selector);
      
      drawingArea.append("g")
      .attr("class", "y axis")
      .append("text")
      .attr("x", -5)
      .attr("y", -14)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(frequencyName.slice(1, frequencyName.length));
      
      var bars = drawingArea.selectAll(".x>.tick").data(group.data);
      var indicator = drawingArea.select(".x.axis").selectAll('g.tick')
        .append('g')
        .attr('class', 'indicator')
      
      drawingArea.selectAll(".x.axis g.tick>text").attr("class", "unselect");
      
      indicator.append('rect')
        .attr('class', 'colorIndicator')
        .attr('x', (group.x.rangeBand()/2) * -1)
        .attr('y', 0)
        .attr('width', group.x.rangeBand())
        .attr('height', 25)
        .style("stroke","black")
        .style("stroke-width", 2)
        .style("opacity", 0);
         
      indicator.append('g')
        .attr('class', 'altIndicator')
        .style("stroke","black")
        .style("stroke-width", 2)
        .style("opacity", 0.5);
     
      // var bars = d3.selectAll(".x>.tick").data(data);
      bars.append("rect")
        .attr("class", "bar drawn")
        .attr("x", -group.x.rangeBand()/2)
        .attr("width", group.x.rangeBand())
        .attr("y", 0)
        .attr("height", 0)
        .style("fill", function(d) { return d.color;});
      
      var selArea = drawingArea.selectAll("g.gtooltip")
        .data(group.data)
        .enter()
        .append("g")
        .attr("class", "gtooltip");

      selArea.attr("transform", function (d) {
          var trans = d3.selectAll(".x>.tick").filter( function (da) { return da === d;}).attr("transform");
          if (trans === trans.split(",")[0]) { // fix for IE
          	trans = trans.substr(0, trans.length-1) + ", " + myHeight + ")";
          }
          else {
          	trans = trans.split(",")[0] + ", " + myHeight + ")";
          }
          return trans;
        });
      
      /*
      var tooltipHeight = 41;
      var tooltipWidth;
      */
      
      selArea.append("rect")
        .attr("class", "selection bar unselect")
        .attr("x", -group.x.rangeBand()/2)
        .attr("width", group.x.rangeBand())
        .attr("y", function(d) { return -(myHeight - y(maxFrequencyOfInitialItems)); })
        .attr("height", myHeight + 20 - y(maxFrequencyOfInitialItems))
        .on("mouseover", function(d) {
          showTooltipFor(d);
          })
        .on("mouseout", function(d) {
          d3.selectAll(".tooltip").remove();
        })
        .on("click", function(d) {
          console.log("Clicked on: "+d.index);
          d3.selectAll(".tooltip").remove();
          if (d3.event.altKey) {
            updateAlternativeSelection(d.item);
          }
          else {
            updateSelection(d.item);
          }
        });   
        makeUnselectableForOtherBrowsers();   
    }
    
    // 2.2. displaying bars for current selection
    function render(reselectData, group) {
      if (typeof group === 'undefined') {
        group = {
            items: [],
            data: data,
            selector: "g.group"
          };
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
            })
          }
        })
      }
      group.data = data.filter(function (d) {return (group.items.indexOf(d.itemShort) !== -1);});
      
      if (group.firstTime) {
        maxFrequencyOfInitialItems = d3.max(data, function(d) { return d.frequency; });
        renderFirstTime(group);
        group.firstTime = false;
        /*
        console.log("1 - Hase");
        console.log(groupMap.get("Hase"));
        console.log("2 - ");
        console.log(groupMap.get(""));
        */
        // console.timeEnd("Time for data loading");
      }
      
      maxFrequencyOfCurrentItems = (document.getElementById('update_axis').checked) ?
        d3.max(data, function(d) { return d.frequency; }) : maxFrequencyOfInitialItems;
      y.domain([0, maxFrequencyOfCurrentItems]);

      updateBars();
      showPatterns();
      
      var transition = d3.select("svg").transition().duration(750);
      transition.selectAll(".y.axis").call(yAxis);
      transition.selectAll(".groupBlock").attr("transform",
        function(d,i) { return "translate("+ i * 167 + ", 0)"; 
        });
        
      var transBars = transition.selectAll(".bar.drawn")
        .attr("y", function(d) { return -(myHeight - y(d.frequency)); })
        .attr("height", function(d) { return myHeight - y(d.frequency); });
      if (reselectData && (document.getElementById('sort').checked))  
        transBars.call(endAll, function () {
            // console.log("All the transitions have ended!");
            sortItems();
        });     
    }
        
    // 2.4 tooltip. argument is d - data of the corresponding bar
    function showTooltipFor (d) {
      var tooltipHeight = 41;
      var tooltipWidth;
      var topY = -(myHeight - y(d.frequency)) - tooltipHeight - 10;
      var bottomY = topY + tooltipHeight +10;
      var colNumber;
      var sel = d3.selectAll("g.gtooltip").filter( function (da, i) { return da === d;});
      var textBoxSel = sel.insert("g", ".selection.bar")
        .attr("class", "tooltip textBoxGroup")
        //.attr("transform", "translate(100,0)");
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
      // sel.insert("rect", ".tooltip.textgroup")
      textBoxSel.insert("rect", ".tooltip.textgroup")
      // sel.insert("rect", "text.tooltip.firstLine")
        .attr("class", "tooltip box")
        .attr("x", -tooltipWidth/2)
        .attr("y", topY)
        .attr("width", tooltipWidth)
        .attr("height", tooltipHeight)
        .style("fill", lighterRGB(rgbString))
        .style("stroke", rgbString);
              
      sel.insert("path", ".selection.bar")
        .attr("class", "tooltip triangle")
        .attr("d"," M 0 " + bottomY +"l -10 -10 l 20 0 l -10 10")
        .style("fill", rgbString)
        .style("stroke", rgbString);      
    }
    
    // 2.5 callback for when all transitions are finished, called at the end of function 2.2 render(reselectData)
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
    
    //4.1. process OR selection for given item
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
      altArcMap = getArcMap(alternativeItemSet.keys());
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
    
    // 4.2. check if alternative selection is within group
    function checkAlternativeSelectionWithinGroup(item) {
      if (!alternativeItemSet.empty()) {
        var oneAlternativeItem = alternativeItemSet.keys()[0]; 
        var currentGroup;        
        
        if (typeof alternativeItemSet.group === 'undefined') {
          data.forEach(function(_item) {
            if (_item.item === oneAlternativeItem) {
              // setting the group and the scale for the alt arcs
              alternativeItemSet.group = _item.group;
              x = groupMap.get(alternativeItemSet.group).x;
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
        console.log("currentGroup: " + currentGroup);
        console.log("relevantGroup: " + alternativeItemSet.group);
        return (currentGroup === alternativeItemSet.group);
      }
      else {
        return true;
      }
    }
    
    //4.3. display arcs for OR Selection altArcId
    function drawArcs(altSelectionFinished, altArcId) {
      // var aId = altSelectionFinished ? altId : (altId + 1);
      var aId = altArcId;
      d3.selectAll('.altIndicator').selectAll("path.line.altId"+(aId)).remove();     
      d3.selectAll('.altIndicator')
        .filter(function(d) {
          return altArcMap.has(d.item);})
        .append("path")
        .attr("class", function (d) { return "line altId"+(aId);})
        .attr("d", function(d) {return altArc(altArcMap.get(d.item));})
        .style("opacity", 0.5)
        .style("stroke-width", function (d) { 
          return altSelectionFinished ? 3 : 2;})
        .style("stroke-dasharray", function (d) { 
          return altSelectionFinished ? "" : "2,2";});
    }
    
    
    //5.1 process (regular) selection for given item
    function updateSelection(item) {
      if (!(null === alternativeItemSet)) {
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
          if (!(null === alternativeItemSet)) {
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
          if (!(null === alternativeItemSet)) {
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
      data.forEach(function (element){ element.frequency = 0;});
      render(true);
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
        altArcMap = getArcMap(value.keys());
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
      if (rows.length > 1) {
        for (var i=0; i < rows.length-1; i++) {
            var tablePos = d3.select("#selectionTable tbody").append("tr").attr("class", "content");
            tablePos.append("td").text(rows[i]);
        }
      }
      else if (rows.length === 1){
        for (var i=0; i < 3; i++) {
            var tablePos = d3.select("#selectionTable tbody").append("tr").attr("class", "content");
            tablePos.append("td").style("color", "white").text(" .");
        }
      }
    }
    
    //7.1. update bar chart with new sorting order
    function sortItems() {
      var sortByFreq = document.getElementById('sort').checked;
      var data_sorted = data.slice();
      x = x.domain(data_sorted.sort((sortByFreq)
          ? function(a, b) { return b.frequency - a.frequency; }
          : function(a, b) { return d3.ascending(a.index, b.index); })
          .map(function(d) { return d.itemShort; }));
          
      var transition = drawingArea.transition().duration(750),
          delay = function(d, i) { return i * 50; };
          
      transition.selectAll(".x>.tick")
        .delay(delay)
        .attr("transform", function(d) {
          return "translate(" + (x(d.itemShort) + x.rangeBand()/2) + ",0)";
        });
      d3.selectAll(".gtooltip").attr("transform", function(d) {
          return "translate(" + (x(d.itemShort) + x.rangeBand()/2) + ", " + myHeight +")";
        });
        
      listOfAlternativeItemSets.forEach(function(key, value) {
        redrawArcs(true, key, value);
      }); 
      if (null !== alternativeItemSet) {
      redrawArcs(false, altId + 1, alternativeItemSet);
      }
    }
    
    //7.2. Arcs for OR Selections have to be recomputed after resorting
    function redrawArcs(altSelectionFinished, itemKey, altSelectionMap) {
      var delay2 = function (d, i) {
        return (data.indexOf(d)) * 50;
      };
      
      var updateArcs;      
      var altArcMaps = [];
      // var altSelectionFinished = true;
      var smallArc = [{x: 0, y: 25}, {x: 0, y: 0}];
      altArcMap = getArcMap(altSelectionMap.keys());
      
      updateArcs = d3.selectAll(".altIndicator")
        .filter ( function(d) { return altArcMap.has(d.item); 
        });
      
      updateArcs.selectAll("path.line.altId"+(itemKey)).transition().delay(delay2).duration(800) 
        .attr("d", function(d) {return altArc(smallArc);})
        .transition()
        .attr("d", function(d) {return altArc(altArcMap.get(d.item));});  
      
      updateArcs.filter(function() {
        return d3.select(this).select("path.line.altId"+(itemKey)).empty();
        })
        .append("path")
        .attr("class", function (d) { return "line altId"+(itemKey);})
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
      updateArcs.selectAll("path.line.altId"+(itemKey))
      .style("opacity", 0.5)
      .transition().delay(delay2).duration(750)
      .style("opacity", 0)
      .remove();      
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
      var keys = Object.keys(row);
      var keyLength = keys.length;

      for (var i=1; i < keyLength; i++){
        if (row[keys[i]] === 1) {
          for (var j=i+1; j < keyLength; j++){
            if (row[keys[j]] === 1) {
              frequentItemOne[i-1][j-1] += row[keys[0]];
            } 
          }  
        }
      }
    }
      
    //8.3. display TOP 3 frequent 2-item sets in table
    function showPatterns() {
      var patterns = [];
      for (var p = 0; p < 3; p++) {
          patterns[p] = { frequency: 0, itemOne: "None", itemTwo: "None"};
        }
      for (var i=0; i < frequentItemOne.length; i++){
        if (selectedItemSet.has(data[i].item)) {
            continue;
          }
        for (var j=i+1; j < frequentItemOne.length; j++){
          if (selectedItemSet.has(data[j].item)) {
            continue;
          }

          for (var p=0; p < patterns.length; p++) {
            if (frequentItemOne[i][j] > patterns[p].frequency) {
              patterns.splice(p, 0, {frequency: frequentItemOne[i][j], itemOne: data[i].itemShort, itemTwo: data[j].itemShort});
              patterns.pop();
              break;
            }
          }
        }
      }

      d3.selectAll("#patternTable tr.content").remove();
      var format = d3.format(",.0f");
      for (var p=0; p < patterns.length; p++) {
          var tablePos = d3.select("#patternTable tbody").append("tr").attr("class", "content");
          tablePos.append("td").text(patterns[p].itemOne);
          tablePos.append("td").text(patterns[p].itemTwo);
          tablePos.append("td").text(formatNumber((patterns[p].frequency)));
          tablePos.append("td").text(
            formatNumber(Number(patterns[p].frequency*100/initialFrequencyTotal).toFixed(1)+"%"));
      }
    }
    
    //9.1. display help rectangle after "mouseover" event
    function showHelp() {
      console.log("show help");
      var top = 5-margin.top-padding.top;
      var delay = 0;
      
      d3.select("div.interaction.help")
        .style("background", "white")
        .style("border", "0px solid darkgrey");
        
      // var rect = d3.select("div.interaction.help").node().getBoundingClientRect();
      // var rect = d3.select("div#mining").node().getBoundingClientRect();
      var rect = drawingArea.node().getBoundingClientRect();
      //  console.log(rect.top, rect.right, rect.bottom, rect.left);  
      var xPosition = (rect.right - rect.left) / 2 - 200;  
      var yPosition = (rect.bottom - rect.top) / 2 - 100;  
      
      drawingArea.append("rect")
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
        drawingArea.append("text")
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
    
    //9.2. remove help rectangle after "mouseout" event
    function removeHelp() {
      console.log("remove help");
      drawingArea.selectAll(".helpBox").remove();
      d3.select("div.interaction.help")
        .style("background", "lightgrey")
        .style("border", "1px solid darkgrey");
    }
       
    //10.1. helper for displaying decimal point for frequency and percent with German convention
    function formatNumber(str) {
      if (+str % 1 !== 0)
        return str.split(".").join(",");
      var format = d3.format(",.0f");
      var newStr = format(str).split(",").join(".");
      return newStr;
    }
    
    //10.2. helper for create a light shade of a color - used for tooltip box background
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
    
    //10.3. shim for IE, Opera
    function makeUnselectableForOtherBrowsers() {
    	d3.selectAll(".x.axis g.tick>text").attr("unselectable", "on");
    	d3.selectAll(".y.axis g.tick>text").attr("unselectable", "on");
    	// above does not seem to work for shift + click
    	window.onload = function() {
			  document.onselectstart = function() {
			    return false;
			  }
			}
    }
    return IEChart;
}
