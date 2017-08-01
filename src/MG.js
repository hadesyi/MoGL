var cls = function(name, p, c, proto){
	var f, pfn, fn, psup, id = 2;
	if(typeof p == 'string') p = cls.classes[p];
	p = p || MG, pfn = p.prototype, psup = pfn.super;
	cls.classes[name] = f = function(){c.apply(this, arguments);}, fn = f.prototype = Object.create(pfn);
	f._mId = id++;
	Object.keys(proto).forEach(function(k){
		var f = proto[k];
		if(typeof f == 'function') fn[k] = f;
		else Object.defineProperty(fn, k, f);
	});
	fn.super = Object.keys(pfn).reduce(function(p, c){
		var f = pfn[c];
		if(c != 'super') p[c] = function(){return f.apply(this, arguments);};
		return p;
	}, function(){
		this.super = psup;
		p.apply(this, arguments);
		delete this.super;
	});
	return f;
};
cls.classes = {};
var GLMAT_EPSILON = 0.000001;
var ATAN = Math.atan, ATAN2 = Math.atan2, ASIN = Math.asin;
var SIN = function f(r){return r in f ? f[r] : (f[r] = Math.sin(r));};
var COS = function f(r){return r in f ? f[r] : (f[r] = Math.cos(r));};
var TAN = function f(r){return r in f ? f[r] : (f[r] = Math.tan(r));};
var SQRT = function f(r){return r in f ? f[r] : (f[r] = Math.sqrt(r));}; 
var CEIL = Math.ceil, ABS = Math.abs, PI = Math.PI, PIH = PI * 0.5, PID = PI * 2, D2R = PI / 180, R2D = 180 / PI;
var COLOR = function(v){
	var ret = [0, 0, 0, 1];
	if(typeof v == 'string' && v.charAt(0) == '#'){
		if(v.length == 4) v = '#'+v[1]+v[1]+v[2]+v[2]+v[3]+v[3];
		ret[0] = parseInt(v.substr(1, 2), 16) / 255,
		ret[1] = parseInt(v.substr(3, 2), 16) / 255,
		ret[2] = parseInt(v.substr(5, 2), 16) / 255;
		if(v.length > 7){
			ret[3] = parseFloat(v.substr(7));
			if(ret[3] > 1) ret[3] = 1;
		}
	}else if('r' in v) ret[0] = v.r, ret[1] = v.g, ret[2] = v.b, ret[3] = 'a' in v ? v.a : 1;
	else ret[0] = v[0], ret[1] = v[1], ret[2] = v[2], ret[3] = '3' in v ? v[3] : 1;
	return ret;
};
var MG = (function(){
	var id = 1, MG = function(){
		this._mId = id++;
		this._mClsId = this.constructor._id;
	}, fn = MG.prototype;
	fn.toString = function(){
		return this._mClsId + '_' + this._mId;
	};
	fn.listen = function(e){
		const ev = this._mEv;
		if(ev && ev.length) this.notify(e);
	};
	fn.addListener = function(type, target){
		var ev;
		if(typeof target != 'function' && !target.listen) throw 'invalid listener:' + target;
		ev = this._mEv || (this._mEv = []);
		if(ev.indexOf(target) == -1){
			target._mType = type;
			ev.push(target);
		}
	};
	fn.removeListener = function(target){
		var ev = this._mEv, i;
		if(!ev || !ev.length) return;
		if(typeof target == 'string'){
			i = ev.length;
			while(i--) if(ev._mType == target) ev.splice(i, 1);
		}else if((i = ev.indexOf(target)) != -1) ev.splice(i, 1);
	};
	fn.notify = function f(type, e){
		const ev = this._mEv;
		if(!ev || !ev.length) return;
		f._fe.type = type, f._fe.e = e;
		ev.forEach(f._fe);
	};
	fn.notify._fe = function f(v){if(v._mType == f.type) typeof v == 'function' ? v(f.e) : v.listen(f.e);};
	fn.observable = function(k, listener){
		var p = this._mProp || (this._mProp = {});
		if(k in p) return;
		Object.defineProperty(this, k, {
			get:function(){return p[k];},
			set:function(v){
				p[k] = v;
				typeof listener == 'function' ? listener(k, v) : listener.listen(k, v);
			}
		});
	};
	(function(fn){
		var shared = {};
		fn.shared = function(k){
			var p = shared[this._mClsId] || (shared[this._mClsId] = {});
			p = p[k] || (p[k] = {});
			Object.defineProperty(this, k, {
				get:function(){return p[this._mId];},
				set:function(v){p[this._mId] = v;}
			});
			if(arguments.length == 2) p[this._mId] = arguments[1];
		};
	})(fn);
	Object.freeze(fn);
	Object.defineProperty(MG, 'shared', {get:function(cls, k){return shared[cls._mId][k];}});
	MG.cls = cls;
	'vbo,vcbo,vnbo,uvbo,ibo'.split(',').forEach(function(k1){
		var k2 = k1.toUpperCase();
		MG['make' + k2] = function(gpu, geo, data, stribe){
			var gl = gpu.gl, buffer = gpu[k1][geo];
			if(buffer) return;
			if(Array.isArray(data)) data = new Float32Array(data);

			var buffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
			gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
			buffer.data = data;
			buffer.stride = stribe;
			buffer.numItem = data.length / stribe;
			gl.bindBuffer(gl.ARRAY_BUFFER, null);
			buffer.name = geo;
			buffer.type = k2;
			gpu[k1][geo] = buffer;
		};
	});
	MG.makeProgram = function(gpu, name, vSource, fSource){
		var gl = gpu.gl, vShader, fShader, program, i, len, tList;
		vShader = gl.createShader(gl.VERTEX_SHADER), fShader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(vShader, vSource.shaderStr), gl.compileShader(vShader);
		gl.shaderSource(fShader, fSource.shaderStr), gl.compileShader(fShader);

		program = gl.createProgram();
		gl.attachShader(program, vShader), gl.attachShader(program, fShader);
		gl.linkProgram(program);
		vShader.name = vSource.id, fShader.name = fSource.id, program.name = name;
		if(!gl.getProgramParameter(program, gl.LINK_STATUS)) throw 'fail to initialize program';
		gl.useProgram(program);

		tList = vSource.attributes;
		for(i = 0, len = tList.length; i < len; i++){
			gl.bindBuffer(gl.ARRAY_BUFFER, gpu.vbo['null']),
			gl.enableVertexAttribArray(program[tList[i]] = gl.getAttribLocation(program, tList[i])),
			gl.vertexAttribPointer(program[tList[i]], gpu.vbo['null'].stride, gl.FLOAT, false, 0, 0),
			gl.bindBuffer(gl.ARRAY_BUFFER, null);
		}

		tList = vSource.uniforms, i = tList.length;
		while(i--) program[tList[i]] = gl.getUniformLocation(program, tList[i]);

		tList = fSource.uniforms, i = tList.length;
		while (i--) program[tList[i]] = gl.getUniformLocation(program, tList[i]);
		gpu.programs[name] = program;
	};
	MG.makeTexture = function(gpu, texture){
		var gl = gpu.gl, glTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, glTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.img);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.generateMipmap(gl.TEXTURE_2D);
		glTexture.textrue = texture;
		gpu.textures[texture] = glTexture;
		gl.bindTexture(gl.TEXTURE_2D, null);
	};
	MG.makeFrameBuffer = function(gpu, camera, cvs){
		var gl = gpu.gl, texture, fBuffer, rBuffer, tArea, cvsW, cvsH, pRatio;
		if(!cvs) return;
		cvsW = cvs.width, cvsH = cvs.height, pRatio = window.devicePixelRatio;
		tArea = camera.renderArea ? camera.renderArea : [0, 0, cvsW, cvsH];
		fBuffer = gl.createFramebuffer();
		fBuffer.x = tArea[0], fBuffer.y = tArea[1];
		fBuffer.width = Math.min(tArea[2] * pRatio, cvsW);
		fBuffer.height = Math.min(tArea[3] * pRatio, cvsH);
		gl.bindFramebuffer(gl.FRAMEBUFFER, fBuffer);
		texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, fBuffer.width, fBuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

		rBuffer = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, rBuffer);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, fBuffer.width, fBuffer.height);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rBuffer);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gpu.framebuffers[camera] = {frameBuffer:fBuffer, texture:texture};
	};
	MG.vertexShaderParser = function(source){
		var i, temp, str, resultObject, code;
		code = source.code;
		resultObject = {id:code.id, shaderStr: null, uniforms: [], attributes: []};
		str = "", temp = code.attributes, i = temp.length;
		while(i--){
			str += 'attribute ' + temp[i] + ';\n',
			resultObject.attributes.push(temp[i].split(' ')[1]);
		}
		temp = code.uniforms, i = temp.length;
		while(i--){
			str += 'uniform ' + temp[i] + ';\n',
			resultObject.uniforms.push(temp[i].split(' ')[1]);
		}
		temp = code.varyings, i = temp.length;
		while(i--) str += 'varying ' + temp[i] + ';\n';
		resultObject.shaderStr = str + VertexShader.baseFunction + 'void main(void){\n' + code.main + ';\n}';
		return resultObject;
	};
	MG.fragmentShaderParser = function(source){
		var i, temp, str, resultObject, code;
		code = source.code;
		resultObject = {id:code.id, shaderStr:null, uniforms:[]};
		str = 'precision ' + (code.precision ? code.precision : mediump float) + ';\n';
		temp = code.uniforms, i = temp.length;
		while(i--){
			str += 'uniform ' + temp[i] + ';\n',
			resultObject.uniforms.push(temp[i].split(' ')[1]);
		}
		temp = code.varyings, i = temp.length;
		while(i--) str += 'varying ' + temp[i] + ';\n';
		resultObject.shaderStr = str + 'void main(void){\n' + code.main + ';\n}';
		return resultObject;
	};
	return Object.freeze(MG);
})();