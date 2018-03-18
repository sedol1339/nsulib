'use strict';

var ui = { //functions and variables about user interface
	button: {
		f: $('#button_faculty'),
		s: $('#button_subject'),
		t: $('#button_teacher'),
	},
	clear: {
		f: $('#clear_faculty'),
		s: $('#clear_subject'),
		t: $('#clear_teacher'),
	},
	list: {
		f: $('#list_faculties'),
		s: $('#list_subjects'),
		t: $('#list_teachers'),
	},
	results_box: $('#aside1_results_box'),
	article_frame: $('#article_frame'),
	article_frame_placeholder: $('#article_frame_placeholder'),
	article_frame_preview: $("#article_frame_preview"),
	download_frame: $('#download_frame'),
	button_download: $('#button_download'),
	dummy: $('#dummy'),
	default_names: {
		f: "Все факультеты",
		s: "Все предметы",
		t: "Все преподаватели",
	},
};

var data = {
	full_lists: {
		f:{0: ""}, s:{0: ""}, t:{0: ""}
	},
}

var requests = { //functions and variables about xml-http-requests
	lists: {
		f:[], s:[], t:[],
	},
	result_array: null,
	query_materials: null,
	queries_lists: {
		f:null, s:null, t:null,
	},
};

$(document).ready(function init() {
	ui.dummy.click(ui.cancel_all_lists);
	$(window).on('resize', ui.recalculate_css);
	ui.recalculate_css();
	ui.button.f.click(function(event) {ui.button_show_list(event, "f")});
	ui.button.s.click(function(event) {ui.button_show_list(event, "s")});
	ui.button.t.click(function(event) {ui.button_show_list(event, "t")});
	ui.clear.f.click(function(event) {ui.button_clear(event, "f")});
	ui.clear.s.click(function(event) {ui.button_clear(event, "s")});
	ui.clear.t.click(function(event) {ui.button_clear(event, "t")});
	ui.list.f.click(function(event) {ui.list_event_selection(event, "f")});
	ui.list.s.click(function(event) {ui.list_event_selection(event, "s")});
	ui.list.t.click(function(event) {ui.list_event_selection(event, "t")});
	ui.results_box.click(ui.results_event_selection);
	ui.button_download.click(ui.download);
	requests.get_full_lists_and_relations( function on_finish() {
		var initial_data_correct = data.relations.find( function(x) {
			return (
				(initial_f == 0 || x[0] == initial_f) && 
				(initial_s == 0 || x[1] == initial_s) && 
				(initial_t == 0 || x[2] == initial_t)
			);
		});
		if (initial_data_correct) {
			ui.update(initial_f, initial_s, initial_t);
		} else {
			window.alert("Указанная информация не может быть отображена.");
			initial_res = 0;
			ui.update(0, 0, 0);
		}
	});
});

ui.recalculate_css = function() {
	//recalculate lists maxHeight
	var total_height = Math.round(parseFloat(
		window.getComputedStyle($('#aside1')[0]).height));
	var button_faculty = ui.button.f.parent(); //wrapper
	var button_subject = ui.button.s.parent();
	var button_teacher = ui.button.t.parent();
	var _parent = button_faculty.parent();
	var offset_faculty_button = button_faculty.offset().top - _parent.offset().top;
	var offset_subject_button = button_subject.offset().top - _parent.offset().top;
	var offset_teacher_button = button_teacher.offset().top - _parent.offset().top;
	ui.list.f.css('maxHeight', total_height - 6 - offset_faculty_button + 'px');
	ui.list.s.css('maxHeight', total_height - 6 - offset_subject_button + 'px');
	ui.list.t.css('maxHeight', total_height - 6 - offset_teacher_button + 'px');
};

ui.list_update = function(letter) {
	var list = ui.list[letter];
	list.children().slice(1).remove();
	var dummy = list.children().first();
	var data_list = ui.sort_by_name(requests.lists[letter], letter);
	var add = function(id, _, set) {
		var name = (id == 0) ? ui.default_names[letter] : data.full_lists[letter][id][(letter == "t") ? 1 : 0];
		var new_elem = dummy.clone();
		var new_elem_inner = new_elem.find('.search_box_list_element_text').first();
		new_elem_inner.text(name);
		new_elem.css('display', '');
		new_elem.attr('data-id', id);
		list.append(new_elem);
	}
	add(0);
	data_list.forEach(add);
};

