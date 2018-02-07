'use strict';

document.addEventListener('DOMContentLoaded', init);

var ui = {
	dummy: document.getElementById('dummy'),
	selected_file: document.getElementById('info_filename'),
	button_publish_or_edit: document.getElementById('publish_file_button'),
	button_quit: document.getElementById('quit_button'),
	material_table: document.getElementById('materials_table'),
}

var data = {
	materials: { },
}

var requests = { //functions and variables about xml-http-requests
	query_upload: null,
	query_get_materials: null,
};

function init() {
	ui.init_guide_box();
	window.addEventListener('beforeunload', ui.process_exit);
	window.addEventListener('resize', ui.recalculate_css);
	ui.recalculate_css();
	ui.button_publish_or_edit.addEventListener('click', function(event) {ui.button_publish_or_edit_click(event)});
	ui.button_quit.addEventListener('click', function(event) {ui.button_quit_click(event)});
}

function get_cookie(name) {
	var matches = document.cookie.match(new RegExp(
		"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
	));
	return matches ? decodeURIComponent(matches[1]) : undefined;
}

ui.init_guide_box = function() {
	//upload.css: #guide_box_wrapper {pointer-events: none;} #guide_box {pointer-events: auto;}
	var guide_box_wrapper = document.getElementById('guide_box_wrapper');
	var button_guidebox_ok = document.getElementById('button_guidebox_ok');
	button_guidebox_ok.addEventListener('click', ui.hide_guide_box);
	var show_guide_box = true;
	if (get_cookie("showGuideBox") === 'false') show_guide_box = false;
	if (show_guide_box) {
		ui.show_guide_box();
		ui.dummy.style.display = '';
		ui.dummy.addEventListener('click', ui.hide_guide_box);
	};
}

ui.show_guide_box = function() {
	guide_box_wrapper.style.display = '';
	ui.dummy.style.display = '';
	ui.dummy.classList.add("dummy_shade");
}

ui.hide_guide_box = function() {
	guide_box_wrapper.style.display = 'none';
	ui.dummy.style.display = 'none';
	ui.dummy.classList.remove("dummy_shade");
	document.cookie = "showGuideBox=false";
}

ui.process_exit = function(event) {
	if (false) {
		var message = "Your confirmation message goes here.";
		event = event || window.event;
		if (event) {
			event.returnValue = message;
		}
		return message;
	}
}

ui.recalculate_css = function(event) {
	var main_width = document.getElementById('main_container').clientWidth;
	//TODO исправить таблицу
}

ui.button_publish_or_edit_click = function(event) {
	if (requests.query_upload != null) requests.query_upload.abort();
	requests.query_upload = new XMLHttpRequest();
	requests.query_upload.open("POST", "uploadScript.php", true);
	
	var formData = new FormData();
	formData.append('file', ui.selected_file.files[0]);
	formData.append("someKey", "someValue");
	requests.query_upload.upload.onprogress = function(event) {
		console.log( 'Загружено на сервер ' + event.loaded + ' байт из ' + event.total );
	};
	requests.query_upload.onload = function(event) {
		console.log( 'Данные полностью загружены на сервер!' );
		console.log( 'Ответ: ', requests.query_upload.responseText);
	};
	requests.query_upload.onerror = function(event) {
		console.log( 'Произошла ошибка при загрузке данных на сервер!' );
	};
	requests.query_upload.send(formData);
}

ui.button_quit_click = function(event) {
	window.location.href = "/";
}

ui.show_materials = function() {
	var material_dummy = document.getElementById('dummy_material');
	var items_to_remove = [];
	var entries = ui.material_table.getElementsByClassName('material_entry');
	Array.prototype.forEach.call(entries, function(item, i, arr) {
		if (item != material_dummy) items_to_remove.push(item);
	});
	items_to_remove.forEach(function(item, i, arr) {
		item.remove();
	});
	if (Object.keys(data.materials).length === 0) {
		document.getElementById('no_materials').style.display='';
		console.log(1);
	} else {
		document.getElementById('no_materials').style.display='none';
		for (var id in data.materials) {
			var entry = data.materials[id];
			var new_elem = material_dummy.cloneNode(true);
			new_elem.children[0].textContent = entry.name;
			new_elem.children[1].textContent = entry.uploader;
			new_elem.children[2].textContent = entry.uploaded;
			new_elem.removeAttribute("id");
			new_elem.style.display='';
			ui.material_table.appendChild(new_elem);
		}
	}
}

requests.receive_materials = function() {
	/*data.materials = { };
	data.materials["3231"] = { "name": "Lektsii_T-2_V_Bondar_1972.djvu", "uploader": "Oleg S", "uploaded": "22.03.2017 5:53PM" };
	data.materials["4351"] = { "name": "Госэкзамен (2010).pdf", "uploader": "Oleg S", "uploaded": "20.03.2017 11:42PM" };
	data.materials["5661"] = { "name": "ВЫЧМЕТ. V семестр,  лекции, 2007.pdf", "uploader": "Oleg S", "uploaded": "20.03.2017 9:27PM" };
	data.materials["4389"] = { "name": "ВЫЧМЕТ. V семестр, вопросы на экзамен", "uploader": "Oleg S", "uploaded": "20.03.2017 9:27PM" };
	data.materials["5869"] = { "name": "ВЫЧМЕТ. V семестр, задачи на экзамен", "uploader": "Oleg S", "uploaded": "20.03.2017 9:27PM" };
	data.materials["3654"] = { "name": "Колмогоров А. Н. Драгалин А. Г. - Введение в математическую логику", "uploader": "Oleg S", "uploaded": "20.03.2017 9:27PM" };*/
	if (requests.query_get_materials != null) requests.query_get_materials.abort();
	requests.query_get_materials = new XMLHttpRequest();
	requests.query_get_materials.open("GET", "/uploadScript.php", true);
	requests.query_get_materials.onload = function() {
		data.materials = JSON.parse(requests.query_get_materials.responseText);
	}
	requests.query_get_materials.send();
}	