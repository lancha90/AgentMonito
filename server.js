console.log('Server listenning port 3000');
var config = require('./conf/configuration');
// variable que almacenará el objeto de email de las notificaciones para el envio del email
var callback_email;

/** 
 * Modulos que se requieren para el proyecto
 * {curl}		libreria para realizar peticiones http desde node por medio de curl
 * {exec} 		ejecutar comandos bash
 * {email}		libreria para el envio de emails '/notifications/email.js'
 * {express} 	rutas y servidor web
 * {mongoose}	orm para mongo
 * {os} 		comandos del sistema operativo
 * {schedule}	libreria para programar las tareas
 * {swig}		libreria de templates
 * {tailf} 		libreria para el analisis de archivos
 * {i18n} 		libreria para internacionalización del frontend
 * {request} 	libreria para la captura de los datos de la pagina WEB
 * {cheerio} 	libreria para interpretar y capturar datos de una sentencia HTTP
 */
var exec = require('child_process').exec,
	express = require('express.io'),
	form_data = require('form-data'),
	fs = require('fs'),
	i18n = require("i18n"),
	email = require('./notifications/email.js'),
	mongoose = require('mongoose'),
	os = require('os'),
	schedule = require('node-schedule'),
	swig = require('swig'),
	tailf = require('tail').Tail,
	request = require('request'),
	cheerio = require('cheerio');


/**
 * importación de los modelos ODM (object document manager)
 */
var odm_applications = require('./model/applications'),
	odm_connects = require('./model/connects'),
	odm_cpu = require('./model/cpu'),
	odm_database = require('./model/database'),
	odm_filesystem = require('./model/filesystem'),
	odm_log = require('./model/log'),
	odm_monitor = require('./model/monitor'),
	odm_network = require('./model/network'),
	odm_node = require('./model/swl_node'),
	odm_processdb = require('./model/processdb'),
	odm_ram = require('./model/ram'),
	odm_transaction = require('./model/transaction'),
	odm_webservice = require('./model/webservice'),
	odm_jboss_jmx = require('./model/jboss_jmx');

/**
 * importación de los controladores
 */
var applications = require('./controllers/applications'),
	connects = require('./controllers/connects'),
	cpu = require('./controllers/cpu'),
	database = require('./controllers/database'),
	filesystem = require('./controllers/filesystem'),
	home = require('./controllers/home'),
	monitor = require('./controllers/monitor'),
	network = require('./controllers/network'),
	swl_node = require('./controllers/swl_node'),
	processdb = require('./controllers/processdb'),
	ram = require('./controllers/ram'),
	tail = require('./controllers/tail'),
	transaction = require('./controllers/transaction'),
	jboss_instance = require('./controllers/jboss_instance'),
	jboss_queue = require('./controllers/jboss_queue'),
	jboss_jmx = require('./controllers/jboss_jmx');

var server = express();

/**
 * Configuración del servidor
 */
server.engine('html', swig.renderFile);
server.set('view engine', 'html');
server.set('views', './frontend');
server.use(express.static('./public'));
server.configure(function() {
	server.use(express.bodyParser());
	server.use(express.cookieParser());
	server.use(express.logger());
	server.use(i18n.init);
});

// configuración de la internacionalización
i18n.configure({
	cookie: 'lang',
	defaultLocale: 'en',
	locales:['en', 'es', 'fr'],
	directory: __dirname + '/lang'
});

// inicialización del servidor
server.http().io();

// conexión de datos
mongoose.connect(config.mongo);

