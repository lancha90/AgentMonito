var allData;
var lang;

$(document).on('ready',function() {
	var jqxhr = $.getJSON( "/js/language.json", function(data) {
		allData = data;
		lang = getCookie('lang');
		connects();
	});
});

function connects(){
	$('header nav ul li').removeClass('select');
    $('header nav ul li#menu_server').addClass('select');
	$.ajax({
		url : url_base+'api/v1/connects/all',
		type : 'GET',
		dataType : "json",
		timeout : 10000,
		crossDomain : true,
		success : function(_data){
			var data       = _data;
			var toGraphicA = [];
			var toGraphicI = [];
			
			var ejex  = [];
			var ejeyA = [];
			var ejeyI = [];

			if (data.length > 0) {
				for(var l in data) {
					if (data[l].connects.control != null) {
						var value = parseFloat(data[l].connects.control);
					}
				}
				var maxcontrol = value-(value*0.1);
				
				for(var k in data) {
					ejex.unshift(data[k].date.split('T')[1]);
					
					if (data[k].connects.status == 'INACTIVE') {
						if(parseFloat(data[k].connects.quantity) > maxcontrol) {
							ejeyI.unshift({ y: parseFloat(data[k].connects.quantity), color: '#BF0B23'}   );
						} else {
							ejeyI.unshift(parseFloat(data[k].connects.quantity));
						}
					} else if (data[k].connects.status == 'ACTIVE') {
						if(parseFloat(data[k].connects.quantity) > maxcontrol) {
							ejeyA.unshift({ y: parseFloat(data[k].connects.quantity), color: '#BF0B23'}   );
						} else {
							ejeyA.unshift(parseFloat(data[k].connects.quantity));
						}
					}
				}
				var dates  = (_data[k].date.split("T"))[0];
			}
			
			toGraphicA.name = allData[lang].active;
			toGraphicA.data = ejeyA;
			toGraphicI.name = allData[lang].inactive;
			toGraphicI.data = ejeyI;
			
			$(function () {
				$('#container').highcharts({
					chart: {
						zoomType: 'x',
						spacingRight: 20
					},
					title: {
						text: allData[lang].connectionToDB,
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
							text: allData[lang].noConnection
						},
						min: 0,
						tickInterval: 2,
						plotBands: {
							color: '#eed3d7', // Color value
							from: maxcontrol, // Start of the plot band
							to: value*2 // End of the plot band
						},
						plotLines: [{
							value: 0,
							width: 1,
							color: '#808080'
						}]
					},
					tooltip: {
						formatter: function() {
							return allData[lang].connectionTo + ': <b>' + this.x + '</b> ' + allData[lang].was + ' <b>' + this.y + '</b>';
						}
					},
					legend: {
						layout: 'vertical',
						align: 'right',
						verticalAlign: 'middle',
						borderWidth: 0
					},
					series: [toGraphicA,toGraphicI]
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
