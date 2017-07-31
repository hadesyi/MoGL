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

var MG = (function(){
	var id = 1, MG = function(){
		this._mId = id++;
		this._mClsId = this.constructor._id;
	}, fn = MG.prototype;
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
			get(){return p[k];},
			set(v){
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
				get(){return p[this._mId];},
				set(v){p[this._mId] = v;}
			});
			if(arguments.length == 2) p[this._mId] = arguments[1];
		};
	})(fn);
	Object.defineProperty(MG, 'shared', {get:function(cls, k){return shared[cls._mId][k];}});
	Object.defineProperty(MG, 'cls', {value:cls});
	Object.freeze(fn);
	Object.freeze(MG);
	return MG;
})();