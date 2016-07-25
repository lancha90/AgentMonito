// Constante de respuesta cuando una inserción resulta vacia
const INSERT_NULL = '000';
// Constante de respuesta cuando una inserción resulto existosa
const INSERT_OK = '200';
// Constante de respuesta cuando una inserción resulto erronea
const INSERT_ERROR = '400';

var ramSchema;
var mongoose;
var io;

var model = function (_mongoose,_io) {
	mongoose = _mongoose;
	io = _io;

	ramSchema = mongoose.Schema({
	    ram: {
		    total: String, 
		    used: String,
		    pused: String,
		    free: String,
		    buffer: String
	    },
	    date: { type: Date, default: Date.now },
	    meta: { timestamp: { type: Date, default: Date.now } }
	});	
};

/**
* Función para insertar un objeto en la base de datos
*/
var insert = function (_object,_callback) {
	var Ram = mongoose.model('Ram', ramSchema);
	var row = new Ram(_object);

	row.save(function (err, fluffy) {
		if (err){
			_callback({state: INSERT_ERROR, message: err});
		}else{
			_callback({state: INSERT_OK, message: row});
		}
	});
};

var all = function (_req,_res) {
	var Ram = mongoose.model('Ram', ramSchema);
	
	Ram.find({}).select('date ram').sort({date: 'desc'}).limit(200).exec(function (err, docs) {
		_res.header("Access-Control-Allow-Origin",_req.headers.origin);
		_res.send(docs);
	});
};

module.exports = {
	init: model,
	insert: insert,
	all: all
};