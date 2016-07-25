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
			cpu_linux();
		} else if (os_platform.match(/darwin.*/)) {
			cpu_macosx();
		} else if (os_platform == "cygwin") {
			console.log('cygwin');
		} else if (os_platform == "win32") {
			console.log('win32');
		} else if (os_platform == "freebsd") {
			console.log('freebsd');
		}
	});
};

var cpu_used = function () {
	var cpu = os.cpus();
	var counter = 0;
	var total = 0;
	var free = 0;
	var sys = 0;
	var user = 0;

	for (var i = 0; i < cpu.length ; i++) {
		counter++;
		total = parseFloat(cpu[i].times.idle) + parseFloat(cpu[i].times.sys) + parseFloat(cpu[i].times.user) + parseFloat(cpu[i].times.irq) + parseFloat(cpu[i].times.nice);

		free+=100*(parseFloat(cpu[i].times.idle)/total);
		sys+=100*(parseFloat(cpu[i].times.sys)/total);
		user+=100*(parseFloat(cpu[i].times.user)/total);
	};
	
	var tmp = new Object();

	tmp.cpu = {
		'user': user/counter,
		'sys': sys/counter,
		'free': free/counter
	};

	insert(tmp);
}

var cpu_macosx = function () {
	exec('top -l 12 -s 5 | grep -e "[0-9]\\{4\\}/[0-9]\\{2\\}/[0-9]\\{2\\} [0-2][0-9]:[0-5][0-9]:[0-5][0-9]" -e "CPU usage:"', function(error, stdout, stderr) {
		var array = stdout.split("\n");
		var data = [];
		var tmp = new Object();

		for (var i = 0; i < array.length ; i++) {
			if (array[i].match(/^[0-9]{4}\/(0[1-9]|1[012])\/(0[1-9]|[12][0-9]|3[01])/) && i%2==0) {
			  tmp.date = array[i];
			} else if (array[i].indexOf('CPU usage: ') == 0) {
				array[i] = array[i].replace('CPU usage: ','');
				var values = array[i].split(', ');

				tmp.cpu = {
					'user': values[0].split('% ')[0],
					'sys': values[1].split('% ')[0],
					'free': values[2].split('% ')[0]
				};
				data.push(tmp);
				tmp = new Object();
			}
		};

		for (var i = 0; i< data.length ; i++) {
			insert(data[i]);	
		};
	});
};

var cpu_linux = function () {
	var date = new Date();

	exec('top -b -n 12 -d 5 | grep -e "Cpu\(s\):"', function (error, stdout, stderr) {
		var array = stdout.split("\n");
		var data = [];
		var obj = new Object();

		for (var i = 0; i < array.length && array[i].length > 0; i++) {
			var tmp = array[i].split(/[\s,]+/);

			if (tmp[0] == 'Cpu(s):') {
				tmp.splice(0,1);
			}

			tmp[0] = tmp[0].replace('%us','');
			tmp[1] = tmp[1].replace('%sy','');
			tmp[2] = tmp[2].replace('%ni','');
			tmp[3] = tmp[3].replace('%id','');
			tmp[4] = tmp[4].replace('%wa','');
			tmp[5] = tmp[5].replace('%hi','');
			tmp[6] = tmp[6].replace('%si','');
			tmp[7] = tmp[7].replace('%st','');

			obj.cpu = {
				'user': tmp[0],
				'sys': parseFloat(tmp[1]) + parseFloat(tmp[2]) + parseFloat(tmp[4]) + parseFloat(tmp[5]) + parseFloat(tmp[6]) + parseFloat(tmp[7]),
				'free': tmp[3]
			}
			date.setSeconds(date.getSeconds() + 5);
			
			obj.date = date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
			data.push(obj);
			obj = new Object();
		};

		for (var i = 0; i < data.length; i++) {
			insert(data[i]);	
		};
	});
};

var insert = function (row) {
	typeof odm.insert(row,function (data) {
		if (data) {
			switch(data.state) {
				case INSERT_ERROR:
					console.log(row.date+' [ERROR] [CPU] - '+data.message);
				break;
				case INSERT_OK:
					console.log(row.date+' [INFO] [CPU] - Se inserto un nuevo registro');
				break;
			}
		}
	});
}

module.exports = {
	init: init
};