ui.list_event_selection = function(event, letter) {
	event.stopPropagation();
	ui.button_hide_list(letter);
	var elem = $(event.target);
	var outer = elem.closest("[data-id]");
	var id = outer.attr('data-id');
	var name = (id == 0) ? ui.default_names[letter] : data.full_lists[letter][id][(letter == "t") ? 1 : 0];
	ui.button_set_data(letter, id);
	var f = ui.button.f.attr('data-id');
	var s = (letter != "f") ? ui.button.s.attr('data-id') : 0;
	var t = (letter == "t") ? ui.button.t.attr('data-id') : 0;
	ui.update(f, s, t);
};

ui.button_set_data = function(letter, id) {
	var button = ui.button[letter];
	var button_inner = button.find('.aside1_search_box_button_text').first();
	button.attr('data-id', id);
	var name = (id == 0) ? ui.default_names[letter] : data.full_lists[letter][id][(letter == "t") ? 1 : 0];
	button_inner.text(name);
};

ui.button_show_list = function(event, letter) {
	var list = ui.list[letter];
	list.css('display', 'flex');
	list.scrollTop(0);
	ui.dummy.css('display', '');
};

ui.button_clear = function(event, letter) {
	ui.button[letter].attr('data-id', 0);
	var f = ui.button.f.attr('data-id');
	var s = (letter != "f") ? ui.button.s.attr('data-id') : 0;
	var t = (letter == "t") ? ui.button.t.attr('data-id') : 0;
	ui.update(f, s, t);
};

ui.button_hide_list = function(letter) {
	ui.list[letter].css('display', '');
	ui.dummy.css('display', 'none');
};

ui.cancel_all_lists = function() {
	ui.button_hide_list("f");
	ui.button_hide_list("s");
	ui.button_hide_list("t");
};

ui.results_event_selection = function(event) {
	var elem = $(event.target).closest("[data-id]");
	ui.result_selection(elem.attr('data-id'), elem);
};

ui.show_preview = function(id, entry) {
	ui.article_frame_preview.empty().hide();
	ui.article_frame_placeholder.unbind("click");
	
	if (!id) {
		ui.article_frame_placeholder
		.empty()
		.append(
			$('<span>').
			text("Выберите материал для отображения")
		)
		.show();
		return;
	} else if (entry.link) {
		ui.article_frame_placeholder
		.empty()
		.append(
			$('<p>').
			text("Ссылка:")
		)
		.append(
			$('<a>').
			prop("href", entry.link).
			prop("target", entry.link).
			text(entry.link)
		)
		.show();
		return;
	} else if (preview_is_accessible(entry)) {
		ui.article_frame_placeholder
		.empty()
		.append(
			$('<span>').
			text("Нажмите для просмотра файла").
			css("font-size", "11pt").
			css("color", "blue").
			addClass("clickable")
		).
		click(function() {
			load_preview(id, entry);
		})
		.show();
	} else {
		ui.article_frame_placeholder
		.empty()
		.append(
			$('<span>').
			text("Файл недоступен для просмотра")
		)
		.show();
		return;
	}
}

function recognize_mime(entry) {
	if (entry.link) return "LINK";
	if (!entry.mime) return "UNKNOWN";
	if (entry.mime == "application/pdf") return "PDF";
	if (
		entry.mime.startsWith("application/vnd.")
		|| entry.mime.startsWith("application/ms")
	) return "MS-OFFICE";
	if (
		entry.mime == "image/gif"
		|| entry.mime == "image/jpeg"
		|| entry.mime == "image/pjpeg"
		|| entry.mime == "image/png"
		|| entry.mime == "image/tiff"
		|| entry.mime == "image/webp"
	) return "IMAGE";
	if (entry.mime == "image/vnd.djvu") return "DJVU";
	if (entry.mime.startsWith("text/")) return "TEXT";
	return "UNKNOWN";
}

function preview_is_accessible(entry) {
	var type = recognize_mime(entry);
	if (type == "LINK") {
		console.error("Warning: calling \"preview_is_accessible()\" for LINK type!");
		return false;
	}
	if (type == "PDF") return true;
	if (type == "MS-OFFICE") return true;
	if (type == "IMAGE") return true;
	if (type == "DJVU") return true;
	
	//text, djvu, unknown
	if (entry.filesize < 1 * 1024 * 1024) {
		return true;
	} else {
		return false;
	}
}

