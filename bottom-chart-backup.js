function bottomChart() {

    var margin = {
            top: 0,
            right: 50,
            bottom: 40,
            left: 5
        },
        width = 920,
        height = 250,
        Bheight = 270;

    function monthDay(d){
        var timeFormat = d3.time.format('%e');
        var timeFormat1 = d3.time.format('%b');
        var c = timeFormat(new Date(d));
        if(c == 1){
            return timeFormat1(new Date(d));
        }
        return c;
    }

    function month1Day(d){
        var timeFormat = d3.time.format.utc('%e');
        var timeFormat1 = d3.time.format.utc('%b');
        var c = timeFormat(new Date(d));
        if(c == 1){
            return timeFormat1(new Date(d));
        }
        return c;
    }

    var barHeight  = 60;
    var yyyymmdd = d3.time.format("%Y-%m-%d");
    var commaFormat = d3.format(",");
    var kFormat = d3.format('.2s');

    function csrender(selection) {
        selection.each(function() {
            var new1_genData = genData.filter(function(d){                                        
                if(d.Date >= startDomain && d.Date <endDomain){
                    return d;
                }
            });
                
            console.log(new1_genData);

            var xOrdinalScale = d3.scale.ordinal().domain(new1_genData.map(function(d){return d.Date})).rangeBands([0,width]);                
            var ordinalScaleBand = xOrdinalScale.rangeBand();                        
            var x = d3.time.scale()
                .domain(d3.extent(new1_genData,function(d){ return d.Date;}))
                .range([ordinalScaleBand/ 2, (width - ordinalScaleBand / 2 )]);  
                console.log(x.domain());
                console.log(xOrdinalScale.domain());
            // y axes for OHLC chart
            var y = d3.scale.linear().rangeRound([height, 0]);
            var pan_y = d3.scale.linear().rangeRound([height, 0]);

            var zoom = d3.behavior.zoom()        
                .x(x)
                .xExtent(d3.extent(genData, function(d) {                       
                    return d.Date
                }))                   
                .on("zoom", zoomed);
            
            var bisectDate = d3.bisector(function(d) { return d.Date; }).left;

            var minimal = d3.min(genData, function(d) {
                return d.l;
            });
            var maximal = d3.max(genData, function(d) {
                return d.h;
            });                            

            // y axis for line charts pan functionality
            var tmp_y = d3.scale.linear().rangeRound([height, 0]);        

            // y axis for bar chart pan functionality
            var bar_y = d3.scale.linear().rangeRound([barHeight, 0]);

            var xAxis = d3.svg.axis().scale(xOrdinalScale);            
            var xAxis1 = d3.svg.axis().scale(x);            

            var yAxis = d3.svg.axis()
                .scale(y)
                .ticks(Math.floor(height / 50));
            
            // var panyAxis = d3.svg.axis()
            //     .scale(pan_y)
            //     .ticks(Math.floor(height / 50));
            
            y.domain([d3.min(genData, function(d) {
                    return d.l;
                }), d3.max(genData, function(d) {
                    return d.h;
                })]).nice();

            // y.domain([minimal, maximal]).nice();

            // var barwidth = width / genData.length;

            var tmp_divider = TCount[period][interval];             
            var barwidth = width / 8;
            // var barwidth = 10;
                        
            // var candlewidth = width / 8;
            // // var candlewidth = 8;
            // var delta = Math.round((barwidth - candlewidth) / 2);        
            var candlewidth = (Math.floor(barwidth * 0.9) / 2) * 2 + 1;            
            var delta = Math.round((barwidth - candlewidth) / 2);


            d3.select(this).select("svg").remove();
            var svg = d3.select(this).append("svg").attr('viewBox','0 0 '+(width + margin.left + margin.right) + ', '+ (Bheight + margin.top + margin.bottom))
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            svg.append("g")
                .attr("class", "axis xaxis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis.orient("bottom").tickFormat(monthDay));            

            svg.append("g")
                .attr("class", "axis xaxis1")
                .attr("transform", "translate(0," + (height+10) + ")")
                .call(xAxis1.orient("bottom").tickFormat(month1Day))
                .call(xAxis1.orient("bottom"));  

            svg.append("g")
                .attr("class", "axis yaxis")
                .attr("transform", "translate(" + width + ",0)")
                .call(yAxis.orient("right").tickSize(0));

            svg.append("g")
                .attr("class", "axis grid")
                .attr("transform", "translate(" + width + ",0)")
                // .call(yAxis.orient("left").tickFormat("").tickSize(width));            
                .call(yAxis.orient("left").tickSize(0));            

            var bands = svg.selectAll(".bands")
                .data([genData])
                .enter().append("g")
                .attr("class", "bands");

            bands.selectAll("rect")
                .data(function(d) {
                    return d;
                })
                .enter().append("rect")
                .attr("x", function(d) {                       
                    return x(d.Date);
                })
                .attr("y", 0)
                .attr("height", Bheight)
                .attr("width", 1)
                .attr("class", function(d, i) {
                    return "band" + i;
                })
                .style("stroke-width", Math.floor(barwidth));

            var stick = svg.selectAll(".sticks")
                .data([genData])
                .enter().append("g")
                .attr("class", "sticks");

            stick.selectAll("rect")
                .data(function(d) {
                    return d;
                })
                .enter().append("rect")
                .attr("x", function(d) {
                    return x(d.Date)+candlewidth/2;
                })
                .attr("y", function(d) {
                    return y(d.h);
                })
                .attr("class", function(d, i) {
                    return "stick stick" + i;
                })
                .attr("height", function(d) {
                    return y(d.l) - y(d.h);
                })
                .attr("width", 1)
                .classed("rise", function(d) {
                    return (d.c > d.o);
                })
                .classed("fall", function(d) {
                    return (d.o > d.c);
                });

            var candle = svg.selectAll(".candles")
                .data([genData])
                .enter().append("g")
                .attr("class", "candles");

            candle.selectAll("rect")
                .data(function(d) {
                    return d;
                })
                .enter().append("rect")
                .attr("x", function(d) {
                    return x(d.Date);
                })
                .attr("y", function(d) {
                    return y(d3.max([d.o, d.c]));
                })
                .attr("class", function(d, i) {
                    return "candle candle" + i;
                })
                .attr("height", function(d) {
                    return y(d3.min([d.o, d.c])) - y(d3.max([d.o, d.c]));
                })
                .attr("width", candlewidth)
                .classed("rise", function(d) {
                    return (d.c > d.o);
                })
                .classed("fall", function(d) {
                    return (d.o > d.c);
                });

            var indicator_g = svg.append('g').attr('class', 'indicator_g').attr('transform', "translate(" + (width - 10) + "," + (y(genData[genData.length - 1].c) - 7) + ")");

            indicator_g.append('svg').attr('viewBox', "0 0 65 15").attr("enable-background", "new 0 0 65 15").attr('xml:space', "preserve");
            indicator_g.append('path').attr("d", "M65.1,0H11C8.2,0,6.8,0.7,4.5,2.7L0,7.2l4.3,4.6c0,0,3,3.2,6.5,3.2H65L65.1,0L65.1,0z").attr('class', 'ohlc_indicator');
            indicator_g.append('text').attr('x', 12).attr('y', 0).attr('dy', '1em').text(genData[genData.length - 1].c.toFixed(0));
            
            var dotline = svg.append('line').attr('class','dotted_line').attr('x1',0).attr('y1',(y(genData[genData.length - 1].c))).attr('x2',(width-7)).attr('y2',(y(genData[genData.length - 1].c) ));
            var focus_g = svg.append('g').attr('class', 'focus_g').attr('transform', "translate(" + (width - 10) + "," + (y(genData[genData.length - 1].c) - 7) + ")").style('display','none');

            focus_g.append('svg').attr('viewBox', "0 0 65 15").attr("enable-background", "new 0 0 65 15").attr('xml:space', "preserve");
            focus_g.append('path').attr("d", "M65.1,0H11C8.2,0,6.8,0.7,4.5,2.7L0,7.2l4.3,4.6c0,0,3,3.2,6.5,3.2H65L65.1,0L65.1,0z").attr('class', 'focus_indicator');
            focus_g.append('text').attr('x', 12).attr('y', 0).attr('dy', '1em').text("0");

            var x_move_wrapper = svg.append('g').attr('class','x_wrapper').style('display','none');

            var x_move_rect = x_move_wrapper.append("rect").attr("class",'x_move_rect')
                            .attr("x", -35)
                            .attr("y", 0)
                            .attr('rx',0)
                            .attr("width", barwidth)
                            .attr("height", height - 3);            

            var x_line = svg.append('line').attr('class','x_grid_line').attr('x1',0).attr('y1',0).attr('x2',0).attr('y2',height).style('display','none');
            var y_line = svg.append('line').attr('class','y_grid_line').attr('x1',0).attr('y1',0).attr('x2',width).attr('y2',0).style('display','none');
            var rect = d3.select("#chart2 svg").append("svg:rect")
                .attr("class", "pane")
                .attr("width", width)
                .attr("height", height)
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")") 
                .on('mousedown',function(){d3.select(this).style('cursor','-webkit-grabbing');
                focus_g.style("display", "none"); x_move_wrapper.style("display","none");
                x_line.style('display',"none");y_line.style('display',"none")
            })     
                .on('mouseup',function(){d3.select(this).style('cursor','crosshair');
                focus_g.style("display", null); x_move_wrapper.style("display",null);
                x_line.style('display',null);y_line.style('display',null)})
                .on("mouseover", function() { focus_g.style("display", null); x_move_wrapper.style("display",null);
                    x_line.style('display',null);y_line.style('display',null)
                })
                .on("mouseout", function() { focus_g.style("display", "none"); x_move_wrapper.style("display","none");
                    x_line.style('display','none');y_line.style('display','none')
                })
                .on("mousemove", mousemove)
                .call(zoom).on("wheel.zoom", null);
            
            svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

              function mousemove() {
                var eachBand = xOrdinalScale.rangeBand();            
                var index = Math.round((d3.mouse(this)[0] / eachBand));                                                
                var val = x.domain()[index];
                var y0 = y.invert(d3.mouse(this)[1]);
                focus_g.select("text").text(y0.toFixed(0));
                focus_g.attr("transform", "translate(" + (width-10) + "," + (d3.mouse(this)[1]-7) + ")");
                y_line.attr('y1',d3.mouse(this)[1]).attr('y2',d3.mouse(this)[1]);                
                $('#huDate').html( yyyymmdd( new Date(genData[index].Date)));
                $('#huOpen').html( "Open: "+commaFormat(genData[index].o));
                $('#huClose').html("Close: "+ commaFormat(genData[index].c));
                $('#huHigh').html("High: "+ commaFormat(genData[index].h));
                $('#huLow').html("Low: "+ commaFormat(genData[index].l));
                $('#huVolume').html("Volume: "+ kFormat(genData[index].v));
                $('#huSocialVolume').html("Social Volume: "+ kFormat(genData[index].tv));
                $('#huSocial').html("Negative Tweets: "+ genData[index].nv);
                $('.toolTip').show();
                x_move_wrapper.select('rect').attr('x',xOrdinalScale(val)).attr('y',0).attr('width',barwidth).attr('height',height); 
              }

            function zoomed() {         
                console.log('func bot zoomed');

                var vis_startDomain = Date.parse(x.domain()[0]);
                var vis_endDomain = Date.parse(x.domain()[1]);
                console.log(vis_startDomain)
                svg.select(".xaxis1").call(xAxis1);                
                         

                var new_genData = genData.filter(function(d){                                        
                        if(d.Date > vis_startDomain && d.Date <vis_endDomain){
                            return d;
                        }
                    });

                pan_y.domain([d3.min(new_genData, function(d) {
                    return d.l;
                }), d3.max(new_genData, function(d) {
                    return d.h;
                })]).nice();

                y.domain([d3.min(new_genData, function(d) {
                    return d.l;
                }), d3.max(new_genData, function(d) {
                    return d.h;
                })]).nice();

                svg.select(".yaxis").call(yAxis.orient("right").tickSize(0));       
                svg.select(".grid").call(yAxis.orient("left").tickSize(width));       

                svg.selectAll('.candle').data(genData).attr("x", function(d) {
                    return xOrdinalScale(d.Date) - candlewidth/2
                }).attr("y", function(d) {
                    return pan_y(d3.max([d.o, d.c]));
                })
                .attr("height", function(d) {
                    return pan_y(d3.min([d.o, d.c])) - pan_y(d3.max([d.o, d.c]));
                });

                svg.selectAll('.stick').data(genData).attr("x", function(d) {
                    return xOrdinalScale(d.Date)
                }).attr("y", function(d) {
                    return pan_y(d.h);
                }).attr("class", function(d, i) {
                    return "stick stick" + i;
                }).attr("height", function(d) {
                    return pan_y(d.l) - pan_y(d.h);
                }).classed("rise", function(d) {
                    return (d.c > d.o);
                }).classed("fall", function(d) {
                    return (d.o > d.c);
                });;

                bar_y.domain([0, d3.max(new_genData, function(d) {
                    return d["tv"];
                })]).nice();
                
                // d3.selectAll('.volume').data(genData)
                d3.selectAll('.volume').data(genData).attr("x", function(d) {
                    return xOrdinalScale(d.Date) - candlewidth/2
                }).attr("y", function(d) {                    
                    return bar_y(d['tv']);
                }).attr("height", function(d) {                    
                    return bar_y(0) - bar_y(d['tv']);                    
                });
            }

        });
    } // csrender


    csrender.Bheight = function(value) {
        if (!arguments.length) return Bheight;
        Bheight = value;
        return csrender;
    };

    return csrender;
} // cschart