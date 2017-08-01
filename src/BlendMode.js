var BlendMode = cls('BlendMode', null, function(){}, {});
'add,alpha,darken,difference,erase,hardlight,invert,lighten,multiply,screen,subtract'.split(',').forEach(function(v){BlendMode[v] = v;});
Object.freeze(BlendMode);