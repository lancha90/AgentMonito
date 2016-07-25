// Constante de respuesta cuando una inserción resulta vacia
const INSERT_NULL = '000';
// Constante de respuesta cuando una inserción resulto existosa
const INSERT_OK = '200';
// Constante de respuesta cuando una inserción resulto erronea
const INSERT_ERROR = '400';

var exec;
var schedule;
var os;
var odm;
var rule;
var os_platform;

/**
 * Función inicializadora del controlador
 */
var init = function (_schedule,_exec,_os,_odm) {
	exec        = _exec;
	schedule    = _schedule;
	os          = _os;
	odm         = _odm;
	rule        = new schedule.RecurrenceRule();
	os_platform = os.platform();

	rule.second = 00;

	schedule.scheduleJob(rule, function() {
		if (os_platform == "linux") {
			connects_linux();
		} else if (os_platform.match(/darwin.*/)) {
			console.log('darwin');
		} else if (os_platform == "cygwin") {
			console.log('cygwin');
		} else if (os_platform == "win32") {
			console.log('win32');
		} else if (os_platform == "freebsd") {
			console.log('freebsd');
		}
	});
};

/**
 * Función que obtiene las estadisticas de uso de las conexiones y las inserta en base de datos
 */
var connects_linux = function() {
	var date = new Date();
	
	exec('sh ' + __dirname + '/bin/db_connections.sh', function (error, stdout, stderr) {
		var array = stdout.split("\n");
		var data = [];
		var obj = new Object();
		
		for (var i = 0; i < array.length && array[i].length > 0; i++) {
			var tmp = array[i].split(/[\s,]+/);
			if (tmp[2].indexOf('ORA-') == -1 && tmp[2].indexOf('ERROR:') == -1 && tmp[2].indexOf('timeout') == -1 && tmp[2] != null) {
				obj.connects = {
					'quantity': tmp[1],
					'status':   tmp[2],
					'control':  tmp[3]
				}
				
				date.setSeconds(date.getSeconds() + 5);
				
				obj.date = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
				data.push(obj);
				obj = new Object();
			}
		};

		for (var i = 0; i< data.length ; i++) {
			insert(data[i]);
		};
	});
}

/**
 * Función que inserta un registro estadistico de las conexiones en la base de datos 
 */
var insert = function (row) {
	typeof odm.insert(row,function (data) {
		if (data) {
			switch(data.state) {
				case INSERT_ERROR:
					console.log(row.date + ' [ERROR] [CONNECT] - ' + data.message);
				break;
				case INSERT_OK:
					console.log(row.date + ' [INFO] [CONNECT] - Se inserto un nuevo registro');
				break;
			}
		}
	});
}

module.exports = {
	init: init
};