var cls = function(name, p, c, proto){
	var f, pfn, fn, psup, id = 2;
	if(typeof p === 'string') p = cls.classes[p];
	p = p || MG, pfn = p.prototype, psup = pfn.super;
	cls.classes[name] = f = function(){c.apply(this, arguments);}, fn = f.prototype = Object.create(pfn);
	f._mId = id++;
	Object.keys(proto).forEach(function(k){
		var f = proto[k];
		if(typeof f === 'function') fn[k] = f;
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
var PIXEL_RATIO = window.devicePixelRatio;
var GLMAT_EPSILON = 0.000001;
var ATAN = Math.atan, ATAN2 = Math.atan2, ASIN = Math.asin;
var SIN = function f(r){return r in f ? f[r] : (f[r] = Math.sin(r));};
var COS = function f(r){return r in f ? f[r] : (f[r] = Math.cos(r));};
var TAN = function f(r){return r in f ? f[r] : (f[r] = Math.tan(r));};
var SQRT = function f(r){return r in f ? f[r] : (f[r] = Math.sqrt(r));}; 
var CEIL = Math.ceil, ABS = Math.abs, PI = Math.PI, PIH = PI * 0.5, PID = PI * 2, D2R = PI / 180, R2D = 180 / PI;
var COLOR = function(v){
	var ret = [0, 0, 0, 1];
	if(typeof v === 'string' && v.charAt(0) === '#'){
		if(v.length === 4) v = '#'+v[1]+v[1]+v[2]+v[2]+v[3]+v[3];
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
		if(typeof target !== 'function' && !target.listen) throw 'invalid listener:' + target;
		ev = this._mEv || (this._mEv = []);
		if(ev.indexOf(target) === -1){
			target._mType = type;
			ev.push(target);
		}
	};
	fn.removeListener = function(target){
		var ev = this._mEv, i;
		if(!ev || !ev.length) return;
		if(typeof target === 'string'){
			i = ev.length;
			while(i--) if(ev._mType == target) ev.splice(i, 1);
		}else if((i = ev.indexOf(target)) !== -1) ev.splice(i, 1);
	};
	fn.notify = function f(type, e){
		const ev = this._mEv;
		if(!ev || !ev.length) return;
		f._fe.type = type, f._fe.e = e;
		ev.forEach(f._fe);
	};
	fn.notify._fe = function f(v){if(v._mType == f.type) typeof v === 'function' ? v(f.e) : v.listen(f.e);};
	fn.observable = function(k, listener){
		var p = this._mProp || (this._mProp = {});
		if(k in p) return;
		Object.defineProperty(this, k, {
			get:function(){return p[k];},
			set:function(v){
				p[k] = v;
				typeof listener === 'function' ? listener(k, v) : listener.listen(k, v);
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
			if(arguments.length === 2) p[this._mId] = arguments[1];
		};
	})(fn);
	Object.freeze(fn);
	Object.defineProperty(MG, 'shared', {get:function(cls, k){return shared[cls._mId][k];}});
	MG.cls = cls;
	
	
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
	return Object.freeze(MG);
})();