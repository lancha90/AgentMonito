var allData;
var lang;

$(document).on('ready',function() {
	lang = getCookie('lang');
	var jqxhr = $.getJSON( "/js/language.json", function(data) {
		allData = data;
		ram();
	});
	ram();
});

function ram(){
	var data;
    var ejex=[];
    var ejey_pused=[];
    var ejey_buffer=[];

    $('header nav ul li').removeClass('select');
    $('header nav ul li#menu_server').addClass('select');

    $.ajax({
            url : url_base+'api/v1/ram/all',
            type : 'GET',
            dataType : "json",
            timeout : 10000,
            crossDomain : true,
            success : function(_data){
                data=_data;
                toGraphic_used = {};
                toGraphic_buffer = {};

                for(var k in data) {
                    
                    ejex.unshift(data[k].date.split('T')[1]);

                    ejey_buffer.unshift(parseFloat(data[k].ram.buffer));
                    ejey_pused.unshift(parseFloat(data[k].ram.pused));

                }
                toGraphic_buffer.name='Buffers';
                toGraphic_buffer.data=ejey_buffer;
                toGraphic_buffer.type='area';
                
                toGraphic_used.name=allData[lang].usedMemory;
                toGraphic_used.data=ejey_pused;
                toGraphic_used.type='area';


                $(function () {
                    $('#container').highcharts({
                        chart: {
                            zoomType: 'x',
                            spacingRight: 20
                        },
                        title: {
                            text: allData[lang].stateMemoryRam,
                            x: -20 //center
                        },
                        subtitle: {
                            text: allData[lang].usedRam,
                            x: -20
                        },
                        xAxis: {
                            categories: ejex,
                            type: 'datetime'
                        },
                        yAxis: {
                            title: {
                                text: '%'
                            },
                            max: 100,
                            min:0,
                            labels: {
                                formatter: function() {
                                    return this.value + ' %';
                                }
                            }
                        },
                        tooltip: {
                             formatter: function() {
                                return allData[lang].usedRamat + ' <b>' + this.x + '</b> ' + allData[lang].was + ' <b>' + this.y + '%</b>';
                                }
                        },
                        legend: {
                            enable: false
                        },
                        plotOptions: {
                            area: {
                                fillColor: {
                                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
                                    stops: [
                                        [0, Highcharts.getOptions().colors[0]],
                                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                                    ]
                                },
                                lineWidth: 1,
                                marker: {
                                    enabled: false
                                },
                                shadow: false,
                                states: {
                                    hover: {
                                        lineWidth: 1
                                    }
                                },
                                threshold: null
                            }
                        },
                        series: [toGraphic_used]
                    });
                });
            }
        });
}

function getCookie ( c_name) {
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