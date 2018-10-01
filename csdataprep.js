function genType(d) {
  d.TIMESTAMP  = parseDate(d.dt);
  d.l        = +d.l;
  d.h       = +d.h; 
  d.o       = +d.o;
  d.c      = +d.c;
  return d;
}

function timeCompare(date, interval) {
  if (interval == "week")       { var durfn = d3.time.monday(date); }
  else if (interval == "month") { var durfn = d3.time.month(date); }
  else { var durfn = d3.time.day(date); } 
  return durfn;
}

function dataCompress(data, interval) {
  var compressedData  = d3.nest()
                 .key(function(d) { return timeCompare(d.TIMESTAMP, interval); })
                 .rollup(function(v) { return {
                         TIMESTAMP:   timeCompare(d3.values(v).pop().TIMESTAMP, interval),
                         o:        d3.values(v).shift().o,
                         l:         d3.min(v, function(d) { return d.l;  }),
                         h:        d3.max(v, function(d) { return d.h; }),
                         c:       d3.values(v).pop().c,
                        }; })
                 .entries(data).map(function(d) { return d.values; });

  return compressedData;
}