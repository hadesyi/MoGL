## mgl:class
A class that wraps around the WebGL layer, and hides the low-level API lightly.

### mgl#constructor

* param
    1. canvas:[string|HTMLCanvasElement] - canvas element id or canvas element.
	2. option:[Object] - context option. Only the properties passed are changed, the rest remain the default value(same WebGL default)
	    * alpha = true
		* depth = true
		* stencil = false
		* antialias = true
		* premultipliedAlpha = true
		* preserveDrawingBuffer = true
* return - mgl

```js
const m = new mgl('cid', {depth: false});
```

### mgl#depth

toggle depth test.

* param
    1. depth function or null:[string|null] - null to turn off depth test. depth function to turn on depth test and to set depth algorithm.
	    * depth function - 'less'(usualy), 'greater', 'equal', 'lequal', 'gequal', 'notequal', 'never', 'always'
* return - this

```js
const m = new mgl('cid', {depth: false});
m.depth('less');
m.depth(null);
```

### mgl#blend

toggle blend mode

* param
    1. sfactor or null:[string|null] - null to turn off blend mode. sfactor to turn on blend mode and to set blend mode sfactor algorithm.
	    * sfactor function - 'zero', 'one', 'src_alpha', 'src_alpha_saturate', 'one_minus_src_alpha', 'dst_color', 'one_minus_dst_color', 'constant_color', 'one_minus_constant_color', 'dst_alpha', 'one_minus_dst_alpha', 'constant_alpha', 'one_minus_constant_alpha'
	2. ?dfactor:[string] - when blend mode turn on, set blend mode dfactor algorithm.
	    * dfactor function - sane as for sfactor except 'src_alpha_saturate'
* return - this

```js
const m = new mgl('cid');
m.blend('src_alpha', 'src_alpha');
m.blend(null);
```

### mgl#scissor

toggle scissor test. when activated, range of scissor is automatically adjusted to the size of the canvas.

* param
    1. isActivate[boolean] - toggle sissor test

* return - this

```js
const m = new mgl('cid');
m.scissor(true);
m.scissor(false);
```

### mgl#culling'

toggle culling. 

* param
    1. face[string|null] - null to turn off culling. face to turn on culling and to set cullface. when cullface is front, frontface is automatically set CW.
	    * face - 'front', 'back', 'front_and_back'
* return - this
```js
const m = new mgl('cid');
m.culling('front');
m.culling(null);
```

### mgl#bg

* param
    1. color
	2.
* return -

```js
const m = new mgl('cid', {depth: false});
```
### mgl#viewport

* param
    1. width
	2. height
* return -

```js
const m = new mgl('cid', {depth: false});
```
### mgl#clear

* param
    1.
	2.
* return -

```js
const m = new mgl('cid', {depth: false});
```
### mgl#buffer

* param
    1. key
	2. isDynamic
	3. info
	4. vertex
	5. index
	6. makeNormal
* return -

```js
const m = new mgl('cid', {depth: false});
```
### mgl#program

* param
    1. key
	2. vertexShader
	3. fragmentShader
* return -

```js
const m = new mgl('cid', {depth: false});
```
### mgl#uniform

* param
    1. key
	2. uniformData
* return -

```js
const m = new mgl('cid', {depth: false});
```
### mgl#texture

* param
    1. key
	2. isFlipY
	3. isMipmap
	4. texture
* return -

```js
const m = new mgl('cid', {depth: false});
```
### mgl#attr', function(k, buf, attr, stride, offset)

* param
    1. programKey
	2. bufferKey
	3. attribute
	4. stride
	5. offset
* return -

```js
const m = new mgl('cid', {depth: false});
```
### mgl#index

* param
    1. programKey
	2. bufferKey
* return -

```js
const m = new mgl('cid', {depth: false});
```
### mgl#drawArray

* param
    1. mode
	2. start
	3. count
* return -

```js
const m = new mgl('cid', {depth: false});
```
### mgl#drawElement

* param
    1. mode
	2. offset
* return -

```js
const m = new mgl('cid', {depth: false});
```
### mgl.sin

cached Math.sin

* param
    1. radian[number] - radian for calculation.
* return - number

```js
const v = mgl.sin(Math.PI);
```

### mgl.cos

cached Math.cos

* param
    1. radian[number] - radian for calculation.
* return - number

```js
const v = mgl.sin(Math.PI);
```
### mgl.tan

cached Math.tan

* param
    1. radian[number] - radian for calculation.
* return - number

```js
const v = mgl.sin(Math.PI);
```

### mgl.normal

calulate vertex normal.

* param
    1. positionBuffer[Buffer]
	2. indexBuffer[Buffer]
* return - array[float]

```js
const m = mgl.sin(Math.PI);
m.buffer('test', false, 'xyz', [0,0,0,1,1,1,2,2,2], [0,1,2]);
const normal = mgl.normal(m.buffer('test'), m.buffer('test'));
```