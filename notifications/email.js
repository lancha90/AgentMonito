// Para mas información acerca del uso de la libreria
// http://www.nodemailer.com/docs/smtp

// Para mas información acerca de la generación de graficas
// http://www.highcharts.com/docs/export-module/render-charts-serverside

var config = require("../conf/notifications"),
	nodemailer = require("nodemailer");

var smtpTransport,
	exec,
	os,
	fs;

var init = function (_exec,_os,_fs) {
	exec=_exec;
	os=_os;
	fs=_fs;
	smtpTransport = nodemailer.createTransport("SMTP",config.from.SMTP);
}

/**
 * Función que envia un correo electronico con la alerta del filesystem
 */
var filesystem = function (object) {
	var filename = generateUUID();
	var path= __dirname+'/../bin/phantomjs';

	var pie = {
		chart: {plotBackgroundColor: null,plotBorderWidth: null,plotShadow: false,width: 400,height: 400},
        title: {text: object.filesystem},
        subtitle: {text: object.mounted_on},
		series: [{type: "pie",name: object.filesystem,data: [["Used",parseFloat(object.pused)],["Free",(100-parseFloat(object.pused))]]}]
	};

	fs = require('fs');
	fs.writeFile(path+'/into/'+filename+'.json', JSON.stringify(pie), function (err) {
		if (err) {
			return console.log(err);
		} else {
			var command = path + '/macosx/phantomjs ' + path + '/js/highcharts-convert.js -infile ' + path + '/into/' + filename + '.json -outfile ' + path + '/image/' + filename + '.png -scale 2.5 -width 400';
			
			exec(command, function( error, stdout, stderr) {
				if (stdout) {
					config.filesystem.attachments = [{   // file on disk as an attachment
						fileName: "Storage.png",
						filePath: stdout.replace('\n','') // stream this file
					}];
					
					/*smtpTransport.sendMail(config.filesystem, function(error, response){
						if (error) {
							console.log(new Date() + ' [ERROR] [EMAIL] [FILESYSTEM] - '+error);
						} else {
							console.log(new Date() + ' [INFO] [EMAIL] [FILESYSTEM] - '+response.message);
						}
					});*/
				}
			});
		}
	});
}

/**
 * Función que genera un identificador unico para los archivos .json
 */
function generateUUID () {
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = (d + Math.random()*16)%16 | 0;
		d = Math.floor(d/16);
		return (c=='x' ? r : (r&0x7|0x8)).toString(16);
	});
	return uuid;
};

module.exports = {
	init: init,
	filesystem: filesystem
}