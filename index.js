'use strict';

document.addEventListener('DOMContentLoaded', init);

var ui = { //functions and variables about user interface
	button: {
		f: document.getElementById('button_faculty'),
		s: document.getElementById('button_subject'),
		t: document.getElementById('button_teacher'),
	},
	clear: {
		f: document.getElementById('clear_faculty'),
		s: document.getElementById('clear_subject'),
		t: document.getElementById('clear_teacher'),
	},
	list: {
		f: document.getElementById('list_faculties'),
		s: document.getElementById('list_subjects'),
		t: document.getElementById('list_teachers'),
	},
	results_box: document.getElementById('aside1_results_box'),
	article_frame: document.getElementById('article_frame'),
	download_frame: document.getElementById('download_frame'),
	button_download: document.getElementById('button_download'),
	dummy: document.getElementById('dummy'),
	default_names: {
		f: "Все факультеты",
		s: "Все предметы",
		t: "Все преподаватели",
	},
};

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

function init() {
	ui.dummy.addEventListener('click', ui.cancel_all_lists);
	window.addEventListener('resize', ui.recalculate_css);
	ui.recalculate_css();
	ui.button.f.addEventListener('click', function(event) {ui.button_show_list(event, "f")});
	ui.button.s.addEventListener('click', function(event) {ui.button_show_list(event, "s")});
	ui.button.t.addEventListener('click', function(event) {ui.button_show_list(event, "t")});
	ui.clear.f.addEventListener('click', function(event) {ui.button_clear(event, "f")});
	ui.clear.s.addEventListener('click', function(event) {ui.button_clear(event, "s")});
	ui.clear.t.addEventListener('click', function(event) {ui.button_clear(event, "t")});
	ui.list.f.addEventListener('click', function(event) {ui.list_event_selection(event, "f")});
	ui.list.s.addEventListener('click', function(event) {ui.list_event_selection(event, "s")});
	ui.list.t.addEventListener('click', function(event) {ui.list_event_selection(event, "t")});
	ui.results_box.addEventListener('click', ui.results_event_selection);
	ui.button_download.addEventListener('click', ui.download);
	ui.update(initial_f, null, initial_s, null, initial_t, null);
};

ui.recalculate_css = function() {
	//recalculate lists maxHeight
	var total_height = Math.round(parseFloat(
		window.getComputedStyle(document.getElementById('aside1')).height));
	var button_faculty = ui.button.f.parentElement; //wrapper
	var button_subject = ui.button.s.parentElement;
	var button_teacher = ui.button.t.parentElement;
	var _parent = button_faculty.parentElement;
	var offset_faculty_button = button_faculty.offsetTop - _parent.offsetTop;
	var offset_subject_button = button_subject.offsetTop - _parent.offsetTop;
	var offset_teacher_button = button_teacher.offsetTop - _parent.offsetTop;
	ui.list.f.style.maxHeight = (total_height - 6 - offset_faculty_button) + 'px';
	ui.list.s.style.maxHeight = (total_height - 6 - offset_subject_button) + 'px';
	ui.list.t.style.maxHeight = (total_height - 6 - offset_teacher_button) + 'px';
};

ui.list_update = function(letter) {
	var list = ui.list[letter];
	while(list.children[1]) { list.removeChild(list.children[1]); }
	var dummy = list.firstElementChild;
	var current_data_list = requests.lists[letter];
	var data_list = requests.lists[letter]
	for (var id in data_list) {
		var new_elem = dummy.cloneNode(true);
		var new_elem_inner = new_elem.getElementsByClassName('search_box_list_element_text')[0];
		new_elem_inner.textContent = data_list[id];
		new_elem.style.display='';
		new_elem.setAttribute('data-id',id);
		new_elem.setAttribute('data-name',data_list[id]);
		new_elem_inner.textContent = data_list[id];
		list.appendChild(new_elem);
	};
};

ui.list_event_selection = function(event, letter) {
	event.stopPropagation();
	ui.button_hide_list(letter);
	var elem = event.target;
	var id, name;
	while(elem.parentNode) {
		if (elem.hasAttribute('data-id')) {
			id = +elem.getAttribute('data-id');
			name = elem.getAttribute('data-name');
			break;
		}
		elem = elem.parentNode;
	}
	ui.button_set_data(letter, id, name);
	ui.update(
			ui.button.f.getAttribute('data-id'),
			ui.button.f.getAttribute('data-name'),
			ui.button.s.getAttribute('data-id'),
			ui.button.s.getAttribute('data-name'),
			ui.button.t.getAttribute('data-id'),
			ui.button.t.getAttribute('data-name'),
	);
};

