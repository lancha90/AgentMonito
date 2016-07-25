// Constante de respuesta cuando una inserción resulta vacia
const INSERT_NULL = '000';
// Constante de respuesta cuando una inserción resulto existosa
const INSERT_OK = '200';
// Constante de respuesta cuando una inserción resulto erronea
const INSERT_ERROR = '400';

var http = require('http');

var	schedule;
var config;
var exec;
var odm;
var rule;

var init = function (_config,_exec,_odm,_schedule) {
	config   = _config;
	exec     = _exec;
	odm      = _odm;
	schedule = _schedule;
	rule     = new schedule.RecurrenceRule();

	rule.repeat = 20;

	schedule.scheduleJob(rule, function () {
		for (k in config.app) {
			getStatus(k);
		}
	});
};

/**
 * Función para obtener los ultimos 1000 registro de log
 */
var getLog = function (_req,_res){
	exec('tail -n 1000 '+config.app[_req.query.app].logs[_req.query.log].url, function(error, stdout, stderr){ 
		_res.header("Access-Control-Allow-Origin",_req.headers.origin);
		_res.send({data:stdout});
	});
};

/**
* Función que verifica y retorna el estado de los servicios de una aplicación
*/
var getStatusServer = function (_req,_res) {
	var url = config.app[_req.query.app].ws;

	if (url.length > 0) {
		var toResponse = [];
		var iterator = 0;
		for (i in url) {
			http.get(url[i].url, function (res) {
				res.resume();
				iterator++;
				toResponse.push({"url":res.req._headers.host+res.req.path, "status": res.statusCode});
				if (url.length == iterator) {
					_res.send(toResponse);
				}
			}).on('error', function (e) {
				toResponse.push({"url":url[i].url, "status": 400});
				iterator++;
				if (url.length == iterator ) {
					_res.send(toResponse);
				}
			});
		};
	} else {
		_res.send(new Object());
	}
};

var getStatus = function (k) {
	var url = config.app[k].ws;

	if (url.length > 0) {
		var toResponse = [];
		var iterator = 0;
		for (i in url) {
			http.get(url[i].url, function (res) {
				res.resume();
				iterator++;
				//toResponse.push({"app": k,"url":res.req._headers.host+res.req.path, "status": res.statusCode});
				if (url.length == iterator) {
					insert(toResponse);
				}
			}).on('error', function (e) {
				toResponse.push({"app": k,"url":this._headers.host+this.path, "status": 400});
				iterator++;
				if (url.length == iterator) {
					insert(toResponse);
				}
			});
		};
	}
};

/**
 * Función que inserta un registro estadistico de las conexiones en la base de datos 
 */
var insert = function (rows) {
	for (i in rows) {
		var row = rows[i];

		typeof odm.insert(row,function(data) {
			if (data) {
				switch(data.state) {
					case INSERT_ERROR:
						console.log(new Date() + ' [ERROR] [WEBSERVICE] - ' + data.message);
					break;
					case INSERT_OK:
						console.log(new Date() + ' [INFO] [WEBSERVICE] - Se inserto un nuevo registro');
					break;
				}
			}
		});
	}
}

module.exports = {
	log: getLog,
	status: getStatusServer,
	init: init
};