<?php
	
	//get.php?action=materials?s=9&t=325
	//get.php?action=list&target=t&s=32
	
	//Определение действия, подготовка соединения с БД
	
	error_reporting(0);
	
	if (!isset($_GET['action'])) {
		echo "Action not specified"; exit;
	} else {
		$action = $_GET['action'];
	}
	
	$mysqli = new mysqli("vh216217.eurodir.ru:3306", "vh216217_user", "usbw", "vh216217_library");
	
	if ($mysqli->connect_errno) {
		echo "Не удалось подключиться к MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error; exit;
	}
	
	if (!$mysqli->set_charset("utf8")) {
		echo "Ошибка при загрузке набора символов utf8: " . $mysqli->error; exit;
	}
	
	//Действия
	
	if ($action == "materials") { //Получить список материалов по факультету, преподавателю, предмету
		
		if (isset($_GET['f']) && is_numeric($_GET['f'])) { $f = (int) $_GET['f']; } else { $f = 0; }
		if (isset($_GET['s']) && is_numeric($_GET['s'])) { $s = (int) $_GET['s']; } else { $s = 0; }
		if (isset($_GET['t']) && is_numeric($_GET['t'])) { $t = (int) $_GET['t']; } else { $t = 0; }
		
		$results = array();
		
		$sql = "SELECT id, faculty, subject, teacher, type, title, author, uploaded, file FROM materials WHERE true";
		if ($f != 0) { $sql .= " AND faculty = $f"; }
		if ($s != 0) { $sql .= " AND subject = $s"; }
		if ($t != 0) { $sql .= " AND teacher = $t"; }
		
		if (!$result = $mysqli->query($sql)) {
			echo "Запрос $sql не удался: (" . $mysqli->errno . ") " . $mysqli->error; exit;
		} else {
			while ($row = $result->fetch_assoc()) {
				/*$a = array();
				$a["id"] = $row["id"];
				$a["faculty"] = $row["faculty"];
				$a["subject"] = $row["subject"];
				$a["teacher"] = $row["teacher"];
				$a["type"] = $row["type"];
				$a["name"] = $row["title"];
				$a["author"] = $row["author"];
				$a["date"] = $row["uploaded"];
				array_push($results, $a);*/
				$a = array();
				$a["faculty"] = $row["faculty"];
				$a["subject"] = $row["subject"];
				$a["teacher"] = $row["teacher"];
				$a["type"] = $row["type"];
				$a["name"] = $row["title"];
				$a["author"] = $row["author"];
				$a["date"] = $row["uploaded"];
				$a["file"] = $row["file"];
				$results[$row["id"]] = $a;
			}
		}
		
		echo json_encode($results, JSON_UNESCAPED_UNICODE);
		
		exit;
		
	} else if ($action == "list") { //Получить списки (факультетов, преподавателей, предметов)
		
		if (isset($_GET['target'])) { 
			$target = $_GET['target']; }
		else {
			echo "Target is undefined"; exit;
		}
		
		if (isset($_GET['f']) && is_numeric($_GET['f'])) { $f = (int) $_GET['f']; } else { $f = 0; }
		if (isset($_GET['s']) && is_numeric($_GET['s'])) { $s = (int) $_GET['s']; } else { $s = 0; }
		if (isset($_GET['t']) && is_numeric($_GET['t'])) { $t = (int) $_GET['t']; } else { $t = 0; }
		
		$list = array();
		
		if ($target == 'f') { //вернуть список факультетов
			
			$sql = "SELECT DISTINCT faculties.id, faculties.title FROM faculties, materials WHERE faculties.id = materials.faculty ";
			if ($s != 0) { $sql .= " AND materials.subject = $s"; }
			if ($t != 0) { $sql .= " AND materials.teacher = $t"; }
		
			if (!$result = $mysqli->query($sql)) {
				echo "Запрос $sql не удался: (" . $mysqli->errno . ") " . $mysqli->error; exit;
			} else {
				while ($row = $result->fetch_assoc()) {
					$list[$row["id"]] = $row["title"];
				}
			}
			
		} else if ($target == 's') { //вернуть список предметов
			
			$sql = "SELECT DISTINCT subjects.id, subjects.title FROM subjects, materials WHERE subjects.id = materials.subject ";
			if ($f != 0) { $sql .= " AND materials.faculty = $f"; }
			if ($t != 0) { $sql .= " AND materials.teacher = $t"; }
		
			if (!$result = $mysqli->query($sql)) {
				echo "Запрос $sql не удался: (" . $mysqli->errno . ") " . $mysqli->error; exit;
			} else {
				while ($row = $result->fetch_assoc()) {
					$list[$row["id"]] = $row["title"];
				}
			}
			
		} else if ($target == 't') { //вернуть список преподавателей
			
			$sql = "SELECT DISTINCT teachers.id, teachers.name FROM teachers, materials WHERE teachers.id = materials.teacher ";
			if ($f != 0) { $sql .= " AND materials.faculty = $f"; }
			if ($s != 0) { $sql .= " AND materials.subject = $s"; }
		
			if (!$result = $mysqli->query($sql)) {
				echo "Запрос $sql не удался: (" . $mysqli->errno . ") " . $mysqli->error; exit;
			} else {
				while ($row = $result->fetch_assoc()) {
					$list[$row["id"]] = $row["name"];
				}
			}
			
		}
		
		echo json_encode($list, JSON_UNESCAPED_UNICODE);
		
		exit;
		
	}

?>