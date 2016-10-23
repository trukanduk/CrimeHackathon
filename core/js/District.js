var kDefaultTooltipRelScale = 100*1000;

function _renderSluchaevWord(num) {
	if (num%10 == 1) {
		return "случай";
	} else if (num%10 == 2) {
		return "случая";
	} else {
		return "случаев";
	}
}

function _renderScale(num) {
	var result = "";
	while (num > 0) {
		result = " " + ("000" + num%1000).slice(-3) + result;
		num = Math.floor(num / 1000);
	}

	while (result.length > 0 && (result[0] == "0" || result[0] == " ")) {
		result = result.slice(1);
	}

	return result;
}

function new_District(map, name, initialStyles) {
	var type = "district";
	var coordsSet = (type == "district" ? kDistrictCoords : kUpperDistrictCoords);
	var self = L.polygon(coordsSet[name], initialStyles);
	// this.prototype.__proto__.constructor.call(this, coordsSet[this.name], initialStyles);
	self.map = map;
	self.name = name;
	self.type = "district";
	self.checked = false;
	self.hover = false;

	self.on('mouseover', function() {
        this.hover = true;
        this.openTooltip();
        this._updateStyle();
    }).on('mouseout', function() {
        this.hover = false;
        this.closeTooltip();
        this._updateStyle();
    }).on('click', function() {
        this.map._districtClick(this.name);
    });

    self.checked = false;
    self.hover = false;

	self.toggleCheck = District_toggleCheck;
	self.check = District_check;
	self.uncheck = District_uncheck;
	self._updateStyle = District__updateStyle;
	self.setColor = District_setColor;
	self.setTooltipExt = District_setTooltipExt;
	self.setUndefinedTooltip     = District_setUndefinedTooltip;

    return self;
}

function District_toggleCheck() {
	this.check(!this.checked);
	return this;
}

function District_check(value) {
	if (value === undefined) {
		value = true;
	}
	if (!!this.checked == !!value) {
		return;
	}

	this.checked = !!value;
    this._updateStyle();

    if (this.checked) {
	    selectedDistricts.add(this.name);
    } else {
	    selectedDistricts.delete(this.name);
	}
	return this;
}

function District_uncheck() {
	this.check(false);
	return this;
}

function District__updateStyle() {
    this.setStyle(_getDistrictStyle(this.checked, this.hover));
}

function District_setColor(color) {
	this.setStyle({ fillColor: color });
	return this;
}

function District_setTooltipExt(abs, rel, scale) {
	if (scale === undefined) {
		scale = kDefaultTooltipRelScale;
	}

	var relValue = Math.floor(rel*scale);
	this.bindTooltip(this.name + ": " + abs + " " + _renderSluchaevWord(abs) + "<br/>" +
                                relValue + " " + _renderSluchaevWord(relValue) + " на " + _renderScale(scale) + " жителей");
	return this;
}

function District_setUndefinedTooltip() {
	this.bindTooltip(this.name + ": нет данных");
	return this;
}


