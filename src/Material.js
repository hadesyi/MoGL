var Material = cls('Material', null, (function(){
	return function(){
		var a = arguments, i = a.length;
		this.super();
		this._mLineWidth = 1;
		this.shared('_mColor', COLOR(i ? i == 1 ? a[0] : a : '#fff'));
		this.shared('_mWColor', [Math.random(), Math.random(), Math.random(), 1]);
		this.shared('wireFrame', false);
		this.shared('lambert', 1);
		this.shared('shading', Shading.none);
		this.shared('diffuse', []);
		this.shared('diffuseWrap', []);
		this.shared('normal', []);
		this.shared('specular', []);
		this.shared('specularNormal', []);
	};
})(),{
	lineWidth:{
		get:function(){return this._mLineWidth;}
		set:function(v){this._mLineWidth = v;}
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