ui.button_set_data = function(letter, id ,text) {
	var button = ui.button[letter];
	var button_inner = button.getElementsByClassName('aside1_search_box_button_text')[0];
	button.setAttribute('data-id',id);
	if (text != null) {
		button.setAttribute('data-name',text);
		button_inner.textContent = text;
	}
};

ui.button_show_list = function(event, letter) {
	var list = ui.list[letter];
	list.style.display = 'flex';
	list.scrollTop = 0;
	ui.dummy.style.display = '';
};

ui.button_clear = function(event, letter) {
	ui.button[letter].setAttribute('data-id', 0);
	ui.update(
			ui.button.f.getAttribute('data-id'),
			ui.button.f.getAttribute('data-name'),
			ui.button.s.getAttribute('data-id'),
			ui.button.s.getAttribute('data-name'),
			ui.button.t.getAttribute('data-id'),
			ui.button.t.getAttribute('data-name'),
	);
};

ui.button_hide_list = function(letter) {
	ui.list[letter].style.display = '';
	ui.dummy.style.display = 'none';
};

ui.cancel_all_lists = function() {
	ui.button_hide_list("f");
	ui.button_hide_list("s");
	ui.button_hide_list("t");
};

ui.results_event_selection = function(event) {
	var elem = event.target;
	var id;
	while(elem.parentNode) {
		if (elem.hasAttribute('data-id')) {
			id = +elem.getAttribute('data-id');
			ui.result_selection(id);
			return;
		};
		if (elem == ui.results_box)
			return;
		elem = elem.parentNode;
	}
};

ui.result_selection = function(id) {
	var stub = document.getElementById('aside2_stub');
	var box = document.getElementById('aside2_info_box');
	if (id == 0) {
		ui.selected_result = null;
		stub.style.display='';
		box.style.display='none';
		ui.article_frame.style.display = 'none';
		ui.article_frame.src = "about:blank";
	} else {
		var result = requests.result_array[id];
		stub.style.display='none';
		box.style.display='';
		var span_author = document.getElementById('author_span');
		var span_description = document.getElementById('description_span');
		var span_date = document.getElementById('date_span');
		if (result.author) {
			span_author.textContent = result.author;
		} else {
			span_author.textContent = '';
			var faint = document.createElement('span');
			faint.className += 'text_faint_style';
			span_author.appendChild(faint);
			faint.textContent = 'Не указан';
		};
		if (result.description) {
			span_description.textContent = result.description;
		} else {
			span_description.textContent = '';
			var faint = document.createElement('span');
			faint.className += 'text_faint_style';
			span_description.appendChild(faint);
			faint.textContent = 'Отсутствует';
		};
		if (result.date) {
			span_date.textContent = result.date;
		} else {
			span_date.textContent = '';
			var faint = document.createElement('span');
			faint.className += 'text_faint_style';
			span_date.appendChild(faint);
			faint.textContent = 'Неизвестно';
		};
		ui.article_frame.style.display = '';
		if (result.type.split(":")[1] == "PDF") {
			ui.article_frame.src = "/files/test_pdf.pdf";
		} else {
			ui.article_frame.src = "/files/no_preview.html";
		}
		ui.selected_result = id;
	}
	ui.update_page_url(false);
};

