function topChart() {

        var margin = {
                top: 0,
                right: 50,
                bottom: 50,
                left: 5
            },
            width = 920,
            topHeight = 250,
            botHeight = 250;
        Bheight = 270;

        var barHeight = 60;
        var yyyymmdd = d3.time.format("%Y-%m-%d");
        var commaFormat = d3.format(",");
        var kFormat = d3.format('.2s');
        var nv_color = '#B95F61';
        var pv_color = '#31e41d';

        function monthDay(d) {
            var timeFormat = d3.time.format('%e');
            var timeFormat1 = d3.time.format('%b');
            var c = timeFormat(new Date(d));
            if (c == 1) {
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
                    let emaToolTip = d3.select('body').append('div').attr('class', 'emaToolTip').style('position', 'absolute').style('z-index', '100').style('background', 'white').style('padding', '5px').style('visibility', 'hidden')
                    var tmp_divider = TCount[period][interval];
                    var parseDate = d3.time.format("%d");
                    var x = d3.time.scale()
                        .domain([startDomain, endDomain])
                        .range([width / tmp_divider / 2, (width - width / tmp_divider / 2)]);

                    topY = d3.scale.linear().rangeRound([topHeight, 0]);
                    var pan_y = d3.scale.linear().rangeRound([topHeight, 0]);

                    var zoom = d3.behavior.zoom()
                        .x(x)
                        .xExtent(d3.extent(genData, function(d) {
                            return d.Date;
                        }))
                        .on("zoom", zoomed);

                    var bisectDate = d3.bisector(function(d) {
                        return d.dt;
                    }).left;

                    // y axis for line charts pan functionality
                    var tmp_y = d3.scale.linear().rangeRound([topHeight, 0]);

                    // y axis for bar chart pan functionality
                    var bar_y = d3.scale.linear().rangeRound([barHeight, 0]);

                    var xAxis = d3.svg.axis().scale(x);

                    var yAxis = d3.svg.axis()
                        .scale(topY)
                        .ticks(Math.floor(topHeight / 50));

                    var new_genData = genData.filter(function(d) {
                        if (d.Date > startDomain && d.Date <= endDomain) {
                            return d;
                        }
                    });

                    bar_y.domain([0, d3.max(new_genData, function(d) {
                        return d["v"];
                    })]).nice();

                    topY.domain(d3.extent(genData, function(d) {
                        return d[MValue];
                    })).nice();

                    var barwidth = width / tmp_divider;

                    var valueareapv = d3.svg.area().x(function(d) {
                        return x(d.Date);
                    }).y0(topHeight).y1(function(d) {
                        return tmp_y(d['pv']);
                    }).interpolate('basis');
                    var valueareanv = d3.svg.area().x(function(d) {
                        return x(d.Date);
                    }).y0(topHeight).y1(function(d) {
                        return tmp_y(d['nv']);
                    }).interpolate('basis');
                    var valuelinetv = d3.svg.line().x(function(d) {
                        return x(d.Date);
                    }).y(function(d) {
                        return tmp_y(d['v']);
                    }).interpolate('basis');
                    var valuelineps = d3.svg.line().x(function(d) {
                        return x(d.Date);
                    }).y(function(d) {
                        return tmp_y(d['ps']);
                    }).interpolate('basis');
                    var valueareaps = d3.svg.line().x(function(d) {
                        return x(d.Date);
                    }).y(function(d) {
                        return tmp_y(d['ps']);
                    }).interpolate('basis');
                    var valuelineema12 = d3.svg.line().x(function(d) {
                        return x(d.Date);
                    }).y(function(d) {
                        return tmp_y(d['ema']);
                    }).interpolate('basis');
                    var valuelineema26 = d3.svg.line().x(function(d) {
                        return x(d.Date);
                    }).y(function(d) {
                        return tmp_y(d['ema']);
                    }).interpolate('basis');

                    d3.select(this).select("svg").remove();
                    var svg = d3.select(this).append("svg").attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (Bheight * 2 + margin.top + margin.bottom));

                    var topSvg = svg
                        .append("g")
                        .attr('class', 'top_g')
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    topSvg.append("defs").append("clipPath")
                        .attr("id", "clip")
                        .append("rect")
                        .attr("width", width)
                        .attr("height", topHeight);

                    if (period == '1w') {
                        topSvg.append("g")
                            .attr("class", "axis xaxis")
                            .attr("transform", "translate(0," + topHeight + ")")
                            .call(xAxis.orient("bottom").ticks(8));
                        topSvg.append('line').attr('x1', 0).attr('x2', width).attr('y1', topHeight).attr('y2', topHeight).attr('stroke', 'white').attr('stroke-width', '1px');
                    } else {
                        topSvg.append("g")
                            .attr("class", "axis xaxis")
                            .attr("transform", "translate(0," + topHeight + ")")
                            .call(xAxis.orient("bottom"));
                        topSvg.append('line').attr('x1', 0).attr('x2', width).attr('y1', topHeight).attr('y2', topHeight).attr('stroke', 'white').attr('stroke-width', '1px');
                    }
                    topSvg.append("g")
                        .attr("class", "axis xaxis")
                        .attr("transform", "translate(0," + topHeight + ")")
                        .call(xAxis.orient("bottom"));

                    topSvg.append("g")
                        .attr("class", "axis yaxis topyaxis")
                        .attr("transform", "translate(" + width + ",0)")
                        .call(yAxis.orient("right").tickSize(6));

                    topSvg.append("g")
                        .attr("class", "axis grid topxaxis")
                        .attr("transform", "translate(" + width + ",0)")
                        .call(yAxis.orient("left").tickSize(0));

                    drawBarChart('v', 'sv');
                    drawLineChart('v', 'sv');
                    drawLineChart('ps', 'ps');
                    drawLineChart('ip', 'ip');
                    drawAreaChart('pv', 'pv');
                    drawAreaChart('nv', 'nv');

                    var dotline = topSvg.append('line').attr('class', 'dotted_line').attr('x1', 0).attr('y1', (topY(genData[genData.length - 1][MValue]) - 7)).attr('x2', (width - 7)).attr('y2', (topY(genData[genData.length - 1][MValue]) - 7));
                    var focus_g = topSvg.append('g').attr('class', 'focus_g').attr('transform', "translate(" + (width - 10) + "," + (topY(genData[genData.length - 1][MValue]) - 7) + ")").style('display', 'none');

                    focus_g.append('svg').attr('viewBox', "0 0 65 15").attr("enable-background", "new 0 0 65 15").attr('xml:space', "preserve");
                    focus_g.append('path').attr("d", "M65.1,0H11C8.2,0,6.8,0.7,4.5,2.7L0,7.2l4.3,4.6c0,0,3,3.2,6.5,3.2H65L65.1,0L65.1,0z").attr('class', 'focus_indicator');
                    focus_g.append('text').attr('x', 12).attr('y', 0).attr('dy', '1em').text("0");

                    var x_move_wrapper = topSvg.append('g').attr('class', 'x_wrapper').style('display', 'none');

                    var x_move_rect = x_move_wrapper.append("rect").attr("class", 'x_move_rect')
                        .attr("x", 0)
                        .attr("y", 0)
                        .attr('rx', 0)
                        .attr("width", barwidth)
                        .attr("height", topHeight);

                    var x_line = topSvg.append('line').attr('class', 'x_grid_line').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', topHeight).style('display', 'none');
                    var y_line = topSvg.append('line').attr('class', 'y_grid_line').attr('x1', 0).attr('y1', 0).attr('x2', (width - 10)).attr('y2', 0).style('display', 'none');
                    var rect = d3.select(".top_g").append("svg:rect")
                        .attr("class", "pane")
                        .attr("width", width)
                        .attr("height", topHeight)
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                        .on('mousedown', function() {
                            d3.select(this).style('cursor', '-webkit-grabbing');
                            focus_g.style("display", "none");
                            x_move_wrapper.style("display", "none");
                            x_line.style('display', "none");
                            y_line.style('display', "none")
                        })
                        .on('mouseup', function() {
                            d3.select(this).style('cursor', 'crosshair');
                            focus_g.style("display", null);
                            x_move_wrapper.style("display", null);
                            x_line.style('display', null);
                            y_line.style('display', null)

                            bot_focus_g.style("display", null);
                            bot_x_move_wrapper.style("display", null);
                            bot_x_line.style('display', null);
                            bot_y_line.style('display', null)
                        })
                        .on("mouseover", function() {
                            focus_g.style("display", null);
                            x_move_wrapper.style("display", null);
                            bot_focus_g.style("display", null);
                            bot_x_move_wrapper.style("display", null);
                            x_line.style('display', null);
                            y_line.style('display', null);
                            bot_x_line.style('display', null);
                            bot_y_line.style('display', null);
                        })
                        .on("mouseout", function() {
                            focus_g.style("display", "none");
                            x_move_wrapper.style("display", "none");
                            x_line.style('display', 'none');
                            y_line.style('display', 'none');
                            bot_x_line.style('display', 'none');
                            bot_y_line.style('display', 'none');
                            $('.toolTip').hide();
                        })
                        .on("mousemove", mousemove)
                        .call(zoom).on("wheel.zoom", null);
                    drawEmaChart(topSvg, vema12, 'v12');
                    drawEmaChart(topSvg, vema26, 'v26');
                    drawEmaChart(topSvg, psema12, 'ps12');
                    drawEmaChart(topSvg, psema26, 'ps26');
                    drawEmaChart(topSvg, pvema12, 'pv12');
                    drawEmaChart(topSvg, pvema26, 'pv26');
                    drawEmaChart(topSvg, nvema12, 'nv12');
                    drawEmaChart(topSvg, nvema26, 'nv26');

                    function mousemove() {
                        var x0 = x.invert(d3.mouse(this)[0]);
                        var y0 = topY.invert(d3.mouse(this)[1]);
                        var y1 = botY.invert(d3.mouse(this)[1]);

                        var t = Date.parse(x0);
                        var s = new Date(t);
                        var st = Date.parse(new Date(s.getFullYear(), s.getMonth(), s.getDate()));

                        var index = genData.find(function(item, i) {
                            if (item.Date === st) {
                                index = i;
                                return i;
                            }
                        });

                        focus_g.attr("transform", "translate(" + width + "," + (d3.mouse(this)[1] - 7) + ")");
                        x_move_wrapper.attr('transform', "translate(" + d3.mouse(this)[0] + "," + 0 + ")");
                        x_line.attr('x1', d3.mouse(this)[0]).attr('x2', d3.mouse(this)[0]);
                        y_line.attr('y1', d3.mouse(this)[1]).attr('y2', d3.mouse(this)[1]);
                        focus_g.select("text").text(y0.toFixed(0));

                        bot_focus_g.attr("transform", "translate(" + width + "," + (d3.mouse(this)[1] - 7) + ")");
                        bot_x_move_wrapper.attr('transform', "translate(" + d3.mouse(this)[0] + "," + 0 + ")");
                        bot_x_line.attr('x1', d3.mouse(this)[0]).attr('x2', d3.mouse(this)[0]);
                        bot_y_line.attr('y1', d3.mouse(this)[1]).attr('y2', d3.mouse(this)[1]);
                        bot_focus_g.select("text").text(y1.toFixed(0));

                        $('#huDate').html(yyyymmdd(new Date(index.Date)));
                        $('#huOpen').html("Open: " + commaFormat(index.o));
                        $('#huClose').html("Close: " + commaFormat(index.c));
                        $('#huHigh').html("High: " + commaFormat(index.h));
                        $('#huLow').html("Low: " + commaFormat(index.l));
                        $('#huVolume').html("Volume: " + kFormat(index.v));
                        $('#huSocialVolume').html("Social Volume: " + kFormat(index.tv));
                        var tmp_str = "";
                        switch (activeDrop) {
                            case "v":
                                tmp_str = "Social Volume: "
                                break;
                            case "ps":
                                tmp_str = "% Positive Sentiment: ";
                                break;
                            case "pv":
                                tmp_str = "Positive Tweets: ";
                                break;
                            case "nv":
                                tmp_str = "Negative Tweets: ";
                                break;
                        }
                        $('#huSocial').html(tmp_str + index[activeDrop]);
                        $('.toolTip').show();
                    }

                    function zoomed() {
                        var vis_startDomain = Date.parse(x.domain()[0]);
                        var vis_endDomain = Date.parse(x.domain()[1]);
                        d3.selectAll(".xaxis").call(xAxis);

                        var new_genData = genData.filter(function(d) {
                            if (d.Date > vis_startDomain && d.Date <= vis_endDomain) {
                                return d;
                            }
                        });

                        pan_y.domain([d3.min(new_genData, function(d) {
                            return d.l;
                        }), d3.max(new_genData, function(d) {
                            return d.h;
                        })]).nice();

                        topY.domain(d3.extent(new_genData, function(d) {
                            return d[activeDrop];
                        })).nice();

                        topSvg.select(".topyaxis").call(yAxis.orient("right").tickSize(6));

                        bar_y.domain([0, d3.max(new_genData, function(d) {
                            return d["v"];
                        })]).nice();
                        
                        d3.selectAll('.volume').data(genData).attr("x", function(d) {
                            return x(d.Date) - barwidth / 2;
                        }).attr("y", function(d) {
                            return bar_y(d['v']);
                        }).attr("height", function(d) {
                            return bar_y(0) - bar_y(d['v']);
                        });

                        tmp_y.domain(d3.extent(new_genData, function(d) {
                            return d['pv'];
                        })).nice();
                        d3.selectAll(".pvarea")
                            .attr("d", valueareapv(genData));

                        tmp_y.domain(d3.extent(new_genData, function(d) {
                            return d['ps'];
                        })).nice();
                        d3.selectAll(".psline")
                            .attr("d", valuelineps(genData));

                        tmp_y.domain(d3.extent(new_genData, function(d) {
                            return d['v'];
                        })).nice();
                        d3.selectAll(".svline")
                            .attr("d", valuelinetv(genData));

                        tmp_y.domain(d3.extent(new_genData, function(d) {
                            return d['nv'];
                        })).nice();
                        d3.selectAll(".nvarea")
                            .attr("d", valueareanv(genData));


                        var new_vema12 = vema12.filter(function(d) {
                            if (d.Date > vis_startDomain && d.Date <= vis_endDomain) {
                                return d;
                            }
                        });

                        tmp_y.domain(d3.extent(new_vema12, function(d) {
                            return d['ema'];
                        })).nice();
                        d3.selectAll(".v12.emaline").attr("d", valuelineema12(vema12));

                        var new_vema26 = vema26.filter(function(d) {
                            if (d.Date > vis_startDomain && d.Date < vis_endDomain) {
                                return d;
                            }
                        });

                        tmp_y.domain(d3.extent(new_vema26, function(d) {
                            return d['ema'];
                        })).nice();
                        d3.selectAll(".v26.emaline").attr("d", valuelineema26(vema26));

                        //Bot Zoom
                        botPanY.domain([d3.min(new_genData, function(d) {
                            return d.l;
                        }), d3.max(new_genData, function(d) {
                            return d.h;
                        })]).nice();

                        botY.domain([d3.min(new_genData, function(d) {
                            return d.l;
                        }), d3.max(new_genData, function(d) {
                            return d.h;
                        })]).nice();

                        botSvg.select(".botYAxis").call(botYAxis.orient("right").tickSize(6));

                        svg.selectAll('.candle').data(genData).attr("x", function(d) {
                                return x(d.Date) - candlewidth / 2
                            }).attr("y", function(d) {
                                return botPanY(d3.max([d.o, d.c]));
                            })
                            .attr("height", function(d) {
                                return botPanY(d3.min([d.o, d.c])) - botPanY(d3.max([d.o, d.c]));
                            });

                        svg.selectAll('.stick').data(genData).attr("x", function(d) {
                            return x(d.Date)
                        }).attr("y", function(d) {
                            return botPanY(d.h);
                        }).attr("class", function(d, i) {
                            return "stick stick" + i;
                        }).attr("height", function(d) {
                            return botPanY(d.l) - botPanY(d.h);
                        }).classed("rise", function(d) {
                            return (d.c > d.o);
                        }).classed("fall", function(d) {
                            return (d.o > d.c);
                        });

                        botBarY.domain([0, d3.max(new_genData, function(d) {
                            return d["tv"];
                        })]).nice();

                        // d3.selectAll('.volume').data(genData)
                        d3.selectAll('.tvbar .volume').data(genData).attr("x", function(d) {
                            return x(d.Date) - barwidth / 2;
                        }).attr("y", function(d) {
                            return botBarY(d['tv']);
                        }).attr("height", function(d) {
                            return botBarY(0) - botBarY(d['tv']);
                        });
                    }

                    function drawLineChart(MValue, mname) {
                        tmp_y.domain(d3.extent(new_genData, function(d) {
                            return d[MValue];
                        })).nice();

                        var valueline = d3.svg.line().x(function(d) {
                            return x(d.Date);
                        }).y(function(d) {
                            return tmp_y(d[MValue]);
                        }).interpolate('basis');

                        var chart_wrapper = topSvg.append('g').attr('class', 'hide line_wrapper ' + mname + '_line');

                        chart_wrapper.append("path")
                            .attr("class", mname + "line line")
                            .attr("d", valueline(genData))
                            .attr("fill", "#path_grad");

                        var indicator_g = chart_wrapper.append('g').attr('class', 'indicator_g').attr('transform', "translate(" + (width - 10) + "," + (topY(genData[genData.length - 1][MValue]) - 7) + ")");

                        indicator_g.append('svg').attr('viewBox', "0 0 65 15").attr("enable-background", "new 0 0 65 15").attr('xml:space', "preserve");
                        indicator_g.append('path').attr("d", "M65.1,0H11C8.2,0,6.8,0.7,4.5,2.7L0,7.2l4.3,4.6c0,0,3,3.2,6.5,3.2H65L65.1,0L65.1,0z").attr('class', mname + '_indicator');
                        indicator_g.append('text').attr('x', 12).attr('y', 0).attr('dy', '1em').text(genData[genData.length - 1][MValue].toFixed(2));
                    }

                    function drawEmaChart(wrapper, data, stat) {
                        var new_genEmaData = data.filter(function(d) {
                            if (d.Date > startDomain && d.Date <= endDomain) {
                                return d;
                            }
                        });

                        tmp_y.domain(d3.extent(new_genEmaData, function(d) {
                            return d['ema'];
                        })).nice();

                        var valueline = d3.svg.line()
                            .x(function(d) {
                                return x(d.Date)
                            })
                            .y(function(d) {
                                return tmp_y(d.ema);
                            })
                            .interpolate('basis');

                        var ema_g_wrapper = wrapper.append('g').attr('class', function(){
                            var ts = '';
                            if(stat.includes('12')){
                                ts +='ema_12_g ';
                            }else{
                                ts +='ema_26_g ';
                            }
                            return ts+'hide ema_g_wrapper ' + stat + '_g_wrapper'});

                        ema_g_wrapper.append("path")
                            .attr("class", stat + " emaline line")
                            .attr("d", valueline(data))
                            .on("mouseover", function() {
                                if (stat.includes('12')) {
                                    var i = "ma(12,C,ema,0,n)" + "<br>";
                                } else {
                                    var i = 'ma(26,C,ema,0,n)' + '<br>';
                                }
                                i += '( right-click to delete )';
                                d3.select(this).attr('stroke-width', '2px');
                                d3.selectAll('.emaToolTip').style('visibility', null);
                                emaToolTip.html(i);
                            })
                            .on("mouseout", function() {
                                d3.select(this).attr('stroke-width', '1px');
                                d3.selectAll('.emaToolTip').style('visibility', 'hidden');
                            })
                            .on("mousemove", function() {
                                return emaToolTip.style('top', (d3.event.pageY - 10) + 'px').style('left', (d3.event.pageX + 10) + "px");
                            })
                            .on("contextmenu", function() {
                                d3.selectAll('.emaToolTip').style('visibility', 'hidden');
                                d3.select(this).remove();
                            });

                        var indicator_g = ema_g_wrapper.append('g').attr('class', 'indicator_g').attr('transform', "translate(" + (width) + "," + (tmp_y(data[data.length - 1].ema) - 7) + ")");

                        indicator_g.append('svg').attr('viewBox', "0 0 65 15").attr("enable-background", "new 0 0 65 15").attr('xml:space', "preserve");
                        indicator_g.append('path').attr("d", "M65.1,0H11C8.2,0,6.8,0.7,4.5,2.7L0,7.2l4.3,4.6c0,0,3,3.2,6.5,3.2H65L65.1,0L65.1,0z").attr('class', stat + '_indicator');
                        indicator_g.append('text').attr('x', 12).attr('y', 0).attr('dy', '1em').text(data[data.length - 1].ema.toFixed(2));
                    }

                    function drawBarChart(MValue, mname) {
                        //Bar Chart
                        var top_bar_wrapper = topSvg.append('g').attr('class', 'top_bar_wrapper hide').attr('transform', 'translate(0,190)');

                        var mbar = top_bar_wrapper.selectAll(".svbar")
                            .data([genData])
                            .enter().append("g")
                            .attr("class", "svbar");

                        mbar.selectAll("rect")
                            .data(function(d) {
                                return d;
                            })
                            .enter().append("rect")
                            .attr("class", "svfill")
                            .attr("x", function(d) {
                                return x(d.Date) - barwidth / 2;
                            })
                            .attr("y", function(d) {
                                return bar_y(d[MValue]);
                            })
                            .attr("class", function(d, i) {
                                return 'sv' + i + " volume";
                            })
                            .attr("height", function(d) {
                                return bar_y(0) - bar_y(d[MValue]);
                            })
                            .attr("width", barwidth);
                    }

                    function drawAreaChart(MValue, mname) {
                        var defs = topSvg.append("defs");

                        var gradients = defs.append('linearGradient').attr('id', 'path_grad' + mname).attr("x1", "0%")
                            .attr("x2", "0%")
                            .attr("y1", "0%")
                            .attr("y2", "100%");

                        gradients.append("stop")
                            .attr('class', 'start')
                            .attr("offset", '0%')
                            .attr("stop-color", function() {
                                if (MValue == "pv") {
                                    return pv_color;
                                } else if (MValue == "nv") {
                                    return nv_color;
                                }
                                return nv_color;
                            })
                            .attr("stop-opacity", 1);
                        gradients.append("stop")
                            .attr('class', 'end')
                            .attr("offset", "100%")
                            .attr("stop-color", "#2F323C")
                            .attr("stop-opacity", 1);

                        tmp_y.domain(d3.extent(new_genData, function(d) {
                            return d[MValue];
                        })).nice();

                        var valuearea = d3.svg.area().x(function(d) {
                            return x(d.Date);
                        }).y0(topHeight).y1(function(d) {
                            return tmp_y(d[MValue]);
                        }).interpolate('basis');

                        var chart_wrapper = topSvg.append('g').attr('class', 'hide area_wrapper ' + mname + '_area');

                        chart_wrapper.append("path")
                            .attr("class", mname + "area area")
                            .attr("d", valuearea(genData))
                            .attr("fill", "#path_grad" + mname);

                        var indicator_g = chart_wrapper.append('g').attr('class', 'indicator_g').attr('transform', "translate(" + (width - 10) + "," + (topY(genData[genData.length - 1][MValue]) - 7) + ")");

                        indicator_g.append('svg').attr('viewBox', "0 0 65 15").attr("enable-background", "new 0 0 65 15").attr('xml:space', "preserve");
                        indicator_g.append('path').attr("d", "M65.1,0H11C8.2,0,6.8,0.7,4.5,2.7L0,7.2l4.3,4.6c0,0,3,3.2,6.5,3.2H65L65.1,0L65.1,0z").attr('class', mname + '_indicator');
                        indicator_g.append('text').attr('x', 12).attr('y', 0).attr('dy', '1em').text(genData[genData.length - 1][MValue].toFixed(2));
                    }

                    //Bottom Chart 
                    // y axes for OHLC chart
                    var botY = d3.scale.linear().rangeRound([botHeight, 0]);
                    var botPanY = d3.scale.linear().rangeRound([botHeight, 0]);

                    var bisectDate = d3.bisector(function(d) {
                        return d.Date;
                    }).left;

                    var minimal = d3.min(genData, function(d) {
                        return d.l;
                    });
                    var maximal = d3.max(genData, function(d) {
                        return d.h;
                    });

                    // y axis for line charts pan functionality
                    var botTmpY = d3.scale.linear().rangeRound([botHeight, 0]);

                    // y axis for bar chart pan functionality
                    var botBarY = d3.scale.linear().rangeRound([barHeight, 0]);

                    botBarY.domain([0, d3.max(new_genData, function(d) {
                        return d["tv"];
                    })]).nice();


                    var botYAxis = d3.svg.axis()
                        .scale(botY)
                        .ticks(Math.floor(botHeight / 50));

                    var new_genData = genData.filter(function(d) {
                        if (d.Date > startDomain && d.Date < endDomain) {
                            return d;
                        }
                    });

                    botY.domain([d3.min(new_genData, function(d) {
                        return d.l;
                    }), d3.max(new_genData, function(d) {
                        return d.h;
                    })]).nice();

                    // // y.domain([minimal, maximal]).nice();

                    // var tmp_divider = TCount[period][interval];             
                    // var barwidth = width / tmp_divider;

                    var candlewidth = (Math.floor(barwidth * 0.9) / 2) * 2 + 1;
                    var delta = Math.round((barwidth - candlewidth) / 2);

                    // d3.select(this).select("svg").remove();
                    var botSvg = svg
                        .append("g")
                        .attr('class', 'bot_g')
                        .attr("transform", "translate(" + margin.left + "," + (topHeight + 30 + margin.top) + ")");

                    //Bar Chart
                    var btm_bar_wrapper = botSvg.append('g').attr('class', 'btm_bar_wrapper').attr('transform', 'translate(0,190)');

                    var mbar = btm_bar_wrapper.selectAll(".tvbar")
                        .data([genData])
                        .enter().append("g")
                        .attr("class", "tvbar");

                    mbar.selectAll("rect")
                        .data(function(d) {
                            return d;
                        })
                        .enter().append("rect")
                        .attr("class", "tvfill")
                        .attr("x", function(d) {
                            return x(d.Date) - barwidth / 2;
                        })
                        .attr("y", function(d) {
                            return botBarY(d['tv']);
                        })
                        .attr("class", function(d, i) {
                            return 'tv' + i + " volume";
                        })
                        .attr("height", function(d) {
                            return botBarY(0) - botBarY(d['tv']);
                        })
                        .attr("width", barwidth);

                    botSvg.append("defs").append("clipPath")
                        .attr("id", "clip2")
                        .append("rect")
                        .attr("width", width)
                        .attr("height", botHeight);

                    if (period == '1w') {
                        botSvg.append("g")
                            .attr("class", "axis xaxis")
                            .attr("transform", "translate(0," + botHeight + ")")                                    
                            .call(xAxis.orient("bottom"));
                        botSvg.append('line').attr('x1', 0).attr('x2', width).attr('y1', botHeight).attr('y2', botHeight).attr('stroke', 'white').attr('stroke-width', '1px');
                    } else {
                        botSvg.append("g")
                            .attr("class", "axis xaxis")
                            .attr("transform", "translate(0," + botHeight + ")")                            
                            .call(xAxis.orient("bottom").ticks(8));
                        botSvg.append('line').attr('x1', 0).attr('x2', width).attr('y1', botHeight).attr('y2', botHeight).attr('stroke', 'white').attr('stroke-width', '1px');
                    }


                    botSvg.append("g")
                        .attr("class", "axis botYAxis")
                        .attr("transform", "translate(" + width + ",0)")
                        .call(botYAxis.orient("right").tickSize(6));

                    botSvg.append("g")
                        .attr("class", "axis grid")
                        .attr("transform", "translate(" + width + ",0)")
                        .call(botYAxis.orient("left").tickSize(0));

                    var bands = botSvg.selectAll(".bands")
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

                    var stick = botSvg.selectAll(".sticks")
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
                            return botY(d.h);
                        })
                        .attr("class", function(d, i) {
                            return "stick stick" + i;
                        })
                        .attr("height", function(d) {
                            return botY(d.l) - botY(d.h);
                        })
                        .attr("width", 1)
                        .classed("rise", function(d) {
                            return (d.c > d.o);
                        })
                        .classed("fall", function(d) {
                            return (d.o > d.c);
                        });

                    var candle = botSvg.selectAll(".candles")
                        .data([genData])
                        .enter().append("g")
                        .attr("class", "candles");

                    candle.selectAll("rect")
                        .data(function(d) {
                            return d;
                        })
                        .enter().append("rect")
                        .attr("x", function(d) {
                            return x(d.Date) - candlewidth / 2;
                        })
                        .attr("y", function(d) {
                            return botY(d3.max([d.o, d.c]));
                        })
                        .attr("class", function(d, i) {
                            return "candle candle" + i;
                        })
                        .attr("height", function(d) {
                            return botY(d3.min([d.o, d.c])) - botY(d3.max([d.o, d.c]));
                        })
                        .attr("width", candlewidth)
                        .classed("rise", function(d) {
                            return (d.c > d.o);
                        })
                        .classed("fall", function(d) {
                            return (d.o > d.c);
                        });

                    var indicator_g = botSvg.append('g').attr('class', 'indicator_g').attr('transform', "translate(" + (width) + "," + (botY(genData[genData.length - 1].c) - 7) + ")");

                    indicator_g.append('svg').attr('viewBox', "0 0 65 15").attr("enable-background", "new 0 0 65 15").attr('xml:space', "preserve");
                    indicator_g.append('path').attr("d", "M65.1,0H11C8.2,0,6.8,0.7,4.5,2.7L0,7.2l4.3,4.6c0,0,3,3.2,6.5,3.2H65L65.1,0L65.1,0z").attr('class', 'ohlc_indicator');
                    indicator_g.append('text').attr('x', 12).attr('y', 0).attr('dy', '1em').text(genData[genData.length - 1].c.toFixed(0));

                    var bot_focus_g = botSvg.append('g').attr('class', 'bot_focus_g').attr('transform', "translate(" + (width) + "," + (botY(genData[genData.length - 1].c) - 7) + ")").style('display', 'none');

                    bot_focus_g.append('svg').attr('viewBox', "0 0 65 15").attr("enable-background", "new 0 0 65 15").attr('xml:space', "preserve");
                    bot_focus_g.append('path').attr("d", "M65.1,0H11C8.2,0,6.8,0.7,4.5,2.7L0,7.2l4.3,4.6c0,0,3,3.2,6.5,3.2H65L65.1,0L65.1,0z").attr('class', 'focus_indicator');
                    bot_focus_g.append('text').attr('x', 12).attr('y', 0).attr('dy', '1em').text("0");

                    var bot_x_move_wrapper = botSvg.append('g').attr('class', 'x_wrapper').style('display', 'none');

                    var bot_x_move_rect = bot_x_move_wrapper.append("rect").attr("class", 'x_move_rect')
                        .attr("x", 0)
                        .attr("y", 0)
                        .attr('rx', 0)
                        .attr("width", width / tmp_divider)
                        .attr("height", botHeight);

                    var bot_x_line = botSvg.append('line').attr('class', 'x_grid_line').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', botHeight).style('display', 'none');
                    var bot_y_line = botSvg.append('line').attr('class', 'y_grid_line').attr('x1', 0).attr('y1', 0).attr('x2', width).attr('y2', 0).style('display', 'none');
                    var rect = d3.select(".bot_g").append("svg:rect")
                        .attr("class", "pane")
                        .attr("width", width)
                        .attr("height", botHeight)
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                        .on('mousedown', function() {
                            d3.select(this).style('cursor', '-webkit-grabbing');
                            focus_g.style("display", "none");
                            x_move_wrapper.style("display", "none");
                            x_line.style('display', "none");
                            y_line.style('display', "none")
                        })
                        .on('mouseup', function() {
                            d3.select(this).style('cursor', 'crosshair');
                            focus_g.style("display", null);
                            x_move_wrapper.style("display", null);
                            x_line.style('display', null);
                            y_line.style('display', null)
                        })
                        .on("mouseover", function() {
                            bot_focus_g.style("display", null);
                            bot_x_move_wrapper.style("display", null);
                            focus_g.style("display", null);
                            x_move_wrapper.style("display", null);
                            bot_x_line.style('display', null);
                            bot_y_line.style('display', null)
                            x_line.style('display', null);
                            y_line.style('display', null)
                        })
                        .on("mouseout", function() {
                            bot_focus_g.style("display", "none");
                            bot_x_move_wrapper.style("display", "none");
                            focus_g.style("display", "none");
                            x_move_wrapper.style("display", "none");
                            bot_x_line.style('display', 'none');
                            bot_y_line.style('display', 'none')
                            x_line.style('display', 'none');
                            y_line.style('display', 'none')
                        })
                        .on("mousemove", mousemove)
                        .call(zoom).on("wheel.zoom", null);

                    drawEmaChart(botSvg, cema12, 'c12');
                    drawEmaChart(botSvg, cema26, 'c26');
                });
            } // csrender


        csrender.Bheight = function(value) {
            if (!arguments.length) return Bheight;
            Bheight = value;
            return csrender;
        };

        return csrender;
    } // cschart