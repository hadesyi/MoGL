var dynamicAttr = function(){
	var world = new mgl('stage')
	.program('base', `
		attribute vec3 apos;
		attribute vec4 acolor;
		varying vec4 vcolor;
		void main(void){
			vcolor = acolor;
			gl_Position = vec4(apos, 1.0);
		}
		`, `
		precision mediump float;
		varying vec4 vcolor;
		void main(void){
			gl_FragColor = vcolor;
		}
	`)
	.buffer('t1', true, 'xyzrgba', [
		-.5,.5,0,1,1,0,1, 0,0,0,1,1,0,1, -.5,-.5,0,1,1,0,1,
		.5,.5,0,0,1,0,1, 0,0,0,0,1,0,1, .5,-.5,0,0,1,0,1
	]);
	(function(){
		var pos = world.buffer('t1').pos(),
			origin = pos.map(function(v){return v;}),
			f = function(v, i){if(i % 3 == 0) pos[i] = origin[i] + tx},
			a = 0, tx, loop;
		requestAnimationFrame(loop = function(){
			tx = mgl.sin(a) / 2;
			a += 0.01;
			pos.forEach(f);
			world.attr('base', 't1', {apos:'pos', acolor:'color'}).clear().drawArray('triangles');
			requestAnimationFrame(loop);
		});
	})();
};
var uniform = function(){
	var world = new mgl('stage')
	.program('base', `
		attribute vec3 apos;
		attribute vec4 acolor;
		uniform mat4 uproject;
		uniform mat4 umove;
		varying vec4 vcolor;
		void main(void){
			vcolor = acolor;
			gl_Position = uproject * umove * vec4(apos, 1.0);
		}
		`, `
		precision mediump float;
		varying vec4 vcolor;
		void main(void){
			gl_FragColor = vcolor;
		}
	`)
	.buffer('t1', false, 'xyzrgba', [
		-.5,.5,0,1,1,0,1, 0,0,0,1,1,0,1, -.5,-.5,0,1,1,0,1,
		.5,.5,0,0,1,0,1, 0,0,0,0,1,0,1, .5,-.5,0,0,1,0,1
	])
	.attr('base', 't1', {apos:'pos', acolor:'color'})
	.uniform('base', {uproject:new mgl.Matrix().matPerspective(45, 1, 0.1, 100)});
	(function(){
		var u = {umove:new mgl.Matrix().matTranslate(0, 0, -2)}, a = 0, loop;
		requestAnimationFrame(loop = function(){
			u.umove.matIdentity().matTranslate(mgl.sin(a += 0.01) / 2, 0, -2);
			world.uniform('base', u).clear().drawArray('triangles');
			requestAnimationFrame(loop);
		});
	})();
};
var index = function(){
	var world = new mgl('stage')
	.program('base', `
		attribute vec3 apos;
		attribute vec4 acolor;
		uniform mat4 uproject;
		uniform mat4 umove;
		varying vec4 vcolor;
		void main(void){
			vcolor = acolor;
			gl_Position = uproject * umove * vec4(apos, 1.0);
		}
		`, `
		precision mediump float;
		varying vec4 vcolor;
		void main(void){
			gl_FragColor = vcolor;
		}
	`)
	.buffer('color', false, 'rgb', [
		0,0,1, 1,1,1, 0,0,1, 0,0,1, 0,0,1, 1,1,1,
		0,1,1, 1,1,1, 0,1,1, 0,1,1, 0,1,1, 1,1,1 
	])
	.buffer('pos', false, 'xyz', [
		0,0,0, 1,0,0, 2,0,0, .5,1,0, 1.5,1,0, 1,2,0,
		0,0,-2, 1,0,-2, 2,0,-2, .5,1,-2, 1.5,1,-2, 1,2,-2
	])
	.buffer('index', false, 'index', [
		0,1,3, 1,3,4, 1,2,4, 3,4,5, 
		6,7,9, 7,9,10, 7,8,10, 9,10,11,
		0,3,6, 3,6,9, 3,5,9, 5,9,11,
		2,4,8, 4,8,10, 4,5,10, 5,10,11,
		0,6,8, 8,2,0
	])
	.attr('base', 'color', {acolor:'color'})
	.attr('base', 'pos', {apos:'pos'})
	.index('base', 'index')
	.uniform('base', {uproject:new mgl.Matrix().matPerspective(45, 1, 0.1, 100)});
	(function(){
		var u = {umove:new mgl.Matrix().matTranslate(0, 0, -2)}, a = 0, loop;
		requestAnimationFrame(loop = function(){
			u.umove.matIdentity().matTranslate(-1 + mgl.sin(a += 0.01) / 2, -1, -8).matRotateY(a).matRotateZ(a);
			world.uniform('base', u).clear().drawElement('triangles');
			requestAnimationFrame(loop);
		});
	})();
};
var texture = function(){
	var tex1 = document.createElement('img'), tex2 = document.createElement('img'), i = 0;
	tex2.src = 'bg.png';
	tex1.src = 'b2.png';
	tex1.onload = tex2.onload = function(){if(++i == 2) start();};
	var start = function(){
		var triangleVertices = [
			0,0,0, 1,0,0, 2,0,0, .5,1,0, 1.5,1,0, 1,2,0,
			0,0,-2, 1,0,-2, 2,0,-2, .5,1,-2, 1.5,1,-2, 1,2,-2
		];	
		var triangleTexCoords = [];
		for(var i=0; i<triangleVertices.length/3; i++){
			triangleTexCoords.push(i%2);
			triangleTexCoords.push(i%2);
		}
		var world = new mgl('stage');
		world.program('base', `
			attribute vec3 apos;
			attribute vec2 auv;

			uniform mat4 uproject;
			uniform mat4 umove;

			varying vec2 vuv;
			void main(void){
				gl_Position = uproject * umove * vec4(apos, 1.0);
				vuv = auv;
			}
			`, `
			precision mediump float;
			uniform sampler2D utex1;
			uniform sampler2D utex2;
			varying vec2 vuv;
			void main(void){
				vec4 a = texture2D(utex1, vuv);
				vec4 b = texture2D(utex2, vuv);
				gl_FragColor = a.a > b.a ? a : b;
			}
		`)
		.buffer('pos', false, 'xyz', [
			0,.5,-1, -.5,-.5,-1, .5,-.5,-1,
			0,.5,1, .5,-.5,1, -.5,-.5,1
			
		])
		.buffer('uv', false, 'uv', [
			0,1, 1,0, 0,0, 1,1, 1,0, 0,0
		])
		.buffer('index', false, 'index', [
			0,1,2, 0,2,3, 3,2,4, 3,4,5, 3,5,1, 3,1,0, 2,5,4, 1,5,2
		])
		.attr('base', 'pos', {apos:'pos'})
		.attr('base', 'uv', {auv:'uv'})
		.index('base', 'index')
		.uniform('base', {uproject:new mgl.Matrix().matPerspective(45, 1, 0.1, 100)})
		.culling(null)
		.texture('base', {utex1:tex1, utex2:tex2});
		(function(){
			var u = {umove:new mgl.Matrix().matTranslate(0, 0, -2)}, a = 0, loop;
			requestAnimationFrame(loop = function(){
				u.umove.matIdentity().matTranslate( mgl.sin(a += 0.01) / 2, 0, -3).matRotateY(a);
				world.uniform('base', u).clear().drawElement('triangles');
				requestAnimationFrame(loop);
			});
		})();
	};
};