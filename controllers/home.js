var getInfo = function (_os,_res) {
	var data =  new Object();

	data.hostname = _os.hostname();
	data.arch     = _os.arch();
	data.cpu      = _os.cpus();
	data.network  = _os.networkInterfaces();

	_res.send(data);
};

module.exports = {
	info: getInfo
};