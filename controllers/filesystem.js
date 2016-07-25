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
var notifications;

/**
 * Función inicializadora del controlador
 */
var init = function (_schedule,_exec,_os,_odm,_notifications) {
	exec          = _exec;
	schedule      = _schedule;
	os            = _os;
	odm           = _odm;
	notifications = _notifications;
	rule          = new schedule.RecurrenceRule();
	os_platform   = os.platform();
	
	rule.repeat = 30;

	schedule.scheduleJob(rule, function () {
		if (os_platform == "linux") {
			fs_linux();
		} else if (os_platform.match(/darwin.*/)) {
			fs_macosx();
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
 * Función para procesar las estadisticas del disco en mac os x
 */
var fs_macosx = function () {
	exec('df -h', function (error, stdout, stderr) {
		var array = stdout.split("\n");
		var data = [];

		for (var i = 1; i < array.length ; i++) {
			var tmp = array[i].split(/[\s,]+/);

			if (tmp.length > 9) {
				tmp[0] = tmp[0] + ' ' + tmp[1];
				tmp.splice(1,1);
			}
			
			if (tmp.length > 5) {
				var toInsert = {filesystem: tmp[0],size: tmp[1],used: tmp[2],avail: tmp[3],capacity: tmp[4],iused: tmp[5],ifree: tmp[6],pused: tmp[7],mounted_on: tmp[8]};
				insert(toInsert);
			}
		};
	});
};

/**
 * Función para procesar las estadisticas del disco en linux
 */
var fs_linux = function () {
	exec('df -h', function(error, stdout, stderr) {
		var array = stdout.split("\n");
		var data = [];

		for (var i = 1; i < array.length ; i++) {
			var tmp = array[i].split(/[\s,]+/);
			
			if (tmp.length > 5 ) {
				if (tmp[0] != 'none' && tmp[5].indexOf('/media/') == -1) {
					var toInsert = {filesystem: tmp[0],size: tmp[1],used: tmp[2],avail: tmp[3],pused: tmp[4],mounted_on: tmp[5]};
					insert(toInsert);
				}
			}
		};
	});
};

/**
 * Función que invoca el metodo de insertar del modelo
 */
var insert = function (row) {
	if (parseFloat(row.pused) > 90) {
		if (notifications) {
			typeof notifications.filesystem(row);
		}

	}
	
	typeof odm.insert(row,function(data) {
		if (data) {
			switch(data.state) {
				case INSERT_ERROR:
					console.log(row.date+' [ERROR] [HD] - '+data.message);
				break;
				case INSERT_OK:
					console.log(row.date+' [INFO] [HD] - Se inserto un nuevo registro');
				break;
			}
		}
	});
}

module.exports = {
	init: init
};