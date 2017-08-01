var Vertex = cls('Vertex', null, function(){}, {});
'x,y,z,r,g,b,a,u,v,normalX,normalY,normalZ'.split(',').forEach(function(v){Vertex[v] = v;});
Object.freeze(Vertex);