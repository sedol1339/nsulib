'use strict';

var ui = {
	dummy: $('#dummy'),
	button_publish_or_edit: $('#publish_file_button'),
	button_quit: $('#quit_button'),
	materials_filter: $('#materials_header_filter'),
	materials_filter_box: $('#materials_filter_box'),
	materials_filter_button_ok: $('#filter_button_ok'),
	filters: {
		f: $('#filter_f'),
		s: $('#filter_s'),
		t: $('#filter_t'),
		uploaded: $('#filter_uploaded'),
	},
	info_type: $('#info_type'),
	edit_info: $('#edit_info'),
	input: {
		file: $('#input_file'),
		f: $('#input_f'),
		s: $('#input_s'),
		t: $('#input_t'),
		type: $('#input_type'),
		title: $('#input_title'),
		author: $('#input_author'),
		year: $('#input_year'),
		description: $('#input_description'),
	},
	file_about: $('#info_file_about'),
	upload_grid: $("#materials_upload_grid"),
	grid: $("#materials_grid"),
	sort: {
		title: $('#sort_title'),
		f: $('#sort_f'),
		s: $('#sort_s'),
		t: $('#sort_t'),
		uploader: $('#sort_uploader'),
		uploaded: $('#sort_uploaded'),
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

$(document).ready(function init() {
	
	ui.init_guide_box();
	
	$(window).on('beforeunload', ui.process_exit);
	$(window).on('resize', ui.recalculate_css);
	ui.recalculate_css();
	
	ui.button_publish_or_edit.on('click', ui.button_publish_or_edit_click);
	ui.button_quit.on('click', ui.button_quit_click);
	ui.input.file.on('change', ui.file_selected);
	
	ui.set_uploading_type(null, "publishing");
	ui.info_type.children().each(function() {
		$(this).on('click', ui.set_uploading_type);
	});
	
	ui.input.f.on('change', function(event) {ui.event_main_selection(event, "f")});
	ui.input.s.on('change', function(event) {ui.event_main_selection(event, "s")});
	ui.input.t.on('change', function(event) {ui.event_main_selection(event, "t")});
	ui.fill_additional_lists();
	
	ui.materials_filter.on('click', function(event) {ui.materials_filter_show_or_hide(event, "switch")});
	ui.materials_filter_button_ok.on('click', function(event) {ui.materials_filter_show_or_hide(event, "hide")});
	ui.filters.f.on('change', function(event) {ui.event_filter_selection(event, "f")});
	ui.filters.s.on('change', function(event) {ui.event_filter_selection(event, "s")});
	ui.filters.t.on('change', function(event) {ui.event_filter_selection(event, "t")});
	ui.filters.uploaded.on('change', function(event) {ui.event_filter_selection(event, "uploaded")});
	ui.update_filter_list("f");
	ui.update_filter_list("s");
	ui.update_filter_list("t");
	ui.fill_additional_filter_lists();
	requests.get_filter_list("f", undefined, undefined, undefined, { update_ui: true, update_ui_custom_function: ui.set_default_filters } );
	
	ui.sort.title.on('click', function(event) {ui.show_materials("title")});
	ui.sort.f.on('click', function(event) {ui.show_materials("f")});
	ui.sort.s.on('click', function(event) {ui.show_materials("s")});
	ui.sort.t.on('click', function(event) {ui.show_materials("t")});
	ui.sort.uploader.on('click', function(event) {ui.show_materials("uploader")});
	ui.sort.uploaded.on('click', function(event) {ui.show_materials("uploaded")});
	
	ui.grid.on('mouseleave', ui.grid_onmouseleave);
	ui.upload_grid.on('mouseleave', ui.grid_onmouseleave);
	
	requests.get_full_lists_and_relations();
	
	ui.update_upload_grid();
	
	//checkpoint("init finished");
});

ui.set_uploading_type = function(event, type) {
	if (event) {
		//клик мыши, известен эвент и элемент, определить тип
		var elem = $(event.delegateTarget);
		type = elem.attr('data-type');
	} else {
		//известен тип, определить элемент
		var elem = ui.info_type.find("[data-type='" + type + "']");
	}
	
	ui.info_type.children().removeClass("info_type_selected");
	if (elem) {elem.addClass("info_type_selected");}
	
	ui.mode = type;
	if (type == "publishing") {
		//не менять порядок следующих двух строк
		ui.material_deselect();
		ui.edit_info.css('display', "none");
		ui.input.file.css('display', "");
		ui.input_clear();
		ui.button_publish_or_edit.text("Опубликовать файл");
		ui.input_disabled(false);
	} else if (type == "editing") {
		ui.input.file.css('display', "none");
		ui.edit_info.css('display', ui.selected_material_id ? "none" : "");
		ui.input_disabled(ui.selected_material_id ? false : true);
		ui.input_clear();
		ui.button_publish_or_edit.text("Отредактировать информацию");
	}
}

ui.input_clear = function() {
	ui.input.f.val(0);
	ui.input.s.val(0);
	ui.input.t.val(0);
	ui.input.type.val("TEACHER");
	ui.input.title.val("")
	ui.input.author.val("")
	ui.input.year.val("2018")
	ui.input.description.val("")
}

ui.input_disabled = function(disabled) {
	ui.input.f.prop('disabled', disabled);
	ui.input.s.prop('disabled', disabled);
	ui.input.t.prop('disabled', disabled);
	ui.input.type.prop('disabled', disabled);
	ui.input.title.prop('disabled', disabled);
	ui.input.author.prop('disabled', disabled);
	ui.input.year.prop('disabled', disabled);
	ui.input.description.prop('disabled', disabled);
	ui.button_publish_or_edit_disabled = disabled;
	if (disabled) {
		ui.button_publish_or_edit.addClass('common_button_disabled');
	} else {
		ui.button_publish_or_edit.removeClass('common_button_disabled');
	}
}

ui.update_upload_grid = function() {
	data.uploading.forEach(function(entry, _, set) {
		if (entry.state == "NOT_EXIST") {
			data.uploading.delete(entry);
		};
	});
	if (data.uploading.size == 0) {
		ui.upload_grid.empty().css('display', "none");
		ui.highlighted_row_first_elem_upload = null;
		return;
	} else {
		ui.upload_grid.css('display', "").css('height', Math.min(data.uploading.size, 6) * 30 + 'px');
		//ui.upload_grid.css('display', "").css('height', '150' + 'px');
	}
	
	/*var rows_to_remove = new Set();
	ui.upload_grid.children("[grid-column-start='title']").each( function() {
		rows_to_remove.add($(this));
	});*/
	//var rows_to_remove = new Set(ui.upload_grid.children("[grid-column-start='title']"));
	var rows_to_remove = new Set();
	ui.upload_grid.children().each(function() {
		if ($(this).css('grid-column-start') == 'title') {
			rows_to_remove.add($(this));
		}
	});
	
	var state_handlers = {
		"UPLOADING": function(entry, div) {
			if (entry.state_changed) {
				div.empty();
				
				var span = $('<span>');
				span.addClass("uploading_span");
				div.append(span);
				entry.loading_span = span;
				
				var progress_bar = $('<div>');
				progress_bar.addClass("uploading_progress_bar");
				div.append(progress_bar);
				
				var progress_bar_inner = $('<div>');
				progress_bar_inner.addClass("uploading_progress_bar_inner");
				progress_bar.append(progress_bar_inner);
				entry.progress_bar_inner = progress_bar_inner;
				
				div.next().empty().append($('<span>').html('отмена').click(ui.upload_erase));
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
			entry.loading_span.text(txt);
			entry.progress_bar_inner.css("width", percent);
		},
		"WAITING_FOR_RESPONSE": function(entry, div) {
			if (!entry.state_changed) return;
			div.empty();
			var span = $('<span>');
			span.text("Обработка файла на сервере...");
			span.css("display", "inline-block");
			div.append(span);
			div.next().empty().append($('<div>').addClass('uploading_erase').click(ui.upload_erase));
		},
		"FINISHED": function(entry, div) {
			if (!entry.state_changed) {
				var span = div.children().first();
			} else {
				div.empty();
				var span = $('<span>');
				span.css("display", "inline-block");
				div.append(span);
				div.next().empty().append($('<div>').addClass('uploading_erase').click(ui.upload_erase));
			}
			span.text(entry.result);
			span.prop("title", span.text());
		},
		"FINISHED_ERROR": function(entry, div) {
			if (!entry.state_changed) {
				var span = div.children().first();
			} else {
				div.empty();
				var span = $('<span>');
				span.css("display", "inline-block");
				div.append(span);
				span.css("color", "#E00");
				div.next().empty().append($('<div>').addClass('uploading_erase').click(ui.upload_erase));
			}
			span.text("Ошибка: " + entry.result);
			span.prop("title", span.text());
		},
		"CANCELLED": function(entry, div) {
			if (!entry.state_changed) return;
			div.empty();
			var span = $('<span>');
			span.text("Загрузка отменена");
			span.css("display", "inline-block");
			div.append(span);
			div.next().empty().append($('<div>').addClass('uploading_erase').click(ui.upload_erase));
		},
	};
	
	data.uploading.forEach(function(entry, _, set) {
		if (!entry.elem) {
			/*if (!ui.upload_grid.is(':empty')) {
				var row = +ui.upload_grid.last().css("grid-row-start") + 1;
				console.log("if: " + row);
			} else {
				var row = 1;
				console.log("else: " + row);
			}*/
			
			var div1 = $("<div>");
			div1.addClass("grid_item");
			//div1.css("grid-row", row);
			div1.css("grid-column", "title");
			div1.mouseover(ui.materials_onmouseover);
			var span1 = $("<span>");
			span1.prop("title", entry.title);
			span1.text(entry.title);
			div1.append(span1);
			ui.upload_grid.append(div1);
			
			entry.elem = div1;
			
			var div2 = $("<div>");
			div2.addClass("grid_item");
			//div2.css("grid-row", row);
			div2.css("grid-column-start", "status_start");
			div2.css("grid-column-end", "delete");
			div2.mouseover(ui.materials_onmouseover);
			ui.upload_grid.append(div2);
			
			var div3 = $("<div>");
			div3.addClass("grid_item");
			div3.addClass("delete_button_faint");
			//div3.css("grid-row", row);
			div3.css("grid-column", "delete");
			div3.mouseover(ui.materials_onmouseover);
			var span3 = $("<span>");
			span3.html("отмена");
			div3.append(span3);
			ui.upload_grid.append(div3);
			
			state_handlers[entry.state](entry, div2);
			
		} else {
			rows_to_remove.forEach(function(elem, _, set) {
				if (elem.is(entry.elem)) {
					rows_to_remove.delete(elem);
				}
			});
			state_handlers[entry.state](entry, entry.elem.next());
		}
	});
	
	rows_to_remove.forEach(function(elem, _, set) {
		/*var next_elem = elem.next().next().next();
		while (next_elem[0]) {
			next_elem.css("grid-row-start", "-=1");
			next_elem = next_elem.next();
		}*/
		elem.next().next().remove();
		elem.next().remove();
		elem.remove();
		if (elem.is(ui.highlighted_row_first_elem_upload)) {
			ui.highlighted_row_first_elem_upload = null;
		}
	});
}

ui.upload_erase = function(event) {
	var elem = $(event.delegateTarget).closest(".grid_item");
	var first_elem_in_row = elem.prev().prev(); 
	data.uploading.forEach(function(entry, _, set) {
		if (entry.elem.is(first_elem_in_row)) {
			entry.XMLHttpRequest.abort();
			data.uploading.delete(entry);
		};
	});
	
	ui.update_upload_grid();
}

ui.materials_filter_show_or_hide = function(event, to_do, no_update) {
	var show = function() {
		ui.materials_filter_box.css('display', "");
		ui.materials_filter.addClass("materials_header_filter_darken");
	};
	var hide = function() {
		ui.materials_filter_box.css('display', "none");
		ui.materials_filter.removeClass("materials_header_filter_darken");
		
		if (no_update != true) { requests.receive_materials(true); }
	}
	if (to_do == "switch") {
		if (ui.materials_filter_box.css('display') == 'none') {
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
	var file = ui.input.file.prop('files')[0];
	if (!file) return;
	var lastDotPosition = file.name.lastIndexOf(".");
	if (lastDotPosition < 1 | lastDotPosition == file.name.length - 1) {
		var file_name = file.name;
		var file_ext = file.name;
	} else {
		var file_name = file.name.substr(0, lastDotPosition);
		var file_ext = file.name.substr(lastDotPosition + 1, file.name.length);
	}
	ui.file_about.text("Файл " + file_ext + ", размер " + humanFileSize(file.size, true));
	//ui.input.title.val(file_name);
	ui.input.title.val(file.name);	//иначе файл скачивается обратно без расширения!
									//возможно, это временное решение
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
	//if (ui.input[letter].selectedIndex == -1) return 0;
	//return ui.input[letter].options[ui.input[letter].selectedIndex].value;
	return ui.input[letter].val();
}

ui.get_selected_filter_value = function(letter) {
	//if (ui.filters[letter].selectedIndex == -1) return 0;
	//return ui.filters[letter].options[ui.filters[letter].selectedIndex].value;
	return ui.filters[letter].val();
}

ui.event_main_selection = function(event, letter) {
	ui.update_lists(letter);
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
		//ui.filters["s"].prop('disabled', true);
		requests.get_filter_list("s", ui.get_selected_filter_value("f"), undefined, undefined, { update_ui: true } );
		//сбрасываем t
		data.filters.t = [];
		ui.update_filter_list("t");
	} else if (letter == "s") {
		//обновляем t
		//ui.filters["t"].prop('disabled', true);
		requests.get_filter_list("t", ui.get_selected_filter_value("f"), ui.get_selected_filter_value("s"), undefined, { update_ui: true } );
	}
}

ui.update_filter_list = function(letter) {
	var local_list = ui.filters[letter];
	var local_data = ui.sort_by_name(data.filters[letter], letter);
	//var selected = ui.fill_select_tag_and_select_if_one_option(local_list, local_data);
	//ui.filters[letter].prop('disabled', false);
	local_list.empty();
	var func = function(i, _, set) {
		var title = (i == 0) ? "" : data.full_lists[letter][i][(letter == "t") ? 1 : 0];
		var opt = $('<option>');
		opt.text(title);
		opt.prop('value', i);
		local_list.append(opt);
	};
	func(0, null, null);
	local_data.forEach(func);
}

ui.set_default_filters = function() {
	//ui.filters.uploaded.val("ALL_TIME");
	//ui.filters.f.val("1");
	ui.filters.uploaded.val("TODAY");
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
		var opt = $('<option>');
		opt.text(i);
		opt.val(i);
		ui.input.year.append(opt);
	}
}

ui.fill_additional_filter_lists = function() {
	//uploaded
	var local_list = ui.filters.uploaded;
	var local_data = data.filters.uploaded;
	ui.fill_select_tag_and_select_if_one_option(local_list, local_data);
}

ui.fill_select_tag_and_select_if_one_option = function(local_list, local_data) {
	local_list.empty();
	for (var i in local_data) {
		var item = local_data[i];
		var opt = $('<option>');
		opt.text(item);
		opt.val(i);
		local_list.append(opt);
	};
	//если в списке только одно значение, возможно кроме пустого, устанавливаем его
	if (Object.keys(local_data).length == 1) {
		local_list.val(local_list.last().prop('value'));
		return false;
	};
	if (Object.keys(local_data).length == 2 & local_list.children().first().text() == "") {
		local_list.val(local_list.last().prop('value'));
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
	ui.guide_box_wrapper = $('#guide_box_wrapper');
	ui.button_guidebox_ok = $('#button_guidebox_ok');
	ui.button_guidebox_ok.on('click', ui.hide_guide_box);
	var show_guide_box = true;
	if (get_cookie("showGuideBox") === 'false') show_guide_box = false;
	if (show_guide_box) {
		ui.show_guide_box();
		ui.dummy.css('display', "");
		ui.dummy.on('click', ui.hide_guide_box);
	};
}

ui.show_guide_box = function() {
	ui.guide_box_wrapper.css('display', "");
	ui.dummy.css('display', "");
	ui.dummy.addClass("dummy_shade");
}

ui.hide_guide_box = function() {
	ui.guide_box_wrapper.css('display', "none");
	ui.dummy.css('display', "none");
	ui.dummy.removeClass("dummy_shade");
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
	//var main_width = $('#main_container').css('clientWidth');
}

ui.button_publish_or_edit_click = function(event) {
	
	if (ui.button_publish_or_edit_disabled) return;
	
	if (ui.mode == "editing") {
		var edit = true;
	} else if (ui.mode == "publishing") {	
		var edit = false;
	} else {
		console.log("unknown mode! ui.mode = " + ui.mode);
		return;
	}
	
	var check_filled = function() {
		var blank_fields_exist = false;
		var error_message = "Не заполнены следующие поля:\n";
		
		if (ui.get_selected_value("f") == 0) { blank_fields_exist = true; error_message += "Факультет\n"; }
		if (ui.get_selected_value("s") == 0) { blank_fields_exist = true; error_message += "Предмет\n"; }
		if (ui.get_selected_value("t") == 0) { blank_fields_exist = true; error_message += "Преподаватель\n"; }
		if (ui.get_selected_value("type") == 0) { blank_fields_exist = true; error_message += "Тип\n"; }
		if (ui.input.title.val().length == 0) { blank_fields_exist = true; error_message += "Название\n"; }
		
		if (blank_fields_exist) {
			window.alert(error_message);
			return false;
		}
		return true;
	}	
	
	if (!edit && ui.input.file.prop('files')[0] == null) { window.alert("Не выбран файл"); return; }
	
	if (!check_filled()) return;
	
	var formData = new FormData();
	
	if (!edit) formData.append('file', ui.input.file.prop('files')[0]);
	
	formData.append('f', ui.get_selected_value("f"));
	formData.append('s', ui.get_selected_value("s"));
	formData.append('t', ui.get_selected_value("t"));
	formData.append('type', ui.get_selected_value("type"));
	formData.append('title', ui.input.title.val());
	
	formData.append('author', ui.input.author.val());
	formData.append('year', ui.get_selected_value("year"));
	formData.append('description', ui.input.description.val());
	
	if (edit) formData.append('id', ui.selected_material_id);
	
	var query_upload = new XMLHttpRequest();
	query_upload.open("POST", "php/uploadScript.php", true);
	
	var uploading_obj = {"title": formData.get("title"), "uploaded": 0, "XMLHttpRequest": query_upload, "_state": "UPLOADING", "_state_changed": true};
	if (edit) uploading_obj.edit_id = ui.selected_material_id;
	Object.defineProperty(uploading_obj, "state", {
		set: function (x) { this._state = x; this._state_changed = true; },
		get: function () { return this._state; }
	});
	Object.defineProperty(uploading_obj, "state_changed", {
		set: function (x) { this._state_changed = x; },
		get: function () { if (this._state_changed) {this._state_changed = false; return true;} else {return false;} }
	});
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
			uploading_obj.result = edit ? "Материал успешно отредактирован." : "Файл успешно загружен.";
			requests.receive_materials(true); //!
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

ui.button_quit_click = function(event) {
	window.location.href = "/";
}

ui.show_materials = function(sort) {
	var box = ui.grid;
	box.css('display', '');
	box.empty();
	
	/*var html = $('html')[0];
	html.css("--width_f", ui.grid_columns.width_f ? ui.filter_column.f.prop('checked') : "0fr");
	html.css("--width_s", ui.grid_columns.width_s ? ui.filter_column.s.prop('checked') : "0fr");
	html.css("--width_t", ui.grid_columns.width_t ? ui.filter_column.t.prop('checked') : "0fr");
	html.css("--width_uploader", ui.grid_columns.width_uploader ? ui.filter_column.uploader.prop('checked') : "0fr");
	html.css("--width_uploaded", ui.grid_columns.width_uploaded ? ui.filter_column.uploaded.prop('checked') : "0fr");*/
	
	if (data.materials.length == 0) {
		$('#no_materials').css('display', '');
		box.css('display', 'none');
	} else {
		$('#no_materials').css('display', 'none');
		if (data.materials.length > 1000) {
			$('#materials_amount').text(" (" + data.materials.length + ", показано 1000)");
		} else {
			$('#materials_amount').text(" (" + data.materials.length + ")");
		}
		
		
		if (!sort) {
			sort = "f";
		}
		if (sort == "title") {
			var sort_func = function(a, b) { return a.title.localeCompare(b.title); };
		} else if (sort == "f") {
			sort_func = function(a, b) {
				var result = data.full_lists.f[a.faculty][1].localeCompare(data.full_lists.f[b.faculty][1]);
				if (result == 0) result = data.full_lists.s[a.subject][1].localeCompare(data.full_lists.s[b.subject][1]);
				if (result == 0) result = data.full_lists.t[a.teacher][1].localeCompare(data.full_lists.t[b.teacher][1]);
				return result;
			};
		} else if (sort == "s") {
			var sort_func = function(a, b) {
				var result = data.full_lists.s[a.subject][1].localeCompare(data.full_lists.s[b.subject][1]);
				if (result == 0) result = data.full_lists.t[a.teacher][1].localeCompare(data.full_lists.t[b.teacher][1]);
				if (result == 0) result = data.full_lists.f[a.faculty][1].localeCompare(data.full_lists.f[b.faculty][1]);
				return result;
			};
		} else if (sort == "t") {
			var sort_func = function(a, b) {
				var result = data.full_lists.t[a.teacher][1].localeCompare(data.full_lists.t[b.teacher][1]);
				if (result == 0) result = data.full_lists.f[a.faculty][1].localeCompare(data.full_lists.f[b.faculty][1]);
				if (result == 0) result = data.full_lists.s[a.subject][1].localeCompare(data.full_lists.s[b.subject][1]);
				return result;
			};
		} else if (sort == "uploader") {
			var sort_func = function(a, b) {
				var result = a.uploader.localeCompare(b.uploader);
				if (result == 0) result = b.uploaded.localeCompare(a.uploaded);
				return result;
			};
		} else if (sort == "uploaded") {
			var sort_func = function(a, b) {
				return b.uploaded.localeCompare(a.uploaded);
			};
		}
		if (sort_func) {
			data.materials = data.materials.sort(sort_func);
		}
		
		var row_number = 1;
		data.materials.forEach(function(entry, array_index, arr) {
			
			if (row_number > 1000) return;
			
			var div = $("<div>");
			div.addClass("grid_item");
			div.mouseover(ui.materials_onmouseover);
			div.click(ui.material_select_event);
			div.css("grid-row", row_number);
			div.css("grid-column", "title");
			var span = $("<span>");
			span.prop('title', entry.title);
			span.text(entry.title);
			div.append(span);
			box.append(div);
			
			div.attr('data-id', entry.id);
			
			//if (ui.filter_column.f.checked) {
				var div = $("<div>");
				div.addClass("grid_item");
				div.mouseover(ui.materials_onmouseover);
				div.click(ui.material_select_event);
				div.css("grid-row", row_number);
				div.css("grid-column", "f");
				var span = $("<span>");
				span.prop('title', data.full_lists.f[entry.faculty][0]);
				span.text(data.full_lists.f[entry.faculty][1]);
				div.append(span);
				box.append(div);
			//}
			
			//if (ui.filter_column.s.checked) {
				var div = $("<div>");
				div.addClass("grid_item");
				div.mouseover(ui.materials_onmouseover);
				div.click(ui.material_select_event);
				div.css("grid-row", row_number);
				div.css("grid-column", "s");
				var span = $("<span>");
				span.prop('title', data.full_lists.s[entry.subject][0]);
				span.text(data.full_lists.s[entry.subject][1]);
				div.append(span);
				box.append(div);
			//}
			
			//if (ui.filter_column.t.checked) {
				var div = $("<div>");
				div.addClass("grid_item");
				div.mouseover(ui.materials_onmouseover);
				div.click(ui.material_select_event);
				div.css("grid-row", row_number);
				div.css("grid-column", "t");
				var span = $("<span>");
				span.prop('title', data.full_lists.t[entry.teacher][0]);
				span.text(data.full_lists.t[entry.teacher][1]);
				div.append(span);
				box.append(div);
			//}
			
			//if (ui.filter_column.uploader.checked) {
				var div = $("<div>");
				div.addClass("grid_item");
				div.mouseover(ui.materials_onmouseover);
				div.click(ui.material_select_event);
				div.css("grid-row", row_number);
				div.css("grid-column", "uploader");
				var span = $("<span>");
				span.prop('title', entry.uploader);
				span.text(entry.uploader);
				div.append(span);
				box.append(div);
			//}
			
			//if (ui.filter_column.uploaded.checked) {
				var div = $("<div>");
				div.addClass("grid_item");
				div.mouseover(ui.materials_onmouseover);
				div.click(ui.material_select_event);
				div.css("grid-row", row_number);
				div.css("grid-column", "uploaded");
				var span = $("<span>");
				span.prop('title', entry.uploaded);
				span.text(entry.uploaded);
				div.append(span);
				box.append(div);
			//}
			
			var div = $("<div>");
			div.addClass("grid_item");
			div.mouseover(ui.materials_onmouseover);
			div.click(ui.material_delete_or_restore_event);
			div.addClass("delete_button_faint");
			div.css("grid-row", row_number);
			div.css("grid-column", "delete");
			var span = $("<span>");
			div.text("удалить");
			div.append(span);
			box.append(div);
			
			row_number++;
		});
	}
	$('#receiving_materials_status').css('display', 'none');
	ui.highlighted_row_first_elem = null;
	ui.selected_row_first_elem = null;
	ui.grid.scrollTop(0);
}

ui.material_delete_or_restore = function(elem, delete_box) {
	
	var id = elem.attr('data-id');
	
	if (id == ui.selected_material_id) {
		ui.material_deselect();
	}
	
	var entry = data.materials.find( function(x) {
		return (x.id == id);
	});
	var actions = {
		exists: function() {
			delete_box.empty().append($("<span>").text("удалить"));
			var sibling = elem;
			sibling.removeClass("text_faint_style"); sibling = sibling.next();
			sibling.removeClass("text_faint_style"); sibling = sibling.next();
			sibling.removeClass("text_faint_style"); sibling = sibling.next();
			sibling.removeClass("text_faint_style"); sibling = sibling.next();
			sibling.removeClass("text_faint_style"); sibling = sibling.next();
			sibling.removeClass("text_faint_style"); sibling = sibling.next();
			sibling.removeClass("text_faint_style");
		},
		deleted: function() {
			delete_box.empty().append($("<span>").text("восстановить"));
			var sibling = elem;
			sibling.addClass("text_faint_style"); sibling = sibling.next();
			sibling.addClass("text_faint_style"); sibling = sibling.next();
			sibling.addClass("text_faint_style"); sibling = sibling.next();
			sibling.addClass("text_faint_style"); sibling = sibling.next();
			sibling.addClass("text_faint_style"); sibling = sibling.next();
			sibling.addClass("text_faint_style"); sibling = sibling.next();
			sibling.addClass("text_faint_style");
		},
		error: function() {
			delete_box.empty().append($("<span>").css("color", "red").text("ошибка"));
		},
	};
	//state machine
	if (!entry.deleted_state || entry.deleted_state == "exists") {
		//удаляем
		entry.deleted_state = "in_progress";
		var params = {
			action: "delete",
			id: id,
		};
		params.on_success = function() {
			entry.deleted_state = "deleted";
			actions.deleted();
		};
		params.on_error = function() {
			entry.deleted_state = "error";
			actions.error();
		};
		params.on_network_error = function() {
			entry.deleted_state = "exists";
		};
		params.on_success.bind(this);
		params.on_error.bind(this);
		params.on_network_error.bind(this);
		requests.delete_material(params);
	} else if (entry.deleted_state == "deleted") {
		//восстанавливаем
		entry.deleted_state = "in_progress";
		var params = {
			action: "restore",
			id: id,
		};
		params.on_success = function() {
			entry.deleted_state = "exists";
			actions.exists();
		};
		params.on_error = function() {
			entry.deleted_state = "error";
			actions.error();
		};
		params.on_network_error = function() {
			entry.deleted_state = "deleted";
		};
		params.on_success.bind(this);
		params.on_error.bind(this);
		params.on_network_error.bind(this);
		requests.delete_material(params);
	} else if (entry.deleted_state == "error") {
		//ничего не делаем 
	} else if (entry.deleted_state == "in_progress") {
		//запрос уже отправлен, результат еще не получен, ничего не делаем
	}
}

requests.delete_material = function(params) {
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "/php/delete.php", true);
	
	var formData = new FormData();
	formData.append('id', params.id);
	formData.append('action', params.action);
	
	xhr.onload = function(event) {
		if (xhr.status == 200) {
			console.log("response: " + xhr.responseText);
			params.on_success();
		} else {
			console.log("error while deleting!", );
			console.log("id = " + params.id);
			console.log("action = " + params.action);
			console.log("response code: " + xhr.status);
			console.log("response: " + xhr.responseText);
			params.on_error();
		}
	};
	xhr.onerror = params.on_network_error;
	
	xhr.send(formData);
}

ui.material_select = function(elem) {
	
	var id = elem.attr('data-id');
	var entry = data.materials.find( function(x) {
		return (x.id == id);
	});
	if (entry.deleted_state && entry.deleted_state != "exists") return;
	
	if (elem.is(ui.selected_row_first_elem)) {
		var clear_selection = true;
	}	
	var sibling = elem;
	if (sibling) {
		sibling.addClass("js_bold"); sibling = sibling.next();
		sibling.addClass("js_bold"); sibling = sibling.next();
		sibling.addClass("js_bold"); sibling = sibling.next();
		sibling.addClass("js_bold"); sibling = sibling.next();
		sibling.addClass("js_bold"); sibling = sibling.next();
		sibling.addClass("js_bold"); sibling = sibling.next();
		sibling.addClass("js_bold");
	}
	sibling = ui.selected_row_first_elem;
	if (sibling) {
		sibling.removeClass("js_bold"); sibling = sibling.next();
		sibling.removeClass("js_bold"); sibling = sibling.next();
		sibling.removeClass("js_bold"); sibling = sibling.next();
		sibling.removeClass("js_bold"); sibling = sibling.next();
		sibling.removeClass("js_bold"); sibling = sibling.next();
		sibling.removeClass("js_bold"); sibling = sibling.next();
		sibling.removeClass("js_bold");
	}
	if (clear_selection) {
		ui.selected_row_first_elem = null;
		ui.selected_material_id = null;
		ui.input_clear();
		ui.edit_info.css('display', "");
		return;
	}
	ui.selected_row_first_elem = elem;
	ui.selected_material_id = id;
	//сохранить порядок следующих двух строк
	ui.edit_info.css('display', "");
	ui.set_uploading_type(null, "editing");
	ui.fill_info_to_edit();
}

ui.material_deselect = function() {
	if (!ui.selected_row_first_elem) return;
	ui.material_select(ui.selected_row_first_elem);
}

ui.fill_info_to_edit = function() {
	var entry = data.materials.find( function(x) {
		return (x.id == ui.selected_material_id);
	});
	
	var f = entry.faculty;
	var s = entry.subject;
	var t = entry.teacher;
	
	ui.input.f.val(f);
	ui.update_lists("f");
	ui.input.s.val(s);
	ui.update_lists("s");
	ui.input.t.val(t);
	ui.update_lists("t");
	//если f, s, t некорректны изначально (нет такой связи)?
	
	ui.input.type.val(entry.type.substr(0, entry.type.indexOf(':'))); 
	ui.input.title.val(entry.title ? entry.title : "");
	if (entry.author) { ui.input.author.val(entry.author); }
	if (entry.year) { ui.input.year.val(entry.year); }
	if (entry.commentary) { ui.input.description.text(entry.commentary); }
}

ui.material_select_event = function(event) {
	var elem = $(event.delegateTarget);
	var sibling = find_first_elem_in_row(elem);
	ui.material_select(sibling);
};

ui.material_delete_or_restore_event = function(event) {
	var elem = $(event.delegateTarget);
	var sibling = find_first_elem_in_row(elem);
	ui.material_delete_or_restore(sibling, elem);
}

ui.selected_row_first_elem = null;
ui.highlighted_row_first_elem = null;
ui.highlighted_row_first_elem_upload = null;
ui.grid_onmouseleave = function(event) {
	if ($(event.currentTarget).is(ui.grid)) {
		if (!ui.highlighted_row_first_elem) return;
		var sibling = ui.highlighted_row_first_elem;
		if (sibling) {
			sibling.removeClass("js_shadowed"); sibling = sibling.next();
			sibling.removeClass("js_shadowed"); sibling = sibling.next();
			sibling.removeClass("js_shadowed"); sibling = sibling.next();
			sibling.removeClass("js_shadowed"); sibling = sibling.next();
			sibling.removeClass("js_shadowed"); sibling = sibling.next();
			sibling.removeClass("js_shadowed"); sibling = sibling.next();
			sibling.removeClass("js_shadowed");
		}
		ui.highlighted_row_first_elem = null;
	} else if ($(event.currentTarget).is(ui.upload_grid)) {
		if (!ui.highlighted_row_first_elem_upload) return;
		var sibling = ui.highlighted_row_first_elem_upload;
		if (sibling) {
			sibling.removeClass("js_shadowed"); sibling = sibling.next();
			sibling.removeClass("js_shadowed"); sibling = sibling.next();
			sibling.removeClass("js_shadowed");
		}
		ui.highlighted_row_first_elem_upload = null;
	}
}

function find_first_elem_in_row(elem) {
	if (!elem) return;
	var column = elem.css("grid-column-start");
	if (!column) return;
	var sibling;
	if (elem.parent().is(ui.grid)) {
		if (column == "title") {
			sibling = elem;
		} else if (column == "f") {
			sibling = elem.prev();
		} else if (column == "s") {
			sibling = elem.prev().prev();
		} else if (column == "t") {
			sibling = elem.prev().prev().prev();
		} else if (column == "uploader") {
			sibling = elem.prev().prev().prev().prev();
		} else if (column == "uploaded") {
			sibling = elem.prev().prev().prev().prev().prev();
		} else if (column == "delete") {
			sibling = elem.prev().prev().prev().prev().prev().prev();
		} else {
			return undefined;
		}
	} else if (elem.parent().is(ui.upload_grid)) {
		if (column == "title") {
			sibling = elem;
		} else if (column == "status_start") {
			sibling = elem.prev();
		} else if (column == "delete") {
			sibling = elem.prev().prev();
		} else {
			return undefined;
		}
	}
	return sibling;
}

ui.materials_onmouseover = function(event) {
	var elem = $(event.delegateTarget);
	/*console.log(event);
	console.log(event.target);
	for (var i = 0; i < event.path.length; i++) {
		if (event.path[i].classList.contains("grid_item")) {
			elem = event.path[i];
			break;
		} else if (event.path[i] == document.documentElement) {
			break;
		};
	};
	elem = $(elem);*/
	var column = elem.css("grid-column-start");
	var row = elem.css("grid-row-start");
	if (!column || !row) return; //почему так происходит?
	
	var sibling = find_first_elem_in_row(elem);
	if (elem.parent().is(ui.grid)) {
		if (sibling.is(ui.highlighted_row_first_elem)) return;
		
		if (sibling) {
			sibling.addClass("js_shadowed"); sibling = sibling.next();
			sibling.addClass("js_shadowed"); sibling = sibling.next();
			sibling.addClass("js_shadowed"); sibling = sibling.next();
			sibling.addClass("js_shadowed"); sibling = sibling.next();
			sibling.addClass("js_shadowed"); sibling = sibling.next();
			sibling.addClass("js_shadowed"); sibling = sibling.next();
			sibling.addClass("js_shadowed");
		}
		
		var sibling = ui.highlighted_row_first_elem;
		if (sibling) {
			sibling.removeClass("js_shadowed"); sibling = sibling.next();
			sibling.removeClass("js_shadowed"); sibling = sibling.next();
			sibling.removeClass("js_shadowed"); sibling = sibling.next();
			sibling.removeClass("js_shadowed"); sibling = sibling.next();
			sibling.removeClass("js_shadowed"); sibling = sibling.next();
			sibling.removeClass("js_shadowed"); sibling = sibling.next();
			sibling.removeClass("js_shadowed");
		}
		
		ui.highlighted_row_first_elem = find_first_elem_in_row(elem);
	} else if (elem.parent().is(ui.upload_grid)) {
		if (sibling.is(ui.highlighted_row_first_elem_upload)) return;
		
		if (sibling) {
			sibling.addClass("js_shadowed"); sibling = sibling.next();
			sibling.addClass("js_shadowed"); sibling = sibling.next();
			sibling.addClass("js_shadowed");
		}
		
		var sibling = ui.highlighted_row_first_elem_upload;
		if (sibling) {
			sibling.removeClass("js_shadowed"); sibling = sibling.next();
			sibling.removeClass("js_shadowed"); sibling = sibling.next();
			sibling.removeClass("js_shadowed");
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
		$('#receiving_materials_status').css('display', '');
		$('#no_materials').css('display', 'none');
	}
	
	var url_params = { "action": "materials" };
	url_params["f"] = ui.get_selected_filter_value("f");
	url_params["s"] = ui.get_selected_filter_value("s");
	url_params["t"] = ui.get_selected_filter_value("t");
	url_params["uploaded"] = ui.get_selected_filter_value("uploaded");
	
	if (requests.query_get_materials != null) requests.query_get_materials.abort();
	requests.query_get_materials = new XMLHttpRequest();
	
	var _url = requests.build_url("/php/get.php", url_params);
	requests.query_get_materials.open("GET", _url, true);
	requests.query_get_materials.onload = function() {
		var response = JSON.parse(requests.query_get_materials.responseText);
		data.materials = [];
		for (var id in response) {
			var entry = response[id];
			entry.id = id;
			entry.deleted_state = "exists";
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
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "/data/init.json", true);
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
		var local_data = ui.sort_by_name(data.lists[letter], letter);
		local_list.empty();
		var func = function(i, _, set) {
			var title = (i == 0) ? "" : data.full_lists[letter][i][(letter == "t") ? 1 : 0];
			var opt = $('<option>');
			opt.text(title);
			opt.val(i);
			local_list.append(opt);
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
			$(ui.input["t"].children("option")[1]).prop('selected', 'selected'); //?

		}
	} else {
		//ничего не делаем
	}
}

requests.get_filter_list = function(target, f_id, s_id, t_id, function_params) {
	var url_params = { "action": "list", "target": target };
	if (f_id != undefined) url_params["f"] = f_id;
	if (s_id != undefined) url_params["s"] = s_id;
	if (t_id != undefined) url_params["t"] = t_id;
	
	if (requests.queries_filters[target] != null) requests.queries_filters[target].abort();
	requests.queries_filters[target] = new XMLHttpRequest();
	
	var _url = requests.build_url("/php/get.php", url_params);
	requests.queries_filters[target].open("GET", _url, true);
	requests.queries_filters[target].onload = function() {
		data.filters[target] = JSON.parse(requests.queries_filters[target].responseText);
		//data.filters[target][0] = "";
		if (function_params.update_ui) {
			ui.update_filter_list(target);
		}
		if (function_params.update_ui_custom_function != undefined) {
			function_params.update_ui_custom_function();
		}
	}
	requests.queries_filters[target].send();
}

ui.sort_by_name = function(list, letter) {
	list = Array.from(list); //list на входе либо массив, либо множество
	return list.sort(function(a, b) {
		return data.full_lists[letter][a][0].localeCompare(data.full_lists[letter][b][0]);
	});
}