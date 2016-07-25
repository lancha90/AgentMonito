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

	schedule.scheduleJob(rule, function () {
		if (os_platform == "linux") {
			ram_linux();
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
 * Función que obtiene las estadisticas de uso de la cpu y las inserta en base de datos
 */
var ram_linux = function () {
	var date = new Date();
	
	exec('top -b -n 12 -d 5 | grep -e "Mem:"', function (error, stdout, stderr) {
		var array = stdout.split("\n");
		var data = [];
		var obj = new Object();

		for (var i = 0; i < array.length && array[i].length > 0; i++) {
			var tmp = array[i].split(/[\s,]+/);

			if (tmp[0] == 'Mem:' || tmp[0] == 'KiB') {
				if (tmp[0] == 'KiB') {
					tmp.splice(0,1);
				}
				tmp.splice(0,1);
				tmp.splice(1,1);
				tmp.splice(2,1);
				tmp.splice(3,1);
				tmp.splice(4,1);
			}

			tmp[0] = tmp[0].replace('k','');
			tmp[1] = tmp[1].replace('k','');
			tmp[2] = tmp[2].replace('k','');
			tmp[3] = tmp[3].replace('k','');

			obj.ram = {
				'total': tmp[0],
				'used': tmp[1],
				'free': tmp[2],
				'buffer': tmp[3],
				'pused': (parseFloat(tmp[1])/parseFloat(tmp[0]))*100
			}

			date.setSeconds(date.getSeconds()+5);
			
			obj.date = date.getFullYear()+'/'+(date.getMonth()+1)+'/'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
			data.push(obj);
			obj = new Object();
		};

		for (var i = 0; i< data.length ; i++) {
			insert(data[i]);
		};
	});
};

/**
 * Función que inserta un registro estadistico de la RAM en la base de datos 
 */
var insert = function (row) {
	typeof odm.insert(row,function (data) {
		if (data) {
			switch(data.state) {
				case INSERT_ERROR:
					console.log(row.date+' [ERROR] [RAM] - '+data.message);
				break;
				case INSERT_OK:
					console.log(row.date+' [INFO] [RAM] - Se inserto un nuevo registro');
				break;
			}
		}
	});
}

module.exports = {
	init: init
};