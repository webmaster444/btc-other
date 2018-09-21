var genRaw, genData;
var ema12, ema26 = [];
var startDate = "2018-05-01T00:00:00";
var endDate = "2018-06-17T00:00:00";
var period = "1w";
var endDomain = Date.parse(endDate);
var startDomain = Date.parse(startDate);
var timestampduration = 0;
var interval='hour';

var TCount = {
    "1w": {"day":8,"hour":24 * 7},
    "1m": {"day":30,"hour": 24 * 30},
    "2w": {"day":14,"hour":24 * 14},
    "1d": {"minute":24 * 60,"hour":25},
    "3h": {"minute":180},
    "6h": {"minute":360},
    "1h": {"minute":60},
    "6m": {"day":180},
    "1y": {"day":365}
}
changeDomain(period);
function changeDomain(period){
    if (period == "1w") {
        timestampduration = 1000 * 60 * 60 * 24 * 8;    
    }else if(period =='1m'){
        timestampduration = 1000 * 60 * 60 * 24 * 31;
    }else if (period =='2w'){
        timestampduration = 1000 * 60 * 60 * 24 * 15;
    }else if (period =='3m'){
        timestampduration = 1000 * 60 * 60 * 24 * 31 * 3;
    }else if(period == '6m'){
        timestampduration = 1000 * 60 * 60 * 24 * 31 * 6;
    }else if(period =='1y'){
        timestampduration = 1000 * 60 * 60 * 24 * 366;
    }else if(period == "3h"){
        timestampduration = 1000 * 60 * 60 * 3;
    }else if(period =="1h"){
        timestampduration = 1000 * 60 * 60;
    }else if(period =="1d"){
        timestampduration = 1000 * 60 * 60 * 24;
    }else if(period =="6h"){
        timestampduration = 1000 * 60 * 60 * 6;
    }
    startDomain = endDomain - timestampduration;
    return startDomain;
}
(function() {
    var url = "https://decryptz.com/api/v1/charts/d3-tmp?key=JnW39hF43pkbqBo&symbol=btc&interval="+interval+"&startDate="+startDate+"&endDate="+endDate;
    d3.json(url, function(error, data) {        
        data.forEach(function(d) {
            d.Date = Date.parse(d.Date);
            d.Low = +d.Low;
            d.High = +d.High;
            d.Open = +d.Open;
            d.Close = +d.Close;
            d.Volume = +d.Volume;
            d.PV = +d.PV;
            d.PS = +d.PS;
            d.NV = +d.NV;
            d.TV = +d.TV;
        })
        genRaw = data;
        ema12 = calcema(12, genRaw);
        ema26 = calcema(26, genRaw);
        mainjs();
    });

    $('#linechart_select').change(function() {
      $('.linechart_wrapper').hide();
      var tmpClass = "."+$(this).val().toLowerCase() +".linechart_wrapper";
      $(tmpClass).show();
    });

}());


function mainjs() {
    genData = genRaw;
    displayAll();    
}

function displayAll() {    
    displayCS();
}

function displayCS() {
    var chart = cschart().Bheight(460);
    d3.select("#chart1").call(chart);

    var chart = barchart().mname("volume").margin(380).MValue("Volume");
    d3.select("#chart1").datum(genData).call(chart);

    var chart = linechart().mname("ps").margin(0).MValue("PS");
    d3.select("#chart1").datum(genData).call(chart);

    var chart = linechart().mname("pv").margin(0).MValue("PV");
    d3.select("#chart1").datum(genData).call(chart);

    var chart = linechart().mname("nv").margin(0).MValue("NV");
    d3.select("#chart1").datum(genData).call(chart);

    var chart = linechart().mname("tv").margin(0).MValue("TV");
    d3.select("#chart1").datum(genData).call(chart);

    var chart = emachart().mname("ema12").margin(0);
    d3.select("#chart1").datum(ema12).call(chart);

    var chart = emachart().mname("ema26").margin(0);
    d3.select("#chart1").datum(ema26).call(chart);

    if (genData[0].hasOwnProperty('IP')) {
        var chart = linechart().mname("ip").margin(0).MValue("IP");
        d3.select("#chart1").datum(genData).call(chart);
    }

    hoverAll();
}

