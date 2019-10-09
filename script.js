const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const image = new Image();

const clipCanvas = document.createElement('canvas');
const clipCtx = clipCanvas.getContext('2d');
var clipPoints = [];

image.onload = onLoad;
//image.src = 'img.jpg';
image.src = 'hulkhogan2.jpg';

var x = 0;
var y = 0;

var dx = 0;
var dy = 0;

var scale = 1;

//clip middle
var clipMid_x = 0;
var clipMid_y = 0;

var controller_x;
var controller_y;

var dragged = null;
var createPoints = true;

canvas.addEventListener('mousedown', e => {
	x = e.clientX;
	y = e.clientY;

	if ((controller_x - x) ** 2 + (controller_y - y) ** 2 < 169) {
		dragged = "controller";
	}

	if (dragged === null) {
		for (let p of clipPoints) {
			let d = (p[0] - x) ** 2 + (p[1] - y) ** 2;
			if (d < 169) {
				dragged = p;
				break;
			}
		}
	}

	if (dragged === null && createPoints) {
		clipPoints.push([x, y]);
		updateClipMiddle();
	}
	drawRecursive();
});

canvas.addEventListener('mouseup', e => {
	dragged = null;
});

canvas.addEventListener('mousemove', e => {
	if (dragged !== null) {
		if (dragged == "controller") {

      //default distance between clip middle and controller
			let d0 = (clipPoints[0][0] - clipMid_x) ** 2 + (clipPoints[0][1] - clipMid_y) ** 2;
      //new distance between clip middle and controller
			let d = (clipMid_x + dx - e.clientX) ** 2 + (clipMid_y + dy - e.clientY) ** 2;

			d0 = Math.sqrt(d0);
			d = Math.sqrt(d);

      scale = d/d0;

		} else {
			dragged[0] = e.clientX;
			dragged[1] = e.clientY;

      updateClipMiddle();
		}
	} else if (e.buttons > 0) {
		dx += e.clientX - x;
		dy += e.clientY - y;
		x = e.clientX;
		y = e.clientY;
	}
	drawRecursive();
});

document.addEventListener("keydown", e => {
	if (e.keyCode == 87) {
		scale *= 1.04;
		scale *= 1.04;
	} else if (e.keyCode == 83) {
		scale *= 0.96;
		scale *= 0.96;
	} else {
		createPoints = false;
		console.log("koniec");
	}
	drawRecursive();
});

function drawRecursive() {
	ctx.setTransform(1, 0, 0, 1, 0, 0);

	clipCtx.clearRect(0, 0, clipCanvas.width, clipCanvas.height);
	clipCtx.save();

	if (clipPoints.length > 0) {
		clipCtx.beginPath();
		clipCtx.moveTo(clipPoints[0][0], clipPoints[0][1]);
		for (let p of clipPoints) {
			clipCtx.lineTo(p[0], p[1]);
		}
		clipCtx.closePath();
	}
	clipCtx.clip();

	clipCtx.drawImage(image, 0, 0);
	ctx.drawImage(image, 0, 0);

	ctx.translate(clipMid_x, clipMid_y);

	for (let i = 0; i < 10; i++) {
		ctx.translate(dx, dy);

		ctx.scale(scale, scale);

		ctx.translate(-clipMid_x, -clipMid_y);
		ctx.drawImage(clipCanvas, 0, 0);
		ctx.translate(clipMid_x, clipMid_y);
	}

	clipCtx.restore();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	drawGUI();
}

function drawGUI() {
	if (clipPoints.length == 0) return;

	ctx.strokeStyle = 'white';
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.moveTo(clipPoints[0][0], clipPoints[0][1]);
	for (let p of clipPoints) {
		ctx.lineTo(p[0], p[1]);
	}
	ctx.closePath();
	ctx.stroke();

	ctx.fillStyle = 'white';
	ctx.strokeStyle = 'black';
	for (let p of clipPoints) {
		ctx.beginPath()
		ctx.arc(p[0], p[1], 7, 0, Math.PI * 2, false);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}

	let rel_x = clipPoints[0][0] - clipMid_x;
	rel_x *= scale;

	let rel_y = clipPoints[0][1] - clipMid_y;
	rel_y *= scale;

	controller_x = rel_x + clipMid_x + dx;
	controller_y = rel_y + clipMid_y + dy;

	ctx.fillStyle = 'red';
	ctx.beginPath();
	ctx.arc(controller_x, controller_y, 7, 0, Math.PI * 2, false);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
}

function onLoad() {
	canvas.width = this.naturalWidth;
	canvas.height = this.naturalHeight;
	clipCanvas.width = this.naturalWidth;
	clipCanvas.height = this.naturalHeight;
	drawRecursive();
}

function updateClipMiddle(){
  if(clipPoints.length == 0) return;

  clipMid_x = 0;
	clipMid_y = 0;
	for (let p of clipPoints) {
		clipMid_x += p[0];
		clipMid_y += p[1];
	}

	clipMid_x /= clipPoints.length;
	clipMid_y /= clipPoints.length;
}