<!doctype html>
<html>
<head>
	<meta charset=utf-8>
	<title>NSU Online Library</title>
	<meta name="description" content="" />
	<meta name="Keywords" content="" />
	<link rel="shortcut icon" href="/images/favicon.ico" />
	<link rel="stylesheet" href="common.css" media="all" />
	<link rel="stylesheet" href="header.css" media="all" />
	<link rel="stylesheet" href="index.css" media="all" />
	<!--<link rel="stylesheet" href="/filetypes/preview-text/styles/default.css" media="all" />-->
	<script src="/js/jquery-3.3.1.min.js" defer></script>
	<script src="/filetypes/preview-pdf/pdfobject.min.js" defer></script>
	<script src="/filetypes/preview_file.js" defer></script>
	<!--<script src="/filetypes/preview-text/highlight.pack.js" async></script>-->
	<script src="/js/utils.js" defer></script>
	<script src="index.js" defer></script>
	<script>
		var initial_f = 0, initial_s = 0, initial_t = 0, initial_res = 0; //производительность? файл не кэшируется в браузере
		<?php
			if (isset($_GET['f']) && is_numeric($_GET['f'])) { $f = (int) $_GET['f']; echo "initial_f = $f;"; }
			if (isset($_GET['s']) && is_numeric($_GET['s'])) { $s = (int) $_GET['s']; echo "initial_s = $s;"; }
			if (isset($_GET['t']) && is_numeric($_GET['t'])) { $t = (int) $_GET['t']; echo "initial_t = $t;"; }
			if (isset($_GET['res']) && is_numeric($_GET['res'])) { $res = (int) $_GET['res']; echo "initial_res = $res;"; }
		?>
	</script>
</head>
<body>
	<div id=dummy style="display:none;z-index:1;position:absolute;width:100%;height:100%;"></div>
	<?php include 'header.php'; ?>
	<main>
		<aside id=aside1>
			<div id=aside1_search_box>
				<div class=horizontal_wrapper>
					<div id=button_faculty class="aside1_search_box_button common_button">
						<p class=aside1_search_box_button_text>Загрузка...</p>
					</div>
					<img id=clear_faculty class=erase_image></img>
					<div id=list_faculties class=search_box_list>
						<div class=search_box_list_element style="display:none;">
							<p class=search_box_list_element_text>Загрузка...</p>
						</div>
					</div>
				</div>
				<div class=horizontal_wrapper>
					<div id=button_subject class="aside1_search_box_button common_button">
						<p class=aside1_search_box_button_text>Загрузка...</p>
					</div>
					<img id=clear_subject class=erase_image></img>
					<div id=list_subjects class=search_box_list>
						<div class=search_box_list_element style="display:none;">
							<p class=search_box_list_element_text>Загрузка...</p>
						</div>
					</div>
				</div>
				<div class=horizontal_wrapper>
					<div id=button_teacher class="aside1_search_box_button common_button">
						<p class=aside1_search_box_button_text><img class=teacher_image></img>Загрузка...</p>
					</div>
					<img id=clear_teacher class=erase_image></img>
					<div id=list_teachers class=search_box_list>
						<div class=search_box_list_element style="display:none;">
							<p class=search_box_list_element_text>Загрузка...</p>
						</div>
					</div>
				</div>
			</div>
			<div id=aside1_results_box>
				<div class="result result_noliterature" id=dummyNoliterature style="display:none;">
					<img></img>
					<p class=result_noliterature_text>DummyNoliterature</p>
				</div>
				<div id=result_literature_header style="display:none;">
					<p class=result_literature_header_text>Литература</p>
				</div>
				<div class="result result_literature" id=dummyLiterature style="display:none;">
					<p class=result_literature_text>DummyLiterature</p>
				</div>
				<div id=result_infobox>
					<p class=result_infobox_text>Загрузка...</p>
				</div>
			</div>
			<div id=aside1_footer>
				<a href="/upload.php">
					<div class="aside1_footer_button common_button">
						<p class=aside1_footer_button_text>Добавить материалы</p>
					</div>
				</a>
			</div>
		</aside>
		<article>
			<div id=article_frame>
				<div id=article_frame_placeholder style='dislay:none'>
					<span>Выберите материал для отображения</span>
				</div>
				<div id=article_frame_preview></div>
			</div>
			<iframe id=download_frame src="about:blank" style="display:none;"></iframe>
		</article>
		<aside id=aside2>
			<div id=aside2_stub>
				Материал не выбран
			</div>
			<div id=aside2_info_box style="display:none;">
				<p id=aside2_info_box_text>
					<strong>Название:</strong> <span id=title_span></span><br/>
					<strong>Автор:</strong> <span id=author_span></span><br/>
					<strong>Описание:</strong> <span id=description_span></span><br/>
					<strong>Дата загрузки:</strong> <span id=date_span></span><br/>
				</p>
				<div id=aside2_info_box_buttons>
					<div class="aside2_info_box_button common_button">
						<p id=button_download class=aside2_info_box_button_text>Скачать</p>
					</div>
					<!--<div class="aside2_info_box_button common_button">
						<p class=aside2_info_box_button_text>Изменить</p>
					</div>-->
				</div>
			</div>
		</aside>
	</main>
</body>
</html>