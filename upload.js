'use strict';

document.addEventListener('DOMContentLoaded', init);

var ui = {
	dummy: document.getElementById('dummy'),
	button_publish_or_edit: document.getElementById('publish_file_button'),
	button_quit: document.getElementById('quit_button'),
	materials_filter: document.getElementById('materials_header_filter'),
	materials_filter_box: document.getElementById('materials_filter_box'),
	materials_filter_button_ok: document.getElementById('filter_button_ok'),
	filters: {
		f: document.getElementById('filter_f'),
		s: document.getElementById('filter_s'),
		t: document.getElementById('filter_t'),
		uploaded: document.getElementById('filter_uploaded'),
	},
	info_type: document.getElementById('info_type'),
	edit_info: document.getElementById('edit_info'),
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
	upload_grid: document.getElementById("materials_upload_grid"),
	grid: document.getElementById("materials_grid"),
	/*filter_column: {
		f: document.getElementById('filter_column_f'),
		s: document.getElementById('filter_column_s'),
		t: document.getElementById('filter_column_t'),
		uploader: document.getElementById('filter_column_uploader'),
		uploaded: document.getElementById('filter_column_uploaded'),
	},
	grid_columns: {
		width_title: "3fr",
		width_f: "0.8fr",
		width_s: "0.8fr",
		width_t: "0.8fr",
		width_uploader: "0.8fr",
		width_uploaded: "1fr",
		width_delete: "0.6fr",
	},*/
	sort: {
		title: document.getElementById('sort_title'),
		f: document.getElementById('sort_f'),
		s: document.getElementById('sort_s'),
		t: document.getElementById('sort_t'),
		uploader: document.getElementById('sort_uploader'),
		uploaded: document.getElementById('sort_uploaded'),
	}
}

var data = {
	materials: [],
	full_lists: {
		f:{0: ""}, s:{0: ""}, t:{0: ""}
	},
	relations: [],
	filters: {
		f:[], s:[], t:[], uploaded:{"TODAY": "Сегодня", "THIS_WEEK": "За последнюю неделю", "ALL_TIME": "За все время"},
	},
	lists: {
		f:{0: ""}, s:{0: ""}, t:{0: ""}, type:{"TEACHER": "Учебный материал", "STUDENT": "Конспект", "LITERATURE": "Литература"},
	},
	uploading: new Set(), //каждый объект хранит ссылку на элемент, а также процент или результат загрузки файла
}

var requests = { //functions and variables about xml-http-requests
	//query_upload: null,
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
	
	Array.prototype.forEach.call(ui.info_type.children, function(item, i, arr) {
		item.addEventListener('click', ui.set_uploading_type);
	});
	ui.set_uploading_type(null, "publishing");
	
	ui.input.f.addEventListener('change', function(event) {ui.event_main_selection(event, "f")});
	ui.input.s.addEventListener('change', function(event) {ui.event_main_selection(event, "s")});
	ui.input.t.addEventListener('change', function(event) {ui.event_main_selection(event, "t")});
	//ui.update_list("f");
	//ui.update_list("s");
	//ui.update_list("t");
	//requests.get_list("f", undefined, undefined, undefined, { update_ui: true } );
	ui.fill_additional_lists();
	
	ui.materials_filter.addEventListener('click', function(event) {ui.materials_filter_show_or_hide(event, "switch")});
	//ui.materials_table.addEventListener('click', function(event) {ui.materials_filter_show_or_hide(event, "hide", true)});
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
	
	ui.sort.title.addEventListener('click', function(event) {ui.show_materials("title")});
	ui.sort.f.addEventListener('click', function(event) {ui.show_materials("f")});
	ui.sort.s.addEventListener('click', function(event) {ui.show_materials("s")});
	ui.sort.t.addEventListener('click', function(event) {ui.show_materials("t")});
	ui.sort.uploader.addEventListener('click', function(event) {ui.show_materials("uploader")});
	ui.sort.uploaded.addEventListener('click', function(event) {ui.show_materials("uploaded")});
	
	ui.grid.addEventListener('mouseleave', ui.grid_onmouseleave);
	ui.upload_grid.addEventListener('mouseleave', ui.grid_onmouseleave);
	
	requests.get_full_lists_and_relations();
	
	ui.update_upload_grid();
}

