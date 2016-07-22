

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var width = window.innerWidth;
var height = window.innerHeight;
var canvas;
var mousePos = new THREE.Vector2(0,0);


canvas = renderer.domElement;

canvas.addEventListener("mousemove", function (e) {
        
    mousePos.set(e.clientX/width, e.clientY/height);

 }, false);

canvas.addEventListener("touchstart", function (e) {

    mousePos.set(e.touches[0].clientX /width, e.touches[0].clientY / height);
    //console.log(mousePos);

}, false);


camera = new THREE.Camera();
camera.position.z = 1;

scene = new THREE.Scene();


var geometry = new THREE.PlaneBufferGeometry( 2, 2 );




var uniforms = {
	time:       { value: 1.0 },
	resolution: { value: new THREE.Vector2() },
	mouse:  	{value: mousePos },
	env_time:  	{value: 0. },

	scale:      {value: 1.0, gui: true, min: 1.0, max: 10.0},
	particle_size: {value: 40.0, gui: true, min: 1.0, max: 60.0},
	color_1: {value: new THREE.Vector3(1.,1.,1.), gui: true, type: "color"},
	color_2: {value: new THREE.Vector3(1.,1.,1.), gui: true, type: "color"}

};

uniforms.resolution.value.x = renderer.domElement.width;
uniforms.resolution.value.y = renderer.domElement.height;

var noiseBuffer = new Uint8Array(512 * 512 * 3 ); 


for(var i = 0; i < 512 * 512 * 3; i++)
{
	noiseBuffer[i] = Math.floor(Math.random() * 256);
}

var noiseTex = new THREE.DataTexture(noiseBuffer, 512,512, THREE.RGBFormat );
noiseTex.needsUpdate = true;

uniforms.noise_tex = {value: noiseTex};

var material = new THREE.ShaderMaterial( {
	uniforms: uniforms,
	vertexShader: document.getElementById( 'vertexShader' ).textContent,
	fragmentShader: document.getElementById( 'fragmentShader' ).textContent
} );


var PARTICLE_COUNT = 10000;
var geo = new THREE.BufferGeometry();


var particleVerts = new Float32Array(PARTICLE_COUNT * 3);
var particleColors = new Float32Array(PARTICLE_COUNT );



var color_1 = hexToFloat(uniforms.color_1.value);
var color_2 = hexToFloat(uniforms.color_2.value);

for (var i = 0; i < PARTICLE_COUNT; i++) {


	particleVerts[i * 3 + 0] = 0; //x
	particleVerts[i * 3 + 1] = 0; //y
	particleVerts[i * 3 + 2] = i/PARTICLE_COUNT; //z

	particleColors[i] = i%2;


}

geo.addAttribute('position', new THREE.BufferAttribute(particleVerts, 3));
geo.addAttribute('color_type', new THREE.BufferAttribute(particleColors, 1));

var particles = new THREE.Points( geo ,material);

scene.add( particles );


var startTime = new Date().getTime();
var envStartTime = new Date().getTime();
var ellapsedTime = 0;
var envLengthSeconds = 2.5;


function render() {

	ellapsedTime = (new Date().getTime() - startTime) * 0.001;
	uniforms.time.value = ellapsedTime;
	uniforms.mouse.value = mousePos;
	uniforms.env_time.value = Math.min(1.0,(new Date().getTime() - envStartTime) * 0.001/envLengthSeconds);


	//console.log(uniforms.env_time.value);

	 var gl = renderer.context;
  	gl.enable(gl.BLEND);
  	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	
	renderer.render( scene, camera );
	requestAnimationFrame( render );
	
}

render();

/*----------------------------------------GUI----------------------------------------------*/

var ControlPanel = function() {
  
  for (var property in uniforms) {
    if (uniforms.hasOwnProperty(property)) {
        if(uniforms[property].gui){
        	if( uniforms[property].value instanceof THREE.Vector2)
        	{
				this[property + "_x"] = uniforms[property].value.x;
				this[property + "_y"] = uniforms[property].value.y;
			}
			else if(uniforms[property].type == "color")
	  		{	
	  			this[property] = "#ffffff";
        	}else{
        		this[property] = uniforms[property].value;
        	}
        	
        }
    }
  }

  this.explode = function(){
  	envStartTime = new Date().getTime();
  }

  
};

window.onload = function() 
{
  var controlPanel = new ControlPanel();
  var gui = new dat.GUI();
  
  gui.add(controlPanel, 'explode');
  gui.remember(controlPanel);



  var events = {};
  
  for (var property in uniforms) {
  	if (uniforms.hasOwnProperty(property)) {
  		if(uniforms[property].gui){

  			if( uniforms[property].value instanceof THREE.Vector2)
        	{	
        		var coord = ["x", "y"];

        		for(var i = 0; i < 2; i++)
        		{

	        		events[property + "_" + coord[i]] = gui.add(controlPanel, property + "_" + coord[i], uniforms[property].min, uniforms[property].max);
		  			
		  			events[property + "_" + coord[i]].onChange(function(value) {
		  				var key = this.property.substring(0, this.property.length - 2);
					 	uniforms[key].value[this.property.substring(this.property.length - 1)] = value;
					});

	  			}

	  		}
	  		else if(uniforms[property].type == "color")
	  		{
	  			events[property] = gui.addColor(controlPanel, property);

	  			events[property].onChange(function(value) {
					
	  				var col = hexToFloat(value);

					uniforms[this.property].value.x = col[0]; 
					uniforms[this.property].value.y = col[1]; 
					uniforms[this.property].value.z = col[2]; 

	  			});
        	}
        	else
        	{
	  			events[property] = gui.add(controlPanel, property, uniforms[property].min, uniforms[property].max);
	  			
	  			events[property].onChange(function(value) {
				  uniforms[this.property].value = value;
				});

  			}
  		}
  	}
  }








};


/////////////////////////////////HELPERS/////////////////////////////////

function hexToFloat(hex) {

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
        [ parseInt(result[1], 16)/255.,
         parseInt(result[2], 16)/255.,
         parseInt(result[3], 16)/255.
        ]
    	: null;
}

