var mgl = (function(W, doc){
	var fn = function(cls){
		var opt = {}, a = arguments, i = 1, j = a.length, v;
		while(i < j) opt[a[i++]] = typeof (v = a[i++]) == 'function' ? {value:v} : v;
		Object.freeze(Object.defineProperties(cls.prototype, opt));
	};
	var map = function(){return Object.create(null);};
	var mgl = function(c, opt){
		var ctx;
		opt = opt || mgl._ctxSetting;
		this._c = typeof c == 'string' ? c = doc.getElementById(c) : c;
		if(mgl._ctx) this._gl = c.getContext(mgl._ctx, opt);
		else 'experimental-webgl,webgl,webkit-3d,moz-webgl,3d'.split(',').some(function(v){
			return ctx = c.getContext(mgl._ctx = v, opt);
		});
		if(!ctx) throw 'webgl disable';
		this._gl = ctx;
		this._programs = map();
		this._buffers = map();
	};
	fn(mgl,
		'buffer', function(k){
			if(arguments.length > 1){
				this._buffers[k] = new Buffer(arguments);
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
		'attr', function(k, attr, buf){
			var v;
			if(!this._programs[k]) throw 'no program';
			this._programs[k].attr(this._gl, attr, v = this._buffers[buf]);
			this._count = v.count;
			return this;
		},
		'drawArray', function(mode, start, count){
			var g = this._gl, v;
			start = start || 0, count = count || this._count;
			v = this._count - start;
			if(count > v) count = v;
			g.drawArrays(g[(mode || 'triangles').toUpperCase()], start, count);
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
	var Shader = function(v, type){
		this._code = v;
		this._type = type;
	};
	fn(Shader,
		'shader', function(gl){
			var v = this._shader;
			if(!v){
				this._shader = v = gl.createShader(this._type == 'vertex' ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER);
				gl.shaderSource(v, this._code);
				gl.compileShader(v);
			}
			if(!gl.getShaderParameter(v, gl.COMPILE_STATUS)) throw this._type + gl.getShaderInfoLog(v);
			return v;
		}
	);
	var Program = function(vs, fs){
		this._v = new Shader(vs, 'vertex');
		this._f = new Shader(fs, 'fragment');
	};
	fn(Program,
		'use', function(gl){
			var v = this._program;
			if(!v){
				this._program = v = gl.createProgram();
				gl.attachShader(v, this._v.shader(gl));
				gl.attachShader(v, this._f.shader(gl));
				gl.linkProgram(v);
			}
			gl.useProgram(v);
			return v;
		},
		'attr', function(gl, attr, buffer){
			var a;
			if(!this._program) throw 'before use Program';
			if(!(buffer instanceof Buffer)) throw 'invalid Buffer';
			a = gl.getAttribLocation(this._program, attr);
			gl.enableVertexAttribArray(a);
			buffer.bind(gl, a);
		}
	);
	var Buffer = (function(){
		var prop = ',,_size,_type,_normal,_stride,_offset'.split(',');
		var f = function(v, i){if(i) self[v] = a[i] || def[i];}
		var def = [null, null, 3, 'FLOAT', false, 0, 0];
		var self, a;
		return function(arg){
			this._data = arg[1];
			self = this, a = arg;
			prop.forEach(f);
			this.count = this._data.length / this._size;
		};
	})();
	fn(Buffer, 
		'bind', function(gl, attr){
			var v;
			v = this._buffer || (this._buffer = gl.createBuffer());
			gl.bindBuffer(gl.ARRAY_BUFFER, v);
			gl.bufferData(gl.ARRAY_BUFFER, this._data, gl.STATIC_DRAW);
			gl.vertexAttribPointer(attr, this._size, gl[this._type], this._normal, this._stride, this._offset);
		},
		'unbind', function(gl){
			if(this._buffer) gl.deleteBuffer(this._buffer);
		}
	);
	return mgl;
})(this, document);