function load_preview(id, entry) {
	ui.article_frame_placeholder.hide();
	
	var loading_img_show = function() {
		ui.article_frame_preview.css("background", "url(../img/loading.gif) center center no-repeat");
	};
	var loading_img_hide = function() {
		checkpoint();
		ui.article_frame_preview.css("background", "");
	};
	
	var type = recognize_mime(entry);
	
	if (type == "PDF") {
		ui.article_frame_preview.show();
		PDFObject.embed("/download.php?id=" + id, ui.article_frame_preview[0]);
		var embed = ui.article_frame_preview.children("embed").first();
		if (embed.length) { //exists
			loading_img_show();
			embed.on("load", loading_img_hide);
		}
	} else if (type == "DJVU") {
		ui.article_frame_preview.show();
		loading_img_show();
		ui.article_frame_preview.append(
			$('<iframe>')
			.prop('id', 'content_iframe')
			.prop('frameBorder', '0')
			.prop('src', "/djvu-viewer/djvu-viewer.php?src=" + encodeURIComponent("/download.php?id=" + id))
			.css('width', '100%')
			.css('height', '100%')
			.on("load", loading_img_hide)
		);
	} else if (type == "MS-OFFICE") {
		ui.article_frame_preview.show();
		loading_img_show();
		ui.article_frame_preview.append(
			$('<iframe>')
			.prop('id', 'content_iframe')
			.prop('frameBorder', '0')
			.prop('src', "http://docs.google.com/gview?embedded=true&url=" + /*window.location.origin*/ encodeURIComponent("http://nsulib.ru" + "/download.php?id=" + id))
			.css('width', '100%')
			.css('height', '100%')
			.on("load", loading_img_hide)
		);
	} else if (type == "IMAGE") {
		ui.article_frame_preview.show();
		loading_img_show();
		ui.article_frame_preview.append(
			$('<iframe>')
			.prop('id', 'content_iframe')
			.prop('frameBorder', '0')
			.css('width', '100%')
			.css('height', '100%')
			.prop('src', "/image_viewer.php?src=/download.php?id=" + id)
			/*.append(
				$('<img>')
				.prop('src', "/download.php?id=" + id)
			)*/
			.on("load", loading_img_hide)
		);
	} else { //text, unknown
		if (type == "UNKNOWN") {
			ui.article_frame_preview.append(
				$("<div>")
				.attr('id',  "article_frame_content_header")
				.text("Формат файла не распознан. Файл отображен как текстовый.")
			);
		}
		//other
		ui.article_frame_preview.show();
		loading_img_show();
		ui.article_frame_preview.append(
			$('<iframe>')
			.prop('id', 'content_iframe')
			.prop('frameBorder', '0')
			.prop('src', "/download.php?plaintext&id=" + id)
			.prop('type', 'text/plain')
			.css('width', '100%')
			.css('height', '100%')
			.on("load", loading_img_hide)
		);
	} 
}

ui.selected_result_elem = null;
ui.result_selection = function(id, elem) {
	if (id != 0 && !elem) {
		//ищем элемент, чтобы выделить его
		elem = ui.results_box.children("[data-id=" + id + "]").first();
	}
	if (ui.selected_result_elem) ui.selected_result_elem.removeClass("selected_result");
	ui.selected_result_elem = elem;
	if (ui.selected_result_elem) ui.selected_result_elem.addClass("selected_result");
	
	var stub = $('#aside2_stub');
	var box = $('#aside2_info_box');
	if (id == 0) {
		ui.selected_result = null;
		stub.css('display', '');
		box.css('display', 'none');
		ui.show_preview(null);
	} else {
		var result = requests.result_array[id];
		stub.css('display', 'none');
		box.css('display', '');
		
		var span_title = $('#title_span');
		span_title.text(result.title);
		
		var span_author = $('#author_span');
		var span_description = $('#description_span');
		var span_date = $('#date_span');
		if (result.author) {
			span_author.text(result.author);
		} else {
			span_author.empty().append($('<span>').addClass('text_faint_style').text('Не указан'));
		};
		if (result.commentary) {
			if (result.commentary.length > 200) {
				var descr = result.commentary.substr(0, 200) + "...";
			} else {
				var descr = result.commentary;
			}
			span_description.text(descr);
		} else {
			span_description.empty().append($('<span>').addClass('text_faint_style').text('Отсутствует'));
		};
		if (result.date) {
			span_date.text(result.date);
		} else {
			span_date.empty().append($('<span>').addClass('text_faint_style').text('Неизвестно'));
		};
		ui.show_preview(id, result);
		ui.selected_result = id;
	}
	ui.update_page_url(
		ui.button.f.attr('data-id'),
		ui.button.s.attr('data-id'),
		ui.button.t.attr('data-id'),
		id, false
	);
};

