function barchart() {

    var margin = {
            top: 300,
            right: 50,
            bottom: 10,
            left: 5
        },
        width = 920,
        height = 60,
        mname = "mbar1";

    var MValue = "Volume";

    function barrender(selection) {        
        selection.each(function(data) {

            var x = d3.time.scale()
                .domain([startDomain, endDomain])
                .range([width / data.length / 2, width - width / data.length / 2]);
                

            var zoom = d3.behavior.zoom()
                .x(x)
                .xExtent(d3.extent(genData, function(d) {
                    return d.Date
                }));

            var y = d3.scale.linear()
                .rangeRound([height, 0]);

            var xAxis = d3.svg.axis()
                .scale(x)
                .tickFormat("");

            var yAxis = d3.svg.axis()
                .scale(y)
                .ticks(Math.floor(height / 50));

            var svg = d3.select(this).select("svg")
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            
            var new1_genData = data.filter(function(d){                                        
                    if(d.Date > startDomain && d.Date <endDomain){
                        return d;
                    }
                });
                        
            y.domain([0, d3.max(new1_genData, function(d) {
                return d["Volume"];
            })]).nice();

            svg.append("g")
                .attr("class", "axis yaxis")
                .attr("transform", "translate(" + width + ",0)")
                .call(yAxis.orient("right").tickFormat("").tickSize(0));

            // var barwidth = width / genData.length;
            var tmp_divider = TCount[period][interval];
            var barwidth = width / tmp_divider;

            var fillwidth = (Math.floor(barwidth * 0.9) / 2) * 2 + 1;        
            var bardelta = Math.round((barwidth - fillwidth) / 2);            

            var mbar = svg.selectAll("." + mname + "bar")
                .data([data])
                .enter().append("g")
                .attr("class", mname + "bar");

            mbar.selectAll("rect")
                .data(function(d) {
                    return d;
                })
                .enter().append("rect")
                .attr("class", mname + "fill")
                .attr("x", function(d) {
                    return x(d.Date) -fillwidth/2;
                })
                .attr("y", function(d) {
                    return y(d[MValue]);
                })
                .attr("class", function(d, i) {
                    return mname + i + " volume";
                })
                .attr("height", function(d) {
                    return y(0) - y(d[MValue]);
                })
                .attr("width", fillwidth);
        });
    } // barrender
    barrender.mname = function(value) {
        if (!arguments.length) return mname;
        mname = value;
        return barrender;
    };

    barrender.margin = function(value) {
        if (!arguments.length) return margin.top;
        margin.top = value;
        return barrender;
    };

    barrender.MValue = function(value) {
        if (!arguments.length) return MValue;
        MValue = value;
        return barrender;
    };

    return barrender;
} // barchart