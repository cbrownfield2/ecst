// JavaScript Document
//Cameron Brownfield
//This is a object manipulation module that allows for changing of aspects
//of objects that are rendered with webGL. 
var objectList = new Array();
var notice_failed_create = "Failed to create object.";
var notice_failed_update = "Failed to update object.";
var notice_failed_delete = "Failed to delete object.";
var notice_success_create  = " successfully created!";
var notice_success_update = " successfuly updated!";
var notice_success_delete = " successfully delete!";
var error_name_missing = "Name must not be null or empty.";
var error_object_exists = "Already exists an object named ";
var error_object_missing = "Failed to find object. Something went terribly wrong! Refresh!";

var lighting = new Object();
lighting.lposx = document.getElementById('lposx').value;
lighting.lposy = document.getElementById('lposy').value;
lighting.lposz = document.getElementById('lposz').value;
lighting.ltoggle = document.getElementById('ltoggle').value;

/**
 * Loads initial state of objects (a solar system model)
 */
function loadObjs(){
	//Create Ground Object
	//To scale solar system. 
	objectList.push(new obj(0, 0,0,0,		200,200,200,		0,0,0, 	0,0,0, 	0,0,0,			"Sky"));
	objectList.push(new obj(1, 0,0,0,		10,10,10,			0,0,0, 	0,0,0, 	1,0.25,0,		"Sun"));
	objectList.push(new obj(1, 10.57,0,0, 	0.03,0.03,0.03,		0,0,0, 	0,0,0, 	1,0,0,			"Mercury"));				
	objectList.push(new obj(1, 11.08,0,0, 	0.085,0.085,0.085, 	0,0,0, 	0,0,0, 	1,0.5,0,		"Venus"));				
	objectList.push(new obj(1, 11.49,0,0, 	0.09,0.09,0.09, 	0,0,0, 	0,0,0, 	0.32,0.57,0.5,	"Earth"));				
	objectList.push(new obj(1, 12.27,0,0, 	0.045,0.045,0.045, 	0,0,0, 	0,0,0, 	1,0,0,			"Mars"));				
	objectList.push(new obj(1, 17.78,0,0, 	1.0,1.0,1.0, 		0,0,0, 	0,0,0, 	1,1,0.35,		"Jupiter"));				
	objectList.push(new obj(1, 24.27,0,0, 	0.835,0.835,0.835, 	0,0,0, 	0,0,0, 	0,1,0.5,		"Saturn"));				
	objectList.push(new obj(1, 38.7,0,0, 	0.335,0.335,0.335, 	0,0,0, 	0,0,0, 	0,0.5,1.0,		"Uranus"));				
	objectList.push(new obj(1, 54.99,0,0, 	0.325,0.325,0.325, 	0,0,0, 	0,0,0, 	1,0.4,1.0,		"Neptune"));				
	objectList.push(new obj(1, 69.13,0,0, 	0.015,0.015,0.015, 	0,0,0, 	0,0,0, 	1,1,1,			"The Forgotten Planet"));				
	loadObjectMenu();
}

/**
 * Creates the object. 
 * Parameters are the parameters required to create an object. 
 * The user only changes type and name on creation. Rest are set to default
 * values. 
 * For X,Y, and Z it accepts position, scalle, rotation, center of rotation, and color multipliers. 
 */
function obj(type, posx, posy, posz, scalex, scaley, scalez, rotx, roty, rotz, corotx, coroty, corotz, r, g, b, name){
	this.type= type;
	this.posx= posx;
	this.posy= posy;
	this.posz= posz;
	this.scalex= scalex;
	this.scaley= scaley;
	this.scalez= scalez;
	this.rotx= rotx;
	this.roty= roty;
	this.rotz= rotz;
	this.rotox= corotx;
	this.rotoy= coroty;
	this.rotoz= corotz;
	this.r= r;
	this.g= g;
	this.b= b;
	this.name= name;
}

/**
 * Called from the html submit "Create Object" button.
 * This reads input from the visible html page, and uses
 * the data to create the default object.
 */
function createObject(){
	var type = document.getElementById('obj_type').value; 
	var name = document.getElementById('objName').value;
	if(name == ""){
		notice(notice_failed_create);
		error(error_name_missing);
	} else if(containsObject(name)){
		notice(notice_failed_create);
		error(error_object_exists+name);
	} else{
		notice(name+notice_success_create);
		clearErrors();
		document.getElementById('objName').value = "";
		var newObj = new obj(type, 0,1,0, 1,1,1, 0,0,0, 0,0,0, 0.5, 0.5, 0.5, name);
		objectList.push(newObj);
		addObjectToMenu(newObj);
	}
}

/**
 * Called whenever a slider gets changed, updates
 * the values of the object, and thus the presentation
 * in the canvas. (Positioning, scaling, rotation, etc...)
 *
 */
