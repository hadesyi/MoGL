var Scene = mgl.Scene = function(){
	this.super();
	this._group = map();
	this._keys = map();
	this._cams = map();
};
Scene.prototype = map(Dispatcher.prototype);
fn(Scene,
'isUpdate',{
	get:(function(){
		var f = function(v){return v.isUpdate;};
		return function(){
			var k, g = this._group;
			for(k in g) if(g[k].some(f)) return true;
			return false;
		};
	})()
},
'addMesh',function(key, mesh){
	var g;
	is(mesh, Mesh, 'invalid mesh');
	g = this._group[mesh.tex.id] || (this._group[mesh.tex.id] = []);
	if(g.indexOf(mesh) > -1) throw 'exist mesh';
	g.push(mesh);
	if(key) this._keys[key] = mesh, mesh.key = key;
},
'removeMesh',function(v){
	var mesh, g = this._group;
	if(typeof v == 'string'){
		mesh = this._keys[v];
		if(!mesh) return;
		delete this._keys[v];
		g = g[mesh.tex.id];
	}else if(v instanceof Mesh){
		if(v.key) delete this._keys[v.key];
		g = g[v.tex.id];
	}
	if(g) g.splice(g.indexOf(mesh), 1);
},
'getMesh',function(v){
	var g;
	if(typeof v == 'string') return this._keys[v];
	is(v, Mesh, 'invalid mesh');
	if(v.key) return this._keys[v.key] ? v : null;
	g = this._group[v.tex.id];
	return g.indexOf(v) > -1 ? v : null;
},
'addCam',function(k, cam){
	is(cam, Cam, 'invalid camera');
	this._cams[k] = cam;
},
'removeCam',function(k){
	delete this._cams[k];
});