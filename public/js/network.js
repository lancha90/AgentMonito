var chart_network;
var allData;
var lang;

var network_io = function(){


    window.client = io.connect(url_socket);
    
    client.on('network_io', function(data){
        var series = chart_network.series;

        for(i in series){
            if(series[i].name == data.ip){
                chart_network.series[i].xAxis.categories.push(data.date.split('T')[1])
                chart_network.series[i].addPoint({y: data.time});
            }
        }


    });

}

var network_graphic = function(){
    var data;
    var ejex=[];
    var ejey=[];
    var ttl=[];

    $('header nav ul li').removeClass('select');
    $('header nav ul li#menu_server').addClass('select');

    $.ajax({
        url : url_base+'api/v1/network/all',
        type : 'GET',
        dataType : "json",
        timeout : 10000,
        crossDomain : true,
        success : function(_data){
            data=_data;
            toGraphic = [];
            ejex=[];

            for(var i in data) {
                var toInsert = [];
                for(var k in data[i].information) {

                    item = parseFloat(data[i].information[k].time);
                    toInsert.push(item);
                    
                    if(i==0){
                        ejex.push(data[i].information[k].date.split('T')[1]);
                    }
                }
                toGraphic.push({name: data[i]._id.ip, data: toInsert});
            }

            $(function () {

                chart_network = new Highcharts.Chart({

                    chart: {
                        renderTo: 'container',
                        zoomType: 'x',
                        spacingRight: 20
                    },
                    title: {
                        text: 'Estado de la red',
                        x: -20 //center
                    },
        
                    subtitle: {
                        text: 'toGraphic.name',
                        x: -20
                        },
                        xAxis: {
                        categories: ejex
                        },
                        yAxis: {
                        title: {
                                text: 'Ping - Milisegundos (ms))'
                            },
                            labels: {
                                formatter: function() {
                                    return this.value + ' ms';
                                }
                            },
                            min: -5,
                            plotBands: {
                                color: '#eed3d7', // Color value
                                from: -100, // Start of the plot band
                                to: 0 // End of the plot band
                            },
                            plotLines: [{
                                value: 0,
                                width: 1,
                                color: '#808080'
                            }]
                        },
                        tooltip: {
                             formatter: function() {
                                return 'El ping a las: <b>' + this.x + '</b> fue <b>' + this.y + '</b>';
                                }
                        },
                        legend: {
                            layout: 'vertical',
                            align: 'right',
                            verticalAlign: 'middle',
                            borderWidth: 0
                        },
                        series: toGraphic


                 });


                });
            }
        });
}

$(document).on('ready',function () {
	network_graphic();
	lang = getCookie('lang');
	var jqxhr = $.getJSON( "/js/language.json", function(data) {
		allData = data;
	});
    network_io();
});

function getCookie (c_name) {
	c_start = document.cookie.indexOf(c_name + "=");
	if (c_start != -1) {
		c_start = c_start + c_name.length + 1;
		c_end = document.cookie.indexOf(";", c_start);
		if(c_end == -1) {
		 c_end = document.cookie.length;
		}
		return unescape(document.cookie.substring(c_start, c_end));
	}
}