if (config.server.type == 'LOCAL' || config.server.type == 'HIBRID') {
	// inicialización de los modelos
	typeof odm_applications.init(mongoose,server.io);
	typeof odm_cpu.init(mongoose,server.io);
	typeof odm_filesystem.init(mongoose,server.io);
	typeof odm_log.init(mongoose,server.io);
	typeof odm_network.init(mongoose,server.io);
	typeof odm_ram.init(mongoose,server.io);
	typeof odm_webservice.init(mongoose);

	// inicialización de los controladores
	// Configuración de las notificaciones
	if(config.notifications.email == "TRUE"){
		typeof email.init(exec,os,fs);
		typeof email.filesystem({pused: '70', filesystem: '/system'});
		callback_email = email;
	}
	
	// typeof tail.init(tailf,config,odm_log,server.io,true);
	typeof applications.init(config,exec,odm_webservice,schedule);
	typeof cpu.init(schedule,exec,os,odm_cpu);
	typeof filesystem.init(schedule,exec,os,odm_filesystem,callback_email);
	typeof network.init(schedule,exec,os,odm_network,config,server.io);
	typeof ram.init(schedule,exec,os,odm_ram);

	if (config.server.database == "TRUE") {
		// inicialización de los modelos de base de datos
		typeof odm_connects.init(mongoose,server.io);
		typeof odm_database.init(mongoose,server.io);
		typeof odm_monitor.init(mongoose,server.io);
		typeof odm_processdb.init(mongoose,server.io);
		typeof odm_transaction.init(mongoose,server.io);
		// inicialización de los controladores de base de datos
		typeof connects.init(schedule,exec,os,odm_connects);
		typeof database.init(schedule,exec,os,odm_database);
		typeof monitor.init(schedule,exec,os,odm_monitor);
		typeof processdb.init(schedule,exec,os,odm_processdb);
		typeof transaction.init(schedule,exec,os,odm_transaction);
	}

	if (config.server.server.is_weblogic == "TRUE") {
		// inicialización de los modelos de weblogic
		typeof odm_node.init(mongoose,server.io);
		// inicialización de los controladores de weblogic
		typeof swl_node.init(schedule,exec,odm_node,config.server.server.weblogic);
	}

	if (config.server.server.is_jboss == "TRUE") {
		// inicialización de los controladores de jboss
		typeof jboss_instance.init(exec,os,config.server.server.jboss);
		typeof jboss_queue.init(exec,os,config.server.server.jboss);
		// inicialización de los modelos de jboss jmx
		typeof odm_jboss_jmx.init(mongoose,server.io);
		// inicialización de los controladores de weblogic
		typeof jboss_jmx.init(request,cheerio,config.server.server.jboss,schedule,exec,os,odm_jboss_jmx);
	}
} else if(config.server.type == 'MASTER') {
}

/*
 * ******************************************************************************************
 * ROUTES DEL DASHBOARD
 * ******************************************************************************************
 */
server.get('/', function (_req, _res) {
	_res.render('index');
});
server.get('/applications', function (_req, _res) {
	_res.render('applications',{app:config.app});
});
server.get('/log', function (_req, _res) {
	_res.render('log');
});

server.get('/server', function (_req, _res) {
	typeof odm_node.serversName(function(result){
		_res.render('server',{
			name: config.server.name,
			isDatabase:config.server.database,
			isJboss:config.server.server.is_jboss,
			isGlassfish:config.server.server.is_glassfish,
			isWeblogic:config.server.server.is_weblogic,
			serverList:result,
			intanceName: _req.query.name
		});
	});
});
server.get('/server/cpu', function (_req, _res) {
	typeof odm_node.serversName(function(result){
		_res.render('server_cpu',{
			name: config.server.name,
			isDatabase:config.server.database,
			isJboss:config.server.server.is_jboss,
			isGlassfish:config.server.server.is_glassfish,
			isWeblogic:config.server.server.is_weblogic,
			serverList:result,
			intanceName: _req.query.name
		});
	});
});
server.get('/server/network', function (_req, _res) {
	typeof odm_node.serversName(function(result){
		_res.render('server_network',{
			name: config.server.name,
			isDatabase:config.server.database,
			isJboss:config.server.server.is_jboss,
			isGlassfish:config.server.server.is_glassfish,
			isWeblogic:config.server.server.is_weblogic,
			serverList:result,
			intanceName: _req.query.name
		});
	});
});
server.get('/server/ram', function (_req, _res) {
	typeof odm_node.serversName(function(result){
		_res.render('server_ram',{
			name: config.server.name,
			isDatabase:config.server.database,
			isJboss:config.server.server.is_jboss,
			isGlassfish:config.server.server.is_glassfish,
			isWeblogic:config.server.server.is_weblogic,
			serverList:result,
			intanceName: _req.query.name
		});
	});
});
server.get('/server/storage', function (_req, _res) {
	typeof odm_node.serversName(function(result){
		_res.render('server_storage',{
			name: config.server.name,
			isDatabase:config.server.database,
			isJboss:config.server.server.is_jboss,
			isGlassfish:config.server.server.is_glassfish,
			isWeblogic:config.server.server.is_weblogic,
			serverList:result,
			intanceName: _req.query.name
		});
	});
});
server.get('/server/node', function (_req, _res) {
	typeof odm_node.serversName(function(result){
		_res.render('server_node',{
			name: config.server.name,
			isDatabase:config.server.database,
			isJboss:config.server.server.is_jboss,
			isGlassfish:config.server.server.is_glassfish,
			isWeblogic:config.server.server.is_weblogic,
			serverList:result,
			intanceName: _req.query.name
		});
	});
});

