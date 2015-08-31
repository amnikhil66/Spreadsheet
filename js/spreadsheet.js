//Spreadsheet
//
//Constructor
//
//Parameters: ele is mandatory, options is optional
var Spreadsheet = function(ele, options){
	var length = null;

	this.spreadsheetContainer = document.createElement('div');

	this.getData();
	length = Object.keys(this.data).length;

	this.spreadsheetContainer.id = "spreadsheet";
	this.options = options || {
		"columns": length || 3,
		"rows": length > 0 ? this.data['A'].length : 3
	};

	this.render(ele);
};

//Retrives data from LocalStorage
Spreadsheet.prototype.getData = function(){
	this.data = JSON.parse(localStorage.getItem('spreadsheet')) || {};
};

//Sets data to LocalStorage
Spreadsheet.prototype.setData = function(){
	var saveMessage = this.spreadsheetContainer.querySelector('.save-message');
	localStorage.setItem('spreadsheet', JSON.stringify(this.data));
	if(saveMessage){
		saveMessage.classList.add('saved');
	}
};

//Render the Spreadsheet
Spreadsheet.prototype.render = function(ele){
	var buttonContainer = document.createElement('div'),
		rowButton = document.createElement('button'),
		colButton = document.createElement('button'),
		saveMessage = document.createElement('div');

	this.table = document.createElement('table');
	this.thead = document.createElement('thead');
	this.tbody = document.createElement('tbody');

	this.thead.appendChild(document.createElement('tr'));

	for(var i = 0; i < this.options.columns; i++){
		var col = document.createElement('th'),
			title = String.fromCharCode(65 + i);

		col.innerHTML = title;
		col.setAttribute('id', title.toLowerCase());

		this.thead.firstChild.appendChild(col);

		if(!this.data.hasOwnProperty(title)){
			this.data[title] = [];
		}

		for(var j = 0; j < this.options.rows; j++){
			var dataRow = !!!i ? document.createElement('tr') : this.tbody.childNodes[j],
				td = document.createElement('td'),
				input = document.createElement('input');

			if(!!!this.data[title][j]){
				this.data[title][j] = '';
			}

			if(!!!dataRow.id){
				dataRow.id = j;
				dataRow.setAttribute('data-idx', j + 1);
			}

			input.setAttribute('disabled', true);
			td.setAttribute('id', title + "_" + j);
			td.appendChild(input);
			td.firstChild.setAttribute('value',  this.data[title][j]);

			dataRow.appendChild(td);

			if(!!!i){
				this.tbody.appendChild(dataRow);
			}
		}
	}

	this.setData();

	rowButton.appendChild(document.createElement('span'));
	rowButton.querySelector('span').textContent = "R";
	rowButton.id = "row_add";

	colButton.appendChild(document.createElement('span'));
	colButton.querySelector('span').textContent = "C";
	colButton.id = "col_add";

	buttonContainer.appendChild(rowButton);
	buttonContainer.appendChild(colButton);

	buttonContainer.className = "button-container";

	saveMessage.textContent = 'Data Saved';
	saveMessage.className = "save-message";

	this.table.appendChild(this.thead);
	this.table.appendChild(this.tbody);

	this.spreadsheetContainer.appendChild(this.table);
	this.spreadsheetContainer.appendChild(buttonContainer);
	this.spreadsheetContainer.appendChild(saveMessage);

	document.querySelector(ele).appendChild(this.spreadsheetContainer);

	this.spreadsheetContainer.addEventListener('blur', this, true);
	this.spreadsheetContainer.addEventListener('click', this);
	this.spreadsheetContainer.addEventListener('contextmenu', this);
};

