// Constante de respuesta cuando una inserción resulta vacia
const INSERT_NULL = '000';
// Constante de respuesta cuando una inserción resulto existosa
const INSERT_OK = '200';
// Constante de respuesta cuando una inserción resulto erronea
const INSERT_ERROR = '400';

var databaseSchema;
var mongoose;
var io;

var model = function (_mongoose,_io) {
	mongoose = _mongoose;
	io = _io;

	databaseSchema = mongoose.Schema({
		database: {
			tablespace: String, 
			sizeMB: String,
			freeMB: String,
			free: String,
			used: String
		},
		date: { type: Date, default: Date.now },
		meta: { timestamp: { type: Date, default: Date.now } }
	});	
};

/**
 * Función para insertar un objeto en la base de datos
 */
var insert = function (_object,_callback) {
	var Database = mongoose.model('Database', databaseSchema);
	var row = new Database(_object);

	row.save(function (err, fluffy) {
		if (err) {
			_callback({state: INSERT_ERROR, message: err});
		} else {
			_callback({state: INSERT_OK, message: row});
		}
	});
};

var all = function (_req,_res) {
	var Database = mongoose.model('Database', databaseSchema);

	Database.aggregate({
		$group : {
			_id : '$database.tablespace',
			information : { $last : { date: "$meta.timestamp", sizeMB: "$database.sizeMB", freeMB: "$database.freeMB", used: "$database.used", free: "$database.free"} }
		}
	},
	{ $sort : { date: -1 } },
	function (err, result) {
		_res.send(result);
	});
};

module.exports = {
	init: model,
	insert: insert,
	all: all
};