var Spreadsheet = function(options){
	this.spreadsheetContainer = document.createElement('div');

	this.getData();
	this.options = options || {
		"columns": Object.keys(this.data).length || 6,
		"rows": Object.keys(this.data).length > 0 ? this.data['A'].length : 7
	};

	this.render();
};

Spreadsheet.prototype.getData = function(){
	this.data = JSON.parse(localStorage.getItem('spreadsheet')) || {};
};

Spreadsheet.prototype.setData = function(){
	localStorage.setItem('spreadsheet', JSON.stringify(this.data));
};

Spreadsheet.prototype.render = function(){
	var mainTable = document.createElement('table'),
		header = document.createElement('thead'),
		body = document.createElement('tbody'),
		buttonContainer = document.createElement('div'),
		rowButton = document.createElement('button'),
		colButton = document.createElement('button');

	header.appendChild(document.createElement('tr'));

	for(var i = 0; i < this.options.columns; i++){
		var col = document.createElement('th'),
			title = String.fromCharCode(65 + i);

		col.innerHTML = title;
		col.setAttribute('id', title.toLowerCase());

		header.firstChild.appendChild(col);

		if(!this.data.hasOwnProperty(title)){
			this.data[title] = [];
		}

		for(var j = 0; j < this.options.rows; j++){
			var dataRow = !!!i ? document.createElement('tr') : body.childNodes[j],
				td = document.createElement('td');

				if(!!!this.data[title][j]){
					this.data[title][j] = '';
				}

				if(!!!dataRow.id){
					dataRow.id = j;
				}

				td.setAttribute('id', title + "_" + j);
				td.appendChild(document.createElement('input'));
				td.firstChild.setAttribute('value',  this.data[title][j]);

				dataRow.appendChild(td);

			if(!!!i){
				body.appendChild(dataRow);
			}
		}
	}

	this.setData();

	rowButton.textContent = "R";
	rowButton.id = "row_add";

	colButton.textContent = "C";
	colButton.id = "col_add";

	buttonContainer.appendChild(rowButton);
	buttonContainer.appendChild(colButton);

	mainTable.appendChild(header);
	mainTable.appendChild(body);

	this.spreadsheetContainer.appendChild(mainTable);
	this.spreadsheetContainer.appendChild(buttonContainer);

	document.getElementById('main').appendChild(this.spreadsheetContainer);

	this.spreadsheetContainer.addEventListener('blur', this, true);
	this.spreadsheetContainer.addEventListener('click', this);
	this.spreadsheetContainer.addEventListener('contextmenu', this);
};

Spreadsheet.prototype.handleEvent = function(event){
	switch(event.type){
		case 'blur': {
			if(event.target.tagName === 'INPUT'){
				var keys = event.target.parentElement.getAttribute('id').split('_');

				this.data[keys[0]][keys[1]] = event.target.value.trim();
				this.setData();
			}
		}
		break;
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
			} else if(event.target.tagName === 'BUTTON'){
				if(event.target.id === 'row_add'){
					addRow(this);
				} else {
					addColumn(this);
				}
			}
		}
		break;
		case 'contextmenu': {
			event.preventDefault();
		}
		break;
		default: {
			return false;
		}
	}
};

function removeClass(eles, class_name){
	for(var i = 0; i < eles.length; i++){
		eles[i].classList.remove(class_name);
	}
}

function sort(order, data, self) {
	var sorted = data.slice(0);

	switch(order){
		case 'ascending': {
			sorted.sort();
			rearrangeDOM(getSortIndexes(sorted, data), self);
		}
		break;
		case 'descending': {
			sorted.reverse();
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

function rearrangeDOM(indexes, self){
	var rearrangedRows = [];

	for(var i = 0; i < indexes.length; i++) {
		rearrangedRows.push(document.getElementById(indexes[i]).outerHTML);
	}

	self.spreadsheetContainer.querySelector('tbody').innerHTML = rearrangedRows.join('');
}

function addRow(self) {
	var tr = document.createElement('tr');

	for(var i = 0; i < self.options.columns; i++){
		var td = document.createElement('td'),
			title = String.fromCharCode(65 + i);

		td.appendChild(document.createElement('input'));
		td.id = title.toLowerCase() + '_' + i;
		self.data[title][self.options.rows] = '';

		tr.appendChild(td);
	}

	self.options.rows++;
	self.setData();
	self.spreadsheetContainer.querySelector('tbody').appendChild(tr);
}

function addColumn(self) {

}