ui.results_update = function() {
	var box = ui.results_box;
	var noliterature_dummy = $('#dummyNoliterature');
	var literature_dummy = $('#dummyLiterature');
	var literatureHeader = $('#result_literature_header');
	var infobox = $('#result_infobox');
	//var items_to_remove = [];
	box.find('.result_noliterature').each( function() {
		if (!$(this).is(noliterature_dummy)) {
			//items_to_remove.push(this);
			this.remove();
		}
	});
	box.find('.result_literature').each( function() {
		if (!$(this).is(literature_dummy)) {
			//items_to_remove.push(this);
			this.remove();
		}
	});
	if (!requests.result_array) {
		infobox.css('display', '');
		var text = ui.button.f.attr('data-id') == 0 ? '' /*'Уточните поисковой запрос'*/ : 'Нет материалов';
		infobox.find('.result_infobox_text').first().text(text);
		literatureHeader.css('display', 'none');
	} else {
		infobox.css('display', 'none');
		var literature_exists = false;
		for (var id in requests.result_array) {
			var item = requests.result_array[id];
			if (item.type.startsWith('LITERATURE')) {
				literature_exists = true;
				var new_elem = literature_dummy.clone();
				new_elem.removeAttr("id");
				new_elem.attr('data-id', id);
				new_elem.find('.result_literature_text').first().text(item.title);
				new_elem.css('display', '');
				new_elem.insertBefore(infobox);
			} else {
				var new_elem = noliterature_dummy.clone();
				new_elem.removeAttr("id");
				new_elem.attr('data-id', id);
				new_elem.find('.result_noliterature_text').first().text(item.title);
				new_elem.css('display', '');
				var image = new_elem.find('img').first();
				if (item.type.startsWith("TEACHER")) {
					image.addClass("image_methodic");
					new_elem.insertBefore(noliterature_dummy.next());
				} else if (item.type.startsWith("STUDENT")) {
					image.addClass("image_abstract");
					new_elem.insertBefore(literatureHeader);
				};
			}
			if (initial_res == id) {
				initial_res = null;
				ui.results_update.elem_to_select = new_elem;
			}
		};
		if (initial_res) {
			window.alert("Указанный материал не найден");
			initial_res = null;
		};
		if (literature_exists) {
			literatureHeader.css('display', '');
		} else {
			literatureHeader.css('display', 'none');
		}
	}
	if (ui.results_update.elem_to_select != null) {
		ui.results_update.elem_to_select.trigger("click");
		//TODO: прокрутка полосы до этого элемента
		ui.results_update.elem_to_select = null;
	}
};

ui.update = function(f_id, s_id, t_id) {
	//вызывается при изменении факультета, предмета или преподавателя
	//устанавливает надписи, отправляет запрос о материалах, заполняет списки
	ui.selected_result = null;
	if (f_id != 0 || s_id != 0 || t_id != 0) {
		requests.get_materials(f_id, s_id, t_id);
	} else {
		requests.result_array = null;
		ui.results_update();
	}
	requests.get_list("f", 0, 0, 0);
	requests.get_list("s", f_id, 0, 0);
	requests.get_list("t", f_id, s_id, 0);
	ui.button_set_data("f", f_id);
	ui.button_set_data("s", s_id);
	ui.button_set_data("t", t_id);
	/*if (initial_res) {
		ui.result_selection(initial_res);
		initial_res = null;
	} else {
		ui.result_selection(0);
	}*/
	ui.result_selection(0);
	//ui.update_page_url(f_id, s_id, t_id, 0, false);
}

