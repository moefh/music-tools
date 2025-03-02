
function formatNumber(n, digits)
{
    if (digits === undefined) digits = 3;
    let s = Math.round(n * Math.pow(10, digits)).toString(10);
    while (s.length < digits+1) s = '0' + s;
    return s.substring(0, s.length-digits) + '.' + s.substring(s.length-digits);
}

class Fraction {

    constructor(n, d) {
        this.n = (n === undefined) ? 0 : n;
        this.d = (d === undefined) ? 1 : d;
    }

    clone() {
        return new Fraction(this.n, this.d);
    }
    
    getValue() {
        return this.n / this.d;
    }

    getLabel() {
        return `${this.n}/${this.d}`;
    }

    multiply(n, d) {
        if ((n instanceof Fraction) && d === undefined) {
            this.multiply(n.n, n.d);
        } else {
            this.n *= n;
            if (d !== undefined) this.d *= d;
            this.reduce();
        }
    }

    divide(n, d) {
        if ((n instanceof Fraction) && d === undefined) {
            this.multiply(n.d, n.n);
        } else {
            this.multiply((d === undefined) ? 1 : d, n);
        }
    }

    reduce() {
        let a = this.n;
        let b = this.d;
        while (b != 0) {
            let t = b;
            b = a % b;
            a = t;
        }
        this.n /= a;
        this.d /= a;
    }
    
}


class TemperamentUtil {

    static scaleFromNumericFifth(fifth) {
        // build scale from fundamental (1) plus 6 ascending fifths plus 5 descending fifths
        let freqs = [1];
        let up = 1;
        let down = 1;
        for (let i = 0; i < 6; i++) {
            up *= fifth;
            while (up >= 2) up /= 2;
            freqs.push(up);
            if (i == 5) continue;  // don't include descending tritone
            down /= fifth;
            while (down <= 1) down *= 2;
            freqs.push(down);
        }

        // sort list by value
        freqs.sort((a, b) => a - b);
        return freqs;
    }

    static scaleFromFractionalFifth(fifth) {
        // build scale from fundamental (1) plus 6 ascending fifths plus 5 descending fifths
        let freqs = [new Fraction(1)];
        let up = freqs[0].clone();
        let down = freqs[0].clone();
        for (let i = 0; i < 6; i++) {
            up.multiply(fifth);
            while (up.getValue() >= 2) up.multiply(1, 2);
            freqs.push(up.clone());
            if (i == 5) continue;  // don't include descending tritone
            down.divide(fifth);
            while (down.getValue() <= 1) down.multiply(2);
            freqs.push(down.clone());
        }

        // sort list by value
        freqs.sort((a, b) => a.getValue() - b.getValue());
        return freqs;
    }
    
    static getNumericInterval(freqs, note1, note2) {
        let interval = freqs[note2] / freqs[note1];
        if (note2 < note1) interval *= 2;
        return {
            value: interval,
            label: '',
        };
    }

    static getFractionalInterval(freqs, note1, note2) {
        let interval = freqs[note2].clone();
        if (note2 < note1) interval.multiply(2);
        interval.divide(freqs[note1]);
        return {
            value: interval.getValue(),
            label: interval.getLabel(),
        };
    }

}

class EqualTemperament {

    constructor() {
        this.freqs = Array.from({length:12}, (_, i) => Math.pow(2, i/12));
    }

    getInterval(note1, note2) {
        return TemperamentUtil.getNumericInterval(this.freqs, note1, note2);
    }
}

class PythagorasTemperament {

    constructor() {
        this.freqs = TemperamentUtil.scaleFromFractionalFifth(new Fraction(3, 2));
    }

    getInterval(note1, note2) {
        return TemperamentUtil.getFractionalInterval(this.freqs, note1, note2);
    }

}

class QuarterCommaMeantoneTemperament {

    constructor() {
        this.freqs = TemperamentUtil.scaleFromNumericFifth(Math.pow(5, 1/4));
    }

    getInterval(note1, note2) {
        return TemperamentUtil.getNumericInterval(this.freqs, note1, note2);
    }

}

class FiveLimitTuningTemperament {

    freqs = [
        new Fraction( 1,  1),  // P1
        new Fraction(16, 15),  // m2
        new Fraction( 9,  8),  // M2
        new Fraction( 6,  5),  // m3
        new Fraction( 5,  4),  // M3
        new Fraction( 4,  3),  // P4
        new Fraction(45, 32),  // TT
        new Fraction( 3,  2),  // P5
        new Fraction( 8,  5),  // m6
        new Fraction( 5,  3),  // M6
        new Fraction(16,  9),  // m7
        new Fraction(15,  8),  // M7
    ];

    
    getInterval(note1, note2) {
        return TemperamentUtil.getFractionalInterval(this.freqs, note1, note2);
    }
    
}

class SevenLimitTuningTemperament {

    freqs = [
        new Fraction( 1,  1),  // P1
        new Fraction(15, 14),  // m2
        new Fraction( 9,  8),  // M2
        new Fraction( 6,  5),  // m3
        new Fraction( 5,  4),  // M3
        new Fraction( 4,  3),  // P4
        new Fraction( 7,  5),  // TT
        new Fraction( 3,  2),  // P5
        new Fraction( 8,  5),  // m6
        new Fraction( 5,  3),  // M6
        new Fraction( 7,  4),  // m7
        new Fraction(15,  8),  // M7
    ];

    
    getInterval(note1, note2) {
        return TemperamentUtil.getFractionalInterval(this.freqs, note1, note2);
    }
    
}
