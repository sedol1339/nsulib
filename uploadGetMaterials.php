<?php

	/*{
		"3231": { "title": "Lektsii_T-2_V_Bondar_1972.djvu", "uploader": "Oleg S", "uploaded": "22.03.2017 5:53PM" },
		"4351": { "title": "Госэкзамен (2010).pdf", "uploader": "Oleg S", "uploaded": "20.03.2017 11:42PM" },
		"5661": { "title": "ВЫЧМЕТ. V семестр,  лекции, 2007.pdf", "uploader": "Oleg S", "uploaded": "20.03.2017 9:27PM" },
		"4389": { "title": "ВЫЧМЕТ. V семестр, вопросы на экзамен", "uploader": "Oleg S", "uploaded": "20.03.2017 9:27PM" },
		"5869": { "title": "ВЫЧМЕТ. V семестр, задачи на экзамен", "uploader": "Oleg S", "uploaded": "20.03.2017 9:27PM" },
		"3654": { "title": "Колмогоров А. Н. Драгалин А. Г. - Введение в математическую логику", "uploader": "Oleg S", "uploaded": "20.03.2017 9:27PM" }
	}*/

	error_reporting(0);
	
	include('.login_data');
	
	$mysqli = new mysqli($db_host, $db_user, $db_password, $db_schema);
	
	if ($mysqli->connect_errno) {
		echo "Не удалось подключиться к MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error; exit;
	}
	
	if (!$mysqli->set_charset("utf8")) {
		echo "Ошибка при загрузке набора символов utf8: " . $mysqli->error; exit;
	}
	
	if (isset($_GET['f']) && is_numeric($_GET['f'])) { $f = (int) $_GET['f']; } else { $f = 0; }
	if (isset($_GET['s']) && is_numeric($_GET['s'])) { $s = (int) $_GET['s']; } else { $s = 0; }
	if (isset($_GET['t']) && is_numeric($_GET['t'])) { $t = (int) $_GET['t']; } else { $t = 0; }
	$uploaded = $_GET['uploaded'];
	if($uploaded != 'TODAY' && $uploaded != 'THIS_WEEK' && $uploaded != 'ALL_TIME') {
		$uploaded = 'ALL_TIME';
	}
	
	$results = array();
		
	$sql = "SELECT materials.id AS id, faculty, subject, teacher, type, title, uploaded, materials.uploader AS uploader_id, accounts.name AS uploader FROM materials, accounts WHERE materials.uploader=accounts.id";
	if ($f != 0) { $sql .= " AND faculty = $f"; }
	if ($s != 0) { $sql .= " AND subject = $s"; }
	if ($t != 0) { $sql .= " AND teacher = $t"; }
	
	if ($uploaded == 'TODAY') { $sql .= " AND uploaded >= DATE_SUB(CURDATE(), INTERVAL 1 DAY)"; }
	else if ($uploaded == 'THIS WEEK') { $sql .= " AND uploaded >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)"; }
	
	if (!$result = $mysqli->query($sql)) {
		echo "Запрос $sql не удался: (" . $mysqli->errno . ") " . $mysqli->error; exit;
	} else {
		while ($row = $result->fetch_assoc()) {
			$a = array();
			$a["faculty"] = $row["faculty"];
			$a["subject"] = $row["subject"];
			$a["teacher"] = $row["teacher"];
			$a["type"] = $row["type"];
			$a["title"] = $row["title"];
			$a["uploaded"] = $row["uploaded"];
			$a["uploader_id"] = $row["uploader_id"];
			$a["uploader"] = $row["uploader"];
			$results[$row["id"]] = $a;
		}
	}
	
	echo json_encode($results, JSON_UNESCAPED_UNICODE);
	
	exit;

?>