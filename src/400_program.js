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
		console.log(k, a)
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
	return this;
},
'texture', (function(){
	var c = doc.createElement('canvas'), ctx = c.getContext('2d');
	var img = function(v){
		var w, h, vw, vh;
		switch(true){
		case v instanceof HTMLImageElement:
			if(!v.complete) throw 'incompleted img';
			break;
		case v instanceof ImageData:
			c.width = w = v.width;
			c.height = h = v.height;
			ctx.clearRect(0, 0, w, h);
			ctx.putImageData(v, 0, 0);
			v = doc.createElement('img');
			v.src = c.toDataURL();
			break;
		case typeof v == 'string' && v.substring(0, 10) == 'data:image' && v.indexOf('base64') > -1:
			w = doc.createElement('img');
			w.src = v;
			v = w;
			break;
		default: throw 'invalid image';
		}
		w = h = 1, vw = v.width, vh = v.height;
		if((vw & (vw - 1)) || (vh & (vh - 1))){
			while(vw > w) w *= 2;
			while(vh > h) h *= 2;
			ctx.clearRect(0, 0, c.width = w, c.height = h);
			ctx.drawImage(v, 0, 0, w, h);
			v.src = c.toDataURL();
			v.width = w, v.height = h;
		}
		return v;
	};
	return function(gl, tex){
		var v, t, k, i = 0;
		if(!this._program) throw 'before use Program';
		if(!tex) throw 'invalid texture';
		if(!this._textures) this._textures = {};
		for(k in tex) if(tex.hasOwnProperty(k)){
			this._textures[k] = {tex:v = gl.createTexture(), index:i};
			gl.activeTexture(gl.TEXTURE0 + i);
			gl.bindTexture(gl.TEXTURE_2D, v);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img(tex[k]));
			//gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			if(!gl.isTexture(v)) throw 'invalid texture';
			gl.uniform1i(gl.getUniformLocation(this._program, k), i);
			i++;
		}

	};
})()
);