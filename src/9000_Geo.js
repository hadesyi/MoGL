var Geometry = mgl.Geometry = function(info, vtx, idx){
	if(info.indexOf('xyz') == -1) throw 'vertex must have xyz';
	if(!(vtx instanceof Array)) throw 'invalid vertex';
	if(!(idx instanceof Array)) throw 'invalid index';
	this._info = info;
	this._vtx = vtx;
	this._idx = idx;
	this._isDynamic = false;
	this._buffer = null;
};
fn(Geometry, 
'buffer', {
	get:function(){
		var buf = this._buffer;
		if(!buf) this._buffer = buf = new Buffer(this._isDynamic, this._info, this._vtx, this._idx, true);
		else buf._isDynamic = this._isDynamic;
		return buf;
	}
},
'isDynamic', {
	get:function(){return this._isDynamic;},
	set:function(v){this._isDynamic = v ? true : false;}
}
);