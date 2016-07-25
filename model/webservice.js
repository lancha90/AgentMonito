// Constante de respuesta cuando una inserción resulta vacia
const INSERT_NULL = '000';
// Constante de respuesta cuando una inserción resulto existosa
const INSERT_OK = '200';
// Constante de respuesta cuando una inserción resulto erronea
const INSERT_ERROR = '400';

var webserviceSchema;
var mongoose;

var model = function (_mongoose) {
	mongoose = _mongoose;

	webserviceSchema = mongoose.Schema({
		name: String,
		url: String, 
		status: Number,
		app: String,
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
	var Webservice = mongoose.model('Webservice', webserviceSchema);
	var row = new Webservice(_object);

	row.save(function (err, fluffy) {
		if (err){
			_callback({state: INSERT_ERROR, message: err});
		}else{
			_callback({state: INSERT_OK, message: row});
		}
	});
};

var all = function (_req,_res) {
	var Webservice = mongoose.model('Webservice', webserviceSchema);

	Webservice.find({'app':_req.query.app}).sort({'date':'-1'}).limit(400).exec(function (err, docs) {
		_res.header("Access-Control-Allow-Origin",_req.headers.origin);
		_res.send(docs);
	});
};

module.exports = {
	init: model,
	insert: insert,
	all: all
};