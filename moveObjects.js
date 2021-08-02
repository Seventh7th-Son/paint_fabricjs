var activeObject = canvas.getActiveObject();
const STEP = 2;
const cb = document.querySelector('#accept');

var Direction = {
	LEFT: 0,
	UP: 1,
	RIGHT: 2,
	DOWN: 3
};

fabric.util.addListener(document.body, 'keydown', function (options) {
	//	if (options.repeat) {
	//		return;
	//	}
	var key = options.which || options.keyCode; // key detection
	if (key === 37) { // handle Left key
		moveSelected(Direction.LEFT);
	} else if (key === 38) { // handle Up key
		moveSelected(Direction.UP);
	} else if (key === 39) { // handle Right key
		moveSelected(Direction.RIGHT);
	} else if (key === 40) { // handle Down key
		moveSelected(Direction.DOWN);

	} else if (key === 46) { // Delete key
		// deleteObjects();
		var activeObjects = canvas.getActiveObjects();
		canvas.discardActiveObject()
		if (activeObjects.length) {
			canvas.remove.apply(canvas, activeObjects);
		}

		canvas.selection = false;
		canvas.requestRenderAll();
	} else if (key === 27) { // Esc key
		canvas.discardActiveObject();
		canvas.requestRenderAll();
	}
});

function moveSelected(direction) {
	var activeObjects = canvas.getActiveObjects();
	if (activeObjects.length) {
		switch (direction) {
			case Direction.LEFT:
				if (canvas.getActiveObject()) {
					canvas.getActiveObject().left -= STEP;
					canvas.requestRenderAll();
				};
				break;
			case Direction.UP:

				if (canvas.getActiveObject()) {
					canvas.getActiveObject().top -= STEP;
					canvas.requestRenderAll();
				};
				break;
			case Direction.RIGHT:
				if (canvas.getActiveObject()) {
					canvas.getActiveObject().left += STEP;
					canvas.requestRenderAll();
				};
				break;
			case Direction.DOWN:
				if (canvas.getActiveObject()) {
					canvas.getActiveObject().top += STEP;
					canvas.requestRenderAll();
				};
				break;
		}
		canvas.requestRenderAll();
	}
}