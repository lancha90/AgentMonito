$(document).on('ready',function () {
    $('header nav ul li').removeClass('select');
    $('header nav ul li#menu_applications').addClass('select');

    $('aside.vert-nav ul li.log').on('click', on_menu_logs);
    $('aside.vert-nav ul li.service_status').on('click', on_menu_ws);
    $('aside.vert-nav ul li.service_report').on('click', on_menu_report);

    $('div.wrapper div.container_input div#log_filter_button').on('click',function(){
        text = $('#log_filter_input').val();

        $('div.wrapper div#container_log p').fadeOut();
        $('div.wrapper div#container_log p:contains('+text+')').fadeIn();
    });
});

var on_menu_logs = function (event) {
	$.ajax({
		url : url_base + 'api/v1/applications/log?app=' + (parseFloat($(this).attr('app'))-1) + '&log=' + (parseFloat($(this).attr('log'))-1),
		type : 'GET',
		dataType : "json",
		timeout : 10000,
		crossDomain : true,
		success : function (_data) {
			$('section.container div.wrapper  div.container_input').fadeIn();
			$('#container_log').html('');
			var data =_data.data.split('\n');
			for (item in data) {
				$('#container_log').append('<p>' + data[item] + '</p>');
			}
		}
	});
}

var on_menu_report = function (event) {
	$.ajax({
		url : url_base + 'api/v1/applications/webservice?app=' + (parseFloat($(this).attr('app'))-1),
		type : 'GET',
		dataType : "json",
		timeout : 10000,
		crossDomain : true,
		success : function (_data) {
			$('#container_log').html('');
			for(item in _data) {
				$('#container_log').append('<div class="ws_status fail" ><div class="title"><strong>'+_data[item].date+'</strong><a> '+_data[item].url+'</a></div><div class"status"><img src="/css/image/status_fail.png"><strong>'+_data[item].status+'</strong></div></div>');
			}
			$('section.container div.wrapper  div.container_input').fadeOut();
		}
	});
};

var on_menu_ws = function (event) {
	$.ajax({
		url : url_base + 'api/v1/applications/status?app=' + (parseFloat($(this).attr('app'))-1),
		type : 'GET',
		dataType : "json",
		timeout : 10000,
		crossDomain : true,
		success : function (_data) {
			var status_image = '/css/image/status_ok.png';
			var status_class = 'ok';
			$('#container_log').html('');
			for (item in _data) {
				if (parseFloat(_data[item].status) < 300) {
					status_image='/css/image/status_ok.png';
					status_class='ok';
				} else if (parseFloat(_data[item].status) < 400) {
					status_image='/css/image/status_warning.png';
					status_class='warning';
				} else {
					status_image='/css/image/status_fail.png';
					status_class='fail';
				}
				$('#container_log').append('<div class="ws_status '+status_class+'" ><div class="title"><a>'+_data[item].url+'</a></div><div class"status"><img src="'+status_image+'" alt='+_data[item].status+'><strong> '+_data[item].status+'</strong></div></div>');
			}
			$('section.container div.wrapper  div.container_input').fadeOut();
		}
	});
};