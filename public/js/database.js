var allData;
var lang;

$(document).on('ready',function() {
	var jqxhr = $.getJSON( "/js/language.json", function(data) {
		allData = data;
		lang = getCookie('lang');
		database();;
	});
});

function database(){
	$('header nav ul li').removeClass('select');
    $('header nav ul li#menu_server').addClass('select');
	$.ajax({
		url : url_base+'api/v1/database/all',
		type : 'GET',
		dataType : "json",
		timeout : 10000,
		crossDomain : true,
		success : function(_data){
			var series1   = [];
			var series2   = [];
			var categoria = [];

			var data_sizeMB = [];
			var data_useMB  = [];
			var data_freeMB = [];
			var data_use    = [];
			var data_free   = [];

			for(var k in _data){
				data_sizeMB.push(parseFloat(_data[k].information.sizeMB));
				data_useMB.push(parseFloat(_data[k].information.sizeMB - _data[k].information.freeMB));
				data_freeMB.push(parseFloat(_data[k].information.freeMB));
				data_use.push(parseFloat(_data[k].information.used));
				data_free.push(parseFloat(_data[k].information.free));

				var dates  = (_data[k].information.date.split("T"))[0];

				categoria.push(_data[k]._id);
			}

			series1.push({name: allData[lang].freeMB, data: data_freeMB, color: 'green'});
			series1.push({name: allData[lang].useMB,  data: data_useMB,  color: 'red'});
			series1.push({name: allData[lang].sizeMB,  data: data_sizeMB, color: 'blue'});

			series2.push({name: allData[lang].use,     data: data_use,    color: 'red'});
			series2.push({name: allData[lang].free,    data: data_free,   color: 'blue'});

			$('.wrapper').append('<div id="container1" style="min-width: 310px; height:400px;"></div>');
			$('.wrapper').append('<div id="container2" style="min-width: 310px; height:400px;"></div>');

			$(function () {
				$('#container1').highcharts({
					chart: {
						type: 'bar'
					},
					title: {
						text: allData[lang].TablespaceMB
					},
					subtitle: {
						text: allData[lang].date + ': ' + dates
					},
					xAxis: {
						categories: categoria,
						title: {
							text: null
						}
					},
					yAxis: {
						min: 0,
						title: {
							text: allData[lang].size,
							align: allData[lang].high
						},
						labels: {
							overflow: 'justify'
						}
					},
					tooltip: {
						valueSuffix: ' MB'
					},
					plotOptions: {
						bar: {
							dataLabels: {
								enabled: false
							}
						}
					},
					legend: {
						layout: 'vertical',
						align: 'right',
						verticalAlign: 'top',
						x: -40,
						y: 100,
						floating: true,
						borderWidth: 1,
						backgroundColor: '#FFFFFF',
						shadow: true
					},
					credits: {
						enabled: true
					},
					series: series1
				});

				$('#container2').highcharts({
					chart: {
						type: 'bar'
					},
					title: {
						text: 'Tablespace en %'
					},
					subtitle: {
						text: 'Date: ' + dates
					},
					xAxis: {
						categories: categoria,
						title: {
							text: null
						}
					},
					yAxis: {
						min: 0,
						title: {
							text: allData[lang].percentage + ' (%)',
							align: 'high'
						},
						labels: {
							overflow: 'justify'
						}
					},
					tooltip: {
						valueSuffix: ' %'
					},
					plotOptions: {
						bar: {
							dataLabels: {
								enabled: false
							}
						}
					},
					legend: {
						layout: 'vertical',
						align: 'right',
						verticalAlign: 'top',
						x: -40,
						y: 100,
						floating: true,
						borderWidth: 1,
						backgroundColor: '#FFFFFF',
						shadow: true
					},
					credits: {
						enabled: true
					},
					series: series2
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