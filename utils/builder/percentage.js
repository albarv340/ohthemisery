class Percentage {
    constructor(value, percent) {
        if (this.isPercent(percent)) {
            this.perc = Number(value);
            this.val = Number(value) / 100;
        } else {
            this.perc = Number(value) * 100;
            this.val = Number(value);
        }
    }

    isPercent(percent) {
        // The default should be a percentage.
        // So, if percent is true or not specified at all (not passed into the constructor)
        // the value should be treated as a percentage.
        return percent == true || percent == undefined;
    }

    toFixedPerc(places) {
        return this.perc.toFixed(places);
    }

    addP(percentage) {
        this.perc += percentage.perc;
        this.val += percentage.val;
        return this;
    }

    mulP(percentage) {
        this.perc *= percentage.val;
        this.val *= percentage.val;
        return this;
    }

    add(value, percent) {
        // Add function with a standalone value
        if (this.isPercent(percent)) {
            this.perc += Number(value);
            this.val += Number(value) / 100;
        } else {
            this.perc += Number(value) * 100;
            this.val += Number(value);
        }
        return this;
    }

    mul(value, percent) {
        // Mul function with a standalone value
        if (this.isPercent(percent)) {
            this.perc *= Number(value) / 100;
            this.val *= Number(value) / 100;
        } else {
            this.perc *= Number(value);
            this.val *= Number(value);
        }
        return this;
    }

    duplicate() {
        return new Percentage(this.perc);
    }
}

module.exports = Percentage;