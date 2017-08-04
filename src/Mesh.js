var Mesh = cls('Mesh', Matrix, function(geometry, material, culling){
	this.super();
	this.shared('geometry', geometry);
	this.shared('material', material);
	this.shared('culling', culling || Mesh.cullingFront);
}, {});
'cullingNone,cullingFront.cullingBack'.split(',').forEach(function(v){Mesh[v] = v;});
Object.freeze(Mesh);