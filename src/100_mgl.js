var mgl = function(c, opt){
	var gl;
	opt = opt || mgl._ctxSetting;
	this._c = typeof c == 'string' ? (c = doc.getElementById(c)) : c;
	this._w = c.width, this._h = c.height;
	if(mgl._ctx) gl = c.getContext(mgl._ctx, opt);
	else 'experimental-webgl,webgl,webkit-3d,moz-webgl,3d'.split(',').some(function(v){
		return gl = c.getContext(mgl._ctx = v, opt);
	});
	if(!gl) throw 'webgl disable';
	this._gl = gl;
	this._programs = map();
	this._buffers = map();
	this.bg([0,0,0,0]);

	this.depth('less');
	this.blend('src_alpha', 'one_minus_src_alpha');
	this.culling('front');
};
fn(mgl,
'depth', function(c){
	var gl = this._gl;
	if(c){
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl[c] || glConst(gl, c));
	}else gl.disable(gl.DEPTH_TEST);
	return this;
},
'blend', function(s, d){
	var gl = this._gl;
	if(s){
		gl.enable(gl.BLEND);
		gl.blendFunc(gl[s] || glConst(gl, s), gl[d] || glConst(gl, d));
	}else gl.disable(gl.BLEND);
	return this;
},
'scissor', function(c){
	var gl = this._gl;
	if(c){
		gl.enable(gl.SCISSOR_TEST);
		gl.scissor(0, 0, this._w, this._h);
	}else gl.disable(gl.SCISSOR_TEST);
	return this;
},
'culling', function(c){
	var gl = this._gl;
	if(c){
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl[c] || glConst(gl, c));
		gl.frontFace(c == 'front' ? gl.CW : gl.CCW);
	}else gl.disable(gl.CULL_FACE);
	return this;
},
'bg', function(c){
	this._bg = c = color(c);
	this._gl.clearColor(c[0], c[1], c[2], c[3]);
	return this;
},
'viewport', function(w, h){
	this._gl.viewport(w || this._w, h || this._h);
},
'clear', function(c){
	var gl = this._gl;
	if(c) this.bg(c);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	return this;
},
'buffer', function(k, isDynamic, info, data, index, makeNormal){
	if(arguments.length > 1){
		this._buffers[k] = isDynamic instanceof Buffer ? isDynamic : new Buffer(isDynamic, info, data, index, makeNormal);
		return this;
	}else return this._buffers[k];
},
'program', function(k, vs, fs){
	var ret;
	if(vs && fs){
		this._programs[k] = new Program(vs, fs);
		ret = this;
	}else{
		if(!this._programs[k]) throw 'no program';
		ret = this._programs[k];
	}
	this._programs[k].use(this._gl);
	return ret;
},
'uniform', function(k, uniform){
	if(!this._programs[k]) throw 'no program';
	this._programs[k].uniform(this._gl, uniform);
	return this;
},
'texture', function(k, tex){
	if(!this._programs[k]) throw 'no program';
	this._programs[k].texture(this._gl, tex);
	return this;
},
'attr', function(k, buf, attr, stride, offset){
	var v;
	if(!this._programs[k]) throw 'no program';
	this._programs[k].attr(this._gl, v = this._buffers[buf], attr, stride, offset);
	this._currentBuffer = v;
	return this;
},
'index', function(k, buf){
	if(!this._programs[k]) throw 'no program';
	(this._currentIndex = this._buffers[buf]).index(this._gl);
	return this;
},
'drawArray', function(mode, start, count){
	var gl = this._gl, c = this._currentBuffer.count, v;
	start = start || 0, count = count || c;
	v = c - start;
	if(count > v) count = v;
	gl.drawArrays(gl[mode] || glConst(gl, mode), start, count);
	return this;
},
'drawElement', function(mode, offset){
	var gl = this._gl, v;
	gl.drawElements(gl[mode] || glConst(gl, mode), this._currentIndex.icount, gl.UNSIGNED_SHORT, offset);
	return this;
}
);
mgl._ctxSetting = {
	alpha: true,
	depth: true,
	stencil: false,
	antialias: true,
	premultipliedAlpha: true,
	preserveDrawingBuffer: false
};
mgl.sin = SIN, mgl.cos = COS, mgl.tan = TAN;
mgl.normal = (function(){
	var v1, v2;
	v1 = {x:0, y:0, z:0}, v2 = {x:0, y:0, z:0};
	return function(pos, idx){
		var a = [], i, j, k, l;
		if(pos instanceof Buffer) pos = pos._pos;
		if(idx instanceof Buffer) idx = idx._index;
		for(i = 0, j = pos.length; i < j; i++) a[i] = 0;
		for(i = 0, j = idx.length; i < j; i += 3){
			k = 3*idx[i + 1], l = 3*idx[i];
			v1.x = pos[k] - pos[l];
			v1.y = pos[k + 1] - pos[l + 1];
			v1.z = pos[k + 2] - pos[l + 2];
			l = 3 * idx[i + 2];
			v2.x = pos[l] - pos[k];
			v2.y = pos[l + 1] - pos[k + 1];
			v2.z = pos[l + 2] - pos[k + 2];
			for(k = 0; k < 3; k++){
				l = 3*idx[i + k],
				a[l] += v1.y*v2.z - v1.z*v2.y;
				a[l + 1] += v1.z*v2.x - v1.x*v2.z;
				a[l + 2] += v1.x*v2.y - v1.y*v2.x;
			}
		}
		for(i = 0, j = pos.length; i < j; i += 3){
			v1.x = a[i], v1.y = a[i + 1], v1.z = a[i + 2];
			k = SQRT(v1.x*v1.x + v1.y*v1.y + v1.z*v1.z) || GLMAT_EPSILON;
			a[i] = v1.x / k, a[i + 1] = v1.y / k, a[i + 2] = v1.z / k;
		}
		return a;
	};
})();