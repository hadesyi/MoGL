var World = mgl.World = function(c){
	this._scenes = [];
	this._isUpdate = true;
	this._mgl = new mgl(c);
};
fn(World,
'addScene', function(scene){
	is(scene, Scene, 'invalid scene');
	if(this._scenes.indexOf(scene) > -1) throw 'exist scene';
	this._scenes.push(scene);
	this._isUpdate = true;
},
'removeScene', function(scene){
	var i;
	is(scene, Scene, 'invalid scene');
	if((i = this._scenes.indexOf(scene)) == -1) return;
	this._scenes.splice(i, 1);
	this._isUpdate = true;
},
'render', function(){
	if(!this._isUpdate) return;
	this._isUpdate = false;
	
}
);