ui.update_page_title = function() {
	if (ui.selected_result > 0 && requests.result_array[ui.selected_result] != null) {
		name = requests.result_array[ui.selected_result].title;
	} else if (ui.button.t.attr('data-id') > 0) {
		var id = ui.button.t.attr('data-id');
		var name = (id == 0) ? ui.default_names.t : data.full_lists.t[id][1];
	} else if (ui.button.s.attr('data-id') > 0) {
		var id = ui.button.s.attr('data-id');
		var name = (id == 0) ? ui.default_names.s : data.full_lists.s[id][1];
	} else if (ui.button.f.attr('data-id') > 0) {
		var id = ui.button.f.attr('data-id');
		var name = (id == 0) ? ui.default_names.f : data.full_lists.f[id][1];
	};
	var name2 = "NSU Online Library";
	if (name) {
		name2 = name + " - " + name2;
	};
	document.title = name2;
}

ui.update_page_url = function(f, s, t, res, push_in_history = true) {
	ui.update_page_title();
	var params = {};
	/*var f = ui.button.f.attr('data-id');
	var s = ui.button.s.attr('data-id');
	var t = ui.button.t.attr('data-id');*/
	if (f > 0) params["f"] = f;
	if (s > 0) params["s"] = s;
	if (t > 0) params["t"] = t;
	//if (ui.selected_result > 0) params["res"] = ui.selected_result;
	if (res > 0) params["res"] = res;
	var name;
	if (ui.update_page_url.notFirstUsage) {
		if (push_in_history) {
			window.history.pushState(
				{}, "", requests.build_url("/", params)
			);
		} else {
			window.history.replaceState(
				{}, "", requests.build_url("/", params)
			);
		}
	} else {
		ui.update_page_url.notFirstUsage = true;
	}
}

ui.download = function(event) {
	var id = ui.selected_result;
	ui.download_frame.prop('src', "/download.php?octet-stream&id=" + id); //octet-stream  для начала скачивания
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

requests.get_materials = function(f_id, s_id, t_id) {
	var params = { "action": "materials" };
	if (f_id != undefined) params["f"] = f_id;
	if (s_id != undefined) params["s"] = s_id;
	if (t_id != undefined) params["t"] = t_id;
	if (requests.query_materials != null) requests.query_materials.abort();
	requests.query_materials = new XMLHttpRequest();
	var _url = requests.build_url("/get.php", params);
	requests.query_materials.open("GET", _url, true);
	requests.query_materials.onload = function() {
		//console.log("readyState = " + requests.query_materials.readyState);
		//console.log("responseText = " + requests.query_materials.responseText);
		requests.result_array = JSON.parse(requests.query_materials.responseText);
		ui.results_update();
	}
	requests.query_materials.send();
}

requests.get_list = function(target, f_id, s_id, t_id) {
	var params = { "action": "list", "target": target };
	if (f_id != undefined) params["f"] = f_id;
	if (s_id != undefined) params["s"] = s_id;
	if (t_id != undefined) params["t"] = t_id;
	if (requests.queries_lists[target] != null) requests.queries_lists[target].abort();
	requests.queries_lists[target] = new XMLHttpRequest();
	var _url = requests.build_url("/get.php", params);
	requests.queries_lists[target].open("GET", _url, true);
	requests.queries_lists[target].onload = function() {
		requests.lists[target] = JSON.parse(requests.queries_lists[target].responseText);
		ui.list_update(target);
		var id = +ui.button[target].attr('data-id');
		if (target == "t" && id == 0 && requests.lists.t.length == 1) {
			//выбираем учителя, если он один в списке
			id = requests.lists.t[0];
		}
		ui.button_set_data(target, id);
		ui.update_page_title();
	}
	requests.queries_lists[target].send();
}

requests.get_full_lists_and_relations = function(on_finish) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "/init.json", true);
	xhr.onload = function() {
		var response = JSON.parse(xhr.responseText);
		data.full_lists.f = response.faculties;
		data.full_lists.s = response.subjects;
		data.full_lists.t = response.teachers;
		data.relations = response.relations;
		if (on_finish) on_finish();
	}
	xhr.send();
}

ui.sort_by_name = function(list, letter) {
	list = Array.from(list); //list на входе либо массив, либо множество
	return list.sort(function(a, b) {
		return data.full_lists[letter][a][0].localeCompare(data.full_lists[letter][b][0]);
	});
}