ui.set_uploading_type = function(event, type) {
	if (event) {
		//клик мыши, известен эвент и элемент, определить тип
		var elem = event.target;
		type = elem.getAttribute('data-type');
	} else {
		//известен тип, определить элемент
		var elem;
		Array.prototype.forEach.call(ui.info_type.children, function(item, i, arr) {
			if (item.getAttribute('data-type') == type) {
				elem = item;
			}; //здесь break возиожно сделать только выбрасыванием исключения
		});
	}
	
	Array.prototype.forEach.call(ui.info_type.children, function(item, i, arr) {
		item.classList.remove("info_type_selected");
	});
	if (elem) { elem.classList.add("info_type_selected"); }
	
	ui.mode = type;
	if (type == "publishing") {
		ui.input.file.style.display = "";
		//ui.edit_info.style.display = "none";
	} else if (type == "editing") {
		ui.input.file.style.display = "none";
		//ui.edit_info.style.display = "";
	}
}

ui.update_upload_grid = function() {
	data.uploading.forEach(function(entry, _, set) {
		if (entry.state == "NOT_EXIST") {
			data.uploading.delete(entry);
		};
	});
	if (data.uploading.size == 0) {
		while (ui.upload_grid.firstChild) {
			ui.upload_grid.removeChild(ui.upload_grid.firstChild);
		};
		ui.upload_grid.style.display = 'none';
		ui.highlighted_row_first_elem_upload = null;
		return;
	} else {
		ui.upload_grid.style.display = '';
		ui.upload_grid.style["height"] = Math.min(data.uploading.size, 6) * 30 + 'px';
	}
	
	var rows_to_remove = new Set();
	Array.prototype.forEach.call(ui.upload_grid.childNodes, function(item, i, arr) {
		if (item.style["grid-column-start"] == "title") {
			rows_to_remove.add(item);
		}
	});
	
	var state_handlers = {
		"UPLOADING": function(entry, div) {
			//if (!entry.loading_span || !div.contains(entry.loading_span) || !div.contains(entry.progress_bar_inner)) {
			if (entry.state_changed) {
				while (div.firstChild) { div.removeChild(div.firstChild); };
				
				var span = document.createElement('span');
				span.classList.add("uploading_span");
				div.appendChild(span);
				entry.loading_span = span;
				
				var progress_bar = document.createElement('div');
				progress_bar.classList.add("uploading_progress_bar");
				div.appendChild(progress_bar);
				
				var progress_bar_inner = document.createElement('div');
				progress_bar_inner.classList.add("uploading_progress_bar_inner");
				progress_bar.appendChild(progress_bar_inner);
				entry.progress_bar_inner = progress_bar_inner;
				
				div.nextElementSibling.innerHTML = "<span onclick=\"ui.upload_erase(event)\">отмена</span>";
			};
			if (!entry.total || entry.total == 0) {
				var percent = "0%";
				var txt = "Загружено " + humanFileSize(entry.uploaded, true) + " из " + "??" + " (" + percent + ")";
			} else if (entry.uploaded > entry.total) {
				var percent = "100%";
				var txt = "Загружено " + humanFileSize(entry.uploaded, true) + " из " + humanFileSize(entry.total, true) + " (" + percent + ")";
			} else {
				var percent = Math.round(entry.uploaded/entry.total*100) + "%";
				var txt = "Загружено " + humanFileSize(entry.uploaded, true) + " из " + humanFileSize(entry.total, true) + " (" + percent + ")";
			};
			entry.loading_span.textContent = txt;
			entry.progress_bar_inner.style.width = percent;
		},
		"WAITING_FOR_RESPONSE": function(entry, div) {
			if (!entry.state_changed) return;
			while (div.firstChild) { div.removeChild(div.firstChild); };
			var span = document.createElement('span');
			span.textContent = "Ожидание ответа от сервера...";
			span.style.display = "inline-block";
			div.appendChild(span);
			div.nextElementSibling.innerHTML = "<div class=uploading_erase onclick=\"ui.upload_erase(event)\"></div>";
		},
		"FINISHED": function(entry, div) {
			if (!entry.state_changed) {
				var span = div.firstChild;
			} else {
				while (div.firstChild) { div.removeChild(div.firstChild); };
				var span = document.createElement('span');
				span.style.display = "inline-block";
				div.appendChild(span);
				div.nextElementSibling.innerHTML = "<div class=uploading_erase onclick=\"ui.upload_erase(event)\"></div>";
			}
			span.title = span.textContent = entry.result;
		},
		"FINISHED_ERROR": function(entry, div) {
			if (!entry.state_changed) {
				var span = div.firstChild;
			} else {
				while (div.firstChild) { div.removeChild(div.firstChild); };
				var span = document.createElement('span');
				span.style.display = "inline-block";
				div.appendChild(span);
				span.style.color = "#E00";
				div.nextElementSibling.innerHTML = "<div class=uploading_erase onclick=\"ui.upload_erase(event)\"></div>";
			}
			span.title = span.textContent = "Ошибка: " + entry.result;
		},
		"CANCELLED": function(entry, div) {
			if (!entry.state_changed) return;
			while (div.firstChild) { div.removeChild(div.firstChild); };
			var span = document.createElement('span');
			span.textContent = "Загрузка отменена";
			span.style.display = "inline-block";
			div.appendChild(span);
			div.nextElementSibling.innerHTML = "<div class=uploading_erase onclick=\"ui.upload_erase(event)\"></div>";
		},
	};
	
	data.uploading.forEach(function(entry, _, set) {
		if (entry.elem == null) {
			if (ui.upload_grid.lastElementChild) {
				var row = +ui.upload_grid.lastElementChild.style["grid-row-start"] + 1;
			} else {
				var row = 1;
			}
			
			var div1 = document.createElement('div');
			div1.classList.add("grid_item");
			div1.style["grid-row"] = row;
			div1.style["grid-column"] = "title";
			div1.onmouseover = ui.materials_onmouseover;
			var span1 = document.createElement('span');
			span1.title = span1.textContent = entry.title;
			div1.appendChild(span1);
			ui.upload_grid.appendChild(div1);
			
			entry.elem = div1;
			
			var div2 = document.createElement('div');
			div2.classList.add("grid_item");
			div2.style["grid-row"] = row;
			div2.style["grid-column-start"] = "status_start";
			div2.style["grid-column-end"] = "delete";
			div2.onmouseover = ui.materials_onmouseover;
			ui.upload_grid.appendChild(div2);
			
			var div3 = document.createElement('div');
			div3.classList.add("grid_item");
			div3.classList.add("delete_button_faint");
			div3.style["grid-row"] = row;
			div3.style["grid-column"] = "delete";
			div3.onmouseover = ui.materials_onmouseover;
			var span3 = document.createElement('span');
			span3.innerHTML = "отмена";
			div3.appendChild(span3);
			ui.upload_grid.appendChild(div3);
			
			state_handlers[entry.state](entry, div2);
			
		} else {
			rows_to_remove.delete(entry.elem);
			state_handlers[entry.state](entry, entry.elem.nextElementSibling);
		}
	});
	
	rows_to_remove.forEach(function(elem, _, set) {
		var next_elem = elem.nextElementSibling.nextElementSibling.nextElementSibling;
		while (next_elem) {
			next_elem.style["grid-row-start"] = next_elem.style["grid-row-start"] - 1;
			next_elem = next_elem.nextElementSibling;
		}
		ui.upload_grid.removeChild(elem.nextElementSibling.nextElementSibling);
		ui.upload_grid.removeChild(elem.nextElementSibling);
		ui.upload_grid.removeChild(elem);
		if (elem == ui.highlighted_row_first_elem_upload) {
			ui.highlighted_row_first_elem_upload = null;
		}
	});
	
}

