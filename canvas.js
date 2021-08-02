//initiate canvas
var canvas = new fabric.Canvas('myCanvas');



fabric.Object.prototype.transparentCorners = false;

$(document).ready(function () {
	canvasFunctions();
});

function canvasFunctions() {

	var tool = 'Select';
	var action = 'none';
	var color = 'Red'
	var x0, y0;
	var selected = null;

	var group;
	var state = []; //used for undo/redo - stores states
	var mods = 0; //used for undo/redo - stores number of undos/states



	function flipX() {
		var obj = canvas.getActiveObject();
		if (obj) {
			obj.set('flipX', !obj.flipX);
			canvas.requestRenderAll();
		}
	}

	function flipY() {
		var obj = canvas.getActiveObject();
		if (obj) {
			obj.set('flipY', !obj.flipY);
			canvas.requestRenderAll();
		}
	}

	//set the mode
	$(".mode").click(function () {
		tool = $(this).attr('id');
		var currentTool = document.getElementById("currentTool");
		currentTool.textContent = "Mode: " + tool;
		canvas.isDrawingMode = false; //don't draw until "Freeline" is clicked

		if (tool === 'Select') {
			canvas.forEachObject(function (o) {
				o.selectable = true;
				var setCoords = o.setCoords.bind(o);
				o.on({
					moving: setCoords,
					scaling: setCoords,
					rotating: setCoords
				});
				canvas.selection = true;
				canvas.setActiveObject(o);
			});
		}
	});



	//set the action
	$(".action").click(function () {
		action = $(this).attr('id');
		var currentAction = document.getElementById("currentAction");
		currentAction.textContent = "Action: " + action;
		canvas.isDrawingMode = false;
	});

	//set the fill color
	$(".color").click(function () {
		color = $(this).attr('id');
		canvas.freeDrawingBrush.color = color;
		var currentColor = document.getElementById("currentColor");
		currentColor.textContent = "Color: " + color;
		});

	$("#MirrorX").click(function () {
		flipX();
		updateModifications(true);
	});

	$("#MirrorY").click(function () {
		flipY();
		updateModifications(true);
	});

	//clear the canvas
	$("#Clear").click(function () {
		updateModifications(true);
		canvas.clear();
		updateModifications(true);

	});

	$("#Delete").click(function () {
		canvas.isDrawingMode = false;
		deleteObjects();
		updateModifications(true); //add modification into state array
	});

	$("#Copy").click(function () {
		canvas.isDrawingMode = false;
		copyObjects();
	});

	$("#Paste").click(function () {
		canvas.isDrawingMode = false;
		pasteObjects();

	});

	$("#Cut").click(function () {
		canvas.isDrawingMode = false;
		cutObjects();

	});

	$("#Group").click(function () {
		canvas.isDrawingMode = false;
		groupObjects();

	});

	$("#Ungroup").click(function () {
		canvas.isDrawingMode = false;
		ungroup()

	});

	$("#Undo").click(function () {
		canvas.isDrawingMode = false;
		Undo();
	});

	$("#Redo").click(function () {
		canvas.isDrawingMode = false;
		Redo();
	});

	$("#Save").click(function () {
		canvas.isDrawingMode = false;
		saveCanvas();
	});

	canvas.on('mouse:down', function (options) {
		var pointer = canvas.getPointer(options.e);
		x0 = pointer.x;
		y0 = pointer.y;
		var fcolor = '';

		if (document.getElementById("dFill").checked) {
			fcolor = color;
		}

		switch (tool) {

			case 'Straightline': {
				var coordinates = [x0, y0, x0, y0]; //set initial coordinates of straight line to the mouse point
				var line = new fabric.Line(coordinates, options = {
					strokeWidth: parseInt(test5.value, 10) || 1,
					fill: color,
					stroke: color,
					strokeLineCap: "round",
					originX: 'center',
					originY: 'center',

					hoverCursor: "pointer",
					selectable: false,

				});
				canvas.add(line);
				canvas.setActiveObject(line);

				canvas.requestRenderAll();
				selected = line;
				break;
			}

			case 'Rectangle': {
				var rectangle = new fabric.Rect({

					top: y0, //set initial y0 of rectangle at y of mouse
					left: x0, //set initial x0 of rectangle at x of mouse
					originX: 'left',
					originY: 'top',
					width: pointer.x - x0,
					height: pointer.y - y0,
					strokeWidth: parseInt(test5.value, 10) || 1,
					stroke: color,
					fill: fcolor, //color
					selectable: false,

				});
				canvas.add(rectangle);
				canvas.setActiveObject(rectangle);
				canvas.requestRenderAll();
				selected = rectangle;
				break;
			}

			case 'Square': {
				var square = new fabric.Rect({

					top: y0, //set initial y0 of rectangle at y of mouse
					left: x0, //set initial x0 of rectangle at x of mouse
					originX: 'left',
					originY: 'top',
					width: pointer.x - x0,
					height: pointer.y - y0,
					strokeWidth: parseInt(test5.value, 10) || 1,
					stroke: color,
					fill: fcolor,
					selectable: false,

				});
				canvas.add(square);
				canvas.setActiveObject(square);
				canvas.requestRenderAll();
				selected = square;
				break;
			}

			case 'Ellipse': {
				var ellipse = new fabric.Ellipse({
					originX: 'center', //set X point to start at the center
					originY: 'center', //set Y point to start at the center
					strokeWidth: parseInt(test5.value, 10) || 1,
					stroke: color,
					top: y0,
					left: x0,
					fill: fcolor,
					rx: 0,
					ry: 0,
					selectable: false,

				});
				canvas.add(ellipse);
				canvas.setActiveObject(ellipse);
				canvas.requestRenderAll();
				selected = ellipse;
				break;
			}

			case 'Circle': {
				var circle = new fabric.Circle({
					left: pointer.x,
					top: pointer.y,
					radius: 0,
					strokeWidth: parseInt(test5.value, 10) || 1,
					stroke: color,
					fill: fcolor,
					selectable: false,
					originX: 'center',
					originY: 'center',

				});

				canvas.add(circle);
				canvas.setActiveObject(circle);
				canvas.requestRenderAll();
				selected = circle;
				break;
			}

		}
	});



	canvas.on('mouse:move', function (options) {
		var pointer = canvas.getPointer(options.e);
		var x2 = pointer.x;
		var y2 = pointer.y;

		var changeInX = x2 - x0;
		var changeInY = y2 - y0;

		switch (tool) {
			case 'Freeline': {
				canvas.isDrawingMode = true;
				currentColor = document.getElementById("currentColor");
				currentColor.textContent = "Color: " + color;
				canvas.freeDrawingBrush.color = color;
				canvas.freeDrawingBrush.width = parseInt(test5.value, 10) || 1;
				break;
			}

			case 'Straightline': {
				if (selected !== null) {
					selected.set({
						x2: x2,
						y2: y2
					})
				}
				canvas.renderAll();
				break;
			}

			case 'Rectangle': {
				if (selected !== null) {

					if (x0 > pointer.x) {
						selected.set({
							left: Math.abs(pointer.x)
						});
					}
					if (y0 > pointer.y) {
						selected.set({
							top: Math.abs(pointer.y)
						});
					}

					selected.set({
						width: Math.abs(x0 - pointer.x)
					});
					selected.set({
						height: Math.abs(y0 - pointer.y)
					});


				}
				canvas.renderAll();
				break;
			}

			case 'Square': {
				if (selected !== null) {
				if (x0 > pointer.x) {
					selected.set({
						left: Math.abs(pointer.x)
					});
				}
				if (y0 > pointer.y) {
					selected.set({
						top: Math.abs(pointer.y)
					});
				}

				var xl = Math.abs(x0 - pointer.x);
				var yl = Math.abs(y0 - pointer.y);

				if (xl >= yl) {
					yl = xl
				} else if (yl >= xl) {
					xl = yl
				}

				selected.set({
					width: xl
				});
				selected.set({
					height: yl
				});
			}
				canvas.renderAll();
				break;
			}

			case 'Ellipse': {
				if (selected !== null) {
					selected.set({
						rx: Math.abs(changeInX),
						ry: Math.abs(changeInY)
					})
				}
				canvas.requestRenderAll();
				break;
			}

			case 'Circle': {
				if (Math.abs(changeInX) >= Math.abs(changeInY))
					changeInY = changeInX;
				else if (Math.abs(changeInX) < Math.abs(changeInY))
					changeInX = changeInY;

				if (selected !== null) {
					selected.set({
						radius: Math.abs(changeInX)
					})
				}
				canvas.renderAll();
				break;
			}

		}
	});


	canvas.on('mouse:up', function (e) {

		switch (tool) {
			case 'Freeline': {

				canvas.forEachObject(function (o) {
					o.selectable = false;
					var setCoords = o.setCoords.bind(o);
					o.on({
						moving: setCoords,
						scaling: setCoords,
						rotating: setCoords
					});
					canvas.selection = false;
					canvas.setActiveObject(o);
				})
			}
		}

		if (tool !== 'Select') {
			selected = null;
			canvas.discardActiveObject();
			canvas.isDrawingMode = false;
			canvas.selection = false;
		}

		x0 = 0;
		y0 = 0;
		updateModifications(true); //add modification into state array
	});


	function deleteObjects() {
		var activeObjects = canvas.getActiveObjects();
		canvas.discardActiveObject()
		if (activeObjects.length) {
			canvas.remove.apply(canvas, activeObjects);
		}
	}

	function cutObjects() {
		copyObjects()
		deleteObjects()
	}

	function copyObjects() {

		canvas.getActiveObject().clone(function (cloned) {
			_clipboard = cloned;
		})
	}


	function pasteObjects() {
		//"copied" so can paste the saved objects as many times
		// clone again, so you can do multiple copies.
		_clipboard.clone(function (clonedObj) {
			canvas.discardActiveObject();
			clonedObj.set({
				left: clonedObj.left, // + 10,
				top: clonedObj.top, //- 10,
				evented: true,
			});
			if (clonedObj.type === 'activeSelection') {
				// active selection needs a reference to the canvas.
				clonedObj.canvas = canvas;
				clonedObj.forEachObject(function (obj) {
					canvas.add(obj);
				});
				// this should solve the unselectability
				clonedObj.setCoords();
			} else {
				canvas.add(clonedObj);
			}
			_clipboard.top += 0; //10;
			_clipboard.left += 0; //10;
			canvas.setActiveObject(clonedObj);
			canvas.requestRenderAll();
		})
	}


	function groupObjects() {

		if (!canvas.getActiveObject()) {
			return;
		}
		if (canvas.getActiveObject().type !== 'activeSelection') {
			return;
		}
		canvas.getActiveObject().toGroup();
		canvas.requestRenderAll();
	}

	function ungroup() {
		if (!canvas.getActiveObject()) {
			return;
		}
		if (canvas.getActiveObject().type !== 'group') {
			return;
		}
		canvas.getActiveObject().toActiveSelection();
		canvas.requestRenderAll();
	}

	//when object is modified or added, push the modification/state into the state array
	canvas.on(
		'object:modified',
		function () {
			updateModifications(true);
		},
		'object:added',
		function () {
			updateModifications(true);
		});

	//push modification into state array
	function updateModifications(saveModification) {
		if (saveModification === true) {
			myjson = JSON.stringify(canvas);
			state.push(myjson);
		}
	}

	//load previous state
	function Undo() {
		if (mods < state.length) {
			canvas.clear().requestRenderAll();
			canvas.loadFromJSON(state[state.length - 1 - mods - 1]);
			canvas.requestRenderAll();
			mods += 1;
		}
	}

	//reload next state
	function Redo() {
		if (mods > 0) {
			canvas.clear().requestRenderAll();
			canvas.loadFromJSON(state[state.length - 1 - mods + 1]);
			canvas.requestRenderAll();
			mods -= 1;
		}
	}

	//save the current canvas
	function saveCanvas() {
		var canvasName = prompt("What would you like to name the canvas?");
		canvas.discardActiveObject();
		canvas.requestRenderAll();

		var fileContent = JSON.stringify(canvas);

		var bb = new Blob([fileContent], {
			type: 'text/plain'
		});
		var a = document.createElement('a');
		a.download = canvasName + '.json';
		a.href = window.URL.createObjectURL(bb);
		a.click();

	}


}