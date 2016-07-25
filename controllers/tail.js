// Constante de respuesta cuando una inserción resulta vacia
const INSERT_NULL = '000';
// Constante de respuesta cuando una inserción resulto existosa
const INSERT_OK = '200';
// Constante de respuesta cuando una inserción resulto erronea
const INSERT_ERROR = '400';

// constante del tipo de mensaje INFO
const MSG_INFO = 'INFO';
const INT_INFO = 3;
// constante del tipo de mensaje WARN
const MSG_WARN = 'WARN'; 
const INT_WARN = 2; 
// constante del tipo de mensaje ERROR
const MSG_ERROR = 'ERROR';
const INT_ERROR = 1;

// Constante con el nombre de usuario que se desea usar para el reporte del log
const SYSTEM_USER = 'SYSTEM';

// Instancia del objeto tail que se encarga del listener del archivo
var tail;
// Instancia del objeto odm que sirve para la inserción en base de datos de logs
var odm;
// Instancia del socket para enviar reportes eventos
var io;
// Variable que almacenara el registro temporal a insertar
var row;
// Objeto con los parametros de configuración
var conf;

/**
 * Función inicializadora del controlador
 */
var init = function (_tail,_config,_odm,_io,_autostart) {
	conf       = _config;
	io         = _io;
	odm        = _odm;
	tail       = new _tail(conf.logs[0].url);
	_autostart = _autostart || false;

	if (!_autostart) {
		stop();
	}

	tail.on("line", function(data) {
		if (validateDate(data.substr(0,conf.line.characters_line),conf.line.init_line)) {
			if (row) {
				typeof odm.insert(row,function (data) {
					if (data) {
						switch(data.state) {
							case INSERT_ERROR:
								console.log(row.date + ' [ERROR] [LOG] ' + data.message);
								break;
							case INSERT_OK:
								io.broadcast('log',data.message);
								console.log(row.date + ' [INFO] [LOG] - Se inserto un nuevo registro');
							  break;
						}
					}
				});
			}

			row = { meta:{user:SYSTEM_USER} };

			var tmp = data.split(' [');

			if (tmp[0]) {
				var information = tmp[0].split(' ');
				if (information[0]) {
					row.meta.date = information[0] + ' ' + information[1];
				}
				
				if (information[2]) {
					switch(information[2]) {
						case MSG_ERROR:
							row.type = INT_ERROR;
							break;
						case MSG_INFO:
							row.type = INT_INFO;
							break;
						case MSG_WARN:
							row.type = INT_WARN;
							break;
					}
				}
			}

			if (tmp[1]) {
				row.message = '[' + tmp[1];
			}
		} else {
			if (typeof(row) != "undefined") {
				row.message = row.message + '\n' + data;
			}
		}
	});
}

/**
 * inicia el analisis del archivo
 */
var start = function(){
	tail.watch();
};

/**
 * deja de analizar el archivo
 */
var stop = function(){
	tail.unwatch();
};

/**
 * Metodo para validar si la cadena ingresada es una hora valida
 */
var validateDate = function (time,res) {
	var result = false, m;
	var re = new RegExp (res);
    if ((m = time.match(re))) {
        result = true;
    }
    return result;
};

module.exports = {
	init: init,
	start: start,
	stop: stop
};