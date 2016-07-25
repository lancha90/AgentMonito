// Constante de respuesta cuando una inserción resulta vacia
const INSERT_NULL = '000';
// Constante de respuesta cuando una inserción resulto existosa
const INSERT_OK = '200';
// Constante de respuesta cuando una inserción resulto erronea
const INSERT_ERROR = '400';

var jmxSchema;
var mongoose;
var io;


var model = function(_mongoose,_io) {
	mongoose = _mongoose;
	io = _io;

	jmxSchema = mongoose.Schema({
		jmx: {
			name:         String,
			process:      String,
			depth:        String,
			depthprocess: String
		},
		date: { type: Date, default: Date.now },
		meta: { timestamp: { type: Date, default: Date.now } }
	});	
};

/**
* Función para insertar un objeto en la base de datos
*/
var insert = function(_object,_callback){
	var Jmx = mongoose.model('Jmx', jmxSchema);
	var row = new Jmx(_object);

	row.save(function (err, fluffy) {
		if (err) {
			_callback({state: INSERT_ERROR, message: err});
		} else {
			_callback({state: INSERT_OK, message: row});
		}
	});
};

var all = function(_req,_res){
	var Jmx = mongoose.model('Jmx', jmxSchema);

	Jmx.find({'jmx.name':_req.query.name}).select('date jmx').sort({date: 'desc'}).limit(200).exec(function (err, docs) {
		_res.header("Access-Control-Allow-Origin",_req.headers.origin);
		_res.send(docs);
	});
};

module.exports = {
	init: model,
	insert: insert,
	all: all
};
