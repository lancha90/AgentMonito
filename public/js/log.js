var showType = 0;

/**
* Función que inicializa los parametros de la aplicación
*/
var main = function(){
	
	$('header nav ul li').removeClass('select');
    $('header nav ul li#menu_log').addClass('select');

	window.client = io.connect("http://localhost:3000/");
	
	client.on('log', function(data){
		$('#log').prepend(showlog(data));
		addListenerMore();
	});

	$('#select_type').on('change',function(){
		$('#log').html('');
		$('#num_debug').html('0');
		$('#num_error').html('0');
		$('#num_warning').html('0');

		showType = $(this).val();
		getData(showType);
	});

	getApplications();
	getData(showType);
};

var addListenerMore = function(){
	$('div.log .more').unbind('click');
	$('div.log .more').on('click',function(){

		$('div.log .message').css('height','1em');
		$(this).parent().parent().find('.message').css('height','auto');

	});
}

/**
* Función encargada de realizar la solicitud ajax al servidor para cargar los primeros resultados
*/
var getData = function(data){
	$.ajax({
	  url: 'http://localhost:3000/api/v1/log/all?type='+data+'&callback=?',
	  crossDomain: true,
	  type: 'GET',
	  success: function(data){
	  	var print = '';
	  	$.each(data,function(row){
	  		print =  print+showlog(data[row]);
	  	});
	  	$('#log').append(print);
	  	addListenerMore();
	  }
	});
};
/**
* Función encargada de realizar la solicitud ajax al servidor para cargar los primeros resultados
*/
var getApplications = function(data){

	$.ajax({
	  url: 'http://localhost:3000/api/v1/applications/all',
	  crossDomain: true,
	  type: 'GET',
	  success: function(data){
	  	var print = '';
	  	$.each(data,function(row){
	  		print = showApplications(data[row]) + print;
	  	});
	  	$('#applications').append(print);
	  }
	});
};

/**
* Función encargada de generar la cadena de texto html de las aplicaciones
*/
var showApplications = function(data){
		var print = '';

		
		print='<div class="applications"><div><strong>'+data.name+'</strong></div><div><strong>'+data.version+'</strong></div><div><strong>'+data.language+'</strong></div></div>';

		return print;
};


/**
* Función encargada de generar la cadena de texto html del log
*/
var showlog = function(data){
		var print = '';

		if(data.type==1 && ( showType == 1 || showType == 0)){
			print='<div class="log error">';
			$('#num_error').html(parseInt($('#num_error').html())+1)
		}else if(data.type==2 && ( showType == 2 || showType == 0)){
			print='<div class="log warn">';
			$('#num_warning').html(parseInt($('#num_warning').html())+1)
		}else if(data.type==3 && ( showType == 3 || showType == 0)){
			print='<div class="log info">';
			$('#num_debug').html(parseInt($('#num_debug').html())+1)
		}

		print= print+'<div class="message"><strong>Mensaje: </strong> <a>'+data.message+'</a></div><div><strong>Fecha: </strong> <a>'+data.meta.date+'</a></div><div><strong>Usuario: </strong> <a>'+data.meta.user+'</a><div class="more">ver mas</div></div></div>';

		return print;
};



$(document).on("ready",main);