ui.upload_erase = function(event) {
	var elem;
	for (var i = 0; i < event.path.length; i++) {
		if (event.path[i].classList.contains("grid_item")) {
			elem = event.path[i];
			break;
		} else if (event.path[i] == document.documentElement) {
			break;
		};
	};
	if (!elem) return;
	
	var first_elem_in_row = elem.previousElementSibling.previousElementSibling;
	
	data.uploading.forEach(function(entry, _, set) {
		if (entry.elem == first_elem_in_row) {
			entry.XMLHttpRequest.abort();
			data.uploading.delete(entry);
		};
	});
	
	ui.update_upload_grid();
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
	ui.update_lists(letter);
	/*if (ui.get_selected_value(letter) == 0) {
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
	}*/
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
			data.filters.t = [];
			ui.update_filter_list("t");
		};
		if (letter == "f") {
			data.filters.s = [];
			ui.update_filter_list("s");
		};
		return;
	};
	if (letter == "f") {
		//обновляем s
		ui.filters["s"].disabled = true;
		requests.get_filter_list("s", ui.get_selected_filter_value("f"), undefined, undefined, { update_ui: true } );
		//сбрасываем t
		data.filters.t = [];
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
	//var selected = ui.fill_select_tag_and_select_if_one_option(local_list, local_data);
	//ui.filters[letter].disabled = false;
	while (local_list.firstChild) {
		local_list.removeChild(local_list.firstChild);
	};
	var func = function(i, _, set) {
		var title = (i == 0) ? "" : data.full_lists[letter][i][(letter == "t") ? 1 : 0];
		var opt = document.createElement('option');
		opt.textContent = title;
		opt.value = i;
		local_list.appendChild(opt);
	};
	func(0, null, null);
	local_data.forEach(func);
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
	/*if (false) {
		var message = "Your confirmation message goes here.";
		event = event || window.event;
		if (event) {
			event.returnValue = message;
		}
		return message;
	}*/
}

