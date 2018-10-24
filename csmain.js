var genRaw, genData;
var ema12, ema26 = [];
var startDate = "2018-09-26T00:00:00";
var endDate = "2017-09-27T00:00:00";
var period = "1w";
var endDomain = Date.parse(endDate);
var startDomain = Date.parse(startDate);
var timestampduration = 0;
var interval='day';
var topY;
var TCount = {
    "1w": {"day":8,"hour":24 * 7},
    "1m": {"day":31,"hour": 24 * 30},
    "2w": {"day":14,"hour":24 * 14},
    "1d": {"minute":24 * 60,"hour":25},
    "3h": {"minute":180},
    "3m":{"day":90},
    "6h": {"minute":360},
    "1h": {"minute":60},
    "6m": {"day":180},
    "1y": {"day":365}
}
var activeDrop = 'v';
changeDomain(period);
function changeDomain(period){
    if (period == "1w") {
        timestampduration = 1000 * 60 * 60 * 24 * 7;    
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
    // var url = "https://decryptz.com/api/v1/charts/d3-tmp?key=JnW39hF43pkbqBo&symbol=btc&interval="+interval+"&startDate="+startDate+"&endDate="+endDate;
    // var url = 'https://decryptz.com/api/v1/charts/d3-tmp?symbol=btc&key=JnW39hF43pkbqBo';
    var url = 'data_backup.json';
    d3.json(url, function(error, data) {        
        data.forEach(function(d) {
            // d.Date = Date.parse(d.dt);
            var tmp;
            tmp = Date.parse(d.dt);
            var t = new Date(tmp);

            d.Date = Date.UTC(t.getFullYear(),t.getMonth(),t.getDate());
            d.DateDisp = d3.time.format('%b');
        })                
        endDomain = data[data.length-1].Date;
        // endDomain = data[data.length-1].Date;
        // endDomain = Date.parse(endDate);
        changeDomain(period);
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
    displayCS();    
}

function displayCS() {
    var chart1 = topChart().Bheight(250).MValue('v');
    d3.select("#chart1").call(chart1);
    d3.select('.sv_line').classed('hide',false);
    // var chart2 = bottomChart().Bheight(250);
    // d3.select("#chart2").call(chart2);    
}

function calcema(period, data) {
    var index = 0;
    var isum = d3.sum(data, function(d) {
        ++index;
        if (index <= period) {
            return d.c
        }
    });
    var isma = isum / period;
    var multiplier = (2 / (period + 1));
    var emares = [];

    var tmp = new Object;
    tmp['dt'] = data[0]['dt'];
    tmp['ema'] = isma;
    tmp['Date'] = Date.parse(data[0]['dt']);

    emares.push(tmp);

    for (var i = 1; i < data.length; i++) {
        var tmp_arr = new Object;
        tmp_arr['dt'] = data[i]['dt'];
        tmp_arr['Date'] = Date.parse(tmp_arr['dt']);
        var tmp_ema = (data[i]['c'] - emares[i - 1]['ema']) * multiplier + emares[i - 1]['ema'];
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
// $('input[type=radio][name=view]').change(function() {    
//     $('#period').html('');
//     $('#radioes2 label').removeClass('active');
//     if ($(this).val() == '1m') {
//         $('#period').append('<option value="1h">1h</option>');
//         $('#period').append('<option value="3h" selected>3h</option>');
//         $('#period').append('<option value="6h">6h</option>');
//         $('#period').append('<option value="1d">1d</option>');
//         $('.implied_price').css('display', 'none');        
//         interval = "minute";
//         period   = "3h";        
//     } else if ($(this).val() == "1h") {
//         $('#period').append('<option value="1d">1d</option>');
//         $('#period').append('<option value="1w" selected>1w</option>');
//         $('#period').append('<option value="2w">2w</option>');
//         $('#period').append('<option value="1m">1m</option>');
//         $('.implied_price').css('display', 'none');
//         interval = "hour";
//         period = "1w";
//     } else if ($(this).val() == "1d") {
//         $('#period').append('<option value="1w">1w</option>');
//         $('#period').append('<option value="1m" selected>1m</option>');
//         $('#period').append('<option value="6m">6m</option>');
//         $('#period').append('<option value="1y">1y</option>');
//         $('.implied_price').css('display', 'inline-block');
//         interval = "day";
//         period = "1m";
//     }
//     $('#checkboxes2 input[type="checkbox"]').prop('checked', false);
//     changeDomain(period);
//     $(this).parent().addClass('active');
//     if (interval == 'minute') {
//         startDate = "2018-06-15T00:00:00";
//     } else if (interval == 'hour') {
//         startDate = "2018-04-01T00:00:00";
//     } else if (interval == 'day') {
//         startDate = "2017-06-01T00:00:00";
//     }
//     // var url = "https://decryptz.com/api/v1/charts/d3-tmp?key=JnW39hF43pkbqBo&symbol=btc&interval=" + interval + "&startDate=" + startDate + "&endDate=" + endDate;
//     var url = 'https://decryptz.com/api/v1/charts/d3-tmp?symbol=btc&key=JnW39hF43pkbqBo';
//     d3.json(url, function(error, data) {
//         $('#chart1').empty();        
//         data.forEach(function(d) {
//             d.Date = Date.parse(d.Date);
//             d.Low = +d.Low;
//             d.High = +d.High;
//             d.Open = +d.Open;
//             d.Close = +d.Close;
//             d.Volume = +d.Volume;
//             d.PV = +d.PV;
//             d.PS = +d.PS;
//             d.NV = +d.NV;
//             d.TV = +d.TV;
//         })
//         genRaw = data;
//         ema12 = calcema(12, genRaw);
//         ema26 = calcema(26, genRaw);        
//         mainjs();
//     });
// });

document.getElementById('chart1').onwheel = function(){ return false; }

// trigger redraw when period selector is changed
$(document).on("change", "#period", function() {
    period = $(this).val();
    changeDomain(period);        
    $('#chart1').empty();        
    mainjs();    
    $('#checkboxes2 input[type="checkbox"]').prop('checked', false);
});

$('.option a').click(function(){    
    $(this).toggleClass('active');    
    if($(this).hasClass('active')){
        $('.option ul').addClass('hide');
        $(".option a").not($(this)).removeClass('active');
        $(this).next().removeClass('hide');
    }else{
        $(this).next().addClass('hide');    
    }    
})

$('.option ul li').click(function(){
    if(!$(this).hasClass('study')){
        $(this).siblings().removeClass('active');    
        $(this).addClass('active');
    }else{
        $(this).toggleClass('active');
    }
    $(this).parent().addClass('hide');    
    $(this).parent().siblings('a').removeClass('active');    

    updateDropDown($(this).attr('data-option'));
    updateTopChart($(this).attr('data-option'));
})

$('.duration.option ul li').click(function(){
    console.log($(this).attr('data-option'));
})

function updateDropDown(option){
    switch(option){
        case "sv":
        $("#linechart-stat .stats-txt").html('Social Volume');
        $('#topchart_title').html('Btc Social Volume');
        break;
        case "ps":
        $("#linechart-stat .stats-txt").html('% Positive Sentiment');
        $('#topchart_title').html('BTC % Positive Sentiment');
        break;
        case "pv":
        $("#linechart-stat .stats-txt").html('Positive Tweets');
        $('#topchart_title').html('Btc Positive Tweets');
        break;
        case "nv":
        $("#linechart-stat .stats-txt").html('Negative Tweets');
        $('#topchart_title').html('Btc Negative Tweets');
        break;
        case "1w":
        $("#duration-stat .stats-txt").html(option);        
        break;        
        case "2w":
        $("#duration-stat .stats-txt").html(option);
        break;        
        case "1m":
        $("#duration-stat .stats-txt").html(option);
        break;        
        case "3m":
        $("#duration-stat .stats-txt").html(option);
        break;        
        case "6m":
        $("#duration-stat .stats-txt").html(option);
        break;  
        case "1y":
        $("#duration-stat .stats-txt").html(option);
        break;
    }
}
function updateTopChart(option){
    d3.selectAll('.line_wrapper').classed('hide',true);
    d3.selectAll('.area_wrapper').classed('hide',true);
    d3.selectAll('.top_bar_wrapper').classed('hide',true);
    switch(option){
        case "sv":
            d3.selectAll('.sv_line').classed('hide',false);
            activeDrop = 'v';            
        break;
        case "ps":
            d3.selectAll('.ps_line').classed('hide',false);
            d3.selectAll('.top_bar_wrapper').classed('hide',false);
            activeDrop = 'ps';
            break;
        case "pv":
            d3.selectAll('.pv_area').classed('hide',false);
            d3.selectAll('.top_bar_wrapper').classed('hide',false);
            activeDrop = 'pv';
        break;
        case "nv":
            d3.selectAll('.nv_area').classed('hide',false);
            d3.selectAll('.top_bar_wrapper').classed('hide',false);
            activeDrop = 'nv';
        break;
        case "ema12":
            if($('.study.ema12').hasClass('active')){
                d3.select('.ema_chart.ema_chart_wrapper_ema12').style('display','block');    
            }else{
                d3.select('.ema_chart.ema_chart_wrapper_ema12').style('display','none');    
            }            
        break;
        case "ema26":
            if($('.study.ema26').hasClass('active')){
                d3.select('.ema_chart.ema_chart_wrapper_ema26').style('display','block');    
            }else{
                d3.select('.ema_chart.ema_chart_wrapper_ema26').style('display','none');    
            }   
        break;
        case "ip":
            if($('.study.ip').hasClass('active')){
                d3.select('.linechart_wrapper.ip').style('display','block');    
            }else{
                d3.select('.linechart_wrapper.ip').style('display','none');    
            } 
        break;        
    }
};

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}