server.get('/database/tablespace', function (_req, _res) {
	typeof odm_node.serversName(function(result){
		_res.render('db_tablespace',{
			name: config.server.name,
			isDatabase:config.server.database,
			isJboss:config.server.server.is_jboss,
			isGlassfish:config.server.server.is_glassfish,
			isWeblogic:config.server.server.is_weblogic,
			serverList:result,
			intanceName: _req.query.name
		});
	});
});
server.get('/database/processdb', function (_req, _res) {
	typeof odm_node.serversName(function(result){
		_res.render('db_process',{
			name: config.server.name,
			isDatabase:config.server.database,
			isJboss:config.server.server.is_jboss,
			isGlassfish:config.server.server.is_glassfish,
			isWeblogic:config.server.server.is_weblogic,
			serverList:result,
			intanceName: _req.query.name
		});
	});
});
server.get('/database/connects', function (_req, _res) {
	typeof odm_node.serversName(function(result){
		_res.render('db_connects',{
			name: config.server.name,
			isDatabase:config.server.database,
			isJboss:config.server.server.is_jboss,
			isGlassfish:config.server.server.is_glassfish,
			isWeblogic:config.server.server.is_weblogic,
			serverList:result,
			intanceName: _req.query.name
		});
	});
});
server.get('/database/transaction', function (_req, _res) {
	typeof odm_node.serversName(function(result){
		_res.render('db_transaction',{
			name: config.server.name,
			isDatabase:config.server.database,
			isJboss:config.server.server.is_jboss,
			isGlassfish:config.server.server.is_glassfish,
			isWeblogic:config.server.server.is_weblogic,
			serverList:result,
			intanceName: _req.query.name
		});
	});
});
server.get('/database/monitor', function (_req, _res) {
	typeof odm_node.serversName(function(result){
		_res.render('db_monitor',{
			name: config.server.name,
			isDatabase:config.server.database,
			isJboss:config.server.server.is_jboss,
			isGlassfish:config.server.server.is_glassfish,
			isWeblogic:config.server.server.is_weblogic,
			serverList:result,
			intanceName: _req.query.name
		});
	});
});
server.get('/server/jboss_instance', function (_req, _res) {
	typeof odm_node.serversName(function(result){
		_res.render('server_jboss_instance',{
			name: config.server.name,
			isDatabase:config.server.database,
			isJboss:config.server.server.is_jboss,
			isGlassfish:config.server.server.is_glassfish,
			isWeblogic:config.server.server.is_weblogic,
			serverList:result,
			intanceName: _req.query.name
		});
	});
});
server.get('/server/jboss_queue', function (_req, _res) {
	typeof odm_node.serversName(function(result){
		_res.render('server_jboss_queue',{
			name: config.server.name,
			isDatabase:config.server.database,
			isJboss:config.server.server.is_jboss,
			isGlassfish:config.server.server.is_glassfish,
			isWeblogic:config.server.server.is_weblogic,
			serverList:result,
			intanceName: _req.query.name
		});
	});
});
server.get('/server/jboss_jmx', function (_req, _res) {
	typeof odm_node.serversName(function(result){
		_res.render('server_jboss_jmx',{
			name: config.server.name,
			jmx: config.server.server.jboss.jmxrun,
			queues: config.server.server.jboss.queues,
			isDatabase:config.server.database,
			isJboss:config.server.server.is_jboss,
			isGlassfish:config.server.server.is_glassfish,
			isWeblogic:config.server.server.is_weblogic,
			serverList:result,
			intanceName: _req.query.name
		});
	});
});

