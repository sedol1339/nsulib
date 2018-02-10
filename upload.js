'use strict';

document.addEventListener('DOMContentLoaded', init);

var ui = {
	dummy: document.getElementById('dummy'),
	button_publish_or_edit: document.getElementById('publish_file_button'),
	button_quit: document.getElementById('quit_button'),
	materials_table: document.getElementById('materials_table'),
	materials_table_tbody: document.getElementById('materials_table').getElementsByTagName('tbody')[0],
	materials_filter: document.getElementById('materials_header_filter'),
	materials_filter_box: document.getElementById('materials_filter_box'),
	materials_filter_button_ok: document.getElementById('filter_button_ok'),
	filters: {
		f: document.getElementById('filter_f'),
		s: document.getElementById('filter_s'),
		t: document.getElementById('filter_t'),
		uploaded: document.getElementById('filter_uploaded'),
	},
	input: {
		file: document.getElementById('input_file'),
		f: document.getElementById('input_f'),
		s: document.getElementById('input_s'),
		t: document.getElementById('input_t'),
		type: document.getElementById('input_type'),
		title: document.getElementById('input_title'),
		author: document.getElementById('input_author'),
		year: document.getElementById('input_year'),
		description: document.getElementById('input_description'),
	},
	file_about: document.getElementById('info_file_about'),
}

var data = {
	materials: { },
	filters: {
		f:{0: ""}, s:{0: ""}, t:{0: ""}, uploaded:{"TODAY": "Сегодня", "THIS_WEEK": "За последнюю неделю", "ALL_TIME": "За все время"},
	},
	lists: {
		f:{0: ""}, s:{0: ""}, t:{0: ""}, type:{"TEACHER": "Учебный материал", "STUDENT": "Конспект", "LITERATURE": "Литература"},
	},
}

var requests = { //functions and variables about xml-http-requests
	query_upload: null,
	query_get_materials: null,
	queries_lists: {
		f:null, s:null, t:null,
	},
	queries_filters: {
		f:null, s:null, t:null,
	},
};

function init() {
	ui.init_guide_box();
	window.addEventListener('beforeunload', ui.process_exit);
	window.addEventListener('resize', ui.recalculate_css);
	ui.recalculate_css();
	ui.button_publish_or_edit.addEventListener('click', function(event) {ui.button_publish_or_edit_click(event)});
	ui.button_quit.addEventListener('click', function(event) {ui.button_quit_click(event)});
	ui.input.file.addEventListener('change', function(event) {ui.file_selected(event)});
	
	ui.input.f.addEventListener('change', function(event) {ui.event_main_selection(event, "f")});
	ui.input.s.addEventListener('change', function(event) {ui.event_main_selection(event, "s")});
	ui.input.t.addEventListener('change', function(event) {ui.event_main_selection(event, "t")});
	ui.update_list("f");
	ui.update_list("s");
	ui.update_list("t");
	requests.get_list("f", undefined, undefined, undefined, { update_ui: true } );
	ui.fill_additional_lists();
	
	ui.materials_filter.addEventListener('click', function(event) {ui.materials_filter_show_or_hide(event, "switch")});
	ui.materials_table.addEventListener('click', function(event) {ui.materials_filter_show_or_hide(event, "hide", true)});
	ui.materials_filter_button_ok.addEventListener('click', function(event) {ui.materials_filter_show_or_hide(event, "hide")});
	
	ui.filters.f.addEventListener('change', function(event) {ui.event_filter_selection(event, "f")});
	ui.filters.s.addEventListener('change', function(event) {ui.event_filter_selection(event, "s")});
	ui.filters.t.addEventListener('change', function(event) {ui.event_filter_selection(event, "t")});
	ui.filters.uploaded.addEventListener('change', function(event) {ui.event_filter_selection(event, "uploaded")});
	ui.update_filter_list("f");
	ui.update_filter_list("s");
	ui.update_filter_list("t");
	ui.fill_additional_filter_lists();
	requests.get_filter_list("f", undefined, undefined, undefined, { update_ui: true, update_ui_custom_function: ui.set_default_filters } );
}