ui.recalculate_css = function(event) {
	var main_width = document.getElementById('main_container').clientWidth;
	//TODO исправить таблицу
}

ui.button_publish_or_edit_click = function(event) {
	
	if (ui.mode == "publishing") {	
	
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
		
		//if (requests.query_upload != null) requests.query_upload.abort();
		var query_upload = new XMLHttpRequest();
		query_upload.open("POST", "uploadScript.php", true);
		
		var uploading_obj = {"title": formData.get("title"), "uploaded": 0, "XMLHttpRequest": query_upload, "_state": "UPLOADING", "_state_changed": true};
		Object.defineProperty(uploading_obj, "state", {
			set: function (x) { this._state = x; this._state_changed = true; },
			get: function () { return this._state; }
		});
		Object.defineProperty(uploading_obj, "state_changed", {
			set: function (x) { this._state_changed = x; },
			get: function () { if (this._state_changed) {this._state_changed = false; return true;} else {return false;} }
		});
		//uploading_obj.setState = function(x) { state = x; this.state_changed = true; };
		//uploading_obj.getState_changed = function() { if (state_changed) {state_changed = false; return true;} else {return false;} };
		data.uploading.add(uploading_obj);
		ui.update_upload_grid();
		
		query_upload.upload.onprogress = function(event) {
			uploading_obj.uploaded = event.loaded;
			uploading_obj.total = event.total;
			console.log(humanFileSize(event.loaded, true) + '/' + humanFileSize(event.total, true));
			ui.update_upload_grid();
		};
		query_upload.upload.onload = function(event) {
			console.log("upload.onload");
			uploading_obj.state = "WAITING_FOR_RESPONSE";
			ui.update_upload_grid();
		};
		query_upload.onload = function(event) {
			console.log("onload " + query_upload.responseText);
			if (query_upload.status == 200) {
				uploading_obj.state = "FINISHED";
				ui.last_uploaded = query_upload.responseText;
				uploading_obj.result = "Файл успешно загружен.";
			} else {
				uploading_obj.state = "FINISHED_ERROR";
				uploading_obj.error = true;
				uploading_obj.result = query_upload.responseText;
			}
			ui.update_upload_grid();
		};
		query_upload.onerror = function(event) {
			console.log("onerror");
			uploading_obj.state = "FINISHED_ERROR";
			uploading_obj.error = true;
			uploading_obj.result = "Ошибка сети";
			ui.update_upload_grid();
		};
		query_upload.send(formData);
	}
}

ui.button_quit_click = function(event) {
	window.location.href = "/";
}

