var Cam = mgl.Cam = function(geo, tex){
	if(!(geo instanceof Geo)) throw 'invalid geo';
	if(!(tex instanceof Tex)) throw 'invalid tex';
	this._geo = geo;
	this._tex = tex;
	this.x = this.y = this.z = 0;
	this._x = this._y = this._z = -1;
	this.rx = this.ry = this.rz = 0;
	this._rx = this._ry = this._rz = -1;
	this.sx = this.sy = this.sz = 0;
	this._sx = this._sy = this._sz = -1;
	this._m = new Matrix();
};
Cam.prototype = map(Dispatcher.prototype);
fn(Cam,
'getMat', function(){
	if(
		this.x == this._x && this.y == this._y && this.z == this._z &&
		this.rx == this._rx && this.ry == this._ry && this.rz == this._rz &&
		this.sx == this._sx && this.sy == this._sy && this.sz == this._sz
	) return this._m;
	return this._m.matIdentity()
		.matScale(this._sx = this.sx, this._sy = this.sy, this._sz = this.sz)
		.matRotateX(this._rx = this.rx).matRotateY(this._ry = this.ry).matRotateZ(this._rz = this.rz)
		.matTranslate(this._x = this.x, this._y = this.y, this._z = this.z);
});