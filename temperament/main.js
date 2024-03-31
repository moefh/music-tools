
class NoteNames {
    static semitoneNames = [ 'C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B' ];
    // this use of flats instead of sharps only really make sense when the root is C:
    static fifthNames = [ 'C', 'D♭', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B' ];

    root = 0;
    order = 'semitones';

    setRoot(root) { this.root = root; }
    setOrder(order) { this.order = order; }
    getOrder() { return this.order; }
    
    getAllNotes() {
	return Array.from({length: 12}, (_, i) => this.getName(i));
    }
    
    getName(pos) {
	if (this.order == 'fifths') {
	    return NoteNames.fifthNames[(pos * 7 + this.root) % 12];
	}
	return NoteNames.semitoneNames[(pos + this.root) % 12];
    }
}

class IntervalNames {

    static names = [
	{ name: 'P1', desc: 'unison' },
	{ name: 'm2', desc: 'minor second' },
	{ name: 'M2', desc: 'major second' },
	{ name: 'm3', desc: 'minor third' },
	{ name: 'M3', desc: 'major third' },
	{ name: 'P4', desc: 'perfect fourth' },
	{ name: 'TT', desc: 'tritone' },
	{ name: 'P5', desc: 'perfect fifth' },
	{ name: 'm6', desc: 'minor sixth' },
	{ name: 'M6', desc: 'major sixth' },
	{ name: 'm7', desc: 'minor seventh' },
	{ name: 'M7', desc: 'major seventh' },
    ];

    static name(n) { return IntervalNames.names[n].name; }
    static desc(n) { return IntervalNames.names[n].desc; }
}

function set_root_note()
{
    var select = document.getElementById('root-note');
    tempering.setRootNote(parseInt(select.value));
}

function set_note_order()
{
    var select = document.getElementById('note-order');
    tempering.setNoteOrder(select.value);
}

function set_temperament()
{
    var select = document.getElementById('temperament');
    switch (select.value) {
    case '12-tet':                 tempering.setTemperament(new EqualTemperament()); break;
    case 'quarter-comma-meantone': tempering.setTemperament(new QuarterCommaMeantoneTemperament()); break;
    case 'pythagoras':             tempering.setTemperament(new PythagorasTemperament()); break;
    case 'five-limit':             tempering.setTemperament(new FiveLimitTuningTemperament()); break;
    case 'seven-limit':            tempering.setTemperament(new SevenLimitTuningTemperament()); break;
    }
}

class Tempering {

    constructor() {
	this.canvasElement = document.getElementById('circle-canvas');
	this.intervalElement = document.getElementById('interval');
	this.temperament = new EqualTemperament();
	this.notes = new NoteNames();
	this.circle = new CircleDisplay(this.canvasElement);
	this.circle.setHandler('intervalChanged', (p1, p2) => this.intervalChanged(p1, p2));
    }

    setRootNote(root) {  // 0 = C, 1 = C#, ...
	this.notes.setRoot(root);
	this.circle.setNoteNames(this.notes.getAllNotes());
	this.circle.render();
    }
    
    setNoteOrder(order) {
	this.notes.setOrder(order);
	this.circle.setNoteNames(this.notes.getAllNotes());
	this.circle.render();
    }

    setTemperament(temperament) {
	this.temperament = temperament;
    }
    
    intervalChanged(pos1, pos2) {
	if (pos1 === null) {
	    this.intervalElement.innerText = '';
	    return;
	}

	let name1 = this.notes.getName(pos1);
	let name2 = this.notes.getName(pos2);

	let noteOrder = this.notes.getOrder();
	let note1 = (noteOrder == 'fifths') ? pos1 * 7 % 12 : pos1;
	let note2 = (noteOrder == 'fifths') ? pos2 * 7 % 12 : pos2;
	let semitones = (note2 - note1 + 12) % 12;
	let name = IntervalNames.name(semitones);
	let desc = IntervalNames.desc(semitones);

	let interval = this.temperament.getInterval(note1, note2);
	let ratio = formatNumber(interval.value, 4);
	let cents = formatNumber(1200 * Math.log2(interval.value), 2);
	let label = (interval.label !== '') ? `(${interval.label})` : '';
	this.intervalElement.innerText = `${name1} - ${name2}\n${name}: ${desc}\nRatio: ${ratio} ${label}\nCents: ${cents}`;
    }
}

var tempering = null;
document.addEventListener('DOMContentLoaded', function() {
    tempering = new Tempering();
    set_root_note();
    set_note_order();
    set_temperament();
}, false);