ui.show_materials = function(sort) {
	var box = ui.grid;
		box.style.display='';
	while (box.firstChild) {
		box.removeChild(box.firstChild);
	}
	
	/*var html = document.getElementsByTagName('html')[0];
	html.style.setProperty("--width_f", ui.grid_columns.width_f ? ui.filter_column.f.checked : "0fr");
	html.style.setProperty("--width_s", ui.grid_columns.width_s ? ui.filter_column.s.checked : "0fr");
	html.style.setProperty("--width_t", ui.grid_columns.width_t ? ui.filter_column.t.checked : "0fr");
	html.style.setProperty("--width_uploader", ui.grid_columns.width_uploader ? ui.filter_column.uploader.checked : "0fr");
	html.style.setProperty("--width_uploaded", ui.grid_columns.width_uploaded ? ui.filter_column.uploaded.checked : "0fr");*/
	
	if (data.materials.length == 0) {
		document.getElementById('no_materials').style.display='';
		box.style.display='none';
	} else {
		document.getElementById('no_materials').style.display='none';
		if (data.materials.length > 1000) {
			document.getElementById('materials_amount').textContent = " (" + data.materials.length + ", показано 1000)";
		} else {
			document.getElementById('materials_amount').textContent = " (" + data.materials.length + ")";
		}
		
		
		if (!sort) {
			sort = "f";
		}
		console.log(sort);
		var sort_func;
		if (sort == "title") {
			sort_func = function(a, b) { return a.title.localeCompare(b.title); };
		} else if (sort == "f") {
			sort_func = function(a, b) {
				var result = data.full_lists.f[a.faculty][1].localeCompare(data.full_lists.f[b.faculty][1]);
				if (result == 0) result = data.full_lists.s[a.subject][1].localeCompare(data.full_lists.s[b.subject][1]);
				if (result == 0) result = data.full_lists.t[a.teacher][1].localeCompare(data.full_lists.t[b.teacher][1]);
				return result;
			};
		} else if (sort == "s") {
			sort_func = function(a, b) {
				var result = data.full_lists.s[a.subject][1].localeCompare(data.full_lists.s[b.subject][1]);
				if (result == 0) result = data.full_lists.t[a.teacher][1].localeCompare(data.full_lists.t[b.teacher][1]);
				if (result == 0) result = data.full_lists.f[a.faculty][1].localeCompare(data.full_lists.f[b.faculty][1]);
				return result;
			};
		} else if (sort == "t") {
			sort_func = function(a, b) {
				var result = data.full_lists.t[a.teacher][1].localeCompare(data.full_lists.t[b.teacher][1]);
				if (result == 0) result = data.full_lists.f[a.faculty][1].localeCompare(data.full_lists.f[b.faculty][1]);
				if (result == 0) result = data.full_lists.s[a.subject][1].localeCompare(data.full_lists.s[b.subject][1]);
				return result;
			};
		} else if (sort == "uploader") {
			sort_func = function(a, b) {
				var result = a.uploader.localeCompare(b.uploader);
				if (result == 0) result = b.uploaded.localeCompare(a.uploaded);
				return result;
			};
		} else if (sort == "uploaded") {
			sort_func = function(a, b) {
				return b.uploaded.localeCompare(a.uploaded);
			};
		}
		if (sort_func) {
			data.materials = data.materials.sort(sort_func);
		}
		
		var row_number = 1;
		data.materials.forEach(function(entry, array_index, arr) {
			
			if (row_number > 1000) return;
			
			var div = document.createElement('div');
			div.classList.add("grid_item");
			div.onmouseover = ui.materials_onmouseover;
			div.onclick = ui.material_select_event;
			div.style["grid-row"] = row_number;
			div.style["grid-column"] = "title";
			var span = document.createElement('span');
			span.title = span.textContent = entry.title;
			div.appendChild(span);
			box.appendChild(div);
			
			div.setAttribute('data-id', entry.id);
			
			//if (ui.filter_column.f.checked) {
				var div = document.createElement('div');
				div.classList.add("grid_item");
				div.onmouseover = ui.materials_onmouseover;
				div.onclick = ui.material_select_event;
				div.style["grid-row"] = row_number;
				div.style["grid-column"] = "f";
				var span = document.createElement('span');
				span.title = data.full_lists.f[entry.faculty][0]
				span.textContent = data.full_lists.f[entry.faculty][1];
				div.appendChild(span);
				box.appendChild(div);
			//}
			
			//if (ui.filter_column.s.checked) {
				var div = document.createElement('div');
				div.classList.add("grid_item");
				div.onmouseover = ui.materials_onmouseover;
				div.onclick = ui.material_select_event;
				div.style["grid-row"] = row_number;
				div.style["grid-column"] = "s";
				var span = document.createElement('span');
				span.title = data.full_lists.s[entry.subject][0];
				span.textContent = data.full_lists.s[entry.subject][1];
				div.appendChild(span);
				box.appendChild(div);
			//}
			
			//if (ui.filter_column.t.checked) {
				var div = document.createElement('div');
				div.classList.add("grid_item");
				div.onmouseover = ui.materials_onmouseover;
				div.onclick = ui.material_select_event;
				div.style["grid-row"] = row_number;
				div.style["grid-column"] = "t";
				var span = document.createElement('span');
				span.title = data.full_lists.t[entry.teacher][0];
				span.textContent = data.full_lists.t[entry.teacher][1];
				div.appendChild(span);
				box.appendChild(div);
			//}
			
			//if (ui.filter_column.uploader.checked) {
				var div = document.createElement('div');
				div.classList.add("grid_item");
				div.onmouseover = ui.materials_onmouseover;
				div.onclick = ui.material_select_event;
				div.style["grid-row"] = row_number;
				div.style["grid-column"] = "uploader";
				var span = document.createElement('span');
				span.title = span.textContent = entry.uploader;
				div.appendChild(span);
				box.appendChild(div);
			//}
			
			//if (ui.filter_column.uploaded.checked) {
				var div = document.createElement('div');
				div.classList.add("grid_item");
				div.onmouseover = ui.materials_onmouseover;
				div.onclick = ui.material_select_event;
				div.style["grid-row"] = row_number;
				div.style["grid-column"] = "uploaded";
				var span = document.createElement('span');
				span.title = span.textContent = entry.uploaded;
				div.appendChild(span);
				box.appendChild(div);
			//}
			
			var div = document.createElement('div');
			div.classList.add("grid_item");
			div.onmouseover = ui.materials_onmouseover;
			div.classList.add("delete_button_faint");
			div.style["grid-row"] = row_number;
			div.style["grid-column"] = "delete";
			var span = document.createElement('span');
			div.textContent = "удалить";
			div.appendChild(span);
			box.appendChild(div);
			
			row_number++;
		});
	}
	document.getElementById('receiving_materials_status').style.display='none';
	ui.highlighted_row_first_elem = null;
	ui.selected_row_first_elem = null;
	ui.grid.scrollTop = 0;
}

