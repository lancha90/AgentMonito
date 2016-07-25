// Constante de respuesta cuando una inserción resulta vacia
const INSERT_NULL = '000';
// Constante de respuesta cuando una inserción resulto existosa
const INSERT_OK = '200';
// Constante de respuesta cuando una inserción resulto erronea
const INSERT_ERROR = '400';

var exec;
var os;
var config;
var os_platform;

/**
 * Función inicializadora del controlador
 */
var init = function (_exec,_os,_config) {
	exec        = _exec;
	os          = _os;
	config      =_config;
	os_platform = os.platform();
};

var getJboss = function (_req,_res) {
	if (os_platform == "linux") {
		jobss_linux(_req,_res);
	} else if (os_platform.match(/darwin.*/)) {
		console.log('darwin');
	} else if (os_platform == "cygwin") {
		console.log('cygwin');
	} else if (os_platform == "win32") {
		console.log('win32');
	} else if (os_platform == "freebsd") {
		console.log('freebsd');
	}
}

/**
 * Función que obtiene las estadisticas de las instancias de jboss
 */
var jobss_linux = function (_req,_res) {
	var num_instance = config.instance;
	var url = config.instancerun;
	
	if (url.length > 0) {
		var toResponse = [];
		var iterator   = 0;
		
		for (var i = 0; i < url.length; i++) {
			if (i < num_instance) {
				(function (i) {
					var name = url[i].name;
					exec(url[i].url, function (error, stdout, stderr) {
						iterator++;
						
						if (error == null) {
							toResponse.push({"url":name, "status": 200, "message":"Running"});
						} else {
							toResponse.push({"url":name, "status": 400, "message":"Stopped"});
						}
						
						if (num_instance == iterator) {
							_res.send(toResponse);
						}
					});
				})(i);
			}
		}
	} else {
		_res.send(new Object());
	}
};

module.exports = {
	status: getJboss,
	init: init
};