var Shader = cls('Shader', null, function(v){
	this.super();
	this.shared('code', 'precision' in v ? parseFragment(v) : parseVertex(v));
}, {
	parseVertex:function(source){
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
		resultObject.shaderStr = str + Shader.vFunction + 'void main(void){\n' + code.main.join('\n') + '}';
		return resultObject;
	},
	parseFragment:function(source){
		var i, temp, str, resultObject, code;
		code = source.code;
		resultObject = {id:code.id, shaderStr:null, uniforms:[]};
		str = 'precision ' + (code.precision ? code.precision : 'mediump float') + ';\n';
		temp = code.uniforms, i = temp.length;
		while(i--){
			str += 'uniform ' + temp[i] + ';\n',
			resultObject.uniforms.push(temp[i].split(' ')[1]);
		}
		temp = code.varyings, i = temp.length;
		while(i--) str += 'varying ' + temp[i] + ';\n';
		resultObject.shaderStr = str + 'void main(void){\n' + code.main.join('\n') + '}';
		return resultObject;
	}
});
(function(){
	var pos = 'gl_Position = uPixelMatrix*uCameraMatrix*positionMTX(uPosition)*rotationMTX(uRotate)*scaleMTX(uScale)*vec4(aVertexPosition, 1.0);';
	var apos = ['vec3 aVertexPosition'];
	var ubase = ['mat4 uPixelMatrix', 'mat4 uCameraMatrix', 'vec3 uRotate', 'vec3 uScale', 'vec3 uPosition'];
	var ubasec = ['mat4 uPixelMatrix', 'mat4 uCameraMatrix', 'vec3 uRotate', 'vec3 uScale', 'vec3 uPosition', 'vec4 uColor'];
	var vc = ['vec4 vColor'];
	var mp = 'mediump float';
	var fc = 'gl_FragColor = vColor;'; 
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
	Shader.graph = {
		vertex: new Shader({
			id:'graphColorVertexShader',
			attributes:apos,
			uniforms:ubasec,
			varyings:vc,
			main:[pos, 'vColor = vec4(aVertexPosition.x, aVertexPosition.y, aVertexPosition.z, 1.0);']		
		}),
		fragment:new Shader({
			id:'graphColorFragmentShader',
			precision:mp,
			uniforms:[],
			varyings:vc,
			main: [
				'float cnt = floor(vColor.y / 0.8);',
				'float rate = (vColor.y - cnt * 0.8)/0.8;',
				'float r, g, b;',
				'if(cnt < 2.0){b = 1.0;}',
				'else{b = 0.1;}',
				'if(cnt == 0.0){g = rate;}',
				'else{',
					'if(cnt < 3.0){g = 1.0;}',
					'else{g = 1.0 - rate;}',
				'}',
				'if(cnt < 2.0){r = 0.0;}',
				'else{',
					'if(cnt > 2.0){r = 1.0;}',
					'else{r = rate;}',
				'}',
				'if(vColor.z == -1.6){r = 1.0;g = 1.0;b = 1.0;}',
				'if(vColor.x == 1.5){r = 1.0;g = 1.0;b = 1.0;}',
				'if(vColor.y == 0.0){r = 1.0;g = 1.0;b = 1.0;}',
				'gl_FragColor = vec4(r, g, b, 1.0);'
			]
		})
	};
	Shader.color = Object.freeze({
		toString:function(){return 'color';},
		vertex:new Shader({
			id:'colorVertexShader',
			attributes:apos,
			uniforms:ubasec,
			varyings:['vec4 vColor'],
			main:[pos, 'vColor = uColor;']		
		}),
		fragment:new Shader({
			id:'colorFragmentShader',
			precision:mp,
			uniforms:[],
			varyings:vc,
			main:[fc]
		})
	});
	Shader.wireFrame = Object.freeze({
		toString:function(){return 'wireFrame';},
		vertex:new Shader({
			id:'wireFrameVertexShader',
			attributes:apos,
			uniforms:ubasec,
			varyings:['vec4 vColor'],
			main:[pos, 'vColor = uColor;']
		}),
		fragment:new Shader({
			id:'wireFrameFragmentShader',
			precision:mp,
			uniforms:[],
			varyings:vc,
			main:[fc]
		})
	});
	Shader.bitmap = Object.freeze({
		toString:function(){return 'bitmap';},
		vertex:new Shader({
			id:'bitmapVertexShader',
			attributes:apos.add('vec2 aUV'),
			uniforms:ubase,
			varyings:['vec2 vUV'],
			main:[pos, 'vUV = aUV;']
		}),
		fragment:new Shader({
			id:'bitmapFragmentShader',
			precision:mp,
			uniforms:['sampler2D uSampler'],
			varyings:vc,
			main:['gl_FragColor =  texture2D(uSampler, vec2(vUV.s, vUV.t));']
		})
	});
	Shader.colorGouraud = Object.freeze({
		toString:function(){return 'colorGouraud';},
		vertex:new Shader({
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
		}),
		fragment:new Shader({
			id:'colorFragmentShaderGouraud',
			precision:mp,
			uniforms:['sampler2D uSampler'],
			varyings:vc,
			main:[fc]
		})
	});
	Shader.bitmapGouraud = Object.freeze({
		toString:function(){return 'bitmapGouraud';},
		vertex:new Shader({
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
		}),
		fragment:new Shader({
			id:'bitmapFragmentShaderGouraud',
			precision:mp,
			uniforms:['sampler2D uSampler'],
			varyings:vc.add('vec4 vLight'),
			main: [
				'gl_FragColor = (vLight*texture2D(uSampler, vec2(vUV.s, vUV.t)));',
				'gl_FragColor.a = 1.0;'
			]
		})
	});
	Shader.colorPhong = Object.freeze({
		toString:function(){return 'colorPhong';},
		vertex:new Shader({
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
		}),
		fragment:new Shader({
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
		})
	});
	Shader.toon = Object.freeze({
		toString:function(){return 'toon';},
		vertex:new Shader({
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
		}),
		fragment:new Shader({
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
		})
	});
	Shader.bitmapPhong = Object.freeze({
		toString:function(){return 'bitmapPhong';},
		vertex:new Shader({
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
		}),
		fragment:new Shader({
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
		})
	});
	Shader.bitmapBlinn = Object.freeze({
		toString:function(){return 'bitmapBlinn';},
		vertex:new Shader({
			id:'bitmapVertexShaderBlinn',
			attributes: apos.add('vec2 aUV', 'vec3 aVertexNormal'),
			uniforms:ubase,
			varyings:['vec2 vUV', 'vec3 vNormal', 'vec3 vPosition'],
			main:[
				'mat4 mv = uCameraMatrix*positionMTX(uPosition)*rotationMTX(uRotate)*scaleMTX(uScale);',
				'gl_Position = uPixelMatrix*mv*vec4(aVertexPosition, 1.0);',
				'vPosition = vec3(mv * vec4(aVertexPosition, 1.0));',
				'vNormal = vec3( mv * vec4(-aVertexNormal, 0.0));',
				'vUV = aUV;'
			]
		}),
		fragment:new Shader({
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
		})
	});
	Shader.postBase = Object.freeze({
		toString:function(){return 'postBase';},
		vertex:new Shader({
			id:'postBaseVertexShader',
			attributes:apos.add('vec2 aUV'),
			uniforms:ubase,
			varyings:['vec2 vUV'],
			main:[pos, 'vUV = aUV;']
		}),
		fragment:new Shader({
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
		})
	});
})();