ui.results_update = function() {
	var box = ui.results_box;
	var noliterature_dummy = document.getElementById('dummyNoliterature');
	var literature_dummy = document.getElementById('dummyLiterature');
	var literatureHeader = document.getElementById('result_literature_header');
	var infobox = document.getElementById('result_infobox');
	var items_to_remove = [];
	var noliterature_delete = box.getElementsByClassName('result_noliterature');
	var literature_delete = box.getElementsByClassName('result_literature');
	Array.prototype.forEach.call(noliterature_delete, function(item, i, arr) {
		if (item != noliterature_dummy) items_to_remove.push(item);
	});
	Array.prototype.forEach.call(literature_delete, function(item, i, arr) {
		if (item != literature_dummy) items_to_remove.push(item);
	});
	items_to_remove.forEach(function(item, i, arr) {
		item.remove();
	});
	if (requests.result_array == null) {
		infobox.style.display='';
		infobox.getElementsByClassName('result_infobox_text')[0].textContent = 'Нет материалов';
		literatureHeader.style.display='none';
	} else {
		infobox.style.display='none';
		var literature_exists = false;
		for (var id in requests.result_array) {
			var item = requests.result_array[id];
			if (item.type.startsWith('LITERATURE')) {
				literature_exists = true;
				var new_elem = literature_dummy.cloneNode(true);
				new_elem.removeAttribute("id");
				new_elem.setAttribute('data-id', id);
				new_elem.getElementsByClassName('result_literature_text')[0].textContent = item.title;
				new_elem.style.display='';
				box.insertBefore(new_elem, infobox);
			} else {
				var new_elem = noliterature_dummy.cloneNode(true);
				new_elem.removeAttribute("id");
				new_elem.setAttribute('data-id', id);
				new_elem.getElementsByClassName('result_noliterature_text')[0].textContent = item.title;
				new_elem.style.display='';
				var image = new_elem.getElementsByTagName('img')[0];
				if (item.type.startsWith("TEACHER")) {
					image.className += "image_methodic";
					box.insertBefore(new_elem, noliterature_dummy.nextSibling);
				} else if (item.type.startsWith("STUDENT")) {
					image.className += "image_abstract";
					box.insertBefore(new_elem, literatureHeader);
				};
				if (initial_res == id) {
					initial_res = null;
					ui.results_update.elem_to_select = new_elem;
				}
			}
		};
		if (literature_exists) {
			literatureHeader.style.display='';
		} else {
			literatureHeader.style.display='none';
		}
	}
	if (ui.results_update.elem_to_select != null) {
		ui.results_update.elem_to_select.click();
		//TODO: прокрутка полосы до этого элемента
		ui.results_update.elem_to_select = null;
	}
};

ui.update = function(f_id, f_name, s_id, s_name, t_id, t_name) {
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
	ui.button_set_data("f", f_id, f_name);
	ui.button_set_data("s", s_id, s_name);
	ui.button_set_data("t", t_id, t_name);
	//имена (*_name) будут уточнены после окончания requests.get_list
	ui.update_page_url();
	ui.result_selection(0);
}

ui.update_page_title = function() {
	var name = "";
	if (ui.selected_result > 0 && requests.result_array[ui.selected_result] != null) {
		name = requests.result_array[ui.selected_result].title;
	} else if (ui.button.t.getAttribute('data-id') > 0
			&& ui.button.t.getAttribute('data-name') != null) {
		name = ui.button.t.getAttribute('data-name');
	} else if (ui.button.s.getAttribute('data-id') > 0
			&& ui.button.s.getAttribute('data-name') != null) {
		name = ui.button.s.getAttribute('data-name');
	} else if (ui.button.f.getAttribute('data-id') > 0
			&& ui.button.f.getAttribute('data-name') != null) {
		name = ui.button.f.getAttribute('data-name');
	};
	var name2 = "NSU Online Library";
	if (name.length > 0) {
		name2 = name + " - " + name2;
	};
	document.title = name2;
}

ui.update_page_url = function(push_in_history = true) {
	ui.update_page_title();
	var params = {};
	var f = ui.button.f.getAttribute('data-id');
	var s = ui.button.s.getAttribute('data-id');
	var t = ui.button.t.getAttribute('data-id');
	if (f > 0) params["f"] = f;
	if (s > 0) params["s"] = s;
	if (t > 0) params["t"] = t;
	if (ui.selected_result > 0) params["res"] = ui.selected_result;
	var name;
	if (ui.update_page_url.notFirstUsage != undefined) {
		if (push_in_history) {
			window.history.pushState(
				{}, "", requests.build_url("", params)
			);
		} else {
			window.history.replaceState(
				{}, "", requests.build_url("", params)
			);
		}
	} else {
		ui.update_page_url.notFirstUsage = true;
	}
}

ui.download = function(event) {
	var id = ui.selected_result;
	ui.download_frame.src = requests.build_url("/download.php", {
		"file": encodeURIComponent(requests.result_array[id].file),
		"filename": requests.result_array[id].name,
	});
}

/////////////////////////////////////

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
		requests.lists[target][0] = ui.default_names[target];
		ui.list_update(target);
		var id = +ui.button[target].getAttribute('data-id');
		var name = requests.lists[target][id]
		if (name != null) ui.button_set_data(target, id, name);
		ui.update_page_title();
	}
	requests.queries_lists[target].send();
}