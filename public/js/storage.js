var allData;
var lang;

$(document).on('ready',function() {
	var jqxhr = $.getJSON( "/js/language.json", function(data) {
		allData = data;
		lang = getCookie('lang');
		storage();
	});
});

function storage(){
        $('header nav ul li').removeClass('select');
        $('header nav ul li#menu_server').addClass('select');

        $.ajax({
            url : url_base+'api/v1/storage/chart',
            type : 'GET',
            dataType : "json",
            timeout : 10000,
            crossDomain : true,
            success : function(_data){

                for(var k in _data){

                    var series=[];
                    var use = parseFloat(_data[k].information.pused.replace('%',''));
                    var free = 100-use;

                    $('.wrapper').append('<div id="container'+k+'" class="chart"></div>');

                    series.push({name: allData[lang].free ,y: free, color: 'green'});
                    series.push({name: allData[lang].used,y: use, color: 'red'});

                    $(function () {
                        $('#container'+k).highcharts({
                            chart: {
                                plotBackgroundColor: null,
                                plotBorderWidth: null,
                                plotShadow: false,
                                width: 400,
                                height: 400
                            },
                            title: {
                                text: _data[k]._id.filesystem+'      Size: '+_data[k]._id.size
                            },
                            subtitle: {
                                text: allData[lang].activemountedOn+ ': '+_data[k]._id.mounted_on
                            },
                            tooltip: {
                                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                            },
                            plotOptions: {
                                 pie: {
                                    allowPointSelect: true,
                                    cursor: 'pointer',
                                    dataLabels: {
                                        enabled: false
                                    },
                                    showInLegend: true
                                }
                            },
                            series: [{
                                type: 'pie',
                                name: allData[lang].usedDisk,
                                data: series
                            }]
                        });
                    });
                }
            }
        });
}


function getCookie (c_name) {
	c_start = document.cookie.indexOf(c_name + "=");
	if(c_start != -1) {
		c_start = c_start + c_name.length + 1;
		c_end = document.cookie.indexOf(";", c_start);
		if(c_end == -1) {
			c_end = document.cookie.length;
		}
		return unescape(document.cookie.substring(c_start, c_end));
	}
}