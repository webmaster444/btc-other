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
        timestampduration = 1000 * 60 * 60 * 24 * 30;
    }else if (period =='2w'){
        timestampduration = 1000 * 60 * 60 * 24 * 14;
    }else if (period =='3m'){
        timestampduration = 1000 * 60 * 60 * 24 * 30 * 3;
    }else if(period == '6m'){
        timestampduration = 1000 * 60 * 60 * 24 * 30 * 6;
    }else if(period =='1y'){
        timestampduration = 1000 * 60 * 60 * 24 * 365;
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
    var url = 'https://decryptz.com/api/v1/charts/d3-tmp?symbol=btc&key=JnW39hF43pkbqBo';
    // var url = 'data.json';
    d3.json(url, function(error, data) {    
        console.log(data);
        data.forEach(function(d) {
            // d.Date = Date.parse(d.dt);
            var tmp;
            tmp = Date.parse(d.dt);
            var t = new Date(tmp);

            d.Date = Date.UTC(t.getFullYear(),t.getMonth(),t.getDate());
            // d.Date = Date.parse(d.dt);
            // console.log(d.Date,d.Date1);
            d.DateDisp = d3.time.format('%b');
        })                
        endDomain = data[data.length-1].Date;
        
        changeDomain(period);
        genRaw = data;
        vema12 = calcema(12, genRaw, 'v');
        vema26 = calcema(26, genRaw, 'v');

        cema12 = calcema(12, genRaw, 'c');
        cema26 = calcema(26, genRaw, 'c');

        psema12 = calcema(12, genRaw, 'ps');
        psema26 = calcema(26, genRaw, 'ps');

        pvema12 = calcema(12, genRaw, 'pv');
        pvema26 = calcema(26, genRaw, 'pv');

        nvema12 = calcema(12, genRaw, 'nv');
        nvema26 = calcema(26, genRaw, 'nv');

        mainjs();

        $('#botchart_title').css('top',($('#chart1').height()/2+5));
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
    var chart1 = topChart().Bheight(250).MValue(activeDrop);
    d3.select("#chart1").call(chart1);
    updateChartByOptions();    
}
function updateChartByOptions(){
    switch(activeDrop){
        case "v":
            d3.select('.sv_line').classed('hide',false);             
            break;
        case 'ps':    
            d3.select('.ps_line').classed('hide',false);
            d3.select('.top_bar_wrapper').classed('hide',false);
            break;
        case 'pv':
            d3.select('.pv_area').classed('hide',false);
            d3.select('.top_bar_wrapper').classed('hide',false);
            break;
        case 'nv':
            d3.select('.nv_area').classed('hide',false);
            d3.select('.top_bar_wrapper').classed('hide',false);
            break;
    }
    updateEma12();
    updateEma26();
    if($('.study.ip').hasClass('active')){
        d3.select('.line_wrapper.ip_line').classed('hide',false);    
    }else{
        d3.select('.line_wrapper.ip_line').classed('hide',true);    
    } 
}
function calcema(period, data,stat) {
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
        var tmp_ema = (data[i][stat] - emares[i - 1]['ema']) * multiplier + emares[i - 1]['ema'];
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
    switch(option){
        case "sv":
            // d3.selectAll('.line_wrapper').classed('hide',true);
            // d3.selectAll('.area_wrapper').classed('hide',true);
            // d3.selectAll('.top_bar_wrapper').classed('hide',true);

            // d3.selectAll('.sv_line').classed('hide',false);            
            activeDrop = 'v';            
            updateEma12();
            updateEma26();            
            // if($('.study.ip').hasClass('active')){
            //     d3.select('.line_wrapper.ip_line').classed('hide',false);    
            // }else{
            //     d3.select('.line_wrapper.ip_line').classed('hide',true);    
            // } 

            // updateYAxisAndIndicator(activeDrop);
            displayCS();
        break;
        case "ps":
            // d3.selectAll('.line_wrapper').classed('hide',true);
            // d3.selectAll('.area_wrapper').classed('hide',true);
            // d3.selectAll('.top_bar_wrapper').classed('hide',true);

            // d3.selectAll('.ps_line').classed('hide',false);
            // d3.selectAll('.top_bar_wrapper').classed('hide',false);
            activeDrop = 'ps';

            updateEma12();
            updateEma26();
            // if($('.study.ip').hasClass('active')){
            //     d3.select('.line_wrapper.ip_line').classed('hide',false);    
            // }else{
            //     d3.select('.line_wrapper.ip_line').classed('hide',true);    
            // } 

            // updateYAxisAndIndicator(activeDrop);
            displayCS();
            break;
        case "pv":
            // d3.selectAll('.line_wrapper').classed('hide',true);
            // d3.selectAll('.area_wrapper').classed('hide',true);
            // d3.selectAll('.top_bar_wrapper').classed('hide',true);
            
            // d3.selectAll('.pv_area').classed('hide',false);
            // d3.selectAll('.top_bar_wrapper').classed('hide',false);
            activeDrop = 'pv';

            updateEma12();
            updateEma26();
            // if($('.study.ip').hasClass('active')){
            //     d3.select('.line_wrapper.ip_line').classed('hide',false);    
            // }else{
            //     d3.select('.line_wrapper.ip_line').classed('hide',true);    
            // } 

            // updateYAxisAndIndicator(activeDrop);
            displayCS();
        break;
        case "nv":
            // d3.selectAll('.line_wrapper').classed('hide',true);
            // d3.selectAll('.area_wrapper').classed('hide',true);
            // d3.selectAll('.top_bar_wrapper').classed('hide',true);

            // d3.selectAll('.nv_area').classed('hide',false);
            // d3.selectAll('.top_bar_wrapper').classed('hide',false);
            activeDrop = 'nv';

            updateEma12();
            updateEma26();
            // if($('.study.ip').hasClass('active')){
            //     d3.select('.line_wrapper.ip_line').classed('hide',false);    
            // }else{
            //     d3.select('.line_wrapper.ip_line').classed('hide',true);    
            // } 
            // updateYAxisAndIndicator(activeDrop);
            displayCS();
        break;
        case "ema12":
            updateEma12();
        break;
        case "ema26":
            updateEma26();
        break;
        case "ip":
            if($('.study.ip').hasClass('active')){
                d3.select('.line_wrapper.ip_line').classed('hide',false);    
            }else{
                d3.select('.line_wrapper.ip_line').classed('hide',true);    
            } 
        break;        
        case "1w":
            period = '1w';
            changeDomain(period);
            displayCS(); 
            break;
        case "2w":
            period = '2w';
            changeDomain(period);
            displayCS(); 
            break;
        case "1m":
            period = '1m';
            changeDomain(period);
            displayCS(); 
            break;
        case "3m":
            period = '3m';
            changeDomain(period);
            displayCS(); 
            break;
        case "6m":
            period = '6m';
            changeDomain(period);
            displayCS(); 
            break;
        case "1y":
            period = '1y';
            changeDomain(period);
            displayCS(); 
            break;            
    }
};

function updateEma12(){
    d3.selectAll('.ema_12_g').classed('hide',true);
    if($('.study.ema12').hasClass('active')){
        switch(activeDrop){
            case "v":
            d3.selectAll('.v12_g_wrapper').classed('hide',false);
            break;
            case "ps":
            d3.selectAll('.ps12_g_wrapper').classed('hide',false);
            break;
            case "pv":
            d3.selectAll('.pv12_g_wrapper').classed('hide',false);
            break;
            case "nv":
            d3.selectAll('.nv12_g_wrapper').classed('hide',false);
            break;
        }
        d3.select('.c12_g_wrapper').classed('hide',false);
    }else{
        switch(activeDrop){
            case "v":
            d3.selectAll('.v12_g_wrapper').classed('hide',true);
            break;
            case "ps":
            d3.selectAll('.ps12_g_wrapper').classed('hide',true);
            break;
            case "pv":
            d3.selectAll('.pv12_g_wrapper').classed('hide',true);
            break;
            case "nv":
            d3.selectAll('.nv12_g_wrapper').classed('hide',true);
            break;
        }
        d3.select('.c12_g_wrapper').classed('hide',true);
    }
}

function updateEma26(){
    d3.selectAll('.ema_26_g').classed('hide',true);
    if($('.study.ema26').hasClass('active')){
        switch(activeDrop){
            case "v":
            d3.selectAll('.v26_g_wrapper').classed('hide',false);
            break;
            case "ps":
            d3.selectAll('.ps26_g_wrapper').classed('hide',false);
            break;
            case "pv":
            d3.selectAll('.pv26_g_wrapper').classed('hide',false);
            break;
            case "nv":
            d3.selectAll('.nv26_g_wrapper').classed('hide',false);
            break;
        }
        d3.select('.c26_g_wrapper').classed('hide',false);
    }else{
        switch(activeDrop){
            case "v":
            d3.selectAll('.v26_g_wrapper').classed('hide',true);
            break;
            case "ps":
            d3.selectAll('.ps26_g_wrapper').classed('hide',true);
            break;
            case "pv":
            d3.selectAll('.pv26_g_wrapper').classed('hide',true);
            break;
            case "nv":
            d3.selectAll('.nv26_g_wrapper').classed('hide',true);
            break;
        }
        d3.select('.c26_g_wrapper').classed('hide',true);
    }  
}

function updateYAxisAndIndicator(activeDrop){

}
function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}