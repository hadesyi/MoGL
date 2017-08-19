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
};
fn(Tex,
  'src', {
  	get:function(){return this._src;}
  }
);
var Text = mgl.Texture = function(src){
	switch(true){
	case v instanceof HTMLImageElement:
		if(!v.complete) throw 'image must be loaded';
	case v instanceof HTMLCanvasElement:case v instanceof HTMLVideoElement:case v instanceof ImageData:
	case typeof v == 'string' && v.substring(0, 10) == 'data:image' && v.indexOf('base64') > -1:
		break;
	default: throw 'invalid src';
	}
	this._src = src;
};