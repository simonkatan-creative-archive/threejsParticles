

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

	scale:      {value: 2.0, gui: true, min: 1.0, max: 10.0}
	

};

uniforms.resolution.value.x = renderer.domElement.width;
uniforms.resolution.value.y = renderer.domElement.height;

var material = new THREE.ShaderMaterial( {
	uniforms: uniforms,
	vertexShader: document.getElementById( 'vertexShader' ).textContent,
	fragmentShader: document.getElementById( 'fragmentShader' ).textContent
} );

var mesh = new THREE.Mesh( geometry, material );
scene.add( mesh );


var startTime = new Date().getTime();
var ellapsedTime = 0;


function render() {

	ellapsedTime = (new Date().getTime() - startTime) * 0.001;
	uniforms.time.value = ellapsedTime;
	uniforms.mouse.value = mousePos;

	//console.log(ellapsedTime);
	
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

  
};

window.onload = function() 
{
  var controlPanel = new ControlPanel();
  var gui = new dat.GUI();
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

