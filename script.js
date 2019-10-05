const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const image = new Image();
image.onload = onLoad;
//image.src = 'img.jpg';
image.src = 'hulkhogan2.jpg';

var clipPoints = [];

var x = 0;
var y = 0;

var dx = 0;
var dy = 0;

//scale
var sx = 1.0;
var sy = 1.0;

var clip_x = 0;
var clip_y = 0;

var dragged = null;
var createPoints = true;

canvas.addEventListener('mousedown', e => {
	x = e.clientX;
	y = e.clientY;

	for (let p of clipPoints) {
		let d = (p[0] - x) ** 2 + (p[1] - y) ** 2;
		if (d < 169) {
			dragged = p;
			break;
		}
	}

	if (dragged === null && createPoints) {
		clipPoints.push([x, y]);

		clip_x = 0;
		clip_y = 0;
		for (let p of clipPoints) {
			clip_x += p[0];
			clip_y += p[1];
		}

		clip_x /= clipPoints.length;
		clip_y /= clipPoints.length;

		dx = clip_x;
		dy = clip_y;
	}
	drawRecursive();
});

canvas.addEventListener('mouseup', e => {
	dragged = null;
});

canvas.addEventListener('mousemove', e => {
	if (dragged !== null) {
		dragged[0] = e.clientX;
		dragged[1] = e.clientY;
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
		sx *= 1.01;
		sy *= 1.01;
	} else if (e.keyCode == 83) {
		sx *= 0.99;
		sy *= 0.99;
	} else {
		createPoints = false;
		console.log("koniec");
	}
	drawRecursive();
});

function drawRecursive() {
	ctx.drawImage(image, 0, 0);

	ctx.setTransform(1, 0, 0, 1, 0, 0);
	//ctx.rotate(6 * Math.PI / 180);

	let actual_sx = 1;
	let actual_sy = 1;

	let rel_x = 0;
	let rel_y = 0;

	for (let i = 0; i < 10; i++) {
    ctx.scale(sx, sy);
		actual_sx *= sx;
		actual_sy *= sy;

		if (i > 0) {
			rel_x += (dx - clip_x) * sx ** i;
			rel_y += (dy - clip_y) * sy ** i;
		}

		let off_x = dx / actual_sx + rel_x / actual_sx - clip_x;
		let off_y = dy / actual_sy + rel_y / actual_sy - clip_y;

		if (clipPoints.length > 0) {
			ctx.beginPath();
			ctx.moveTo(clipPoints[0][0] + off_x, clipPoints[0][1] + off_y);
			for (let p of clipPoints) {
				ctx.lineTo(p[0] + off_x, p[1] + off_y);
			}
			ctx.closePath();
		}
    
		ctx.restore();
		ctx.save();
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.scale(actual_sx, actual_sy);
		ctx.clip();

		ctx.drawImage(image, off_x, off_y);
	}
	ctx.restore();
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

	ctx.fillStyle = 'black';
	for (let p of clipPoints) {
		ctx.beginPath()
		ctx.arc(p[0], p[1], 7, 0, Math.PI * 2, false);
		ctx.closePath();
		ctx.fill();
	}

	ctx.fillStyle = 'white';
	for (let p of clipPoints) {
		ctx.beginPath()
		ctx.arc(p[0], p[1], 5, 0, Math.PI * 2, false);
		ctx.closePath();
		ctx.fill();
	}
}

function onLoad() {
  canvas.width = this.naturalWidth;
	canvas.height = this.naturalHeight;
  drawRecursive();
}