// Constante de respuesta cuando una inserción resulta vacia
const INSERT_NULL = '000';
// Constante de respuesta cuando una inserción resulto existosa
const INSERT_OK = '200';
// Constante de respuesta cuando una inserción resulto erronea
const INSERT_ERROR = '400';

var logSchema;
var mongoose;
var io;

var model = function (_mongoose,_io) {
	mongoose = _mongoose;
	io = _io;

	logSchema = mongoose.Schema({
	    type: Number,
	    message: String,
	    meta: {
	    	timestamp: { type: Date, default: Date.now },
	    	date: String,
	    	user: String
	    }
	});	
};

/**
 * Función para insertar un registro proveniente del api rest
 */
var api_insert = function (_req,_res) {
	var toInsert = {type: _req.body.type,message: _req.body.message, meta: {user: _req.body.user, date:_req.body.date}};
	
	insert(toInsert,function (toReturn) {
		if (toReturn) {
			switch(toReturn.state) {
				case INSERT_ERROR:
					_res.send(toReturn.message);
				break;
				case INSERT_OK:
					io.broadcast('log',toReturn.message);
					_res.send(toReturn.message);
				break;
			}
		}
	});
};

/**
 * Función para insertar un objeto en la base de datos
 */
var insert = function (_object,_callback) {
	var Log = mongoose.model('Log', logSchema);
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
	var Log = mongoose.model('Log', logSchema);

	if (_req.query.type && _req.query.type != 0) {
		Log.find({type:_req.query.type}).sort({'meta.date':-1}).limit(200).exec(function (err, docs) {
			_res.header("Access-Control-Allow-Origin",_req.headers.origin);
			_res.send(docs);
		});
	} else {
		Log.find({}).sort({'meta.date':-1}).limit(100).exec(function (err, docs) {
			_res.header("Access-Control-Allow-Origin",_req.headers.origin);
			_res.send(docs);
		});
	}
};

module.exports = {
	init: model,
	add: api_insert,
	insert: insert,
	all: all
};