function hoverAll() {
    d3.select('#chart1').selectAll('path').on('mouseover', function(d, i) {
        d3.select(this).style('stroke-width', '2px');
    }).on('mouseout', function(d, i) {
        d3.select(this).style('stroke-width', '1px');
    });
}

function calcema(period, data) {
    var index = 0;
    var isum = d3.sum(data, function(d) {
        ++index;
        if (index <= period) {
            return d.Close
        }
    });
    var isma = isum / period;
    var multiplier = (2 / (period + 1));
    var emares = [];

    var tmp = new Object;
    tmp['Date'] = data[0]['Date'];
    tmp['ema'] = isma;

    emares.push(tmp);

    for (var i = 1; i < data.length; i++) {
        var tmp_arr = new Object;
        tmp_arr['Date'] = data[i]['Date'];
        var tmp_ema = (data[i]['Close'] - emares[i - 1]['ema']) * multiplier + emares[i - 1]['ema'];
        tmp_arr['ema'] = tmp_ema;
        emares.push(tmp_arr);
    }

    return emares;
}

$('.custom-control-input').change(function() {
    if ($(this).val() != "implied_price") {
        var clicked = $(this).val();
        var tmpStr = '.ema_chart.ema_chart_wrapper_' + clicked;
        $(tmpStr).toggle();
    } else {
        $('.linechart_wrapper.ip').toggle();
    }
})

//Trigger redraw when view radio button is clicked
$('input[type=radio][name=view]').change(function() {    
    $('#period').html('');
    $('#radioes2 label').removeClass('active');
    if ($(this).val() == '1m') {
        $('#period').append('<option value="1h">1h</option>');
        $('#period').append('<option value="3h" selected>3h</option>');
        $('#period').append('<option value="6h">6h</option>');
        $('#period').append('<option value="1d">1d</option>');
        $('.implied_price').css('display', 'none');        
        interval = "minute";
        period   = "3h";        
    } else if ($(this).val() == "1h") {
        $('#period').append('<option value="1d">1d</option>');
        $('#period').append('<option value="1w" selected>1w</option>');
        $('#period').append('<option value="2w">2w</option>');
        $('#period').append('<option value="1m">1m</option>');
        $('.implied_price').css('display', 'none');
        interval = "hour";
        period = "1w";
    } else if ($(this).val() == "1d") {
        $('#period').append('<option value="1w">1w</option>');
        $('#period').append('<option value="1m" selected>1m</option>');
        $('#period').append('<option value="6m">6m</option>');
        $('#period').append('<option value="1y">1y</option>');
        $('.implied_price').css('display', 'inline-block');
        interval = "day";
        period = "1m";
    }
    $('#checkboxes2 input[type="checkbox"]').prop('checked', false);
    changeDomain(period);
    $(this).parent().addClass('active');
    if (interval == 'minute') {
        startDate = "2018-06-15T00:00:00";
    } else if (interval == 'hour') {
        startDate = "2018-04-01T00:00:00";
    } else if (interval == 'day') {
        startDate = "2017-06-01T00:00:00";
    }
    var url = "https://decryptz.com/api/v1/charts/d3-tmp?key=JnW39hF43pkbqBo&symbol=btc&interval=" + interval + "&startDate=" + startDate + "&endDate=" + endDate;

    d3.json(url, function(error, data) {
        $('#chart1').empty();        
        data.forEach(function(d) {
            d.Date = Date.parse(d.Date);
            d.Low = +d.Low;
            d.High = +d.High;
            d.Open = +d.Open;
            d.Close = +d.Close;
            d.Volume = +d.Volume;
            d.PV = +d.PV;
            d.PS = +d.PS;
            d.NV = +d.NV;
            d.TV = +d.TV;
        })
        genRaw = data;
        ema12 = calcema(12, genRaw);
        ema26 = calcema(26, genRaw);
        mainjs();
    });
});

document.getElementById('chart1').onwheel = function(){ return false; }

// trigger redraw when period selector is changed
$(document).on("change", "#period", function() {
    period = $(this).val();
    changeDomain(period);        
    $('#chart1').empty();        
    mainjs();    
    $('#checkboxes2 input[type="checkbox"]').prop('checked', false);
});