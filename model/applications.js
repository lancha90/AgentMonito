// Constante de respuesta cuando una inserción resulta vacia
const INSERT_NULL = '000';
// Constante de respuesta cuando una inserción resulto existosa
const INSERT_OK = '200';
// Constante de respuesta cuando una inserción resulto erronea
const INSERT_ERROR = '400';

var applicationsSchema;
var mongoose;

var model = function (_mongoose) {
	mongoose = _mongoose;

	applicationsSchema = mongoose.Schema({
	    name: String,
	    version: Number, 
	    language: String,
	    image: String,
	    configurarion:{
	    	file: String,
  			line: {
		  		init_line: String,
		  		characters_line: Number
		  	}
	    },
	    meta: {
	    	timestamp: { type: Date, default: Date.now },
	    	user: String
	    }
	});	
};

/**
 * Función para insertar un objeto en la base de datos
 */
var insert = function (_object,_callback) {
	var Log = mongoose.model('Applications', applicationsSchema);
	var row = new Log(_object);

	row.save(function (err, fluffy) {
		if (err) {
			_callback({state: INSERT_ERROR, message: err});
		} else {
			_callback({state: INSERT_OK, message: row});
		}
	});
};

var all = function (_req,_res) {
	var Log = mongoose.model('Applications', applicationsSchema);

	if (_req.query.type && _req.query.type != 0) {
		Log.find({type:_req.query.type}).sort('name').limit(200).exec(function (err, docs) {
			_res.header("Access-Control-Allow-Origin",_req.headers.origin);
			_res.send(docs);
		});
	} else {
		Log.find({}).sort('name').limit(100).exec(function (err, docs) {
			_res.header("Access-Control-Allow-Origin",_req.headers.origin);
			_res.send(docs);
		});
	}
};

module.exports = {
	init: model,
	insert: insert,
	all: all
};