function updateObject(){
	var objectSelect = document.getElementById('objects');
	var option = objectSelect.options[objectSelect.selectedIndex];
	var obj = option.value;
	var i = findObjByName(option.firstChild.nodeValue);
	if(containsObject(name)){
		notice(notice_failed_update);
		error(error_object_exists+name);
	} else{
		if(i > -1){
			objectList[i].posx = document.getElementById('xLoc').value;
			objectList[i].posy = document.getElementById('yLoc').value;
			objectList[i].posz = document.getElementById('zLoc').value;
			objectList[i].scalex = document.getElementById('xScale').value;
			objectList[i].scaley = document.getElementById('yScale').value;
			objectList[i].scalez = document.getElementById('zScale').value;
			objectList[i].rotx = document.getElementById('xRot').value;
			objectList[i].roty = document.getElementById('yRot').value;
			objectList[i].rotz = document.getElementById('zRot').value;
			objectList[i].rotox = document.getElementById('xCenter').value;
			objectList[i].rotoy = document.getElementById('yCenter').value;
			objectList[i].rotoz = document.getElementById('zCenter').value;
			objectList[i].r = document.getElementById('Cred').value;
			objectList[i].g = document.getElementById('Cgreen').value;
			objectList[i].b = document.getElementById('Cblue').value;
			//option.firstChild.nodeValue = objectList[i].name;
			//notice(objectList[i].name + notice_success_update);

		} else{
			notice(notice_failed_update);
			error(error_object_missing);
		}
	}	
	//console.log(objectList);
}

/**
 * Deletes and object from the objectList vector. 
 * It's no longer rendered to the screen. 
 * Updates the select options on the page. 
 */
function deleteObject(){
	var objectSelect = document.getElementById('objects');
	var option = objectSelect.options[objectSelect.selectedIndex];
	var obj = option.value;
	var i = findObjByName(option.firstChild.nodeValue);
	var objectsRemoved = objectList.splice(i, 1);
	objectSelect.removeChild(option);
	updateSliders();
	notice("Object" + notice_success_delete);
}

/**
 * Updates the notice on the visible html document. 
 */
function notice(note){
	document.getElementById('noticeMsg').innerHTML = note;
}

function error(err){
	document.getElementById('errorMsg').innerHTML = "Error: "+err;
}

function clearErrors(){
	document.getElementById('errorMsg').innerHTML = "";
}

function containsObject(name){
	var i;
	for(i=0;i<objectList.length;i++){
		if(objectList[i].name == name){
			return true;
		}
	}
	return false;
}

/**
 * Helper function to adding an object to the select options.
 */
function addObjectToMenu(obj){
	var objectSelect = document.getElementById('objects');
	var option = document.createElement('option');
	option.appendChild(document.createTextNode(obj.name))
	option.value = obj;
	objectSelect.appendChild(option);
}

/**
 * Helper function for the object menu, initial loading. 
 */ 
function loadObjectMenu(){
	var i;
	for(i=0; i<objectList.length; i++){
		var objectSelect = document.getElementById('objects');
		var option = document.createElement('option');
		option.appendChild(document.createTextNode(objectList[i].name))
		option.value = objectList[i];
		objectSelect.appendChild(option);	
	}
}

/**
 * Helper function for accessing an object by name.
 * @param objName the name of the object you want to access
 * @return the object in the object list with name equal to 
 * 	objName (param)
 */
function findObjByName(objName){
	var i;
	for(i=0;i<objectList.length;i++){	
		if(objectList[i].name == objName){
			return i;
		}
	}
	return -1;
}

/**
 * Whenever a slider changes, all sliders get updated. 
 * Extra work but still fast. Necessary to do all of them, 
 * as this is also called whenever we select a new object from the
 * menu. 
 */
function updateSliders(){
	var objectSelect = document.getElementById('objects');
	var option = objectSelect.options[objectSelect.selectedIndex];
	var obj = option.value;
	var i = findObjByName(option.firstChild.nodeValue);
	$('#xPosSlider').foundation('slider', 'set_value', objectList[i].posx);
	$('#yPosSlider').foundation('slider', 'set_value', objectList[i].posy);
	$('#zPosSlider').foundation('slider', 'set_value', objectList[i].posz);
	$('#xScaleSlider').foundation('slider', 'set_value', objectList[i].scalex);
	$('#yScaleSlider').foundation('slider', 'set_value', objectList[i].scaley);
	$('#zScaleSlider').foundation('slider', 'set_value', objectList[i].scalez);
	$('#xRotSlider').foundation('slider', 'set_value', objectList[i].rotx);
	$('#yRotSlider').foundation('slider', 'set_value', objectList[i].roty);
	$('#zRotSlider').foundation('slider', 'set_value', objectList[i].rotz);
	$('#xCenterSlider').foundation('slider', 'set_value', objectList[i].rotox);
	$('#yCenterSlider').foundation('slider', 'set_value', objectList[i].rotoy);
	$('#zCenterSlider').foundation('slider', 'set_value', objectList[i].rotoz);
	$('#redSlider').foundation('slider', 'set_value', objectList[i].r);
	$('#greenSlider').foundation('slider', 'set_value', objectList[i].g);
	$('#blueSlider').foundation('slider', 'set_value', objectList[i].b);
	$('#lightXSlider').foundation('slider', 'set_value', lighting.lposx);
	$('#lightYSlider').foundation('slider', 'set_value', lighting.lposy);
	$('#lightZSlider').foundation('slider', 'set_value', lighting.lposz);
}

/**
 * Updates lighting information from user input. 
 */
function updateLighting(){
	lighting.lposx = document.getElementById('lposx').value;
	lighting.lposy = document.getElementById('lposy').value;
	lighting.lposz = document.getElementById('lposz').value;
	lighting.ltoggle = document.getElementById('ltoggle').value;
}