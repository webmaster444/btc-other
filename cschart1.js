function cschart() {

    var margin = {
            top: 0,
            right: 50,
            bottom: 40,
            left: 5
        },
        width = 920,
        height = 440,
        Bheight = 460;

    var barHeight  = 60;
    function csrender(selection) {
        selection.each(function() {
            var parseDate = d3.time.format("%d-%b");
            var x = d3.time.scale()
                .domain([startDomain, endDomain])
                .range([width / genData.length / 2, (width - width / genData.length / 2 )]).nice();            

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
                return d.Low;
            });
            var maximal = d3.max(genData, function(d) {
                return d.High;
            });                            

            // y axis for line charts pan functionality
            var tmp_y = d3.scale.linear().rangeRound([height, 0]);        

            // y axis for bar chart pan functionality
            var bar_y = d3.scale.linear().rangeRound([barHeight, 0]);

            var xAxis = d3.svg.axis().scale(x);            

            var yAxis = d3.svg.axis()
                .scale(y)
                .ticks(Math.floor(height / 50));
            
            // var panyAxis = d3.svg.axis()
            //     .scale(pan_y)
            //     .ticks(Math.floor(height / 50));

            var new1_genData = genData.filter(function(d){                                        
                    if(d.Date > startDomain && d.Date <endDomain){
                        return d;
                    }
                });

            y.domain([d3.min(new1_genData, function(d) {
                    return d.Low;
                }), d3.max(new1_genData, function(d) {
                    return d.High;
                })]).nice();

            // y.domain([minimal, maximal]).nice();

            // var barwidth = width / genData.length;

            var tmp_divider = TCount[period][interval];             
            var barwidth = width / tmp_divider;
            
            var candlewidth = (Math.floor(barwidth * 0.9) / 2) * 2 + 1;            
            var delta = Math.round((barwidth - candlewidth) / 2);

            var valuelinepv = d3.svg.line().x(function(d) {return x(d.Date);}).y(function(d) {return tmp_y(d['PV']);});
            var valuelinetv = d3.svg.line().x(function(d) {return x(d.Date);}).y(function(d) {return tmp_y(d['TV']);});
            var valuelinenv = d3.svg.line().x(function(d) {return x(d.Date);}).y(function(d) {return tmp_y(d['NV']);});
            var valuelineps = d3.svg.line().x(function(d) {return x(d.Date);}).y(function(d) {return tmp_y(d['PS']);});
            var valuelineema12 = d3.svg.line().x(function(d) {return x(d.Date);}).y(function(d) {return tmp_y(d['ema']);});
            var valuelineema26 = d3.svg.line().x(function(d) {return x(d.Date);}).y(function(d) {return tmp_y(d['ema']);});

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
                .call(xAxis.orient("bottom"));            

            svg.append("g")
                .attr("class", "axis yaxis")
                .attr("transform", "translate(" + width + ",0)")
                .call(yAxis.orient("right").tickSize(0));

            svg.append("g")
                .attr("class", "axis grid")
                .attr("transform", "translate(" + width + ",0)")
                // .call(yAxis.orient("left").tickFormat("").tickSize(width));            
                .call(yAxis.orient("left").tickSize(width));            

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
                    return x(d.Date) + Math.floor(barwidth / 2);
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
                    return x(d.Date);
                })
                .attr("y", function(d) {
                    return y(d.High);
                })
                .attr("class", function(d, i) {
                    return "stick stick" + i;
                })
                .attr("height", function(d) {
                    return y(d.Low) - y(d.High);
                })
                .attr("width", 1)
                .classed("rise", function(d) {
                    return (d.Close > d.Open);
                })
                .classed("fall", function(d) {
                    return (d.Open > d.Close);
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
                    return x(d.Date) -candlewidth/2;
                })
                .attr("y", function(d) {
                    return y(d3.max([d.Open, d.Close]));
                })
                .attr("class", function(d, i) {
                    return "candle candle" + i;
                })
                .attr("height", function(d) {
                    return y(d3.min([d.Open, d.Close])) - y(d3.max([d.Open, d.Close]));
                })
                .attr("width", candlewidth)
                .classed("rise", function(d) {
                    return (d.Close > d.Open);
                })
                .classed("fall", function(d) {
                    return (d.Open > d.Close);
                });

            var indicator_g = svg.append('g').attr('class', 'indicator_g').attr('transform', "translate(" + (width) + "," + (y(genData[genData.length - 1].Close) - 7) + ")");

            indicator_g.append('svg').attr('viewBox', "0 0 65 15").attr("enable-background", "new 0 0 65 15").attr('xml:space', "preserve");
            indicator_g.append('path').attr("d", "M65.1,0H11C8.2,0,6.8,0.7,4.5,2.7L0,7.2l4.3,4.6c0,0,3,3.2,6.5,3.2H65L65.1,0L65.1,0z").attr('class', 'ohlc_indicator');
            indicator_g.append('text').attr('x', 12).attr('y', 0).attr('dy', '1em').text(genData[genData.length - 1].Close.toFixed(0));

            var focus_g = svg.append('g').attr('class', 'focus_g').attr('transform', "translate(" + (width) + "," + (y(genData[genData.length - 1].Close) - 7) + ")").style('display','none');

            focus_g.append('svg').attr('viewBox', "0 0 65 15").attr("enable-background", "new 0 0 65 15").attr('xml:space', "preserve");
            focus_g.append('path').attr("d", "M65.1,0H11C8.2,0,6.8,0.7,4.5,2.7L0,7.2l4.3,4.6c0,0,3,3.2,6.5,3.2H65L65.1,0L65.1,0z").attr('class', 'focus_indicator');
            focus_g.append('text').attr('x', 12).attr('y', 0).attr('dy', '1em').text("0");

            var x_move_wrapper = svg.append('g').attr('class','x_wrapper').style('display','none');

            var x_move_rect = x_move_wrapper.append("rect").attr("class",'x_move_rect')
                            .attr("x", -35)
                            .attr("y", 2)
                            .attr('rx',5)
                            .attr("width", 70)
                            .attr("height", 20);
            x_move_wrapper.append('text').attr('x',0).attr('y',15).attr('dy',".1em").style('color','white').text('asdf');

            var x_line = svg.append('line').attr('class','x_grid_line').attr('x1',0).attr('y1',0).attr('x2',0).attr('y2',height).style('display','none');
            var y_line = svg.append('line').attr('class','y_grid_line').attr('x1',0).attr('y1',0).attr('x2',width).attr('y2',0).style('display','none');
            var rect = d3.select("#chart1 svg").append("svg:rect")
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

              function mousemove() {
                var x0 = x.invert(d3.mouse(this)[0]);
                var y0 = y.invert(d3.mouse(this)[1]);
            
                focus_g.attr("transform", "translate(" + width + "," + (d3.mouse(this)[1]-7) + ")");
                x_move_wrapper.attr('transform',"translate("+d3.mouse(this)[0]+","+height+")");
                x_line.attr('x1',d3.mouse(this)[0]).attr('x2',d3.mouse(this)[0]);
                y_line.attr('y1',d3.mouse(this)[1]).attr('y2',d3.mouse(this)[1]);
                x_move_wrapper.select('text').text(parseDate(x0));
                focus_g.select("text").text(y0.toFixed(0));
              }

            function zoomed() {                
                var vis_startDomain = Date.parse(x.domain()[0]);
                var vis_endDomain = Date.parse(x.domain()[1]);
                svg.select(".xaxis").call(xAxis);                
                         

                var new_genData = genData.filter(function(d){                                        
                        if(d.Date > vis_startDomain && d.Date <vis_endDomain){
                            return d;
                        }
                    });

                pan_y.domain([d3.min(new_genData, function(d) {
                    return d.Low;
                }), d3.max(new_genData, function(d) {
                    return d.High;
                })]).nice();

                y.domain([d3.min(new_genData, function(d) {
                    return d.Low;
                }), d3.max(new_genData, function(d) {
                    return d.High;
                })]).nice();

                svg.select(".yaxis").call(yAxis.orient("right").tickSize(0));       
                svg.select(".grid").call(yAxis.orient("left").tickSize(width));       

                svg.selectAll('.candle').data(genData).attr("x", function(d) {
                    return x(d.Date) - candlewidth/2
                }).attr("y", function(d) {
                    return pan_y(d3.max([d.Open, d.Close]));
                })
                .attr("height", function(d) {
                    return pan_y(d3.min([d.Open, d.Close])) - pan_y(d3.max([d.Open, d.Close]));
                });

                svg.selectAll('.stick').data(genData).attr("x", function(d) {
                    return x(d.Date)
                }).attr("y", function(d) {
                    return pan_y(d.High);
                }).attr("class", function(d, i) {
                    return "stick stick" + i;
                }).attr("height", function(d) {
                    return pan_y(d.Low) - pan_y(d.High);
                }).classed("rise", function(d) {
                    return (d.Close > d.Open);
                }).classed("fall", function(d) {
                    return (d.Open > d.Close);
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