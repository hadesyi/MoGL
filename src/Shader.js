var Shader = cls('Shader', null, function(v){
	this.shared('code', v);
}, {});
(function(){
	var pos = 'gl_Position = uPixelMatrix*uCameraMatrix*positionMTX(uPosition)*rotationMTX(uRotate)*scaleMTX(uScale)*vec4(aVertexPosition, 1.0);';
	var apos = ['vec3 aVertexPosition'];
	var ubase = ['mat4 uPixelMatrix', 'mat4 uCameraMatrix', 'vec3 uRotate', 'vec3 uScale', 'vec3 uPosition'];
	var ubasec = ['mat4 uPixelMatrix', 'mat4 uCameraMatrix', 'vec3 uRotate', 'vec3 uScale', 'vec3 uPosition', 'vec4 uColor'];
	var vc = ['vec4 vColor'];
	vc.add = ubasec.add = ubase.add = apos.add = function(){
		var ret = this.slice(0);
		ret.push.apply(ret, arguments);
		return ret;
	};
	Shader.vFunction = [
		'mat4 positionMTX(vec3 t){return mat4(1,0,0,0, 0,1,0,0, 0,0,1,0, t[0],t[1],t[2],1);}',
		'mat4 scaleMTX(vec3 t){return mat4(t[0],0,0,0, 0,t[1],0,0, 0,0,t[2],0, 0,0,0,1);}',
		'mat4 rotationMTX(vec3 t){',
			'float s = sin(t[0]);float c = cos(t[0]);',
			'mat4 m1 = mat4( 1,0,0,0, 0,c,s,0, 0,-s,c,0, 0,0,0,1);s = sin(t[1]);c = cos(t[1]);',
			'mat4 m2 = mat4(c,0,-s,0, 0,1,0,0, s,0,c,0,  0,0,0,1);s = sin(t[2]);c = cos(t[2]);',
			'mat4 m3 = mat4(c,s,0,0, -s,c,0,0, 0,0,1,0,  0,0,0,1);',
			'return m3*m2*m1;',
		'}'
	].join('\n');
	Shader.vcolorVertexShader = new Shader({
		id:'vcolorVertexShader',
		attributes:apos.add('vec4 aVertexColor'),
		uniforms:ubase,
		varyings:['vec4 vColor'],
		main:[pos, 'vColor = aVertexColor;']
	});
	Shader.colorVertexShader = new Shader({
		id:'colorVertexShader',
		attributes:apos,
		uniforms:ubasec,
		varyings:['vec4 vColor'],
		main:[pos, 'vColor = uColor;']		
	});
	Shader.wireFrameVertexShader = new Shader({
		id:'wireFrameVertexShader',
		attributes:apos,
		uniforms:ubasec,
		varyings:['vec4 vColor'],
		main:[pos, 'vColor = uColor;']
	});
	Shader.bitmapVertexShader = new Shader({
		id:'bitmapVertexShader',
		attributes:apos.add('vec2 aUV'),
		uniforms:ubase,
		varyings:['vec2 vUV'],
		main:[pos, 'vUV = aUV;']
	});
	Shader.colorVertexShaderGouraud = new Shader({
		id:'colorVertexShaderGouraud',
		attributes:apos.add('vec3 aVertexNormal'),
		uniforms:ubasec.add('vec3 uDLite', 'float uLambert'),
		varyings:['vec4 vColor'],
		main:[
			'mat4 mv = uCameraMatrix*positionMTX(uPosition)*rotationMTX(uRotate)*scaleMTX(uScale);',
			'gl_Position = uPixelMatrix*mv*vec4(aVertexPosition, 1.0);',
			'vec3 N = (mv * vec4(aVertexNormal, 0.0)).xyz;',
			'vec3 LD = normalize(vec4(uDLite, 0.0)).xyz;',
			'float df = max(0.1,dot(N,-LD)*uLambert);',
			'vColor = uColor*df;' +
			'vColor[3] = uColor[3];'
		]
	});
	Shader.bitmapVertexShaderGouraud = new Shader({
		id:'bitmapVertexShaderGouraud',
		attributes:apos.add('vec2 aUV', 'vec3 aVertexNormal'),
		uniforms:ubase.add('vec3 uDLite', 'float uLambert'),
		varyings:['vec2 vUV', 'vec4 vLight'],
		main:[
			'mat4 mv = uCameraMatrix*positionMTX(uPosition)*rotationMTX(uRotate)*scaleMTX(uScale);',
			'gl_Position = uPixelMatrix*mv*vec4(aVertexPosition, 1.0);',
			'vec3 N = (mv * vec4(aVertexNormal, 0.0)).xyz;',
			'vec3 LD = normalize(vec4(uDLite, 0.0)).xyz;',
			'float df = max(0.1,dot(N,-LD)*uLambert);',
			'vLight = vec4(1.0,1.0,1.0,1.0)*df;',
			'vLight[3] = 1.0;',
			'vUV = aUV;'
		]
	});
	Shader.colorVertexShaderPhong = new Shader({
		id:'colorVertexShaderPhong',
		attributes:apos.add('vec3 aVertexNormal'),
		uniforms:ubasec,
		varyings:['vec3 vNormal', 'vec3 vPosition', 'vec4 vColor'],
		main: [
			'mat4 mv = uCameraMatrix*positionMTX(uPosition)*rotationMTX(uRotate)*scaleMTX(uScale);',
			'gl_Position = uPixelMatrix*mv*vec4(aVertexPosition, 1.0);',
			'vPosition = vec3(mv * vec4(aVertexPosition, 1.0));',
			'vNormal = vec3(mv * vec4(-aVertexNormal, 0.0));',
			'vColor = uColor;'
		]
	});
	Shader.toonVertexShaderPhong = new Shader({
		id:'toonVertexShaderPhong',
		attributes:apos.add('vec3 aVertexNormal'),
		uniforms:ubasec,
		varyings:['vec3 vNormal', 'vec3 vPosition', 'vec4 vColor'],
		main: [
			'mat4 mv = uCameraMatrix*positionMTX(uPosition)*rotationMTX(uRotate)*scaleMTX(uScale);',
			'gl_Position = uPixelMatrix*mv*vec4(aVertexPosition, 1.0);',
			'vPosition = vec3(mv * vec4(aVertexPosition, 1.0));',
			'vNormal = (vec3( mv * vec4(-aVertexNormal, 0.0)));',
			'vColor = uColor;'
		]
	});
	Shader.bitmapVertexShaderPhong = new Shader({
		id:'bitmapVertexShaderPhong',
		attributes:apos.add('vec2 aUV', 'vec3 aVertexNormal'),
		uniforms:ubase,
		varyings:['vec2 vUV', 'vec3 vNormal', 'vec3 vPosition'],
		main:[
			'mat4 mv = uCameraMatrix*positionMTX(uPosition)*rotationMTX(uRotate)*scaleMTX(uScale);',
			'gl_Position = uPixelMatrix*mv*vec4(aVertexPosition, 1.0);',
			'vPosition = vec3(mv * vec4(aVertexPosition, 1.0));',
			'vNormal = (vec3( mv * vec4(-aVertexNormal, 0.0)));',
			'vUV = aUV;'
		]
	});
	Shader.bitmapVertexShaderBlinn = new Shader({
		id:'bitmapVertexShaderBlinn',
		attributes:apos('vec2 aUV', 'vec3 aVertexNormal'),
		uniforms:ubase,
		varyings:['vec2 vUV', 'vec3 vNormal', 'vec3 vPosition'],
		main:[
			'mat4 mv = uCameraMatrix*positionMTX(uPosition)*rotationMTX(uRotate)*scaleMTX(uScale);',
			'gl_Position = uPixelMatrix*mv*vec4(aVertexPosition, 1.0);',
			'vPosition = vec3(mv * vec4(aVertexPosition, 1.0));',
			'vNormal = vec3( mv * vec4(-aVertexNormal, 0.0));',
			'vUV = aUV;'
		]
	});
	Shader.postBaseVertexShader = new Shader({
		id:'postBaseVertexShader',
		attributes:apos.add('vec2 aUV'),
		uniforms:ubase,
		varyings:['vec2 vUV'],
		main:[pos, 'vUV = aUV;']
	});
	var mp = 'mediump float';
	var fc = 'gl_FragColor = vColor;'; 
	Shader.colorFragmentShader = new Shader({
		id:'colorFragmentShader',
		precision:mp,
		uniforms:[],
		varyings:vc,
		main:[fc]
	});
	Shader.wireFrameFragmentShader = new Shader({
		id:'wireFrameFragmentShader',
		precision:mp,
		uniforms:[],
		varyings:vc,
		main:[fc]
	});
	Shader.bitmapFragmentShader = new Shader({
		id:'bitmapFragmentShader',
		precision:mp,
		uniforms:['sampler2D uSampler'],
		varyings:vc,
		main:['gl_FragColor =  texture2D(uSampler, vec2(vUV.s, vUV.t));']
	});
	Shader.colorFragmentShaderGouraud = new Shader({
		id:'colorFragmentShaderGouraud',
		precision:mp,
		uniforms:['sampler2D uSampler'],
		varyings:vc,
		main:[fc]
	});
	Shader.bitmapFragmentShaderGouraud = new Shader({
		id:'bitmapFragmentShaderGouraud',
		precision:mp,
		uniforms:['sampler2D uSampler'],
		varyings:vc.add('vec4 vLight'),
		main: [
			'gl_FragColor = (vLight*texture2D(uSampler, vec2(vUV.s, vUV.t)));',
			'gl_FragColor.a = 1.0;'
		]
	});
	Shader.colorFragmentShaderPhong = new Shader({
		id:'colorFragmentShaderPhong',
		precision:mp,
		uniforms:['float uLambert', 'vec3 uDLite'],
		varyings:['vec3 vNormal', 'vec3 vPosition', 'vec4 vColor'],
		main:[
			'vec3 ambientColor = vec3(0.0, 0.0, 0.0);',
			'vec3 diffuseColor = vec3(1.0, 1.0, 1.0);',
			'vec3 specColor = vec3(1.0, 1.0, 1.0);',

			'vec3 normal = normalize(vNormal);',
			'vec3 lightDir = uDLite;',
			'vec3 reflectDir = reflect(lightDir, normal);',
			'vec3 viewDir = normalize(-vPosition);',

			'float lambertian = max(dot(lightDir,normal), 0.1)*uLambert;',
			'float specular = 0.0;',

			'if(lambertian > 0.0) {',
			'float specAngle = max(dot(reflectDir, viewDir), 0.0);',
			'   specular = pow(specAngle, 4.0);',
			'}',
			'gl_FragColor = vColor*vec4(ambientColor +lambertian*diffuseColor +specular*specColor, 1.0);',
			'gl_FragColor.a = vColor[3];'
		]
	});
	Shader.toonFragmentShaderPhong = new Shader({
		id:'toonFragmentShaderPhong',
		precision:mp,
		uniforms:['float uLambert', 'vec3 uDLite'],
		varyings:['vec3 vNormal', 'vec3 vPosition', 'vec4 vColor'],
		main:[
			'vec3 ambientColor = vec3(0.0, 0.0, 0.0);',
			'vec3 diffuseColor = vec3(1.0, 1.0, 1.0);',
			'vec3 specColor = vec3(1.0, 1.0, 1.0);',

			'vec3 normal = normalize(vNormal);',
			'vec3 lightDir = uDLite;',
			'vec3 reflectDir = reflect(lightDir, normal);',
			'vec3 viewDir = normalize(-vPosition);',

			'float lambertian = max(dot(lightDir,normal), 0.1)*uLambert;',
			'float specular = 0.0;',

			'vec3 src = vColor.rgb;',

			'if(lambertian > 0.0) {',
			'float specAngle = max(dot(reflectDir, viewDir), 0.0);',
			'   specular = pow(specAngle, 4.0);',
			'}',
			'src = src*(ambientColor +lambertian*diffuseColor +specular*specColor);',

			'if(lambertian>0.95-0.5) src.rgb*=0.95;',
			'else if(lambertian>0.4-0.5) src.rgb*=0.5;',
			'else if(lambertian>0.3-0.5) src.rgb*=0.3;',
			'else src.rgb*=0.1;',

			'gl_FragColor.rgb = src.rgb;',
			'gl_FragColor.a = vColor[3];'
		]
	});
	Shader.bitmapFragmentShaderPhong = new Shader({
		id:'bitmapFragmentShaderPhong',
		precision:mp,
		uniforms:['sampler2D uSampler', 'float uLambert', 'vec3 uDLite'],
		varyings:vc.add('vec3 vNormal', 'vec3 vPosition'),
		main: [
			'vec3 ambientColor = vec3(0.0, 0.0, 0.0);',
			'vec3 diffuseColor = vec3(1.0, 1.0, 1.0);',
			'vec3 specColor = vec3(1.0, 1.0, 1.0);',

			'vec3 normal = normalize(vNormal);',
			'vec3 lightDir = uDLite;',
			'vec3 reflectDir = reflect(lightDir, normal);',
			'vec3 viewDir = normalize(-vPosition);',

			'float lambertian = max(dot(lightDir,normal), 0.1)*uLambert;',
			'float specular = 0.0;',

			'if(lambertian > 0.0) {',
				'float specAngle = max(dot(reflectDir, viewDir), 0.1);',
				'specular = pow(specAngle, 4.0)*uLambert;',
			'}',

			'gl_FragColor = texture2D(uSampler, vec2(vUV.s, vUV.t))*vec4(ambientColor +lambertian*diffuseColor +specular*specColor, 1.0);',
			'gl_FragColor.a = 1.0;'
		]
	});
	Shader.bitmapFragmentShaderBlinn = new Shader({
		id:'bitmapFragmentShaderBlinn',
		precision:mp,
		uniforms:['sampler2D uSampler', 'float uLambert', 'vec3 uDLite'],
		varyings:vc.add('vec3 vNormal', 'vec3 vPosition'),
		main:[
			'vec3 ambientColor = vec3(0.0, 0.0, 0.0);',
			'vec3 diffuseColor = vec3(1.0, 1.0, 1.0);',
			'vec3 specColor = vec3(1.0, 1.0, 1.0);',

			'vec3 normal = normalize(vNormal);',
			'vec3 lightDir = uDLite;',

			'float lambertian = max(dot(lightDir,normal), 0.1)*uLambert;',
			'float specular = 0.0;',

			'vec3 viewDir = normalize(vPosition);',

			'if(lambertian > 0.0) {',
				'vec3 halfDir = normalize(lightDir + viewDir);',
				'float specAngle = max(dot(halfDir, normal), 0.0);',
				'specular = pow(specAngle, 16.0);',
			'}',
			'gl_FragColor = texture2D(uSampler, vec2(vUV.s, vUV.t))*vec4(ambientColor +lambertian*diffuseColor +specular*specColor, 1.0);',
			'gl_FragColor.a = 1.0;'
		]
	});
	Shader.postBaseFragmentShader = new Shader({
		id:'postBaseFragmentShader',
		precision:mp,
		uniforms:['sampler2D uSampler', 'vec2 uTexelSize', 'int uFXAA'],
		varyings:vc,
		main:[
			'if(uFXAA==1){',
				'float FXAA_REDUCE_MIN = (1.0/128.0);',
				'float FXAA_REDUCE_MUL = (1.0/8.0);',
				'float FXAA_SPAN_MAX = 8.0;',

				'vec4 rgbNW = texture2D(uSampler, (vUV + vec2(-1.0, -1.0) * uTexelSize));',
				'vec4 rgbNE = texture2D(uSampler, (vUV + vec2(1.0, -1.0) * uTexelSize));',
				'vec4 rgbSW = texture2D(uSampler, (vUV + vec2(-1.0, 1.0) * uTexelSize));',
				'vec4 rgbSE = texture2D(uSampler, (vUV + vec2(1.0, 1.0) * uTexelSize));',
				'vec4 rgbM = texture2D(uSampler, vUV);',
				'vec4 luma = vec4(0.299, 0.587, 0.114, 1.0);',
				'float lumaNW = dot(rgbNW, luma);',
				'float lumaNE = dot(rgbNE, luma);',
				'float lumaSW = dot(rgbSW, luma);',
				'float lumaSE = dot(rgbSE, luma);',
				'float lumaM = dot(rgbM, luma);',
				'float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));',
				'float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));',

				'vec2 dir = vec2(-((lumaNW + lumaNE) - (lumaSW + lumaSE)), ((lumaNW + lumaSW) - (lumaNE + lumaSE)));',

				'float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * FXAA_REDUCE_MUL),FXAA_REDUCE_MIN);',
				'float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);',
				'dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX),',
				'max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),',
				'dir * rcpDirMin)) * uTexelSize;',

				'vec4 rgbA = 0.5 * (',
					'texture2D(uSampler, vUV + dir * (1.0 / 3.0 - 0.5)) + ',
					'texture2D(uSampler, vUV + dir * (2.0 / 3.0 - 0.5))',
				');',
				'vec4 rgbB = rgbA * 0.5 + 0.25 * (texture2D(uSampler, vUV + dir *  -0.5)+texture2D(uSampler, vUV + dir * 0.5));',
				'float lumaB = dot(rgbB, luma);',
				'if ((lumaB < lumaMin) || (lumaB > lumaMax)) {',
					'gl_FragColor = rgbA;',
				'}else{',
					'gl_FragColor = rgbB;',
				'}',
			'}else{',
				'gl_FragColor = texture2D(uSampler, vec2(vUV.s, vUV.t));',
			'}'
		]
	});
})();