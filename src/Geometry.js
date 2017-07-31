var Geometry = cls('Geometry', null, (function(){
 	var pos = [], nm = [], tUV = [], tCo = [];
	var calcNormal = (function(){
		var v1, v2;
		v1 = {x:0, y:0, z:0}, v2 = {x:0, y:0, z:0};
		return function calcNormal(pos, idx){
			var i, j, k, l;
			this.super();
			for(nm.length = i = 0, j = pos.length; i < j; i++) nm[i] = 0;
			for(i = 0, j = idx.length; i < j; i += 3){
				k = 3*idx[i + 1], l = 3*idx[i];
				v1.x = pos[k] - pos[l];
				v1.y = pos[k + 1] - pos[l + 1];
				v1.z = pos[k + 2] - pos[l + 2];
				l = 3 * idx[i + 2];
				v2.x = pos[l] - pos[k];
				v2.y = pos[l + 1] - pos[k + 1];
				v2.z = pos[l + 2] - pos[k + 2];
				for(k = 0; k < 3; k++){
					l = 3*idx[i + k],
					ns[l] += v1.y*v2.z - v1.z*v2.y;
					ns[l + 1] += v1.z*v2.x - v1.x*v2.z;
					ns[l + 2] += v1.x*v2.y - v1.y*v2.x;
				}
			}
			for(i = 0, j = pos.length; i < j; i += 3){
				v1.x = ns[i], v1.y = ns[i + 1], v1.z = ns[i + 2];
				k = SQRT(v1.x*v1.x + v1.y*v1.y + v1.z*v1.z) || GLMAT_EPSILON;
				ns[i] = v1.x / k, ns[i + 1] = v1.y / k, ns[i + 2] = v1.z / k;
			}
		};
	})();
	var infoCheck = function(v){return Vertex[v];}
	return function(vertex, index, info) {
		var len, i, j, k, isNormal, isUV, isColor;
		if(!Array.isArray(vertex) && !(vertex instanceof Float32Array)) throw 'invalid vertex:' + vertex;
		if(index && (!Array.isArray(index) && !(index instanceof Uint16Array))) throw 'invalid index:' + index;
		pos.length = nm.length = tUV.length = tCo.length = 0;
		if(info){
			if(!Array.isArray(info) || !info.some(infoCheck) || vertex.length % (len = i = info.length)) throw 'invalid info:' + info;
			while(i--) info[info[i]] = i;
			isNormal = info.normalX && info.normalY && info.normalZ;
			isUV = info.u && info.v;
			isColor = info.r && info.g && info.b && info.a;
			for(i = 0, j = vertex.length / len; i < j; i++){
				k = len * i;
				pos.push(vertex[k+info.x], vertex[k+info.y], vertex[k+info.z]);
				if(isNormal) nm.push(vertex[k+info.normalX], vertex[k+info.normalY], vertex[k+info.normalZ]);
				if(isUV) tUV.push(vertex[k+info.u], vertex[k+info.v]);
				if(isColor) tCo.push(vertex[k+info.r], vertex[k+info.g], vertex[k+info.b], vertex[k+info.a]);
			}
			this._mPos = new Float32Array(pos);
		}else len = 3, this._mPos = vertex instanceof Float32Array ? vertex : new Float32Array(vertex));
		if(!index){
			if(!isNormal) calcNormal(info ? pos : vertex, index);
			this._mNormal = new Float32Array(nm);
			this._mUv = new Float32Array(tUV);
			this._mColor = new Float32Array(tCo);
			this._mTriCnt = index.length / 3;
			this._mVertexCnt = vertex.length / len;
			this._mIndex = index instanceof Uint16Array ? index : new Uint16Array(index);
		}else{
			this._mNormal = 0;
			this._mUv = 0;
			this._mColor = new Float32Array(tCo);
			this._mTriCnt = 0;
			this._mVertexCnt = vertex.length / len;
			this._mIndex = 0;
		}
	};
})(), {
	volume:{
		get(){
			var minX, minY, minZ, maxX, maxY, maxZ, t0, t1, t2, t, i;
			if(!this._mVolume){
				minX = minY = minZ = maxX = maxY = maxZ = 0,
				t = this._mPos, i = t.length;
				while(i--){
					t0 = i * 3, t1 = t0 + 1, t2 = t0 + 2,
					minX = t[t0] < minX ? t[t0] : minX,
					maxX = t[t0] > maxX ? t[t0] : maxX,
					minY = t[t1] < minY ? t[t1] : minY,
					maxY = t[t1] > maxY ? t[t1] : maxY,
					minZ = t[t2] < minZ ? t[t2] : minZ,
					maxZ = t[t2] > maxZ ? t[t2] : maxZ;
				}
				this._mVolume = [maxX - minX, maxY - minY, maxZ - minZ];
			}
			return this._mVolume;
		}
	}
});