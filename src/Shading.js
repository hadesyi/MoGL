var Shading = cls('Shading', null, function(){}, {});
'none,phong,gouraud,blinn,flat,toon,vcolor'.split(',').forEach(function(v){Shading[v] = v;});
Object.freeze(Shading);