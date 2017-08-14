var mgl = (function(W, doc){
	var fn = function(cls){
		var opt = {}, a = arguments, i = 1, j = a.length, v;
		while(i < j) opt[a[i++]] = typeof (v = a[i++]) == 'function' ? {value:v} : v;
		Object.freeze(Object.defineProperties(cls.prototype, opt));
	};
	var map = function(){return Object.create(null);};
	var color = function(v){
		var ret = [];
		if(typeof v == 'string'){
			if(v.charAt(0) != '#') throw 'invalid color';
			if(v.length == 4) {
				v = v.substr(1, 3).split('');
				v = '#' + v[0] + v[0] + v[1] + v[1] + v[2] + v[2];
			}
			ret[0] = parseInt(v.substr(1, 2), 16) / 255,
			ret[1] = parseInt(v.substr(3, 2), 16) / 255,
			ret[2] = parseInt(v.substr(5, 2), 16) / 255;
			ret[3] = v.length > 7 ? parseFloat(v.substr(7)) : 1;
			if(ret[3] > 1) ret[3] = 1;
			else if(ret[3] < 0) ret[3] = 0;
		}else if(v.hasOwnProperty('r')) ret[0] = v.r, ret[1] = v.g, ret[2] = v.b, ret[3] = v.hasOwnProperty('a') ? v.a : 1;
		else if(v instanceof Array) ret[0] = v[0], ret[1] = v[1], ret[2] = v[2], ret[3] = v.length > 3 ? v[3] : 1;
		else throw 'invalid color';
		return ret;
	};
	var glConst = function(gl, v){
		switch(v){
		case'triangles': gl[v] = gl.TRIANGLES; break;
		default:throw 'invalid mode';
		}
		return gl[v];
	};
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
		
		gl.enable(gl.DEPTH_TEST);
	};
	fn(mgl,
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
		'buffer', function(k, isDynamic, info, data, index){
			if(arguments.length > 1){
				this._buffers[k] = new Buffer(isDynamic, info, data, index);
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
			var v;
			if(!this._programs[k]) throw 'no program';
			this._programs[k].uniform(this._gl, uniform);
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
			gl.drawElements(gl[mode] || glConst(gl, mode), this._currentIndex.count, gl.UNSIGNED_SHORT, offset);
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
	'sin,cos,tan'.split(',').forEach(function(v){
		var f;
		mgl[v] = f = function(r){return f[r] || (f[r] = Math[v](r));};
	});
	var PIXEL_RATIO = W.devicePixelRatio;
	var GLMAT_EPSILON = 0.000001, PI = Math.PI, PIH = PI * 0.5, PID = PI * 2, D2R = PI / 180, R2D = 180 / PI;
	var SIN = mgl.sin, COS = mgl.cos, TAN = mgl.tan;
	var ATAN = Math.atan, ATAN2 = Math.atan2, ASIN = Math.asin, CEIL = Math.ceil, ABS = Math.abs;
	var SQRT = function f(r){return r in f ? f[r] : (f[r] = Math.sqrt(r));}; 
	var Matrix = mgl.Matrix = function(){
		this.mat = new Float32Array(16);
		this.matIdentity();
		this.x = this.y = this.z = this.rx = this.ry = this.rz = 0,
		this.sx = this.sy = this.sz = 1;
	};
	fn(Matrix,
		'toMat', function(){
			this.matIdentity()
				.matScale(this.sx, this.sy, this.sz)
				.matRotateX(this.rx).matRotateY(this.ry).matRotateZ(this.rz)
				.matTranslate(this.x, this.y, this.z);
			return this;
		},
		'lookAt', (function(){
			var A = new Float32Array(3), B = new Float32Array(3);
			return function(x, y, z){
				var d, d11, d12, d13, d21, d22, d23, d31, d32, d33, md31, radianX, radianY, radianZ, cosY;
				this.matIdentity();
				A[0] = this.x, A[1] = this.y, A[2] = this.z;
				B[0] = x, B[1] = y, B[2] = z,
				this.matLookAt(A, B, [0, 1, 0]),
				d = this.mat,
				d11 = d[0], d12 = d[1], d13 = d[2],
				d21 = d[4], d22 = d[5], d23 = d[6],
				d31 = d[8], d32 = d[9], d33 = d[10],
				md31 = -d31;
				if(md31 <= -1) radianY = -PIH;
				else if(1 <= md31) radianY = PIH;
				else radianY = ASIN(md31);
				cosY = COS(radianY);
				if(cosY <= 0.001) radianZ = 0, radianX = ATAN2(-d23, d22);
				else radianZ = ATAN2(d21, d11), radianX = ATAN2(d32, d33);
				this.rx = radianX, this.ry = radianY, this.rz = radianZ;
			};
		})(),
		'matIdentity', function(){
			var a = this.mat;
			a[0] = 1, a[1] = 0, a[2] = 0, a[3] = 0, 
			a[4] = 0, a[5] = 1, a[6] = 0, a[7] = 0, 
			a[8] = 0, a[9] = 0, a[10] = 1, a[11] = 0, 
			a[12] = 0, a[13] = 0, a[14] = 0, a[15] = 1;
			return this;
		},
		'matClone', function(){
			var out = new Matrix(), a = this.mat, b = out.mat, i = 16;
			while(i--) b[i] = a[i];
			return out;
		},
		'matCopy', function(to){
			var a = this.mat, b = to.mat, i = 16;
			while(i--) b[0] = a[0];
			return this;
		},
		'matMulti', function(to){
			var a = this.mat, b = to.mat;
			var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], 
				a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], 
				a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], 
				a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
			var b0, b1, b2, b3;
			b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
			a[0] = a00*b0 + a10*b1 + a20*b2 + a30*b3, 
			a[1] = a01*b0 + a11*b1 + a21*b2 + a31*b3, 
			a[2] = a02*b0 + a12*b1 + a22*b2 + a32*b3, 
			a[3] = a03*b0 + a13*b1 + a23*b2 + a33*b3;
			b0 = b[4], b1 = b[5], b2 = b[6], b3 = b[7];
			a[4] = a00*b0 + a10*b1 + a20*b2 + a30*b3;
			a[5] = a01*b0 + a11*b1 + a21*b2 + a31*b3;
			a[6] = a02*b0 + a12*b1 + a22*b2 + a32*b3;
			a[7] = a03*b0 + a13*b1 + a23*b2 + a33*b3,
			b0 = b[8], b1 = b[9], b2 = b[10], b3 = b[11];
			a[8] = a00*b0 + a10*b1 + a20*b2 + a30*b3;
			a[9] = a01*b0 + a11*b1 + a21*b2 + a31*b3;
			a[10] = a02*b0 + a12*b1 + a22*b2 + a32*b3;
			a[11] = a03*b0 + a13*b1 + a23*b2 + a33*b3;
			b0 = b[12], b1 = b[13], b2 = b[14], b3 = b[15];
			a[12] = a00*b0 + a10*b1 + a20*b2 + a30*b3;
			a[13] = a01*b0 + a11*b1 + a21*b2 + a31*b3;
			a[14] = a02*b0 + a12*b1 + a22*b2 + a32*b3;
			a[15] = a03*b0 + a13*b1 + a23*b2 + a33*b3;
			return this;
		},
		'matTranslate', function(x, y, z){
			var a = this.mat;
			a[12] = a[0]*x + a[4]*y + a[8]*z + a[12];
			a[13] = a[1]*x + a[5]*y + a[9]*z + a[13];
			a[14] = a[2]*x + a[6]*y + a[10]*z + a[14];
			a[15] = a[3]*x + a[7]*y + a[11]*z + a[15];
			return this;
		},
		'matScale', function(x, y, z){
			var a = this.mat;
			a[0] = a[0]*x, a[1] = a[1]*x, a[2] = a[2]*x, a[3] = a[3]*x;
			a[4] = a[4]*y, a[5] = a[5]*y, a[6] = a[6]*y, a[7] = a[7]*y; 
			a[8] = a[8]*z, a[9] = a[9]*z, a[10] = a[10]*z, a[11] = a[11]*z;
			a[12] = a[12], a[13] = a[13], a[14] = a[14], a[15] = a[15];
			return this;
		},
		'matRotateX', function(rad){
			var a = this.mat, s = SIN(rad), c = COS(rad);
			var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
			a[4] = a10*c + a20*s, a[5] = a11*c + a21*s, a[6] = a12*c + a22*s, a[7] = a13*c + a23*s;
			a[8] = a20*c - a10*s, a[9] = a21*c - a11*s, a[10] = a22*c - a12*s, a[11] = a23*c - a13*s;
			return this;
		},
		'matRotateY', function(rad){
			var a = this.mat, s = SIN(rad), c = COS(rad);
			var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
			a[0] = a00*c - a20*s, a[1] = a01*c - a21*s, a[2] = a02*c - a22*s, a[3] = a03*c - a23*s;
			a[8] = a00*s + a20*c, a[9] = a01*s + a21*c, a[10] = a02*s + a22*c, a[11] = a03*s + a23*c;
			return this;
		},
		'matRotateZ', function(rad){
			var a = this.mat, s = SIN(rad), c = COS(rad);
			var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
			a[0] = a00*c + a10*s, a[1] = a01*c + a11*s, a[2] = a02*c + a12*s, a[3] = a03*c + a13*s;
			a[4] = a10*c - a00*s, a[5] = a11*c - a01*s, a[6] = a12*c - a02*s, a[7] = a13*c - a03*s;
			return this;
		},
		'matRotate', function(rad, axis){
			var a = this.mat, x = axis[0], y = axis[1], z = axis[2], len = SQRT(x*x + y*y + z*z);
			var s, c, t, a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, b00, b01, b02, b10, b11, b12, b20, b21, b22;
			if(ABS(len) < GLMAT_EPSILON) return null;
			len = 1 / len, x *= len, y *= len, z *= len, s = SIN(rad), c = COS(rad), t = 1 - c;
			a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3]; 
			a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
			a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
			b00 = x*x*t + c, b01 = y*x*t + z*s, b02 = z*x*t - y*s;
			b10 = x*y*t - z*s, b11 = y*y*t + c, b12 = z*y*t + x*s;
			b20 = x*z*t + y*s, b21 = y*z*t - x*s, b22 = z*z*t + c;
			a[0] = a00*b00 + a10*b01 + a20*b02, a[1] = a01*b00 + a11*b01 + a21*b02, a[2] = a02*b00 + a12*b01 + a22*b02;
			a[3] = a03*b00 + a13*b01 + a23*b02, a[4] = a00*b10 + a10*b11 + a20*b12, a[5] = a01*b10 + a11*b11 + a21*b12;
			a[6] = a02*b10 + a12*b11 + a22*b12, a[7] = a03*b10 + a13*b11 + a23*b12, a[8] = a00*b20 + a10*b21 + a20*b22;
			a[9] = a01*b20 + a11*b21 + a21*b22, a[10] = a02*b20 + a12*b21 + a22*b22, a[11] = a03*b20 + a13*b21 + a23*b22;
			if (a !== a) a[12] = a[12], a[13] = a[13], a[14] = a[14], a[15] = a[15];
			return this;
		},
		'frustum', function(a, b, c, d, e, g) {
			var f = this.mat;
			var h = b - a, i = d - c, j = g - e;
			f[0] = e*2 / h, f[1] = 0, f[2] = 0, f[3] = 0;
			f[4] = 0, f[5] = e*2 / i, f[6] = 0, f[7] = 0;
			f[8] = (b + a) / h, f[9] = (d + c) / i, f[10] = -(g + e) / j, f[11] = -1;
			f[12] = 0, f[13] = 0, f[14] = -(g*e*2) / j, f[15] = 0;
			return this;
		},
		'matPerspective', function(fov, aspect, near, far){
			fov = near*TAN(fov*Math.PI / 360);
			aspect = fov*aspect,
			this.frustum(-aspect, aspect, -fov, fov, near, far);
			return this;
		},
		'matLookAt', function(eye, center, up){
			var a = this.mat;
			var x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
			var eyex = eye[0], eyey = eye[1], eyez = eye[2], upx = up[0], upy = up[1], upz = up[2];
			var centerx = center[0], centery = center[1], centerz = center[2];
			if(ABS(eyex - centerx) < GLMAT_EPSILON && ABS(eyey - centery) < GLMAT_EPSILON && ABS(eyez - centerz) < GLMAT_EPSILON) return this.matIdentity();
			z0 = eyex - centerx, z1 = eyey - centery, z2 = eyez - centerz;
			len = 1 / SQRT(z0*z0 + z1*z1 + z2*z2);
			z0 *= len, z1 *= len, z2 *= len;
			x0 = upy*z2 - upz*z1, x1 = upz*z0 - upx*z2, x2 = upx*z1 - upy*z0;
			len = SQRT(x0*x0 + x1*x1 + x2*x2);
			if (!len) x0 = 0, x1 = 0, x2 = 0;
			else len = 1 / len, x0 *= len, x1 *= len, x2 *= len;
			y0 = z1*x2 - z2*x1, y1 = z2*x0 - z0*x2, y2 = z0*x1 - z1*x0;
			len = SQRT(y0*y0 + y1*y1 + y2*y2);
			if (!len) y0 = 0, y1 = 0, y2 = 0;
			else len = 1 / len, y0 *= len, y1 *= len, y2 *= len;
			a[0] = x0, a[1] = y0, a[2] = z0, a[3] = 0;
			a[4] = x1, a[5] = y1, a[6] = z1, a[7] = 0;
			a[8] = x2, a[9] = y2, a[10] = z2, a[11] = 0;
			a[12] = -(x0*eyex + x1*eyey + x2*eyez), a[13] = -(y0*eyex + y1*eyey + y2*eyez);
			a[14] = -(z0*eyex + z1*eyey + z2*eyez), a[15] = 1;
			return this;
		}
	);
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
				if(!gl.getProgramParameter(v, gl.LINK_STATUS)) throw 'program link fail';
			}
			gl.useProgram(v);
			return v;
		},
		'attr', function(gl, buffer, attr, stride, offset){
			var a, k;
			if(!this._program) throw 'before use Program';
			if(!(buffer instanceof Buffer)) throw 'invalid Buffer';
			if(typeof attr == 'string') a = {}, a[attr] = 'pos', attr = a;
			for(k in attr) if(attr.hasOwnProperty(k)){
				a = gl.getAttribLocation(this._program, k);
				gl.enableVertexAttribArray(a);
				buffer.bind(gl, stride || 0, offset || 0, a, attr[k]);
			}
		},
		'uniform', function(gl, uniform){
			var u, k, v;
			if(!this._program) throw 'before use Program';
			if(!uniform) throw 'invalid uniform';
			for(k in uniform) if(uniform.hasOwnProperty(k)){
				u = gl.getUniformLocation(this._program, k);
				v = uniform[k];
				switch(true){
				case v instanceof Matrix: gl.uniformMatrix4fv(u, false, v.mat); break;
				case v instanceof Float32Array:case v instanceof Float64Array:
					switch(v.length){
					case 1: gl.uniform1fv(u, v); break;
					case 2: gl.uniform2fv(u, v); break;
					case 3: gl.uniform3fv(u, v); break;
					case 4: gl.uniform4fv(u, v);
					default:throw 'invalid type';
					}
					break;
				case v instanceof Uint8Array:case v instanceof Int8Array:
				case v instanceof Uint16Array:case v instanceof Int16Array:
				case v instanceof Uint32Array:case v instanceof Int32Array:
					switch(v.length){
					case 1: gl.uniform1iv(u, v); break;
					case 2: gl.uniform2iv(u, v); break;
					case 3: gl.uniform3iv(u, v); break;
					case 4: gl.uniform4iv(u, v);
					default:throw 'invalid type';
					}
					break;
				default:throw 'invalid type';
				}
			}
		}
	);
	var Buffer = (function(){
		var vi, f;
		return function(isDynamic, info, v){
			var i, j, k, pos, color, uv, normal, isAlpha;
			this._dynamic = isDynamic;
			if(info == 'index'){
				this._pos = new Uint16Array(v);
				this.count = this._pos.length;
				return;
			}
			(vi = (info || 'xyz').split('')).forEach(f || (f = function(v, i){vi[v] = i;}));
			if(vi.hasOwnProperty('x')) pos = [];
			if(vi.hasOwnProperty('nx')) normal = [], this._isNormal = true;
			if(vi.hasOwnProperty('u')) uv = [];
			if(vi.hasOwnProperty('r')) color = [], isAlpha = vi.hasOwnProperty('a');
			for(i = 0, j = v.length / vi.length; i < j; i++){
				k = i * vi.length;
				pos && pos.push(v[k+vi.x], v[k+vi.y], v[k+vi.z]);
				normal && normal.push(v[k+vi.nx], v[k+vi.ny], v[k+vi.nz]);
				uv && uv.push(v[k+vi.u], v[k+vi.v]);
				color && color.push(v[k+vi.r], v[k+vi.g], v[k+vi.b], isAlpha ? v[k+vi.a] : 1);
			}
			if(pos) this._pos = new Float32Array(pos);
			if(normal) this._normal = new Float32Array(normal);
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
				gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer = gl.createBuffer());
				gl.bufferData(gl.ARRAY_BUFFER, this['_' + type], this._dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
				console.log(type, size[type], this.count, this['_' + type].length)
				gl.vertexAttribPointer(a, size[type], gl[type] || gltype(gl, type), type == 'normal', stride, offset);
			};
		})(),
		'index', function(gl){
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffer = gl.createBuffer());
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._pos, this._dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
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
	return mgl;
})(this, document);
