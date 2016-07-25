var allData;
var lang;

var getUrlVars =   function () {
	var vars = {};
	var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
		vars[key] = value;
	});
	return vars;
}

$(document).on('ready',function() {
	lang = getCookie('lang');
	var jqxhr = $.getJSON( "/js/language.json", function(data) {
		allData = data;
		node();
	});
});

function node() {
	$('header nav ul li').removeClass('select');
	$('header nav ul li#menu_server').addClass('select');

	var data;
	var server = getUrlVars()["name"];
    //Llamado para saber cuantos servers hay almacenados en la BD, obtiene el nombre y la cantidad de registros por cada uno
    $.ajax({
        url : url_base+'api/v1/node/list?name='+server,
        type : 'GET',
        dataType : "json",
        timeout : 10000,
        crossDomain : true,

        success : function (_data) {
            data = _data;
            var serverName=server;
            
            $('.wrapper').append('<div id="container'+serverName+'" style="min-width: 310px; height: 400px; margin: 0 auto"></div>');

            toGraphicPool      = {};
            toGraphicStuck      = {};
            toGraphicActive     = {};
            toGraphicHog        = {};
            toGraphicThroughput = {};
			
            var ejex       = [];
			var pool       = [];
			var throughput = [];
			var active     = [];
			var stuck      = [];
			var hog        = [];
    		
            for(var i in data) {
        		var dataNode = data[i];
        		ejex.unshift(Highcharts.dateFormat('%H:%M:%S', new Date(Date.parse(dataNode.date))));
	            pool.unshift(parseFloat(dataNode.threadPoolSize));
	            throughput.unshift(parseFloat(dataNode.throughput));
	            active.unshift(parseFloat(dataNode.threadActive));
	            stuck.unshift(parseFloat(dataNode.threadStuck));
	            hog.unshift(parseFloat(dataNode.threadHogging));
            }
            
            toGraphicPool.name=allData[lang].threadPoolSize;
            toGraphicPool.data=pool;

            toGraphicStuck.name=allData[lang].threadsStuck;
            toGraphicStuck.data=stuck;

            toGraphicThroughput.name='Throughput';
            toGraphicThroughput.data=throughput;

            toGraphicActive.name=allData[lang].threadActive;
            toGraphicActive.data=active;

            toGraphicHog.name=allData[lang].threadHogging;
            toGraphicHog.data=hog;              
       
			//Se grafica la informacion del server con HighCharts
			$('#container'+serverName).highcharts({
				chart: {
					renderTo: 'container'+serverName,
					zoomType: 'x',
					spacingRight: 20,
					//renderTo: 'container'+serverName
				},
				title: {
					text: allData[lang].managedServer + serverName,
					x: -20 //center
				},
				subtitle: {
					text: 'Weblogic',
					x: -20
				},
				xAxis: {
					categories: ejex
				},
				yAxis: {
					title: {
						text: allData[lang].value
					},
					labels: {
						formatter: function() {
							return this.value;
						}
					},
					tickInterval: 1,
					plotBands: {
						color: '#eed3d7', // Color value
						from: 80, // Start of the plot band
						to: 1000 // End of the plot band
					},
					plotLines: [{
						value: 0,
						width: 1,
						color: '#808080'
					}]
				},
				tooltip: {
					formatter: function() {
						return allData[lang].the  +this.series.name+ allData[lang].at + ': <b>' +this.x+ '</b> ' + allData[lang].was + ' <b>' + this.y + '</b>';
					}
				},
				legend: {
					layout: 'vertical',
					align: 'right',
					verticalAlign: 'middle',
					borderWidth: 0
				},
				series: [toGraphicPool, toGraphicActive, toGraphicHog, toGraphicStuck, toGraphicThroughput]
			});
        }
    });
}

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