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
		get(){return this._mLineWidth;}
		set(v){this._mLineWidth = v;}
	},
	color:{
		get(){return this._mColor;}
		set(v){this._mColor = COLOR(v);}
	},
	wireFrameColor:{
		get(){return this._mWColor;}
		set(v){this._mWColor = COLOR(v);}
	},
	addTexture:function(type, tex/*,index,blendMode*/) {
		var p, i = arguments[2];
		if(!Texture[type]) throw 'invalid type:' + type;
		if (!(texture instanceof Texture)) throw 'invalid texture:' + tex
		texs = this[type];
		if(texs[tex]) throw 'exist texture:' + type + ':' + tex;
		texs[tex] = tex;
		if(tex.isLoaded){
		
		}else{
		
		}
		//로딩전 텍스쳐에게는 이벤트리스너를 걸어줌
		if(!texture.isLoaded) {
			texture.addEventListener(Texture.load, textureLoaded, null, this);
		}

		//실제 텍스쳐구조체에는 텍스쳐와 블랜드모드가 포함됨
		texture = {tex:texture};

		//블랜드모드가 들어온 경우의 처리
		if (arguments.length > 3) {
			texture.blendMode = arguments[3];
		}
		//인덱스 제공 여부에 따라 텍스쳐리스트에 삽입
		if (i === undefined || i === null) {
			p[p.length] = texture;
		} else if (typeof i == 'number') {
			if (i < 0 || i > p.length - 1) {
				this.error(4);
			} else {
				p.splice(i, 0, texture);
			}
		} else if (i instanceof Texture) {
			i = p.indexOf(i);
			if (i > -1) {
				p.splice(i, 0, texture);
			} else {
				this.error(5);
			}
		} else {
			this.error(3);
		}

		//changed이벤트는 무조건 발생함.
		this.dispatch(Material.changed);
		if (this.isLoaded) this.dispatch(Material.load);
		return this;
	}
}
});
        .field('isLoaded', {
            description: "재질에 적용된 텍스쳐들이 모두 로딩되었는지 확인",
            sample: [
                'console.log(material.isLoaded);'
            ],
            defaultValue:'false',
            get:function(mat) {
                var type, tex, i;
                for (type in texType) {
                    if (tex = texType[type][mat]) {
                        i = tex.length;
                        while (i--) {
                            if(!tex[i].tex.isLoaded) return false;
                        }
                    }
                }
                return true;
            }
        })
        .method('addTexture', {
            description:[
                '[Mesh](Mesh.md)를 통해 최종적으로 포함될 Texture를 등록',
                '* [Scene](Scene.md)에 직접 등록되는 경우는 id를 [addMaterial](Scene.md#addmaterial-idstring-materialmaterial-)시점에 평가함.',
                '* [Mesh](Mesh.md)에서 직접 생성하여 삽입하는 경우는 [addChild](Scene.md#addchild-idstring-meshmesh-)시점에 평가함.',
                '* 이미 직간접적으로 [Scene](Scene.md)에 포함된 경우는 메서드호출시점에 평가함.'
            ],
            param:[
                'type:string - 해당 텍스쳐가 어떠한 타입에 포함될 것인가를 결정함. 다음의 값이 올 수 있음.',
                "* [Texture.diffuse](Texture.md#diffuse) or 'diffuse' - 디퓨즈 맵으로 등록함.",
                "* [Texture.specular](Texture.md#specular) or 'specular' - 스페큘러 맵으로 등록함.",
                "* [Texture.diffuseWrap](Texture.md#diffusewrap) or 'diffuseWrap' - 디퓨즈랩 맵으로 등록함.",
                "* [Texture.normal](Texture.md#normal) or 'normal' - 노말 맵으로 등록함.",
                "* [Texture.specularNormal](Texture.md#specularNormal) or 'diffuse' - 스페큘러노말 맵으로 등록함.",
                '[Texture](Texture.md) - 추가 될 Texture instance.',
                'index:int or [Texture](Texture.md) - 중첩되는 이미지의 경우 순번을 정의함. 생략하거나 null 이면 마지막 인덱스 + 1.',
                '?blendMode:string - 중첩되는 이미지의 경우 아래의 이미지와 합성되는 속성을 정의함. 첫번째 텍스쳐는 적용되지 않고 기본값은 \'alpha\' 이고 다음과 같은 값이 올 수 있음.',
                "* [BlendMode.add](BlendMode.md#add) or 'add' -  전면색을 배경색에 더하고 올림값 0xFF를 적용.",
                "* [BlendMode.alpha](BlendMode.md#alpha) or 'alpha' - 전면색의 알파값에 따라 배경색을 덮어가는 가장 일반적인 중첩.",
                "* [BlendMode.darken](BlendMode.md#darken) or 'darken' - 전면색과 배경색 중 보다 어두운 색상(값이 작은 색상)을 선택.",
                "* [BlendMode.difference](BlendMode.md#difference)or 'difference' - 전면색과 배경색을 비교하여 둘 중 밝은 색상 값에서 어두운 색상 값을 뺌.",
                "* [BlendMode.erase](BlendMode.md#erase) or 'erase' - 전면색의 알파만 적용하여 배경색을 지움.",
                "* [BlendMode.hardlight](BlendMode.md#hardlight) or 'hardlight' - 전면색의 어두운 정도를 기준으로 배경색을 조정.",
                "* [BlendMode.invert](BlendMode.md#invert) or 'invert' - 전면색을 이용하여 배경색을 반전시킴.",
                "* [BlendMode.lighten](BlendMode.md#lighten) or 'lighten' - 전면색과 배경색 중 보다 밝은 색(값이 큰 색상)으로 선택.",
                "* [BlendMode.multiply](BlendMode.md#multiply) or 'multiply' -  전면색에 배경색을 곱하고 0xFF로 나누어 정규화하여 보다 어두운 색을 만듬.",
                "* [BlendMode.screen](BlendMode.md#screen) or 'screen' - 전면색의 보수(역수)에 배경색 보수를 곱하여 표백 효과를 냄.",
                "* [BlendMode.subtract](BlendMode.md#subtract) or 'subtract' - 전면색의 값을 배경색에서 빼고 내림값 0을"
            ],
            exception:[
                "* 'Material.addTexture:0' - 1번째 param 값이 Texture 타입이 아닐 경우.",
                "* 'Material.addTexture:1' - 2번째 param 값이 Texture 인스턴스가 아닐 경우.",
                "* 'Material.addTexture:2' - 2번째 param 값이 이미 등록 되어있는 Texture 일 경우.",
                "* 'Material.addTexture:3' - 3번째 param 값이 index:int or Texture 외 다른 형식이 들어오는 경우.",
                "* 'Material.addTexture:4' - 3번째 param 값이 index:int 일 경우 0 보다 작거나 등록되어 있는 Texture 수보다 많을 경우.",
                "* 'Material.addTexture:5' - 3번째 param 값이 Texture 일 경우 미리 등록된 Texture 가 아닐 경우."
            ],
            ret:[
                'this - 메서드체이닝을 위해 자신을 반환함.'
            ],
            sample:[
                "var indexTestMaterial = Material('#ffffff127.8');",
                "",
                "var indexTexture1 = new Texture();",
                "indexTestMaterial.addTexture(Texture.diffuse, indexTexture1, null, BlendMode.add);",
                "",
                "var indexTexture2 = new Texture();",
                "indexTestMaterial.addTexture(Texture.diffuse, indexTexture2, undefined, BlendMode.screen);",
                "",
                "var indexTexture3 = new Texture();",
                "indexTestMaterial.addTexture(Texture.diffuse, indexTexture3, 1, BlendMode.darken);",
                "",
                "var indexTexture4 = new Texture();",
                "indexTestMaterial.addTexture(Texture.diffuse, indexTexture4);",
                ""
            ],
            value:function addTexture(type, texture/*,index,blendMode*/) {
                var p, i = arguments[2];
                if (!texType[type]) this.error(0);
                if (!(texture instanceof Texture)) this.error(1);

                //lazy초기화
                p = texType[type];
                if (this in p) {
                    p = p[this];
                    if (p[texture]) this.error(2); //이미 있는 텍스쳐
                } else {
                    p = p[this] = [];
                }

                //중복검사용 마킹
                p[texture] = 1;
                //로딩전 텍스쳐에게는 이벤트리스너를 걸어줌
                if(!texture.isLoaded) {
                    texture.addEventListener(Texture.load, textureLoaded, null, this);
                }

                //실제 텍스쳐구조체에는 텍스쳐와 블랜드모드가 포함됨
                texture = {tex:texture};

                //블랜드모드가 들어온 경우의 처리
                if (arguments.length > 3) {
                    texture.blendMode = arguments[3];
                }
                //인덱스 제공 여부에 따라 텍스쳐리스트에 삽입
                if (i === undefined || i === null) {
                    p[p.length] = texture;
                } else if (typeof i == 'number') {
                    if (i < 0 || i > p.length - 1) {
                        this.error(4);
                    } else {
                        p.splice(i, 0, texture);
                    }
                } else if (i instanceof Texture) {
                    i = p.indexOf(i);
                    if (i > -1) {
                        p.splice(i, 0, texture);
                    } else {
                        this.error(5);
                    }
                } else {
                    this.error(3);
                }

                //changed이벤트는 무조건 발생함.
                this.dispatch(Material.changed);
                if (this.isLoaded) this.dispatch(Material.load);
                return this;
            }
        })
        .method('removeTexture', {
            description:[
                'removeTexture를 통해 등록된 텍스쳐를 제거함.'
            ],
            param:[
                'type:string - 어떠한 타입에 텍스쳐가 제거 될 것인가를 결정함.',
                "* [Texture.diffuse](Texture.md#diffuse) or 'diffuse' - 디퓨즈 맵으로 등록함.",
                "* [Texture.specular](Texture.md#specular) or 'specular' - 스페큘러 맵으로 등록함.",
                "* [Texture.diffuseWrap](Texture.md#diffusewrap) or 'diffuseWrap' - 디퓨즈랩 맵으로 등록함.",
                "* [Texture.normal](Texture.md#normal) or 'normal' - 노말 맵으로 등록함.",
                "* [Texture.specularNormal](Texture.md#specularNormal) or 'diffuse' - 스페큘러노말 맵으로 등록함.",
                '[Texture](Texture.md) - 제거 될 Texture instance.'
            ],
            ret:[
                'this - 메서드체이닝을 위해 자신을 반환함.'
            ],
            sample:[
                "material.addTexture(Texture.diffuse, indexTexture3, null, BlendMode.darken);",
                "material.removeTexture(Texture.diffuse, indexTexture3);"
            ],
            value:function removeTexture(type, texture){
                var p, key, i;
                if (texType[type]) {
                    p = texType[type][this];
                    if (p[texture]) {
                        p[texture] = 0;
                        i = p.length;
                        p.splice(p.indexOf(texture), 1);
                        delete p[texture]
                    }
                } else {
                    for (key in texType) {
                        p = texType[key][this];
                        if (p[texture]) {
                            p[texture] = 0;
                            p.splice(p.indexOf(texture), 1);
                            delete p[texture]
                        }
                    }
                }
                this.dispatch(Material.changed);
                return this;
            }
        })
        .event('changed', 'changed')
        .build();
})();