ui.material_select = function(elem) {
	if (elem == ui.selected_row_first_elem) {
		var clear_selection = true;
	}	
	var sibling = elem;
	if (sibling) {
		sibling.classList.add("js_bold"); sibling = sibling.nextElementSibling;
		sibling.classList.add("js_bold"); sibling = sibling.nextElementSibling;
		sibling.classList.add("js_bold"); sibling = sibling.nextElementSibling;
		sibling.classList.add("js_bold"); sibling = sibling.nextElementSibling;
		sibling.classList.add("js_bold"); sibling = sibling.nextElementSibling;
		sibling.classList.add("js_bold"); sibling = sibling.nextElementSibling;
		sibling.classList.add("js_bold");
	}
	sibling = ui.selected_row_first_elem;
	if (sibling) {
		sibling.classList.remove("js_bold"); sibling = sibling.nextElementSibling;
		sibling.classList.remove("js_bold"); sibling = sibling.nextElementSibling;
		sibling.classList.remove("js_bold"); sibling = sibling.nextElementSibling;
		sibling.classList.remove("js_bold"); sibling = sibling.nextElementSibling;
		sibling.classList.remove("js_bold"); sibling = sibling.nextElementSibling;
		sibling.classList.remove("js_bold"); sibling = sibling.nextElementSibling;
		sibling.classList.remove("js_bold");
	}
	if (clear_selection) {
		ui.selected_row_first_elem = null;
		return;
	}
	ui.selected_row_first_elem = elem;
	ui.selected_material_id = elem.getAttribute('data-id');
	ui.set_uploading_type(null, "editing");
	ui.fill_info_to_edit();
}

ui.fill_info_to_edit = function() {
	var entry = data.materials.find( function(x) {
		return (x.id == ui.selected_material_id);
	});
	//TODO заполнить f, s, t
	ui.input.type.value = entry.type.substr(0, entry.type.indexOf(':')); 
	ui.input.title.value = entry.title ? entry.title : "";
	if (entry.author) { ui.input.author.value = entry.author; }
	//if (entry.year) { ui.input.year.value = entry.year; }
	//if (entry.description) { ui.input.description.value = entry.description; }
}

ui.material_select_event = function(event) {
	var elem;
	//var elem = event.target;
	for (var i = 0; i < event.path.length; i++) {
		if (event.path[i].classList.contains("grid_item")) {
			elem = event.path[i];
			break;
		} else if (event.path[i] == document.documentElement) {
			break;
		};
	};
	
	var sibling = find_first_elem_in_row(elem);
	
	ui.material_select(sibling);
};

