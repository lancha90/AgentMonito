var allData;
var lang;

$(document).on('ready',function() {
	lang = getCookie('lang');
	var jqxhr = $.getJSON( "/js/language.json", function(data) {
		allData = data;
		monitor();
	});
});

function monitor(){
	$('header nav ul li').removeClass('select');
    $('header nav ul li#menu_server').addClass('select');
	$.ajax({
		url : url_base+'api/v1/monitor/all',
		type : 'GET',
		dataType : "json",
		timeout : 10000,
		crossDomain : true,
		success : function(_data){
			var data      = _data;
			var toGraphic = [];
			
			var ejex  = [];
			var ejey = [];

			if (data.length > 0) {
				for(var k in data) {
					ejex.unshift(data[k].date.split('T')[1]);
					
					if(data[k].monitor.response = 'X') {
						if(parseFloat(data[k].monitor.time) > 2) {
							ejey.unshift({ y: parseFloat(data[k].monitor.time), color: '#BF0B23'}   );
						} else {
							ejey.unshift(parseFloat(data[k].monitor.time));
						}
					} else {
						ejey.unshift({ y: -5, color: '#BF0B23'}   );
					}
				}
				var dates  = (_data[k].date.split("T"))[0];
			}
			
			toGraphic.name =  allData[lang].response;
			toGraphic.data = ejey;
			
			$(function () {
				$('#container').highcharts({
					chart: {
						zoomType: 'x',
						spacingRight: 20
					},
					title: {
						text: allData[lang].monitoringDB,
						x: -20 //center
					},
					subtitle: {
						text: dates,
						x: -20
					},
					xAxis: {
						categories: ejex
					},
					yAxis: {
						title: {
							text: allData[lang].request + ' - ' + allData[lang].milliseconds + ' (ms))'
						},
						labels: {
							formatter: function() {
								return this.value + ' ms';
							}
						},
						min: -5,
						tickInterval: 2,
						plotBands: {
							color: '#eed3d7', // Color value
							from: 2, // Start of the plot band
							to: 100 // End of the plot band
						},
						plotLines: [{
							value: 0,
							width: 1,
							color: '#808080'
						}]
					},
					tooltip: {
						formatter: function() {
							return  allData[lang].requestAt + ': <b>' + this.x + '</b> ' + allData[lang].was + ' <b>' + this.y + '</b>';
						}
					},
					legend: {
						layout: 'vertical',
						align: 'right',
						verticalAlign: 'middle',
						borderWidth: 0
					},
					series: [toGraphic]
				});
			});
		}
	});
}

function getCookie (c_name) {
	c_start = document.cookie.indexOf(c_name + "=");
	if (c_start != -1) {
		c_start = c_start + c_name.length + 1;
		c_end = document.cookie.indexOf(";", c_start);
		if (c_end == -1) {
			c_end = document.cookie.length;
		}
		return unescape(document.cookie.substring(c_start, c_end));
	}
}