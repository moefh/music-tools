
class CircleDisplay {

    noteStyles = {
	normal: "#000000",
	drag: "#00aa00",
	high: "#0000cc",
    };
    
    highNote = null;
    dragNote = null;
    
    constructor(canvas) {
	this.setCanvas(canvas);
	this.setBackground("#ffffff");
	this.setNoteNames(['?']);
	addEventListener("mousedown", ev => this.mouseDown(ev));
	addEventListener("mouseup", ev => this.mouseUp(ev));
	addEventListener("mousemove", ev => this.mouseMove(ev));
	this.handlers = {};
    }

    setNoteNames(names) {
	this.noteNames = names;
    }
    
    setCanvas(canvas) {
	this.canvas = canvas;
	this.ctx = canvas.getContext("2d");

	let w = parseInt(canvas.width) || 100;
	let h = parseInt(canvas.height) || 100;
	let size = Math.min(w, h);
	this.setRadius(size * 0.4);
	this.setCenter(size * 0.5, size * 0.5);
	this.setNoteHeight(size * 0.125);
	this.setFont(`${Math.floor(size/20)}px sans`);
    }

    setBackground(background) {
	this.background = background;
    }
    
    setCenter(x, y) {
	this.center = {x, y};
    }
    
    setRadius(radius) {
	this.radius = radius;
    }
    
    setFont(font) {
	this.font = font;
    }
    
    setNoteHeight(noteHeight) {
	this.noteHeight = noteHeight;
    }

    getPointDistance(p1, p2) {
	let dx = p1.x - p2.x;
	let dy = p1.y - p2.y;
	return Math.sqrt(dx*dx + dy*dy);
    }

    lerpPoint(p1, p2, val) {
	return {
	    x: p1.x * (1-val) + p2.x * val,
	    y: p1.y * (1-val) + p2.y * val,
	};
    }

    normalizeVector(v) {
	let m = Math.sqrt(v.x*v.x + v.y*v.y);
	v.x /= m;
	v.y /= m;
    }

    getNoteInfo(note) {
	let slice = 2 * Math.PI / 12;
	let angle = note * slice - Math.PI / 2;
	return {
	    sep: slice / 10,
	    angle: angle,
	    center: {
		x: this.center.x + this.radius * Math.cos(angle),
		y: this.center.y + this.radius * Math.sin(angle),
	    },
	}
    }
    
    getNoteFromPoint(x, y) {
	let dx = x - this.center.x;
	let dy = y - this.center.y;
	let dist = Math.sqrt(dx*dx + dy*dy);
	if (dist < this.radius - this.noteHeight/2 || dist > this.radius + this.noteHeight/2) {
	    return null;
	}
	let angle = Math.atan2(dy, dx);
	return (Math.round((angle + Math.PI/2) / (2*Math.PI) * 12) + 12) % 12;
    }
    
    getCanvasMousePos(ev) {
	var rect = this.canvas.getBoundingClientRect();
	return {
	    x: ev.clientX - rect.left,
	    y: ev.clientY - rect.top,
	};
    }

    renderNote(note) {
	let ctx = this.ctx;
	let info = this.getNoteInfo(note);
	let slice = 2 * Math.PI / 12;
	let start = info.angle - slice/2 + info.sep/2;
	let end = info.angle + slice/2 - info.sep/2;

	ctx.beginPath();
	ctx.arc(this.center.x, this.center.y, this.radius + this.noteHeight/2, start, end, false);
	ctx.arc(this.center.x, this.center.y, this.radius - this.noteHeight/2, end, start, true);
	ctx.arc(this.center.x, this.center.y, this.radius + this.noteHeight/2, start, start, false);
	ctx.stroke();
    }

    renderNoteName(note) {
	let info = this.getNoteInfo(note);
	let name = this.noteNames[note%this.noteNames.length];
	this.ctx.fillText(name, info.center.x, info.center.y + 5);
    }

    renderNoteArc(note1, note2) {
	let ctx = this.ctx;

	let info1 = this.getNoteInfo(note1);
	let info2 = this.getNoteInfo(note2);

	let dist = 0.95 * (this.radius - this.noteHeight/2) / this.getPointDistance(this.center, info1.center);
	let p1 = this.lerpPoint(this.center, info1.center, dist);
	let p2 = this.lerpPoint(this.center, info2.center, dist);

	ctx.strokeStyle = this.noteStyles.high;
	ctx.lineCap = "round";
	ctx.beginPath();
	ctx.moveTo(p1.x, p1.y);
	ctx.lineTo(p2.x, p2.y);
	ctx.stroke();
    }
    
    render() {
	let ctx = this.ctx;

	ctx.fillStyle = this.background;
	ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	ctx.font = this.font;
	ctx.textBaseline = "middle";
	ctx.textAlign = "center";
	ctx.lineCap = "butt";
	ctx.lineWidth = 4;
	for (let note = 0; note < 12; note++) {
	    if (note === this.dragNote) {
		ctx.strokeStyle = this.noteStyles.drag;
		ctx.fillStyle = this.noteStyles.drag;
	    } else if (note === this.highNote) {
		ctx.strokeStyle = this.noteStyles.high;
		ctx.fillStyle = this.noteStyles.high;
	    } else {
		ctx.strokeStyle = this.noteStyles.normal;
		ctx.fillStyle = this.noteStyles.normal;
	    }
	    this.renderNote(note);
	    this.renderNoteName(note);
	}
	if (this.dragNote !== null && this.highNote !== null && this.dragNote !== this.highNote) {
	    this.renderNoteArc(this.dragNote, this.highNote);
	}
    }

    setHandler(name, callback) {
	this.handlers[name] = callback;
    }
    
    handleIntervalChanged(note1, note2) {
	if (! this.handlers.intervalChanged) return;
	this.handlers.intervalChanged(note1, note2);
    }
    
    mouseMove(ev) {
	let mouse = this.getCanvasMousePos(ev);
	let note = this.getNoteFromPoint(mouse.x, mouse.y);
	if  (this.highNote != note) {
	    this.highNote = note;
	    this.render();
	    if (this.dragNote !== null) {
		if (this.highNote !== null) {
		    this.handleIntervalChanged(this.dragNote, this.highNote);
		} else {
		    this.handleIntervalChanged(null, null);
		}
	    }
	}
    }

    mouseDown(ev) {
	let mouse = this.getCanvasMousePos(ev);
	this.dragNote = this.getNoteFromPoint(mouse.x, mouse.y);
	this.highNote = this.dragNote;
	this.render();
	this.handleIntervalChanged(this.dragNote, this.highNote);
    }

    mouseUp(ev) {
	this.dragNote = null;
	this.render();
	if (this.highNote !== null) {
	    this.handleIntervalChanged(null, null);
	}
    }

}
