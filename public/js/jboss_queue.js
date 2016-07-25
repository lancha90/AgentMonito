$(document).on('ready',function () {
    $('header nav ul li').removeClass('select');
    $('header nav ul li#menu_jboss_queue').addClass('select');

    $.ajax({
        url : url_base + 'api/v1/jboss_queue/status',
        type : 'GET',
        dataType : "json",
        timeout : 10000,
        crossDomain : true,
        success : function(_data){
			var status_image = '/css/image/status_ok.png';
			var status_class = 'ok';
			$('#container_log').html('');
			for (item in _data) {
				if (parseFloat(_data[item].status) == 200) {
					status_image='/css/image/status_ok.png';
					status_class='ok';
				} else if (parseFloat(_data[item].status) == 400) {
					status_image='/css/image/status_fail.png';
					status_class='fail';
				}
				$('#container_log').append('<div class="ws_status ' + status_class + '" ><div class="title"><a>' + _data[item].url + '</a></div><div class"status"><img src="' + status_image + '" alt=' + _data[item].message + '><strong> ' + _data[item].message + '</strong></div></div>');
			}
			$('section.container div.wrapper  div.container_input').fadeOut();
		}
	});
});