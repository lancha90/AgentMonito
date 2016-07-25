// Constante de respuesta cuando una inserción resulta vacia
const INSERT_NULL = '000';
// Constante de respuesta cuando una inserción resulto existosa
const INSERT_OK = '200';
// Constante de respuesta cuando una inserción resulto erronea
const INSERT_ERROR = '400';

var nodeSchema;
var mongoose;
var io;

var model = function(_mongoose,_io){
	mongoose = _mongoose;
	io = _io;

	nodeSchema = mongoose.Schema({
	    serverName: String,
	    serverState: String,
	    serverHealth: String,
		threadPoolSize: String,
		threadActive: String,
		threadHogging: String,
		threadStuck: String,
		throughput: String,	    
	    date: { type: Date, default: Date.now },
	    meta: { timestamp: { type: Date, default: Date.now } }
	});	
};

/**
* Función para insertar un objeto en la base de datos
*/
var insert = function (_object,_callback) {
	var Node = mongoose.model('Node', nodeSchema);
	var row = new Node(_object);

	row.save(function (err, fluffy) {
		if (err) {
			_callback({state: INSERT_ERROR, message: err});
		} else {
			_callback({state: INSERT_OK, message: row});
		}
	});
};

var all = function (_req,_res) {
	var Node = mongoose.model('Node', nodeSchema);
	if (_req.query.serverName && _req.query.serverName != 0) {
		Node.find({serverName:_req.query.serverName}).sort('date').limit(200).exec(function (err, docs) {
			_res.header("Access-Control-Allow-Origin",_req.headers.origin);
			_res.send(docs);
		});
	} else {
		Node.find({}).select('serverName serverHealth serverState threadPoolSize threadActive threadHogging threadStuck throughput date').sort({date: 'desc'}).limit(100).exec(function (err, docs) {
			_res.header("Access-Control-Allow-Origin",_req.headers.origin);
			_res.send(docs);
		});
	};
};

var getServerInformation = function (_req,_res) {
	var Node = mongoose.model('Node', nodeSchema);
	
	Node.find({serverName:_req.query.name}).sort( { date: -1 }).limit(200).exec(function (err, docs) {
		_res.header("Access-Control-Allow-Origin",_req.headers.origin);
		_res.send(docs);
	});
};

var serversName = function (_callback) {
	var Node = mongoose.model('Node', nodeSchema);
	
	Node.aggregate({
		$group: {_id : { serverName : '$serverName' } },
	},
	function(err, result) {
		_callback(result)
	});
};

var serversNameList = function (_req,_res) {
	var Node = mongoose.model('Node', nodeSchema);
	Node.find({
		serverName:_req.query.name
	}).sort({
		date: -1
	}).limit(100).exec(function (err, docs) {
		_res.header("Access-Control-Allow-Origin",_req.headers.origin);
		_res.send(docs);
	});
};

module.exports = {
	init: model,
	insert: insert,
	all: all,
	serversName:serversName,
	serverList: serversNameList,
	serverInfo:getServerInformation
};