ui.materials_filter_show_or_hide = function(event, to_do, no_update) {
	var show = function() {
		ui.materials_filter_box.style.display = '';
		ui.materials_filter.classList.add("materials_header_filter_darken");
	};
	var hide = function() {
		ui.materials_filter_box.style.display = 'none';
		ui.materials_filter.classList.remove("materials_header_filter_darken");
		
		if (no_update != true) { requests.receive_materials(true); }
	}
	if (to_do == "switch") {
		if (materials_filter_box.style.display == 'none') {
			show();
		} else {
			hide();
		}
	} else if (to_do == "hide") {
		hide();
	} else if (to_do == "show") {
		show();
	}
}

ui.file_selected = function() {
	var file = ui.input.file.files[0];
	var text_area = ui.file_about;
	var lastDotPosition = file.name.lastIndexOf(".");
	if (lastDotPosition < 1 | lastDotPosition == file.name.length - 1) {
		var file_name = file.name;
		var file_ext = file.name;
	} else {
		var file_name = file.name.substr(0, lastDotPosition);
		var file_ext = file.name.substr(lastDotPosition + 1, file.name.length);
	}
	text_area.textContent = "Файл " + file_ext + ", размер " + humanFileSize(file.size, true);
	ui.input.title.value = file_name;
}