/*
 * ******************************************************************************************
 * ROUTES DEL API
 * ******************************************************************************************
 */
server.post('/', function (_req, _res) {
	typeof odm_log.add(_req,_res);
});
server.get('/api/v1/home', function (_req, _res) {
	typeof home.info(os,_res);
});
server.get('/api/v1/log/all', function (_req, _res) {
	typeof odm_log.all(_req,_res);
});
server.get('/api/v1/filesystem/all', function (_req, _res) {
	typeof odm_filesystem.all(_req,_res);
});
server.get('/api/v1/network/all', function (_req, _res) {
	typeof odm_network.all(_req,_res);
});
server.get('/api/v1/storage/chart', function (_req, _res) {
	typeof odm_filesystem.chart(_req,_res);
});
server.get('/api/v1/cpu/all', function (_req, _res) {
	typeof odm_cpu.all(_req,_res);
});
server.get('/api/v1/ram/all', function (_req, _res) {
	typeof odm_ram.all(_req,_res);
});
server.get('/api/v1/applications/log', function (_req, _res) {
	typeof applications.log(_req,_res);
});
server.get('/api/v1/applications/status', function (_req, _res) {
	typeof applications.status(_req,_res);
});
server.get('/api/v1/database/all', function (_req, _res) {
	typeof odm_database.all(_req,_res);
});
server.get('/api/v1/processdb/all', function (_req, _res) {
	typeof odm_processdb.all(_req,_res);
});
server.get('/api/v1/connects/all', function (_req, _res) {
	typeof odm_connects.all(_req,_res);
});
server.get('/api/v1/transaction/all', function (_req, _res) {
	typeof odm_transaction.all(_req,_res);
});
server.get('/api/v1/monitor/all', function (_req, _res) {
	typeof odm_monitor.all(_req,_res);
});
server.get('/api/v1/node/list', function (req, res) {
	typeof odm_node.serverList(req,res);
});
server.get('/api/v1/jboss_instance/status', function (_req, _res) {
	typeof jboss_instance.status(_req,_res);
});
server.get('/api/v1/jboss_queue/status', function (_req, _res) {
	typeof jboss_queue.status(_req,_res);
});
server.get('/api/v1/jboss_jmx/all', function (_req, _res) {
	typeof odm_jboss_jmx.all(_req,_res);
});

server.get('/upload', function(_req, _res) {
	/*var form = new form_data();
	//form.append('api_key', api_key);
	//form.append('product_id', 19);
	form.append('image', fs.createReadStream('/Users/dherrera/Pictures/DSC_0522.JPG'));
	form.submit('http://localhost:3000/upload', function(err, res) {
	  // res – response object (http.IncomingMessage)  //
	  //res.resume(); // for node-0.10.x
	  console.log('---------------------------------------');
	  console.log(res.statusCode);
	  console.log('---------------------------------------');
	});*/
    _res.send(
        '<form action="/upload" method="post" enctype="multipart/form-data">'+
        '<input type="file" name="image">'+
        '<input type="submit" value="Upload">'+
        '</form>'
    );
});

server.post('/upload', function(_req, _res) {
	fs.readFile(req.files.image.path, function (err, data) {
		var imageName = req.files.image.name
		
		/// If there's an error
		if (!imageName) {
			var toResponse = {code: 400, message: 'ERROR'};
			_res.send(toResponse);
		} else {
			var newPath = __dirname + "/db_backups/" + imageName;
			
			/// write file to db_backups folder
			fs.writeFile(newPath, data, function (err) {
				var toResponse = {code: 200, message: 'OK'};
				_res.send(toResponse);
			});
		}
	});
});

server.listen(3000);