ui.selected_row_first_elem = null;
ui.highlighted_row_first_elem = null;
ui.highlighted_row_first_elem_upload = null;
ui.grid_onmouseleave = function(event) {
	if (event.currentTarget == ui.grid) {
		if (ui.highlighted_row_first_elem == null) return;
		var sibling = ui.highlighted_row_first_elem;
		if (sibling) {
			sibling.classList.remove("js_shadowed"); sibling = sibling.nextElementSibling;
			sibling.classList.remove("js_shadowed"); sibling = sibling.nextElementSibling;
			sibling.classList.remove("js_shadowed"); sibling = sibling.nextElementSibling;
			sibling.classList.remove("js_shadowed"); sibling = sibling.nextElementSibling;
			sibling.classList.remove("js_shadowed"); sibling = sibling.nextElementSibling;
			sibling.classList.remove("js_shadowed"); sibling = sibling.nextElementSibling;
			sibling.classList.remove("js_shadowed");
		}
		ui.highlighted_row_first_elem = null;
	} else if (event.currentTarget == ui.upload_grid) {
		if (ui.highlighted_row_first_elem_upload == null) return;
		var sibling = ui.highlighted_row_first_elem_upload;
		if (sibling) {
			sibling.classList.remove("js_shadowed"); sibling = sibling.nextElementSibling;
			sibling.classList.remove("js_shadowed"); sibling = sibling.nextElementSibling;
			sibling.classList.remove("js_shadowed");
		}
		ui.highlighted_row_first_elem_upload = null;
	}
}

function find_first_elem_in_row(elem) {
	if (!elem) return;
	var column = elem.style["grid-column-start"];
	if (!column) return;
	var sibling;
	if (elem.parentNode == ui.grid) {
		if (column == "title") {
			sibling = elem;
		} else if (column == "f") {
			sibling = elem.previousElementSibling;
		} else if (column == "s") {
			sibling = elem.previousElementSibling.previousElementSibling;
		} else if (column == "t") {
			sibling = elem.previousElementSibling.previousElementSibling.previousElementSibling;
		} else if (column == "uploader") {
			sibling = elem.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling;
		} else if (column == "uploaded") {
			sibling = elem.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling;
		} else if (column == "delete") {
			sibling = elem.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling;
		} else {
			return undefined;
		}
	} else if (elem.parentNode == ui.upload_grid) {
		if (column == "title") {
			sibling = elem;
		} else if (column == "status_start") {
			sibling = elem.previousElementSibling;
		} else if (column == "delete") {
			sibling = elem.previousElementSibling.previousElementSibling;
		} else {
			return undefined;
		}
	}
	return sibling;
}

ui.materials_onmouseover = function(event) {
	var elem;
	//var elem = event.target;
	for (var i = 0; i < event.path.length; i++) {
		if (event.path[i].classList.contains("grid_item")) {
			elem = event.path[i];
			break;
		} else if (event.path[i] == document.documentElement) {
			break;
		};
	};
	var column = elem.style["grid-column-start"];
	var row = elem.style["grid-row-start"];
	if (!column || !row) return; //почему так происходит?
	
	var sibling = find_first_elem_in_row(elem);
	if (elem.parentNode == ui.grid) {
		if (sibling == ui.highlighted_row_first_elem) return;
		
		if (sibling) {
			sibling.classList.add("js_shadowed"); sibling = sibling.nextElementSibling;
			sibling.classList.add("js_shadowed"); sibling = sibling.nextElementSibling;
			sibling.classList.add("js_shadowed"); sibling = sibling.nextElementSibling;
			sibling.classList.add("js_shadowed"); sibling = sibling.nextElementSibling;
			sibling.classList.add("js_shadowed"); sibling = sibling.nextElementSibling;
			sibling.classList.add("js_shadowed"); sibling = sibling.nextElementSibling;
			sibling.classList.add("js_shadowed");
		}
		
		var sibling = ui.highlighted_row_first_elem;
		if (sibling) {
			sibling.classList.remove("js_shadowed"); sibling = sibling.nextElementSibling;
			sibling.classList.remove("js_shadowed"); sibling = sibling.nextElementSibling;
			sibling.classList.remove("js_shadowed"); sibling = sibling.nextElementSibling;
			sibling.classList.remove("js_shadowed"); sibling = sibling.nextElementSibling;
			sibling.classList.remove("js_shadowed"); sibling = sibling.nextElementSibling;
			sibling.classList.remove("js_shadowed"); sibling = sibling.nextElementSibling;
			sibling.classList.remove("js_shadowed");
		}
		
		ui.highlighted_row_first_elem = find_first_elem_in_row(elem);
	} else if (elem.parentNode == ui.upload_grid) {
		if (sibling == ui.highlighted_row_first_elem_upload) return;
		
		if (sibling) {
			sibling.classList.add("js_shadowed"); sibling = sibling.nextElementSibling;
			sibling.classList.add("js_shadowed"); sibling = sibling.nextElementSibling;
			sibling.classList.add("js_shadowed");
		}
		
		var sibling = ui.highlighted_row_first_elem_upload;
		if (sibling) {
			sibling.classList.remove("js_shadowed"); sibling = sibling.nextElementSibling;
			sibling.classList.remove("js_shadowed"); sibling = sibling.nextElementSibling;
			sibling.classList.remove("js_shadowed");
		}
		
		ui.highlighted_row_first_elem_upload = find_first_elem_in_row(elem);
	}
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
	
	var url_params = { "action": "materials" };
	url_params["f"] = ui.get_selected_filter_value("f");
	url_params["s"] = ui.get_selected_filter_value("s");
	url_params["t"] = ui.get_selected_filter_value("t");
	url_params["uploaded"] = ui.get_selected_filter_value("uploaded");
	
	if (requests.query_get_materials != null) requests.query_get_materials.abort();
	requests.query_get_materials = new XMLHttpRequest();
	
	var _url = requests.build_url("/get.php", url_params);
	requests.query_get_materials.open("GET", _url, true);
	requests.query_get_materials.onload = function() {
		//data.materials = JSON.parse(requests.query_get_materials.responseText);
		//data.materials.length = Math.max.apply(Math, Object.keys(data.materials));
		//data.materials = Array.from(data.materials);
		var response = JSON.parse(requests.query_get_materials.responseText);
		data.materials = [];
		for (var id in response) {
			var entry = response[id];
			entry.id = id;
			data.materials.push(entry);
		}
		if (show) {
			ui.show_materials();
		}
	}
	requests.query_get_materials.send();
}

