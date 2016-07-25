// Constante de respuesta cuando una inserción resulta vacia
const INSERT_NULL = '000';
// Constante de respuesta cuando una inserción resulto existosa
const INSERT_OK = '200';
// Constante de respuesta cuando una inserción resulto erronea
const INSERT_ERROR = '400';

var exec;
var schedule;
var odm;
var rule;
var config;

/**
 * Función inicializadora del controlador
 */
var init = function (_schedule,_exec,_odm,_config) {
	exec     = _exec;
	schedule = _schedule;
	odm      = _odm;
	rule     = new schedule.RecurrenceRule();
	config   =_config;

	rule.second = 00;

	schedule.scheduleJob(rule, function () {
		//Verificar server para saber cual llamar o cuantos llamar
		server_status_wl();
	});
};

/**
 * Función que obtiene las estadisticas de uso de los WS y las inserta en base de datos
 */
var server_status_wl = function () {
	var exec = require('child_process').exec, child;
	
	child = exec('java -jar ' + __dirname + config.jar + ' ' + config.host + ' ' + config.port + ' ' + config.user + ' ' + config.password, function (error, stdout, stderr) {
		//verificar que el resultado sea correcto para guardar
		
		if (stdout != 0) {
			var data = JSON.parse(stdout);

			for (var i = 0; i < data.length; i++) {
				insert(data[i]);
			};
		}
	});
};

/**
 * Función que inserta un registro estadistico de los WS en la base de datos 
 */
var insert = function (row) {
	typeof odm.insert(row,function (data) {
		if (data) {
			switch(data.state) {
				case INSERT_ERROR:
					console.log('err: '+data.message);
				break;
				case INSERT_OK:
					console.log('INSERT_OK Nodes '+data.message);
				break;
			}
		}
	});
};

module.exports = {
	init: init
};