function humanFileSize(bytes, si) {
    var thresh = si ? 1000 : 1024;
    if(Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    var units = si
        ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
        : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while(Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1)+' '+units[u];
}

ui.get_selected_value = function(letter) {
	if (ui.input[letter].selectedIndex == -1) return 0;
	return ui.input[letter].options[ui.input[letter].selectedIndex].value;
}

ui.get_selected_filter_value = function(letter) {
	if (ui.filters[letter].selectedIndex == -1) return 0;
	return ui.filters[letter].options[ui.filters[letter].selectedIndex].value;
}

ui.event_main_selection = function(event, letter) {
	if (ui.get_selected_value(letter) == 0) {
		//если выбрано пустое значение, сбрасываем нижние списки
		if (letter == "f") {
			data.lists.s = {0: ""};
			ui.update_list("s");
		};
		if (letter == "s" || letter == "f") {
			data.lists.t = {0: ""};
			ui.update_list("t");
		};
		return;
	};
	if (letter == "f") {
		//обновляем s
		ui.input["s"].disabled = true;
		requests.get_list("s", ui.get_selected_value("f"), undefined, undefined, { update_ui: true } );
		//сбрасываем t
		data.lists.t = {0: ""};
		ui.update_list("t");
	} else if (letter == "s") {
		//обновляем t
		ui.input["t"].disabled = true;
		requests.get_list("t", ui.get_selected_value("f"), ui.get_selected_value("s"), undefined, { update_ui: true } );
	}
}

ui.event_filter_selection = function(event, letter) {
	if (letter == "uploaded") {
		return;
	};
	if (letter == "t") {
		return;
	};
	if (ui.get_selected_filter_value(letter) == 0) {
		//если выбрано пустое значение, сбрасываем нижние списки
		if (letter == "s" | letter == "f") {
			data.filters.t = {0: ""};
			ui.update_filter_list("t");
		};
		if (letter == "f") {
			data.filters.s = {0: ""};
			ui.update_filter_list("s");
		};
		return;
	};
	if (letter == "f") {
		//обновляем s
		ui.filters["s"].disabled = true;
		requests.get_filter_list("s", ui.get_selected_filter_value("f"), undefined, undefined, { update_ui: true } );
		//сбрасываем t
		data.filters.t = {0: ""};
		ui.update_filter_list("t");
	} else if (letter == "s") {
		//обновляем t
		ui.filters["t"].disabled = true;
		requests.get_filter_list("t", ui.get_selected_filter_value("f"), ui.get_selected_filter_value("s"), undefined, { update_ui: true } );
	}
}

ui.update_list = function(letter) {
	var local_list = ui.input[letter];
	var local_data = data.lists[letter];
	ui.fill_select_tag_and_select_if_one_option(local_list, local_data);
	ui.input[letter].disabled = false;
}

ui.update_filter_list = function(letter) {
	var local_list = ui.filters[letter];
	var local_data = data.filters[letter];
	var selected = ui.fill_select_tag_and_select_if_one_option(local_list, local_data);
	ui.filters[letter].disabled = false;
}

ui.set_default_filters = function() {
	//не трогать, говнокод, собран из палок и земли, при прикосновении ломается
	ui.filters.uploaded.value = "ALL_TIME";
	ui.filters.f.value = "1";
	ui.event_filter_selection(null, "f"); //для обновления списка предметов
	requests.receive_materials(true);
}

ui.fill_additional_lists = function() {
	//type
	var local_list = ui.input.type;
	var local_data = data.lists.type;
	ui.fill_select_tag_and_select_if_one_option(local_list, local_data);
	
	//year (заполняем самостоятельно)
	for (var i = 2018; i > 1994; i--) {
		var opt = document.createElement('option');
		opt.textContent = i;
		opt.value = i;
		ui.input.year.appendChild(opt);
	}
}

ui.fill_additional_filter_lists = function() {
	//uploaded
	var local_list = ui.filters.uploaded;
	var local_data = data.filters.uploaded;
	ui.fill_select_tag_and_select_if_one_option(local_list, local_data);
}

ui.fill_select_tag_and_select_if_one_option = function(local_list, local_data) {
	while (local_list.firstChild) {
		local_list.removeChild(local_list.firstChild);
	};
	for (var i in local_data) {
		var item = local_data[i];
		var opt = document.createElement('option');
		opt.textContent = item;
		opt.value = i;
		local_list.appendChild(opt);
	};
	//если в списке только одно значение, возможно кроме пустого, устанавливаем его
	if (Object.keys(local_data).length == 1) {
		local_list.value = local_list.lastElementChild.value;
		return false;
	};
	if (Object.keys(local_data).length == 2 & local_list.firstElementChild.textContent == "") {
		local_list.value = local_list.lastElementChild.value;
		return true;
	};
	return false;
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
	
	var mode = "upload";
	
	if (mode == "upload") {	
	
		if (ui.input.file.files[0] == null) { window.alert("Не выбран файл"); return; }
		
		var blank_fields_exist = false;
		var error_message = "Не заполнены следующие поля:\n";
		
		if (ui.get_selected_value("f") == 0) { blank_fields_exist = true; error_message += "Факультет\n"; }
		if (ui.get_selected_value("s") == 0) { blank_fields_exist = true; error_message += "Предмет\n"; }
		if (ui.get_selected_value("t") == 0) { blank_fields_exist = true; error_message += "Преподаватель\n"; }
		if (ui.get_selected_value("type") == 0) { blank_fields_exist = true; error_message += "Тип\n"; }
		if (ui.input.title.value.length == 0) { blank_fields_exist = true; error_message += "Название\n"; }
		
		if (blank_fields_exist) {
			window.alert(error_message);
			return;
		}
		
		//TODO проверка имени файла (на сервере и на клиенте)
		
		var formData = new FormData();
		formData.append('file', ui.input.file.files[0]);
		formData.append('f', ui.get_selected_value("f"));
		formData.append('s', ui.get_selected_value("s"));
		formData.append('t', ui.get_selected_value("t"));
		formData.append('type', ui.get_selected_value("type"));
		formData.append('title', ui.input.title.value);
		
		formData.append('author', ui.input.author.value);
		formData.append('year', ui.get_selected_value("year"));
		formData.append('description', ui.input.description.value);
		
		if (requests.query_upload != null) requests.query_upload.abort();
		requests.query_upload = new XMLHttpRequest();
		requests.query_upload.open("POST", "uploadScript.php", true);
		
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
}

ui.button_quit_click = function(event) {
	window.location.href = "/";
}

ui.show_materials = function() {
	var material_dummy = document.getElementById('dummy_material');
	var items_to_remove = [];
	var entries = ui.materials_table_tbody.getElementsByClassName('material_entry');
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
		document.getElementById('materials_amount').textContent = " (" + Object.keys(data.materials).length + ")";
		for (var id in data.materials) {
			var entry = data.materials[id];
			var new_elem = material_dummy.cloneNode(true);
			new_elem.children[0].textContent = entry.title;
			new_elem.children[1].textContent = entry.uploader;
			new_elem.children[2].textContent = entry.uploaded;
			new_elem.removeAttribute("id");
			new_elem.style.display='';
			ui.materials_table_tbody.appendChild(new_elem);
		}
	}
	document.getElementById('receiving_materials_status').style.display='none';
}

requests.build_url = function(url, parameters) {
	var qs = "";
	for(var key in parameters) {
		var value = parameters[key];
		qs += encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
	}
	if (qs.length > 0){
		qs = qs.substring(0, qs.length-1); //chop off last "&"
		url = url + "?" + qs;
	}
	return url;
};

requests.receive_materials = function(show) {
	if (show) {
		document.getElementById('receiving_materials_status').style.display='';
		document.getElementById('no_materials').style.display='none';
	}
	
	var url_params = { };
	url_params["f"] = ui.get_selected_filter_value("f");
	url_params["s"] = ui.get_selected_filter_value("s");
	url_params["t"] = ui.get_selected_filter_value("t");
	url_params["uploaded"] = ui.get_selected_filter_value("uploaded");
	
	if (requests.query_get_materials != null) requests.query_get_materials.abort();
	requests.query_get_materials = new XMLHttpRequest();
	
	var _url = requests.build_url("/uploadGetMaterials.php", url_params);
	requests.query_get_materials.open("GET", _url, true);
	requests.query_get_materials.onload = function() {
		data.materials = JSON.parse(requests.query_get_materials.responseText);
		if (show) {
			ui.show_materials();
		}
	}
	requests.query_get_materials.send();
}

//TODO убрать повторение кода

requests.get_list = function(target, f_id, s_id, t_id, function_params) {
	var url_params = { "action": "list", "target": target };
	if (f_id != undefined) url_params["f"] = f_id;
	if (s_id != undefined) url_params["s"] = s_id;
	if (t_id != undefined) url_params["t"] = t_id;
	
	if (requests.queries_lists[target] != null) requests.queries_lists[target].abort();
	requests.queries_lists[target] = new XMLHttpRequest();
	
	var _url = requests.build_url("/get.php", url_params);
	requests.queries_lists[target].open("GET", _url, true);
	requests.queries_lists[target].onload = function() {
		data.lists[target] = JSON.parse(requests.queries_lists[target].responseText);
		data.lists[target][0] = "";
		if (function_params.update_ui == true) {
			ui.update_list(target);
		}
	}
	requests.queries_lists[target].send();
}

requests.get_filter_list = function(target, f_id, s_id, t_id, function_params) {
	var url_params = { "action": "list", "target": target };
	if (f_id != undefined) url_params["f"] = f_id;
	if (s_id != undefined) url_params["s"] = s_id;
	if (t_id != undefined) url_params["t"] = t_id;
	
	if (requests.queries_filters[target] != null) requests.queries_filters[target].abort();
	requests.queries_filters[target] = new XMLHttpRequest();
	
	var _url = requests.build_url("/get.php", url_params);
	requests.queries_filters[target].open("GET", _url, true);
	requests.queries_filters[target].onload = function() {
		data.filters[target] = JSON.parse(requests.queries_filters[target].responseText);
		data.filters[target][0] = "";
		if (function_params.update_ui == true) {
			ui.update_filter_list(target);
		}
		if (function_params.update_ui_custom_function != undefined) {
			function_params.update_ui_custom_function();
		}
	}
	requests.queries_filters[target].send();
}