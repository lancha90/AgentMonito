// Constante de respuesta cuando una inserción resulta vacia
const INSERT_NULL = '000';
// Constante de respuesta cuando una inserción resulto existosa
const INSERT_OK = '200';
// Constante de respuesta cuando una inserción resulto erronea
const INSERT_ERROR = '400';

var config;
var exec;
var io;
var odm;
var os;
var rule;
var schedule;

/**
 * Función inicializadora del controlador
 */
var init = function (_schedule,_exec,_os,_odm,_config,_io) {
	exec        = _exec;
	schedule    = _schedule;
	os          = _os;
	odm         = _odm;
	rule        = new schedule.RecurrenceRule();
	config      = _config;
	io          = _io;

	rule.second = [00,20,40];

	schedule.scheduleJob(rule, function () {
		var os_platform = os.platform();

		if (os_platform == "linux") {
			for (ip in config.ping) {
				net_linux(config.ping[ip]);
			}
		} else if (os_platform.match(/darwin.*/)) {
			for (ip in config.ping) {
				net_macosx(config.ping[ip]);
			}
		} else if (os_platform == "cygwin") {
			console.log('cygwin');
		} else if (os_platform == "win32") {
			console.log('win32');
		} else if (os_platform == "freebsd") {
			console.log('freebsd');
		}
	});
};

var net_macosx = function (ip_ping) {
	var toInsert;
	exec('ping -c 4 '+ip_ping, function(error, stdout, stderr) {
		if (stderr.length == 0) {
			var array = stdout.split("\n");
			var data = [];
			var sum = 0;
			var items = 0;
			
			for (var i = 1; i < 5; i++) {
				var tmp = array[i].split(/[\s,]+/);

				if (tmp.length == 8) {
					tmp.splice(1,2);
					tmp.splice(tmp.length-1,1);

					tmp[1] = tmp[1].replace(':','');
					tmp[2] = tmp[2].replace('icmp_seq=','');
					tmp[3] = tmp[3].replace('ttl=','');
					tmp[4] = tmp[4].replace('time=','');

					items++;
					sum+=parseFloat(tmp[4]);
				}
			};
			toInsert = {ip: ip_ping,bytes: tmp[0], ttl: tmp[3],time: (sum/items),date: new Date()};
		} else {
			toInsert = {ip: ip_ping,bytes: '0', ttl: '0',time: '-5',date: new Date()};
		}
		insert(toInsert);
	});
};

var net_linux = function (ip_ping) {
	var toInsert;
	exec('ping -c 4 ' + ip_ping, function (error, stdout, stderr) {
		if (stderr.length == 0) {
			var array = stdout.split("\n");
			var data = [];
			var sum = 0;
			var items = 0;
			
			for (var i = 1; i < 5 ; i++) {
				var tmp = array[i].split(/[\s,]+/);

				if (tmp.length == 8) {
					tmp.splice(1,2);
					tmp.splice(tmp.length-1,1);

					tmp[1] = tmp[1].replace('):','');
					tmp[1] = tmp[1].replace('(','');
					tmp[2] = tmp[2].replace('icmp_seq=','');
					tmp[3] = tmp[3].replace('ttl=','');
					tmp[4] = tmp[4].replace('time=','');

					items++;
					sum+=parseFloat(tmp[4]);
				}
			};
			
			toInsert = {ip: ip_ping,bytes: tmp[0], ttl: tmp[3],time: (sum/items),date: new Date()};
		} else {
			console.log(new Date()+' [ERROR] [NET] - Host no disponible');
			toInsert = {ip: ip_ping,bytes: '0', ttl: '0',time: '-5',date: new Date()};
		}
		insert(toInsert);	
	});
};

/**
 * Función que inserta un registro estadistico de las redes en la base de datos 
 */
var insert = function (row) {
	typeof odm.insert(row,function (data) {
		if (data) {
			switch(data.state) {
				case INSERT_ERROR:
					console.log(row.date+' [ERROR] [NET] - '+data.message);
				break;
				case INSERT_OK:
					io.broadcast('network_io',row);
					console.log(row.date+' [INFO] [NET] - Se inserto un nuevo registro');
				break;
			}
		}
	});
}

module.exports = {
	init: init
};