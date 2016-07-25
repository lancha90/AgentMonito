// Constante de respuesta cuando una inserción resulta vacia
const INSERT_NULL = '000';
// Constante de respuesta cuando una inserción resulto existosa
const INSERT_OK = '200';
// Constante de respuesta cuando una inserción resulto erronea
const INSERT_ERROR = '400';

var filesystemSchema;
var mongoose;
var io;

var model = function (_mongoose,_io) {
	mongoose = _mongoose;
	io = _io;

	filesystemSchema = mongoose.Schema({
	    filesystem: String,
	    size: String, 
	    used: String,
	    avail: String,
	    capacity: String,
	    iused: String,
	    ifree: String,
	    pused: String,
	    mounted_on: String,
	    date: { type: Date, default: Date.now },
	    meta: { timestamp: { type: Date, default: Date.now } }
	});	
};

/**
 * Función para insertar un registro proveniente del api rest
 */
var api_insert = function (_req,_res) {
	var toInsert = {filesystem: _req.body.filesystem,size: _req.body.size,used: _req.body.used,avail: _req.body.avail,capacity: _req.body.capacity,iused: _req.body.iused,ifree: _req.body.ifree,pused: _req.body.pused,mounted_on: _req.body.mounted_on};
	
	insert(toInsert,function (toReturn) {
		if (toReturn) {
			switch(toReturn.state) {
				case INSERT_ERROR:
					_res.send(toReturn.message);
				break;
				case INSERT_OK:
					io.broadcast('filesystem',toReturn.message);
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
	var Filesystem = mongoose.model('Filesystem', filesystemSchema);
	var row = new Filesystem(_object);

	row.save(function (err, fluffy) {
		if (err){
			_callback({state: INSERT_ERROR, message: err});
		}else{
			_callback({state: INSERT_OK, message: row});
		}
	});
};

var all = function (_req,_res) {
	var Filesystem = mongoose.model('Filesystem', filesystemSchema);

	Filesystem.aggregate({
		$group : {
			_id : {filesystem: '$filesystem', size: '$size'},
			information : { $addToSet : { date: "$meta.timestamp", pused: "$pused"} }
		}
	},
	function (err, result) {
		_res.send(result);
	});
};

var chart = function (_req,_res) {
	var Filesystem = mongoose.model('Filesystem', filesystemSchema);
	
	Filesystem.aggregate({
		$group : {
			_id : {filesystem: '$filesystem', size: '$size', mounted_on: '$mounted_on'},
			information : { $last : { date: "$meta.timestamp", pused: "$pused"} }
		}
	},
	{ $sort : { date: -1 } },
	function(err, result) {
		_res.send(result);
	});
}

var _all = function (_req,_res) {
	var Filesystem = mongoose.model('Filesystem', filesystemSchema);
	
	if (_req.query.type && _req.query.type != 0) {
		Filesystem.find({type:_req.query.type}).sort('filesystem').limit(200).exec(function (err, docs) {
			_res.header("Access-Control-Allow-Origin",_req.headers.origin);
			_res.send(docs);
		});
	} else {
		Filesystem.find({}).sort('filesystem').limit(100).exec(function (err, docs) {
			_res.header("Access-Control-Allow-Origin",_req.headers.origin);
			_res.send(docs);
		});
	}
};

module.exports = {
	init: model,
	chart: chart,
	add: api_insert,
	insert: insert,
	all: all
};