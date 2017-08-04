var Texture = cls('Texture', null, (function(){
	var c = document.createElement('canvas'), ctx = c.getContext('2d');
	var resizer = function(resizeType, v){
				var tw = 1, th = 1;
				while(v.width > tw) tw *= 2;
				while(v.height > th) th *= 2;
				if(resizeType === Texture.zoomOut){
						if(v.width < tw) tw /= 2;
						if(v.height < th) th /= 2;
				}
				canvas.width = tw, canvas.height = th;
				context.clearRect(0, 0, tw, th);
				switch(resizeType){
		case Texture.crop:
			var ratio = v.height / v.width;
			if(v.height < th){
				v.height = th;
				v.width = v.height / ratio;
			}
			context.drawImage(v, 0, 0, v.width, v.height);
			break;
		case Texture.addSpace:
			if(v.width < tw) tw = Math.round(v.width);
			if(v.height < th) th = Math.round(v.height);
			context.drawImage(v, 0, 0, tw, th);
			break;
		default:
			context.drawImage(v, 0, 0, tw, th);
				}
				v.src = canvas.toDataURL();
				return v;
		};
	return function(v, resizeType){
		var complete, img, w, h;
		this.super();
		img = document.createElement('img');
		switch(true){
		case v instanceof HTMLImageElement:
			if(!v.complete) throw 'incompleted img:' + v;
			img.src = v.src;
			break;
		case v instanceof ImageData:
			c.width = w = v.width,
			c.height = h = v.height,
			ctx.clearRect(0, 0, w, h),
			ctx.putImageData(v, 0, 0),
			img.src = context.toDataURL();
			break;
		default:
			if(typeof v !== 'string' || v.substring(0, 10) !== 'data:image' || v.indexOf('base64') === -1) throw 'invalid' +
			' img:' + v;
			img.src = v;
		}
		if(resizeType){
			if(!Texture[resizeType]) throw 'invalid resizeType:' + resizeType;
			img = resizer(img);
		}
		this.shared('img', img);
	};
})(), {});
'zoomOut,zoomIn,crop,addSpace,diffuse,specular,diffuseWrap,normal,specularNormal'.split(',').forEach(function(v){Texture[v] = v;});
Object.freeze(Texture);