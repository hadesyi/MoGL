var Scene = cls('Scene', null, function Scene() {
	this.shared('children', {});
	this.shared('cameras', {});
	this.shared('shaders', {});
	this._mDirectionalLight = [0, -1, -1];
},{
	directionalLight:{
		set:function(v){this._mDirectionalLight = v;},
		get:function(){return this._mDirectionalLight;}
	},
	addMesh:function(mesh){
		var c = this.children, m = mesh.material;
		if(!(mesh instanceof Mesh)) throw 'invalid mesh:' + v;
		if(!c[m]){
			c[m] = {mat:m, cnt:m.textureCount, items:[]};
			if(!this.shaders[m.shading]){
				this.shaders[m.shading] = {
					vertex:MG.vertexShaderParser(m.shading),
					fragment:MG.fragmentShaderParser(m.shading)
				};
			}
		}
		c = c[m];
		if(c.items.indexOf(mesh) > -1) throw 'exist child:' + mesh;
	  	c.items.push(mesh);
    },
	removeMesh:function(mesh){
		var c = this.children[mesh.material], i;
		if(!c || (i = c.items.indexOf(mesh)) == -1) return;
		c.items.splice(i, 1);
	},
    addCamera:function(camera){
		var c = this.cameras;
		if(!(camera instanceof Camera)) throw 'invalid camera:' + camera;
		if(c.indexOf(camera) == -1) c.push(camera);
	},
	removeCamera:function(camera){
		var c = this.cameras, i;
		if((i = c.indexOf(camera)) > -1) c.splice(i, 1);
	}
});