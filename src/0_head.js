var mgl = (function(W, doc){
var fn = function(cls){
	var opt = {}, a = arguments, i = 1, j = a.length, v;
	while(i < j) opt[a[i++]] = typeof (v = a[i++]) == 'function' ? {value:v} : v;
	Object.freeze(Object.defineProperties(cls.prototype, opt));
	return cls;
};
var is = function(){
	var a = arguments, i = 0, j = a.length, v, c, t;
	while(i < j){
		v = a[i++], c = a[i++], t = a[i++];
		if(!(v instanceof c)) throw t;
	}
};
var map = function(proto){return Object.create(proto || null);};
var Dispatcher = fn(function(){},
'listen', function(){throw 'override';},
'addListener', function(type, o){
	var l;
	if(typeof o != 'function' && !(o instanceof Dispatcher)) throw 'invalid listener'
	l = this._obsv || (this._obsv = map());
	l = l[type] || (l[type] = []);
	if(l.indexOf(o) == -1) l.push(o);
},
'removeListener', function(type, o){
	var l = this._obsv, i;
	if(!l || !(l = l[type])) return;
	if(o)l.splice(l.indexOf(o), 1);
	else l.length = 0;
},
'dispatch', (function(){
	var f = function(v){typeof v == 'function' ? v(f.data) : v.listen(f.data);};
	return function(type, data){
		var l = this._obsv;
		if(!l || !(l = l[type])) return;
		(f.data = data || {}).type = type;
		l.forEach(f);
	};
})());
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
	case'never': gl[v] = gl.NEVER; break;
	case'always': gl[v] = gl.ALWAYS; break;
	case'less': gl[v] = gl.LESS; break;
	case'lequal': gl[v] = gl.LEQUAL; break;
	case'notequal': gl[v] = gl.NOTEQUAL; break;
	case'equal': gl[v] = gl.EQUAL; break;
	case'greater': gl[v] = gl.GREATER; break;
	case'gequal': gl[v] = gl.GEQUAL; break;
	
	case'zero': gl[v] = gl.ZERO; break;
	case'one': gl[v] = gl.ONE; break;
	case'src_alpha': gl[v] = gl.SRC_ALPHA; break;
	case'src_alpha_saturate': gl[v] = gl.SRC_ALPHA_SATURATE; break;
	case'one_minus_src_alpha': gl[v] = gl.ONE_MINUS_SRC_ALPHA; break;
	case'dst_color': gl[v] = gl.DST_COLOR; break;
	case'one_minus_dst_color': gl[v] = gl.ONE_MINUS_DST_COLOR; break;
	case'constant_color': gl[v] = gl.CONSTANT_COLOR; break;
	case'one_minus_constant_color': gl[v] = gl.ONE_MINUS_CONSTANT_COLOR; break;
	case'dst_alpha': gl[v] = gl.DST_ALPHA; break;
	case'one_minus_dst_alpha': gl[v] = gl.ONE_MINUS_DST_ALPHA; break;
	case'constant_alpha': gl[v] = gl.CONSTANT_ALPHA; break;
	case'one_minus_constant_alpha': gl[v] = gl.ONE_MINUS_CONSTANT_ALPHA; break;

	case'triangles': gl[v] = gl.TRIANGLES; break;
	case'front': gl[v] = gl.FRONT; break;
	case'back': gl[v] = gl.BACK; break;
	case'front_and_back': gl[v] = gl.FRONT_AND_BACK; break;
	default:throw 'invalid mode';
	}
	return gl[v];
};
var PIXEL_RATIO = W.devicePixelRatio;
var GLMAT_EPSILON = 0.000001, PI = Math.PI, PIH = PI * 0.5, PID = PI * 2, D2R = PI / 180, R2D = 180 / PI;
var ATAN = Math.atan, ATAN2 = Math.atan2, ASIN = Math.asin, CEIL = Math.ceil, ABS = Math.abs;
var SQRT = function f(r){return r in f ? f[r] : (f[r] = Math.sqrt(r));}; 
var SIN, COS, TAN;
(function(a){
	'sin,cos,tan'.split(',').forEach(function(v){
		var f;
		a[v] = f = function(r){return f[r] || (f[r] = Math[v](r));};
	});
	SIN = a.sin, COS = a.cos, TAN = a.tan;
})({});