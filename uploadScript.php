<?php

error_reporting(0);

function error($message) {
	header('HTTP/1.1 400 Bad Request');
	header('Content-Type: text/html; charset=utf-8');
	echo $message;
	exit;
}

function internal_error($message) {
	header('HTTP/1.1 500 Internal Server Error');
	header('Content-Type: text/html; charset=utf-8');
	echo $message;
	exit;
}

function send_answer_and_exit($message) {
	header('HTTP/1.1 200 OK');
	header('Content-Type: text/html; charset=utf-8');
	echo $message;
	exit;
}

//send_answer_and_exit("9876");

function random_str($length = 24) {
    $characters = '0123456789ABCDEF';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, $charactersLength - 1)];
		if ($i > 0 && $i % 6 == 0)
			$randomString .= "-";
    }
    return $randomString;
}

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

if (empty($file)) error("Не отправлен файл");
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

if ($file['size'] > 524288000)
	error("Файл должен быть не больше 500 Мб");

switch ($file['error']) {
	case UPLOAD_ERR_OK:
		break;
	case UPLOAD_ERR_NO_FILE:
		error("Не отправлен файл");
	case UPLOAD_ERR_INI_SIZE:
		error("Файл должен быть не больше 500 Мб");
	case UPLOAD_ERR_FORM_SIZE:
		error("Размер загружаемого файла превысил значение MAX_FILE_SIZE, указанное в HTML-форме");
	case UPLOAD_ERR_PARTIAL:
		error("Загрузка файла прервана");
	default:
		internal_error("Внутренняя ошибка сервера: " . $file['error']);
}

$type .= ":UNKNOWN";

$uploader = "1";

$ip = "";

$filesize = $file['size'];

$filename = random_str();
$path = dirname(__FILE__) . "/files/" . $filename;
if (!move_uploaded_file($_FILES['file']['tmp_name'], $path))
	internal_error("Внутренняя ошибка сервера: move_uploaded_file");

//------------------------------

include('.login_data');
	
$mysqli = new mysqli($db_host, $db_user, $db_password, $db_schema);

if ($mysqli->connect_errno) {
	echo "Не удалось подключиться к MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error; exit;
}

if (!$mysqli->set_charset("utf8")) {
	echo "Ошибка при загрузке набора символов utf8: " . $mysqli->error; exit;
}

//------------------------------

$columns = "title";
$values = "'" . $mysqli->real_escape_string($title) . "'";

$columns .= ", " . "faculty";
$values .= ", " . "'" . $mysqli->real_escape_string($f) . "'";

$columns .= ", " . "subject";
$values .= ", " . "'" . $mysqli->real_escape_string($s) . "'";

$columns .= ", " . "teacher";
$values .= ", " . "'" . $mysqli->real_escape_string($t) . "'";

$columns .= ", " . "type";
$values .= ", " . "'" . $mysqli->real_escape_string($type) . "'";

$columns .= ", " . "author";
$values .= ", " . "'" . $mysqli->real_escape_string($author) . "'";

$columns .= ", " . "year";
$values .= ", " . "'" . $mysqli->real_escape_string($year) . "'";

$columns .= ", " . "commentary";
$values .= ", " . "'" . $mysqli->real_escape_string($description) . "'";

$columns .= ", " . "uploader";
$values .= ", " . "'" . $mysqli->real_escape_string($uploader) . "'";

$columns .= ", " . "ip";
$values .= ", " . "'" . $mysqli->real_escape_string($ip) . "'";

$columns .= ", " . "file";
$values .= ", " . "'" . $mysqli->real_escape_string($filename) . "'";

$columns .= ", " . "filesize";
$values .= ", " . "'" . $mysqli->real_escape_string($filesize) . "'";

$sql = "INSERT INTO materials (" . $columns . ") VALUES (" . $values . ")";

if (!$result = $mysqli->query($sql))
	error("MYSQL " . $mysqli->errno . ": " . $mysqli->error);

$new_id = $mysqli->insert_id;

if ($new_id == 0)
	error("MYSQL: insert_id is 0");

send_answer_and_exit($new_id);

?>