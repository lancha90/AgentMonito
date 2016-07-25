var showType = 0;
var url_socket = 'http://localhost:3000/';
var url_base = '/';
var lang='en';
/**
* Función que inicializa los parametros de la aplicación
*/
var main = function(){


	if(document.cookie.indexOf('lang=') == 0){

		var cookie = document.cookie.split(';')

		for(item in cookie){
			tmp = cookie[item].trim();
			if(tmp.indexOf('lang=') == 0 ){
				lang=tmp.substring('lang='.length,tmp.length)
				$('header div.lang a[rel="'+lang+'"]').css('opacity','0.5');

			}
		}
	}else{
		document.cookie="lang=en";
	}



	$('aside.vert-nav ul li').on('click',function(){
		href = $(this).attr('rel');
		if (typeof(href) != "undefined"){
			location.href= href;
		}
	});
	$('header div.lang a').on('click',function(){
		document.cookie="lang="+$(this).attr('rel');
		location.reload();
	});
	$('header div.lang a[rel="'+lang+'"]').off();
};


$(document).on("ready",main);