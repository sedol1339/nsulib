<?php

	include($_SERVER['DOCUMENT_ROOT'] . '/php/include.php');

	if (empty($_POST)) error("Пустой запрос");

	$file = $_FILES['file'];
	$title = $_POST["title"];
	$f = $_POST["f"];
	$s = $_POST["s"];
	$t = $_POST["t"];
	$type = $_POST["type"];
	$author = $_POST["author"];
	$year = $_POST["year"];
	$description = $_POST["description"];
	$id = $_POST["id"];


	if (empty($id)) {
		//новый материал
		$edit = false;
		if (empty($file)) error("Не отправлен файл или id");
	} else {
		//существующий материал
		$edit = true;
		if (!is_numeric($id) || $id <= 0) custom_error("ID_MISSED_OR_MALFORMED", "Некорректно указан id");
	}

	//при редактировании вся информация отправляется заново

	if (empty($title)) error("Не заполнено обязательное поле: название");
	if (empty($f)) error("Не заполнено обязательное поле: факультет");
	if (empty($s)) error("Не заполнено обязательное поле: предмет");
	if (empty($t)) error("Не заполнено обязательное поле: преподаватель");
	if (empty($type)) error("Не заполнено обязательное поле: тип");

	if (strlen($title)>100 || strlen($title)<3)
		error("Длина поля \"название\" должна быть между 3 и 100 символами");

	if ($type != "LITERATURE" && $type != "STUDENT" && $type != "TEACHER")
		error("Тип материала указан неверно: " . $type);

	if (!empty($author) && strlen($author)>100)
		error("Длина поля \"автор\" должна быть не больше 100 символов");

	if (!empty($description) && strlen($description)>4000)
		error("Длина поля \"описание\" должна быть не больше 4000 символов");

	if (!empty($year) && (!is_numeric($year) || $year<1995 || $year>2018))
		error("Год указан неверно");

	$type .= ":UNKNOWN";

	$uploader = "1";

	$ip = "";

	if (!$edit) {
		include($_SERVER['DOCUMENT_ROOT'] . '/filetypes/process_file.php');
		
		switch ($file['error']) {
		case UPLOAD_ERR_OK:
			break;
		case UPLOAD_ERR_NO_FILE:
			error("Не отправлен файл");
		case UPLOAD_ERR_INI_SIZE:
			error("Размер файла превысил максимальное значение, указанное в php.ini");
		case UPLOAD_ERR_FORM_SIZE:
			error("Размер загружаемого файла превысил значение MAX_FILE_SIZE, указанное в HTML-форме");
		case UPLOAD_ERR_PARTIAL:
			error("Загрузка файла прервана");
		default:
			internal_error("Внутренняя ошибка сервера: " . $file['error']);
		}
		
		try {
			$file_params = validate_and_move_file($_FILES['file']['tmp_name']);
		} catch (Exception $e) {
			error($e->getMessage());
		}
	}

	//------------------------------
			
	$mysqli = _mysql_connect();

	//------------------------------

	$columns = array();
	$values = array();

	$columns[] = "title";
	$values[] = ("'" . $mysqli->real_escape_string($title) . "'");

	$columns[] = "faculty";
	$values[] = "'" . $mysqli->real_escape_string($f) . "'";

	$columns[] = "subject";
	$values[] = "'" . $mysqli->real_escape_string($s) . "'";

	$columns[] = "teacher";
	$values[] = "'" . $mysqli->real_escape_string($t) . "'";

	$columns[] = "type";
	$values[] = "'" . $mysqli->real_escape_string($type) . "'";

	$columns[] = "author";
	$values[] = "'" . $mysqli->real_escape_string($author) . "'";

	$columns[] = "year";
	$values[] = "'" . $mysqli->real_escape_string($year) . "'";

	$columns[] = "commentary";
	$values[] = "'" . $mysqli->real_escape_string($description) . "'";

	if (!$edit) {
		$columns[] = "uploader";
		$values[] = "'" . $mysqli->real_escape_string($uploader) . "'";
		
		$columns[] = "ip";
		$values[] = "'" . $mysqli->real_escape_string($ip) . "'";
		
		$columns[] = "file";
		$values[] = "'" . $mysqli->real_escape_string($file_params["name"]) . "'";

		$columns[] = "filesize";
		$values[] = "'" . $mysqli->real_escape_string($file_params["size"]) . "'";

		if (!empty($file_params["mime"])) {
			$columns[] = "mime";
			$values[] = "'" . $mysqli->real_escape_string($file_params["mime"]) . "'";
		}
	} else {
		$columns[] = "edited";
		$values[] = "NOW()";
	}

	if (!$edit) {
		$sql = "INSERT INTO materials (" . implode(", ", $columns) . ") VALUES (" . implode(", ", $values) . ")";

		if (!$result = $mysqli->query($sql)) {
			unlink($file_params["path"]);
			error("MYSQL " . $mysqli->errno . ": " . $mysqli->error); exit;
		}

		$new_id = $mysqli->insert_id;

		if ($new_id == 0) {
			unlink($file_params["path"]);
			internal_error("MYSQL: insert_id is 0");
		}

		var_dump($file_params); //debug
		send_answer_and_exit($new_id);
	} else {
		$pairs = array();
		foreach ($columns as $i => $column) {
			$pairs[] = $column . "=" . $values[$i];
		}
		
		$sql = "UPDATE materials SET " . implode(", ", $pairs) . " WHERE id=" . $mysqli->real_escape_string($id) . " AND deleted=false";
		
		if (!$result = $mysqli->query($sql))
			error("MYSQL " . $mysqli->errno . ": " . $mysqli->error);
		
		if ($mysqli->affected_rows == 0)
			custom_error("INVALID_ID", "Указанный id не существует или удален");
		
		send_answer_and_exit(0);
	}

?>