const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const image = new Image();

const dropzone = document.getElementById('canvas');

const clipCanvas = document.createElement('canvas');
const clipCtx = clipCanvas.getContext('2d');
var clipPoints = [];

dropzone.ondrop = function(e) {
  e.preventDefault();
  var reader = new FileReader();
  reader.readAsDataURL(e.dataTransfer.files[0]);
	reader.onload = function (e) {
		image.src=e.target.result;
  };
};

dropzone.ondragover = function() {
  return false;
};

image.onload = onLoad;
image.src = 'drop.png';

var x = 0;
var y = 0;

var dx = 0;
var dy = 0;

var scale = 1;
var angle = 0;

var clipMid_x = 0;
var clipMid_y = 0;

var controller_x;
var controller_y;

var dragged = null;
var createPoints = true;

var iterationCount = 10;

canvas.addEventListener('mousedown', e => {
	x = e.clientX;
  y = e.clientY - canvas.offsetTop;

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
  drawGUI();
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
			let d = (clipMid_x + dx - e.clientX) ** 2 + (clipMid_y + dy - e.clientY + canvas.offsetTop) ** 2;

			d0 = Math.sqrt(d0);
			d = Math.sqrt(d);

      scale = d/d0;

			let sine = (e.clientY - canvas.offsetTop - clipMid_y - dy) / d;
			let cosine = (e.clientX - clipMid_x - dx) / d;

			let angleController = getAngle(sine,cosine);

      let sine0 = (clipPoints[0][1] - clipMid_y) / d0;
			let cosine0 = (clipPoints[0][0] - clipMid_x) / d0;

			let angle0 = getAngle(sine0,cosine0);

			angle = angleController - angle0;
		} else {
			dragged[0] = e.clientX;
			dragged[1] = e.clientY - canvas.offsetTop;
   
      let rel_x = -clipMid_x*scale;
      let rel_y = -clipMid_y*scale;
      let newDx = Math.cos(angle) * rel_x - Math.sin(angle) * rel_y + clipMid_x + dx;
      let newDy = Math.sin(angle) * rel_x + Math.cos(angle) * rel_y + clipMid_y + dy;

      updateClipMiddle();

      rel_x = -clipMid_x*scale;
      rel_y = -clipMid_y*scale;
      newDx -= Math.cos(angle) * rel_x - Math.sin(angle) * rel_y + clipMid_x;
      newDy -= Math.sin(angle) * rel_x + Math.cos(angle) * rel_y + clipMid_y;

      //compensation of image shift
      dx = newDx;
      dy = newDy;
		}
	} else if (e.buttons > 0) {
		dx += e.clientX - x;
		dy += e.clientY - canvas.offsetTop - y;
		x = e.clientX;
		y = e.clientY - canvas.offsetTop;
	}
	drawRecursive();
  drawGUI();
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

	for (let i = 0; i < iterationCount; i++) {
		ctx.translate(dx, dy);

		ctx.scale(scale, scale);
		ctx.rotate(angle);

		ctx.translate(-clipMid_x, -clipMid_y);
		ctx.drawImage(clipCanvas, 0, 0);
		ctx.translate(clipMid_x, clipMid_y);
	}

	clipCtx.restore();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function drawGUI() {
	if (clipPoints.length == 0) return;

	ctx.strokeStyle = 'black';
	ctx.lineWidth = 5;
	ctx.beginPath();
	ctx.moveTo(clipPoints[0][0], clipPoints[0][1]);
	for (let p of clipPoints) {
		ctx.lineTo(p[0], p[1]);
	}
	ctx.closePath();
	ctx.stroke();

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

	controller_x = Math.cos(angle) * rel_x - Math.sin(angle) * rel_y;
	controller_y = Math.sin(angle) * rel_x + Math.cos(angle) * rel_y;
	controller_x += clipMid_x + dx;
	controller_y += clipMid_y + dy;

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
  reset();
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

function getAngle(s, c) {
  if(c >= 0) 
    return Math.asin(s);
  else 
    return Math.PI - Math.asin(s); 
}

function switchLock(unlock = false) {
  var btn = document.getElementById('lockBtn');
  if(!createPoints || unlock){
    createPoints = true;
    lockBtn.innerText = "Lock creating points";
  }
  else{
    createPoints = false;
    lockBtn.innerText = "Unlock creating points";
  }
}

function saveImage() {
  var link = document.createElement('a');
  link.download = 'recursion.png';

  drawRecursive();
  link.href = canvas.toDataURL();
  drawGUI();

  link.click();
}

function reset() {
  clipPoints = [];
  switchLock(true);
  dx = 0;
  dy = 0;
  scale = 1;
  angle = 0;
  drawRecursive();
}

function setInput() {
  scale = parseFloat( document.getElementById('scaleIn').value);
  angle = parseFloat( document.getElementById('rotationIn').value);
  dx = parseFloat( document.getElementById('dxIn').value);
  dy = parseFloat( document.getElementById('dyIn').value);
  iterationCount = parseInt( document.getElementById('iterationsIn').value);

  drawRecursive();
  drawGUI();
}

function switchInput() {
  var manualInput = document.getElementById('manualInput');
  var btn = document.getElementById('inputBtn');
  if( btn.innerText == "Show input") {
    btn.innerText = "Hide input";
    manualInput.style.display = 'block';
  }
  else {
    btn.innerText = "Show input";
    manualInput.style.display = 'none';
  }
}