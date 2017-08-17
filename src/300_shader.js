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