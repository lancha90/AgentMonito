var allData;
var lang;

$(document).on('ready',function() {
	lang = getCookie('lang');
	var jqxhr = $.getJSON( "/js/language.json", function(data) {
		allData = data;
		cpu();
	});
});

function cpu(){
    $('header nav ul li').removeClass('select');
    $('header nav ul li#menu_server').addClass('select');

	var data;

        var ejex=[];
        var ejey_user=[];
        var ejey_sys=[];
        var ejey_free=[];

        $.ajax({
            url : url_base+'api/v1/cpu/all',
            type : 'GET',
            dataType : "json",
            timeout : 10000,
            crossDomain : true,
            success : function(_data){
                data=_data;
                toGraphic_free = {};
                toGraphic_user = {};
                toGraphic_sys = {};


                for(var k in data) {
                    
                    ejex.unshift(data[k].date.split('T')[1]);

                    ejey_sys.unshift(parseFloat(data[k].cpu.sys));
                    ejey_user.unshift(parseFloat(data[k].cpu.user));
                    ejey_free.unshift(parseFloat(data[k].cpu.free));

                }
                toGraphic_sys.name=allData[lang].system;
                toGraphic_sys.data=ejey_sys;
                toGraphic_sys.type='area';

                toGraphic_user.name=allData[lang].users;
                toGraphic_user.data=ejey_user;
                toGraphic_user.type='area';

                toGraphic_free.name=allData[lang].free;
                toGraphic_free.data=ejey_free;


                $(function () {
                    $('#container').highcharts({
                        chart: {
                            zoomType: 'x',
                            spacingRight: 20
                        },
                        title: {
                            text: allData[lang].stateCpu,
                            x: -20 //center
                        },
                        subtitle: {
                            text: allData[lang].usedCpu,
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
                            min: 0,
                            labels: {
                                formatter: function() {
                                    return this.value + ' %';
                                }
                            }
                        },
                        tooltip: {
                             formatter: function() {
                                return allData[lang].thePing + ': <b>' + this.x + '</b> ' + allData[lang].was + ' <b>' + this.y + '</b>';
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
                        series: [toGraphic_sys,toGraphic_user]
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