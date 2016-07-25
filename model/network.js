// Constante de respuesta cuando una inserción resulta vacia
const INSERT_NULL = '000';
// Constante de respuesta cuando una inserción resulto existosa
const INSERT_OK = '200';
// Constante de respuesta cuando una inserción resulto erronea
const INSERT_ERROR = '400';

var networkSchema;
var mongoose;
var io;

var model = function (_mongoose,_io) {
	mongoose = _mongoose;
	io = _io;

	networkSchema = mongoose.Schema({
	    ip: String,
	    bytes: String, 
	    ttl: String,
	    time: String,
	    date: { type: Date, default: Date.now },
	    meta: { timestamp: { type: Date, default: Date.now } }
	});	
};

/**
 * Función para insertar un registro proveniente del api rest
 */
var api_insert = function (_req,_res) {
	var toInsert = {Network: _req.body.Network,size: _req.body.size,used: _req.body.used,avail: _req.body.avail,capacity: _req.body.capacity,iused: _req.body.iused,ifree: _req.body.ifree,pused: _req.body.pused,mounted_on: _req.body.mounted_on};
	
	insert(toInsert,function (toReturn) {
		if (toReturn) {
			switch(toReturn.state) {
				case INSERT_ERROR:
			  		_res.send(toReturn.message);
					break;
				case INSERT_OK:
					io.broadcast('Network',toReturn.message);
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
	var Network = mongoose.model('Network', networkSchema);
	var row = new Network(_object);

	row.save(function (err, fluffy) {
		if (err) {
			_callback({state: INSERT_ERROR, message: err});
		} else {
			_callback({state: INSERT_OK, message: row});
		}
	});
};

var all = function (_req,_res) {
	_res.header("Access-Control-Allow-Origin",_req.headers.origin);
	var Network = mongoose.model('Network', networkSchema);

	Network.aggregate({
		$sort:{'date':-1}
	},
	{
		$limit:100
	},
	{ 
		$group : {
			_id : {ip: '$ip'},
			information : { $addToSet: {date: "$date", time: "$time"}}
		}
	},
	function (err, result) {
		_res.send(result);
	});
};

var _all = function (_req,_res) {
	var Network = mongoose.model('Network', networkSchema);

	if (_req.query.ip && _req.query.ip != 0) {
		Network.find({ip:_req.query.ip}).sort('date').limit(200).exec(function (err, docs) {
			_res.header("Access-Control-Allow-Origin",_req.headers.origin);
			_res.send(docs);
		});
	} else {
		Network.find({}).select('date ip byte ttl time').sort({date: 'desc'}).limit(100).exec(function (err, docs) {
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