//Event handler for all events bound to the Spreadsheet
Spreadsheet.prototype.handleEvent = function(event){
	switch(event.type){
		case 'click': {
			if(event.target.tagName === 'TH'){
				if(!!!event.target.classList.length){
					removeClass(document.getElementsByClassName('ascending'), 'ascending');
					removeClass(document.getElementsByClassName('descending'), 'descending');

					event.target.classList.add('ascending');

					sort('ascending',
						this.data[event.target.id.toUpperCase()],
						this);
				} else if(event.target.classList.contains('ascending')){
					event.target.classList.remove('ascending');
					event.target.classList.add('descending');

					sort('descending',
						this.data[event.target.id.toUpperCase()],
						this);
				} else {
					event.target.classList.remove('descending');

					sort('',
						this.data[event.target.id.toUpperCase()],
						this);
				}
			} else if(event.target.tagName === 'TD'){
				var input = event.target.querySelector('input');
				if(!!!event.target.classList.contains('edit')){
					event.target.classList.add('edit');
					input.removeAttribute('disabled');
					input.focus();
				} else {
					this.spreadsheetContainer.querySelector('.save-message').classList.remove('saved');
					var keys = event.target.getAttribute('id').split('_');

					event.target.classList.remove('edit');
					this.data[keys[0]][keys[1]] = input.value.trim();

					input.setAttribute('value', this.data[keys[0]][keys[1]]);
					input.setAttribute('disabled', true);
					input.blur();

					this.setData();
				}
			} else if(event.target.tagName === 'BUTTON'){
				if(event.target.id === 'row_add'){
					addRow(this);
				} else {
					addColumn(this);
				}
			}
		}
		break;
		default: {
			return false;
		}
	}
};

//Utility Functions
//
//Remove class name from passed element
function removeClass(eles, class_name){
	for(var i = 0; i < eles.length; i++){
		eles[i].classList.remove(class_name);
	}
}

//Sort passed array based on the order
function sort(order, data, self) {
	var sorted = data.slice(0);

	switch(order){
		case 'ascending': {
			sorted.sort(function(a, b) {
				return a === "" || b === "" ? 0 : a.localeCompare(b);
			});
			rearrangeDOM(getSortIndexes(sorted, data), self);
		}
		break;
		case 'descending': {
			sorted.sort(function(a, b){
				return a === "" || b === "" ? 0 : a.localeCompare(b) > 0 ? -1 : 1;
			});
			rearrangeDOM(getSortIndexes(sorted, data), self);
		}
		break;
		default: {
			rearrangeDOM(
				Array.apply(null,{length: data.length})
				.map(Number.call, Number), self);
		}
	}
}

//Get the before sort indexes of the array
function getSortIndexes(sorted, reference) {
	var indexes = [],
		i = 0,
		length = sorted.length;

	while(i < length) {
		var idx = reference.indexOf(sorted[i]);

		while(idx !== -1) {
			indexes.push(idx);
			idx = reference.indexOf(sorted[i], idx + 1);
		}

		sorted = sorted.filter(function(value){
			return value !== sorted[i];
		});

		length = sorted.length;
	}

	return indexes;
}

//Rearrange the TDs based on the sorted array
function rearrangeDOM(indexes, self){
	var rearrangedRows = [];

	for(var i = 0; i < indexes.length; i++) {
		rearrangedRows.push(document.getElementById(indexes[i]).outerHTML);
	}

	self.tbody.innerHTML = rearrangedRows.join('');
}

//Add a new Row
function addRow(self) {
	var tr = document.createElement('tr');

	for(var i = 0; i < self.options.columns; i++){
		var td = document.createElement('td'),
			title = String.fromCharCode(65 + i),
			input = document.createElement('input');

		input.setAttribute('disabled', true);

		td.appendChild(input);
		td.id = title.toLowerCase() + '_' + i;
		self.data[title][self.options.rows] = '';

		tr.appendChild(td);
	}

	tr.id = self.options.rows;
	self.options.rows++;
	self.setData();
	self.tbody.appendChild(tr);
}

//Add a new Column
function addColumn(self) {
	var th = document.createElement('th'),
		title = String.fromCharCode(65 + self.options.columns);

	th.id = title.toLowerCase();
	th.textContent = title;

	self.spreadsheetContainer.querySelector('thead > tr').appendChild(th);
	self.options.columns++;
	self.data[title] = [];

	for(var i = 0; i < self.options.rows; i++){
		var td = document.createElement('td'),
			input = document.createElement('input');

		input.setAttribute('disabled', true);
		td.appendChild(input);
		td.id = title + "_" + i;
		self.data[title][i] = ""

		document.getElementById(i).appendChild(td);
	}

	self.setData();
}
