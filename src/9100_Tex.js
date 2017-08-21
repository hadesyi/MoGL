var Tex = mgl.Texture = function(src){
	switch(true){
	case v instanceof HTMLImageElement:
		if(!v.complete) throw 'image must be loaded';
	case v instanceof HTMLCanvasElement:case v instanceof HTMLVideoElement:case v instanceof ImageData:
	case typeof v == 'string' && v.substring(0, 10) == 'data:image' && v.indexOf('base64') > -1:
		break;
	default: throw 'invalid src';
	}
	this._src = src;
	this.id = (Date.now() + '_' + mgl.rnd()*10000000000).substr(0, 21);
};
Tex.prototype = map(Dispatcher.prototype);
fn(Tex,
'src',{
	get:function(){return this._src;}
});