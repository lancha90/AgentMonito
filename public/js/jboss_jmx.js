var allData;
var lang;
var config;

$(document).on('ready',function () {
	lang = getCookie('lang');
	
	var conj = $.getJSON("./conf/configuration.json", function (data) {
		config = data;
	});
	
	var jqxhr = $.getJSON("/js/language.json", function (data) {
		allData = data;
		jbossJmx($('.jmx_item:first').attr('jmx'));
	});

	$('.jmx_item').on('click',function(){
		jbossJmx($(this).attr('jmx'));
	});
});

function jbossJmx (name) {
	$('header nav ul li').removeClass('select');
    //$('header nav ul li#menu_jboss_jmx').addClass('select');
	
	$.ajax({
		url : url_base + 'api/v1/jboss_jmx/all?name='+name,
		type : 'GET',
		dataType : "json",
		timeout : 10000,
		crossDomain : true,
		success : function (_data) {
			var data        = _data;
			var toGraphicP  = [];
			var toGraphicD  = [];
			var toGraphicDP = [];
			
			var ejex   = [];
			var ejeyP  = [];
			var ejeyD  = [];
			var ejeyDP = [];
			
			if (data.length > 0) {
				for(var k in data) {
					if (true) {
						ejex.unshift(data[k].date.split('T')[1]);
						
						// PROCESS
						if (data[k].jmx.process != '-') {
							process = parseFloat(data[k].jmx.process);
						} else {
							process = 0;
						}
						
						if (process > 200 && process <= 500) {
							ejeyP.unshift({ y: process, color: '#FFFB16'});
						} else if (process > 500 && process <= 1000) {
							ejeyP.unshift({ y: process, color: '#FFAE17'});
						} else if (process > 1000) {
							ejeyP.unshift({ y: process, color: '#FF171B'});
						} else {
							ejeyP.unshift(process);
						}

						// DEPTH
						if (data[k].jmx.depth != '-') {
							depth = parseFloat(data[k].jmx.depth);
						} else {
							depth = 0;
						}
						
						if (depth > 200 && depth <= 500) {
							ejeyD.unshift({ y: depth, color: '#FFFB16'});
						} else if (depth > 500 && depth <= 1000) {
							ejeyD.unshift({ y: depth, color: '#FFAE17'});
						} else if (depth > 1000) {
							ejeyD.unshift({ y: depth, color: '#FF171B'});
						} else {
							ejeyD.unshift(depth);
						}

						// DEPTH PROCESS
						if (data[k].jmx.depthprocess != '-') {
							depthprocess = parseFloat(data[k].jmx.depthprocess);
						} else {
							depthprocess = 0;
						}
						
						if (depthprocess > 200 && depthprocess <= 500) {
							ejeyDP.unshift({ y: depthprocess, color: '#FFFB16'});
						} else if (depthprocess > 500 && depthprocess <= 1000) {
							ejeyDP.unshift({ y: depthprocess, color: '#FFAE17'});
						} else if (depthprocess > 1000) {
							ejeyDP.unshift({ y: depthprocess, color: '#FF171B'});
						} else {
							ejeyDP.unshift(depthprocess);
						}
					}
				}
				var dates = (data[k].date.split("T"))[0];
			}
			
			toGraphicP.name = allData[lang].process;
			toGraphicP.data = ejeyP;
			toGraphicD.name = allData[lang].depth;
			toGraphicD.data = ejeyD;
			toGraphicDP.name = allData[lang].depthProcess;
			toGraphicDP.data = ejeyDP;
			
			$(function () {
				$('#container').highcharts({
					chart: {
						zoomType: 'x',
						spacingRight: 20
					},
					title: {
						text: name,
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
							text: allData[lang].noAt + name
						},
						min: 0,
						tickInterval: 2,
						plotBands: {
							color: '#eed3d7', // Color value
							from: 200, // Start of the plot band
							to: 20000 // End of the plot band
						},
						plotLines: [{
							value: 0,
							width: 1,
							color: '#808080'
						}]
					},
					tooltip: {
						formatter: function() {
							return name + allData[lang].JMXAt + ': <b>' + this.x + '</b> ' + allData[lang].was + ' <b>' + this.y + '</b>';
						}
					},
					legend: {
						layout: 'vertical',
						align: 'right',
						verticalAlign: 'middle',
						borderWidth: 0
					},
					series: [toGraphicP,toGraphicD,toGraphicDP]
				});
			});
		}
	});
};

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
