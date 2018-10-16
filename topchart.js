function topChart() {

    var margin = {
            top: 0,
            right: 50,
            bottom: 40,
            left: 5
        },
        width = 920,
        height = 250,
        Bheight = 270;

    var barHeight  = 60;
    var yyyymmdd = d3.time.format("%Y-%m-%d");
    var commaFormat = d3.format(",");
    var kFormat = d3.format('.2s');

    function monthDay(d){
        var timeFormat = d3.time.format('%e');
        var timeFormat1 = d3.time.format('%b');
        var c = timeFormat(new Date(d));
        if(c == 1){
            return timeFormat1(new Date(d));
        }
        return c;
    }
    csrender.MValue = function(value) {
        if (!arguments.length) return MValue;
        MValue = value;
        return csrender;
    };

    function csrender(selection) {
        selection.each(function() {
            var parseDate = d3.time.format("%d");            
            // var x = d3.scale.ordinal().domain(genData.map(function(d){return d.dt})).rangeRoundBands([0,width],.1);              
            var x = d3.scale.ordinal().domain(genData.map(function(d){return d.dt})).rangeBands([0,width]);              
                
            // y axes for OHLC chart
            // var y = d3.scale.linear().rangeRound([height, 0]);
            topY = d3.scale.linear().rangeRound([height, 0]);
            var pan_y = d3.scale.linear().rangeRound([height, 0]);

            var zoom = d3.behavior.zoom()
                .x(x)
                .xExtent(d3.extent(genData, function(d) {                       
                    return d.dt
                }))               
                .on("zoom", zoomed);
            
            var bisectDate = d3.bisector(function(d) { return d.dt; }).left;                          

            // y axis for line charts pan functionality
            var tmp_y = d3.scale.linear().rangeRound([height, 0]);        

            // y axis for bar chart pan functionality
            var bar_y = d3.scale.linear().rangeRound([barHeight, 0]);

            var xAxis = d3.svg.axis().scale(x);            

            var yAxis = d3.svg.axis()
                .scale(topY)
                .ticks(Math.floor(height / 50));
            
            // var panyAxis = d3.svg.axis()
            //     .scale(pan_y)
            //     .ticks(Math.floor(height / 50));

            var new1_genData = genData.filter(function(d){                                        
                    if(d.dt > startDomain && d.Date <endDomain){
                        return d;
                    }
                });

            
            topY.domain(d3.extent(genData, function(d) {return d[MValue];})).nice();
            
            var barwidth = x.rangeBand();

            var tmp_divider = TCount[period][interval];                         
            
            // var candlewidth = (Math.floor(barwidth * 0.9) / 2) * 2 + 1;            
            var candlewidth = x.rangeBand();
            var delta = Math.round((barwidth - candlewidth) / 2);

            var valuelinepv = d3.svg.line().x(function(d) {return x(d.dt);}).y(function(d) {return tmp_y(d['pv']);});
            var valuelinetv = d3.svg.line().x(function(d) {return x(d.dt);}).y(function(d) {return tmp_y(d['tv']);});
            var valuelinenv = d3.svg.line().x(function(d) {return x(d.dt);}).y(function(d) {return tmp_y(d['nv']);});
            var valuelineps = d3.svg.line().x(function(d) {return x(d.dt);}).y(function(d) {return tmp_y(d['ps']);});
            var valuelineema12 = d3.svg.line().x(function(d) {return x(d.dt);}).y(function(d) {return tmp_y(d['ema']);});
            var valuelineema26 = d3.svg.line().x(function(d) {return x(d.dt);}).y(function(d) {return tmp_y(d['ema']);});

            d3.select(this).select("svg").remove();
            var svg = d3.select(this).append("svg").attr('viewBox','0 0 '+(width + margin.left + margin.right) + ', '+ (Bheight + margin.top + margin.bottom))
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

            svg.append("g")
                .attr("class", "axis xaxis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis.orient("bottom").tickFormat(monthDay));            

            svg.append("g")
                .attr("class", "axis yaxis")
                .attr("transform", "translate(" + width + ",0)")
                .call(yAxis.orient("right").tickSize(6));

            svg.append("g")
                .attr("class", "axis grid")
                .attr("transform", "translate(" + width + ",0)")
                // .call(yAxis.orient("left").tickFormat("").tickSize(width));            
                .call(yAxis.orient("left").tickSize(0));                    
            
            var dotline = svg.append('line').attr('class','dotted_line').attr('x1',0).attr('y1',(topY(genData[genData.length - 1][MValue]) - 7)).attr('x2',(width-7)).attr('y2',(topY(genData[genData.length - 1][MValue]) - 7));
            var focus_g = svg.append('g').attr('class', 'focus_g').attr('transform', "translate(" + (width - 10) + "," + (topY(genData[genData.length - 1][MValue]) - 7) + ")").style('display','none');

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
            var y_line = svg.append('line').attr('class','y_grid_line').attr('x1',0).attr('y1',0).attr('x2',(width-10)).attr('y2',0).style('display','none');
            var rect = d3.select("#chart1 svg").append("svg:rect")
                .attr("class", "pane")
                .attr("width", width)
                .attr("height", height)
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")") 
                .on('mousedown',function(){
                    d3.select(this).style('cursor','-webkit-grabbing');
                    focus_g.style("display", "none"); x_move_wrapper.style("display","none");
                    x_line.style('display',"none");y_line.style('display',"none")
                })     
                .on('mouseup',function(){d3.select(this).style('cursor','crosshair');
                    focus_g.style("display", null); x_move_wrapper.style("display",null);
                    x_line.style('display',null);y_line.style('display',null)})
                .on("mouseover", function() { focus_g.style("display", null); x_move_wrapper.style("display",null);
                    x_line.style('display',null);
                    y_line.style('display',null)
                })
                .on("mouseout", function() { focus_g.style("display", "none"); x_move_wrapper.style("display","none");
                    x_line.style('display','none');y_line.style('display','none');
                    $('.toolTip').hide();
                })
                .on("mousemove", mousemove)
                .call(zoom).on("wheel.zoom", null);

              function mousemove() {                      
                var eachBand = x.rangeBand();
                var index = Math.round((d3.mouse(this)[0] / eachBand));                                                
                var val = x.domain()[index];
                var y0 = topY.invert(d3.mouse(this)[1]);
                if(MValue!='ps'){
                    focus_g.select("text").text(y0.toFixed(0));    
                }else{
                    focus_g.select("text").text(y0.toFixed(2));    
                }
                
                focus_g.attr("transform", "translate(" + (width-10) + "," + (d3.mouse(this)[1]-7) + ")");
                y_line.attr('y1',d3.mouse(this)[1]).attr('y2',d3.mouse(this)[1]);                
                $('#huDate').html( yyyymmdd( new Date(genData[index].Date)));
                $('#huOpen').html( "Open: "+commaFormat(genData[index].o));
                $('#huClose').html("Close: "+ commaFormat(genData[index].c));
                $('#huHigh').html("High: "+ commaFormat(genData[index].h));
                $('#huLow').html("Low: "+ commaFormat(genData[index].l));
                $('#huVolume').html("Volume: "+ kFormat(genData[index].v));            
                if(MValue=='v'){
                    $('#huSocial').html("Social Volume: "+ genData[index]['v']);    
                    $('#huSocialVolume').html("");
                }else if(MValue=="ps"){
                    $('#huSocial').html("% Positive Sentiment: "+ genData[index]['ps'] * 100 + '%');    
                    $('#huSocialVolume').html("Social Volume: "+ kFormat(genData[index].tv));
                }else if(MValue =="nv"){
                    $('#huSocial').html("Negative Tweets: "+ genData[index][MValue]);    
                    $('#huSocialVolume').html("Social Volume: "+ kFormat(genData[index].tv));
                }else if(MValue =="pv"){
                    $('#huSocial').html("Positive Tweets: "+ genData[index][MValue]);    
                    $('#huSocialVolume').html("Social Volume: "+ kFormat(genData[index].tv));
                }
                
                $('.toolTip').show();
                x_move_wrapper.select('rect').attr('x',x(val)).attr('y',0).attr('width',barwidth).attr('height',height);                
              }

            function zoomed() {                
                console.log('zoomed');
                var vis_startDomain = Date.parse(x.domain()[0]);
                var vis_endDomain = Date.parse(x.domain()[1]);
                svg.select(".xaxis").call(xAxis);                
                         
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
                    return x(d.Date) - candlewidth/2
                }).attr("y", function(d) {
                    return pan_y(d3.max([d.o, d.c]));
                })
                .attr("height", function(d) {
                    return pan_y(d3.min([d.o, d.c])) - pan_y(d3.max([d.o, d.c]));
                });

                svg.selectAll('.stick').data(genData).attr("x", function(d) {
                    return x(d.Date)
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
                    return d["Volume"];
                })]).nice();
                
                // d3.selectAll('.volume').data(genData)
                d3.selectAll('.volume').data(genData).attr("x", function(d) {
                    return x(d.Date) - candlewidth/2
                }).attr("y", function(d) {                    
                    return bar_y(d['Volume']);
                }).attr("height", function(d) {                    
                    return bar_y(0) - bar_y(d['Volume']);                    
                });

                tmp_y.domain(d3.extent(new_genData, function(d) {return d['PV'];})).nice();
                d3.selectAll(".pvline")                     
                    .attr("d", valuelinepv(new_genData));
                
                tmp_y.domain(d3.extent(new_genData, function(d) {return d['PS'];})).nice();
                d3.selectAll(".psline")                     
                    .attr("d", valuelineps(new_genData));
                
                tmp_y.domain(d3.extent(new_genData, function(d) {return d['TV'];})).nice();
                d3.selectAll(".tvline")                     
                    .attr("d", valuelinetv(new_genData));
                
                tmp_y.domain(d3.extent(new_genData, function(d) {return d['NV'];})).nice();
                d3.selectAll(".nvline")                     
                    .attr("d", valuelinenv(new_genData));


                // tmp_y.domain(d3.extent(genData, function(d) {return d['PS'];})).nice();
                // d3.selectAll(".psline").attr("d", valuelineps(genData));

                // tmp_y.domain(d3.extent(genData, function(d) {return d['TV'];})).nice();
                // d3.selectAll(".tvline").attr("d", valuelinetv(genData));

                // tmp_y.domain(d3.extent(genData, function(d) {return d['NV'];})).nice();
                // d3.selectAll(".nvline").attr("d", valuelinenv(genData));

                var new_ema12 = ema12.filter(function(d){                                        
                        if(d.Date > vis_startDomain && d.Date <vis_endDomain){
                            return d;
                        }
                    });

                tmp_y.domain(d3.extent(new_ema12, function(d) {return d['ema'];})).nice();
                d3.selectAll(".ema12line").attr("d", valuelineema12(ema12));    

                // tmp_y.domain(d3.extent(ema12, function(d) {return d['ema'];})).nice();
                // d3.selectAll(".ema12line").attr("d", valuelineema12(ema12));

                var new_ema26 = ema26.filter(function(d){                                        
                        if(d.Date > vis_startDomain && d.Date <vis_endDomain){
                            return d;
                        }
                    });

                tmp_y.domain(d3.extent(new_ema26, function(d) {return d['ema'];})).nice();
                d3.selectAll(".ema26line").attr("d", valuelineema26(ema26));        

                // tmp_y.domain(d3.extent(ema26, function(d) {return d['ema'];})).nice();
                // d3.selectAll(".ema26line").attr("d", valuelineema26(ema26));
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