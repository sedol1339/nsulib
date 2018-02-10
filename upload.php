<!doctype html>
<html>
<head>
	<meta charset=utf-8>
	<title>Upload - NSU Online Library</title>
	<meta name="description" content="" />
	<meta name="Keywords" content="" />
	<meta name="Robots" content="noindex,nofollow" />
	<link rel="shortcut icon" href="img/favicon.ico" />
	<link rel="stylesheet" href="common.css" media="all" />
	<link rel="stylesheet" href="header.css" media="all" />
	<link rel="stylesheet" href="upload.css" media="all" />
	<script src="upload.js" defer></script>
</head>
<body>
	<div id=dummy style="display:none;z-index:1;position:absolute;width:100%;height:100%"></div>
	<div id=guide_box_wrapper style="display:none;">
		<div id=guide_box>
			<div class=box_header>
				<p class=box_header_text>Информация о публикации материалов</p>
			</div>
			<div class=box_main>
				<p class=box_main_text>Нажмите «загрузить файлы» для загрузки файлов на сервер. Вы можете загрузить одновременно несколько файлов.</br></br>Затем заполните для каждого файла информацию об авторе, предмете, преподавателе.</br></br>Вы можете редактировать или удалять опубликованные вами ранее материалы, если вы выполнили вход в систему.</br></br>При публикации pdf-файлов рекомендуется не убирать галочку «обесцветить»: это уменьшит размер файла. Вы также можете загрузить архив с изображениями и конвертировать его в pdf-файл.</br></br>Спасибо за внимание!</p>
			</div>
			<div class=box_footer>
				<div id=button_guidebox_ok class=common_button onclick="console.log(123);">
					<p class=box_button_text>OK</p>
				</div>
			</div>
		</div>
	</div>
	<?php include 'header.php'; ?>
	<main id=main_container> <!-- for js -->
		<div id=materials>
			<div id=materials_header>
				<p id=materials_header_text>Ваши материалы<span id=materials_amount></span>:</p>
				<div id=materials_header_filter class=rowwrapper>
					<p id=materials_filter_text>Фильтры</p>
					<div id=materials_filter_image></div>
				</div>
				<div id=materials_filter_box style="display:none;">
					<div class=info_box_wrapper>
						<div>Факультет:</div>
						<select id=filter_f></select>
					</div>
					<div class=info_box_wrapper>
						<div>Предмет:</div>
						<select id=filter_s></select>
					</div>
					<div class=info_box_wrapper>
						<div>Преподав.:</div>
						<select id=filter_t></select>
					</div>
					<div class=info_box_wrapper>
						<div>Загружено:</div>
						<select id=filter_uploaded></select>
					</div>
					<div class=info_box_wrapper>
						<button id=filter_button_ok>OK</button>
					</div>
				</div>
			</div>
			<div style="overflow-y:scroll;">
				<table id=materials_table>
					<tbody>
						<tr id=dummy_material class=material_entry style="display:none;">
							<td>Название</td>
							<td>Загрузил</td>
							<td>Дата загрузки</td>
							<td>удалить</td>
						</tr>
					</tbody>
					<!--<div style="width:800px;height:100px;background:red;"> </div>-->
				</table>
			</div>
			<div id=no_materials style="display:none;">Нет материалов</div>
			<div id=receiving_materials_status style="display:none;">
				Получение списка материалов<span class="loader_dot">.</span><span class="loader_dot">.</span><span class="loader_dot">.</span>
			</div>
		</div>
		<div id=info>
			<input id=input_file type="file" name="file">
			<div id=main_info>
				<div class=info_box_wrapper>
					<div>Факультет:</div>
					<select id=input_f></select>
					<div class=question_mark data-tooltip="Укажите факультет"></div>
				</div>
				<div class=info_box_wrapper>
					<div>Предмет:</div>
					<select id=input_s></select>
					<div class=question_mark data-tooltip="Укажите предмет"></div>
				</div>
				<div class=info_box_wrapper>
					<div>Преподав.:</div>
					<select id=input_t></select>
					<div class=question_mark data-tooltip="Укажите преподавателя"></div>
				</div>
				<div class=info_box_wrapper>
					<div>Тип:</div>
					<select id=input_type></select>
					<div class=question_mark data-tooltip="Преподавательский - автором материала является преподаватель. Подходит для методичек, презентаций, учебных материалов. Если материал состоит из нескольких файлов (например, презентации лекций), выкладывайте архивом. Данный материал будет показан в первом разделе результатов поиска.&#10;&#10;Студенческий - автором материала является студент. Подходит для конспектов, выполненных заданий. Данный материал будет показан во втором разделе результатов поиска.&#10;&#10;Литература - данный материал рекомендован как литература к данному предмету."></div>
				</div>
				<div class=info_box_wrapper>
					<div>Название:</div>
					<textarea id=input_title rows=1 style="resize: none;"></textarea>
					<div class=question_mark data-tooltip="Назовите загружаемый файл."></div>
				</div>
			</div>
			<div id=additional_info>
				<div class=info_box_wrapper>
					<div>Автор:</div>
					<textarea id=input_author rows=1 style="resize: none;"></textarea>
					<div class=question_mark data-tooltip="Опциональное поле.&#10;&#10;Тот, кто создал данный материал. Для литературы - авторы книги."></div>
				</div>
				<div class=info_box_wrapper>
					<div>Год:</div>
					<select id=input_year>
					</select>
					<div class=question_mark data-tooltip="Опциональное поле.&#10;&#10;Год создания материала."></div>
				</div>
				<div class=info_box_wrapper>
					<div>Описание:</div>
					<textarea id=input_description rows=6 style="resize: none;" placeholder="Если хотите, опишите загружаемый файл..."></textarea>
				</div>
			</div>
			<div id=info_file_about></div>
			<div id=info_placeholder></div>
			<!--<div class=common_button id=add_file_button>Добавить файл</div>-->
			<div class=common_button id=publish_file_button <!--style="display:none;-->">Опубликовать файл</div>
			<div class=common_button id=quit_button>Выйти в главное меню</div>
		</div>
	</main>
</body>
</html>