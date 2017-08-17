var mglLoader = function(f){
	var ret = [], cnt = 0;
	var files = [
		'0_head',
		'100_mgl',
		'101_primitive',
		'200_matrix',
		'300_shader',
		'400_program',
		'500_buffer',
		'footer'
	];
	files.forEach(function(v, idx){
		var xhr = new XMLHttpRequest();
		xhr.open('GET', '../src/' + v + '.js', true);
		xhr.onreadystatechange = function(){
			var scr;
			if(xhr.readyState == 4 && xhr.status == 200){
				ret[idx] = xhr.responseText;
				if(++cnt == files.length){
					scr = document.createElement('script');
					scr.text = ret.join('\n');
					document.body.appendChild(scr);
					f();
				}
			}
		};
		xhr.send(null);
	});
};