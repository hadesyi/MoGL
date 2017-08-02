var Material = cls('Material', null, function(){
	var a = arguments, i = a.length;
	this.super();
	this.lineWidth = 1;
	this._mColor = COLOR(i ? i == 1 ? a[0] : a : '#fff');
	this._mWColor = [Math.random(), Math.random(), Math.random(), 1];
	this.type = Material.TRIANGLES;
	this.wireFrame = false;
	this.lambert = 1;
	this.shader = Shader.color;
	this.diffuse = [];
	this.diffuseWrap = [];
	this.normal = [];
	this.specular = [];
	this.specularNormal = [];
}, {
	textureCount:{
		get:function(){return this.diffuse.length + this.diffuseWrap.length + 
			this.normal.length + this.specular.length + this.specularNormal.length;
		}
	},
	color:{
		get:function(){return this._mColor;}
		set:function(v){this._mColor = COLOR(v);}
	},
	wireFrameColor:{
		get:function(){return this._mWColor;}
		set:function(v){this._mWColor = COLOR(v);}
	},
	addTexture:function(type, tex/*,index,blendMode*/){
		var p, i = arguments[2], texture;
		if(!Texture[type]) throw 'invalid type:' + type;
		if (!(texture instanceof Texture)) throw 'invalid texture:' + tex
		texs = this[type];
		if(tex.toString() in texs[tex]) throw 'exist texture:' + type + ':' + tex;
		texs[tex] = tex;
		texture = {tex:tex, blendMode:arguments[3] || ''};
		if(typeof i == 'number') texs.splice(i, 0, texture);
		else texs.push(texture);
		return this;
	},
	removeTexture:function(type, tex){
		if(!Texture[type]) throw 'invalid type:' + type;
		if (!(texture instanceof Texture)) throw 'invalid texture:' + tex
		texs = this[type];
		if(texs[tex]){
			delete texs[tex];
			texs.splice(texs.indexOf(tex), 1);
		}
	}
});
'POINTS,LINES,LINE_STRIP,LINE_LOOP,TRIANGLES,TRIANGLE_STRIP,TRIANGLE_FAN'.split(',').forEach(function(v){Material[v] = v;});
Object.freeze(Material);