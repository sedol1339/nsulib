<?php
	
	//http://localhost:8081/download.php?id=23178&plaintext
	//http://localhost:8081/download.php?id=23450&octet-stream
	//http://localhost:8081/download.php?id=23450
	
	// TODO http://localhost:8081/download.php?id=25197 пишет ошибки
	
	include('answers.php');
	
	if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
		custom_error("ID_MISSED_OR_MALFORMED", "Id not specified or not valid");
	} else {
		$id = $_GET['id'];
	}
	
	///////////////////////////////////////
	
	include('.login_data');
	
	$mysqli = new mysqli($db_host, $db_user, $db_password, $db_schema);
	
	if ($mysqli->connect_errno) {
		echo "Не удалось подключиться к MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error; exit;
	}
	
	if (!$mysqli->set_charset("utf8")) {
		echo "Ошибка при загрузке набора символов utf8: " . $mysqli->error; exit;
	}
	
	///////////////////////////////////////
	
	$sql = "SELECT title, file, mime FROM materials WHERE id=" . $id . " AND deleted=false";
	
	if (!$result = $mysqli->query($sql)) {
		echo "Запрос $sql не удался: (" . $mysqli->errno . ") " . $mysqli->error; exit;
	}
	
	if ($result->num_rows == 0) {
		custom_error("INVALID_ID", "Указанный id не существует или удален");
	}
	
	$row = $result->fetch_assoc();
	$title = $row["title"];
	
	$file = "files/" . $row["file"];
	if ($row["file"] == "" || !file_exists($file) || is_dir($file)) {
		custom_error("FILE_NOT_EXISTS", "Файл не существует");
	}
	
	$mime = $row["mime"];
	
	include('file-utils/encodings/detect_encoding.php');
	if (isset($_GET['plaintext'])) {
		$charset = detect_encoding($file);
		//echo $charset; exit;
		$mime = "text/plain; charset=" . $charset;
	}
	
	if (isset($_GET['octet-stream'])) {
		$mime = "application/octet-stream";
		header('Content-Disposition: attachment; filename=' . $title);
	}
	
	//echo $mime; exit;
	
	header('Content-Type: ' . $mime);
	
	//header('Expires: 0');
	//header('Cache-Control: must-revalidate');
	//header('Pragma: public');
	
	header('Content-Length: ' . filesize($file));
	header('X-Content-Type-Options: nosniff');  // иначе text/plain скачивается
	ob_clean();
	flush();
	readfile($file);

?>