//TODO убрать повторение кода

requests.get_full_lists_and_relations = function() {
	/*var get_full_list = function(letter) {
		var url_params = { "action": "list", "target": letter };
		
		var request = new XMLHttpRequest();
		
		var _url = requests.build_url("/get.php", url_params);
		request.open("GET", _url, true);
		request.onload = function() {
			data.full_lists[letter] = JSON.parse(request.responseText);
		}
		request.send();
	};
	get_full_list("f");
	get_full_list("s");
	get_full_list("t");*/
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "/init.json", true);
	xhr.onload = function() {
		var response = JSON.parse(xhr.responseText);
		data.full_lists.f = response.faculties;
		data.full_lists.s = response.subjects;
		data.full_lists.t = response.teachers;
		data.relations = response.relations;
		ui.update_lists("init");
	}
	xhr.send();
}

ui.update_lists = function(letter) {
	var upd = function(letter) {
		var local_list = ui.input[letter];
		var local_data = data.lists[letter];
		while (local_list.firstChild) {
			local_list.removeChild(local_list.firstChild);
		};
		var func = function(i, _, set) {
			var title = (i == 0) ? "" : data.full_lists[letter][i][(letter == "t") ? 1 : 0];
			var opt = document.createElement('option');
			opt.textContent = title;
			opt.value = i;
			local_list.appendChild(opt);
		};
		func(0, null, null);
		local_data.forEach(func);
	};
	if (letter == "init") {
		data.lists.f = new Set(Object.keys(data.full_lists.f));
		data.lists.s = new Set();
		data.lists.t = new Set();
		upd("f"); upd("s"); upd("t");
	} else if (letter == "f") {
		data.lists.s.clear();
		if (ui.get_selected_value("f") != 0) {
			for (var i = 0; i < data.relations.length; i++) {
				var relation = data.relations[i];
				if (relation[0] == ui.get_selected_value("f")) {
					data.lists.s.add(relation[1]);
				}
			}
		}
		data.lists.t.clear();
		upd("s"); upd("t");
	} else if (letter == "s") {
		data.lists.t.clear();
		if (ui.get_selected_value("s") != 0) {
			for (var i = 0; i < data.relations.length; i++) {
				var relation = data.relations[i];
				if (relation[0] == ui.get_selected_value("f") && relation[1] == ui.get_selected_value("s")) {
					data.lists.t.add(relation[2]);
				}
			}
		}
		upd("t");
		//если преподаватель один, выбираем его в списке
		if (data.lists.t.size == 1) {
			ui.input["t"].selectedIndex = 1
		}
	} else {
		//ничего не делаем
	}
}

/*requests.get_list = function(target, f_id, s_id, t_id, function_params) {
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
}*/

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
		//data.filters[target][0] = "";
		if (function_params.update_ui == true) {
			ui.update_filter_list(target);
		}
		if (function_params.update_ui_custom_function != undefined) {
			function_params.update_ui_custom_function();
		}
	}
	requests.queries_filters[target].send();
}