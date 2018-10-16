function barchart() {

    var margin = {
            top: 160,
            right: 50,
            bottom: 10,
            left: 5
        },
        width = 920,
        height = 60,
        mname = "mbar1";

    var MValue = "v";

    function barrender(selection) {        
        selection.each(function(data) {            
            var new1_genData = data.filter(function(d){                                        
                if(d.Date >= startDomain && d.Date <=endDomain){
                    return d;
                }
            });
            
            var x = d3.scale.ordinal().domain(new1_genData.map(function(d){return d.Date})).rangeBands([0,width]);                                        
            var y = d3.scale.linear()
                .rangeRound([height, 0]);

            var xAxis = d3.svg.axis()
                .scale(x);                

            var yAxis = d3.svg.axis()
                .scale(y)
                .ticks(Math.floor(height / 50));

            var svg = d3.select(this).select("svg")
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");            
                        
            y.domain([0, d3.max(data, function(d) {                
                return d["v"];
            })]).nice();

            svg.append("g")
                .attr("class", "axis yaxis")
                .attr("transform", "translate(" + width + ",0)")
                .call(yAxis.orient("right").tickFormat("").tickSize(0));
            
            var fillwidth = x.rangeBand();            

            var mbar = svg.selectAll("." + mname + "bar")
                .data([new1_genData])
                .enter().append("g")
                .attr("class", mname + "bar");

            mbar.selectAll("rect")
                .data(function(d) {
                    return d;
                })
                .enter().append("rect")
                .attr("class", mname + "fill")
                .attr("x", function(d) {
                    return x(d.Date);
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