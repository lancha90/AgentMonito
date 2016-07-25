// Constante de respuesta cuando una inserción resulta vacia
const INSERT_NULL = '000';
// Constante de respuesta cuando una inserción resulto existosa
const INSERT_OK = '200';
// Constante de respuesta cuando una inserción resulto erronea
const INSERT_ERROR = '400';

var notificationsSchema;
var mongoose;

var model = function (_mongoose) {
	mongoose = _mongoose;

	notificationsSchema = mongoose.Schema({
		// nombre de la notificación ej. {storage: '/home' || network: '192.168.0.10', service: 'http://example.com?wsdl'}
		name: String,
		// tipo de notificación {email || mms || sms}
		type: String,
		date: { type: Date, default: Date.now },
		meta: {
			timestamp: { type: Date, default: Date.now },
			user: {type: String, default: 'system'}
		}
	});	
};
/**
* Función para insertar un objeto en la base de datos
*/
var insert = function (_object,_callback) {
	var Notifications = mongoose.model('Notifications', notificationsSchema);
	var row = new Notifications(_object);

	row.save(function (err, fluffy) {
		if (err) {
			_callback({state: INSERT_ERROR, message: err});
		} else {
			_callback({state: INSERT_OK, message: row});
		}
	});
};

/**
* Función que verifica si ya se le envio una notificación al usuario
*/
var isExist = function(_name, _type) {
	var Notifications = mongoose.model('Notifications', notificationsSchema);
	
	Notifications.count({name: _name, type: _type}, function(err, c){
		console.log('Count is ' + c);
		if (c == 0)
			return true;
		return false;
	});
};

module.exports = {
	init: model,
	insert: insert,
	exist: isExist
};