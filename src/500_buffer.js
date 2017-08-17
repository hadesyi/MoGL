var Buffer = (function(){
	var vi, f;
	return function(isDynamic, info, v, index, makeNormal){
		var i, j, k, pos, color, uv, normal, isAlpha;
		this._dynamic = isDynamic;
		if(info == 'index'){
			this._index = new Uint16Array(v);
			this.icount = v.length;
			return;
		}else if(index){
			this._index = new Uint16Array(index);
			this.icount = index.length;
		}
		(vi = (info || 'xyz').split('')).forEach(f || (f = function(v, i){vi[v] = i;}));
		if(vi.hasOwnProperty('x')) pos = [];
		if(vi.hasOwnProperty('n')) normal = [];
		if(vi.hasOwnProperty('u')) uv = [];
		if(vi.hasOwnProperty('r')) color = [], isAlpha = vi.hasOwnProperty('a');
		for(i = 0, j = v.length / vi.length; i < j; i++){
			k = i * vi.length;
			pos && pos.push(v[k+vi.x], v[k+vi.y], v[k+vi.z]);
			normal && normal.push(v[k+vi.n], v[k+vi.m], v[k+vi.o]);
			uv && uv.push(v[k+vi.u], v[k+vi.v]);
			color && color.push(v[k+vi.r], v[k+vi.g], v[k+vi.b], isAlpha ? v[k+vi.a] : 1);
		}
		if(pos) this._pos = new Float32Array(pos);
		if(normal) this._normal = new Float32Array(normal);
		else if(makeNormal && pos && this._index) this._normal = normal = mgl.normal(pos, this._index);
		if(uv) this._uv = new Float32Array(uv);
		if(color) this._color = new Float32Array(color);
		j = (i = uv) ? 2 : (i = pos || normal) ? 3 : (i = color) ? 4 : 0;
		this.count = i.length / j;
	};
})();
fn(Buffer, 
'bind', (function(){
	var size = {pos:3, uv:2, normal:3, color:4};
	var gltype = function(gl, type){
		switch(type){
		case'color':case'pos':case'uv':case'normal':gl[type] = gl.FLOAT; break;
		default:throw 'invalid type';
		}
		return gl[type];
	};
	return function(gl, stride, offset, a, type){
		if(!type) throw 'invaild type';
		gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
		gl.bufferData(gl.ARRAY_BUFFER, this['_' + type], this._dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
		gl.vertexAttribPointer(a, size[type], gl[type] || gltype(gl, type), false, stride, offset);
	};
})(),
'index', function(gl){
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._index, this._dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
},
'pos', (function(){
	var f, pos;
	return function(v){
		if(v){
			pos = this._pos;
			v.forEach(f || (f = function(v, i){if(v !== null) pos[i] = v;}));
		}
		return this._pos;
	};
})(),
'unbind', function(gl){
	if(this._buffer) gl.deleteBuffer(this._buffer);
}
);