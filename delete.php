<?php

//error_reporting(0);

include('answers.php');

if (empty($_POST)) error("Пустой запрос");

$id = $_POST["id"];
$action = $_POST["action"];

if (empty($action)) error("Действие (action) не указано");
if (empty($id) || !is_numeric($id) || $id <= 0) custom_error("ID_MISSED_OR_MALFORMED", "Некорректно указан id");

if ($action == "delete") {
	$deleted_val = "true";
} else if ($action == "restore") {
	$deleted_val = "false";
} else {
	error("Действие (action) неизвестно");
}

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

$sql = "UPDATE materials SET deleted=" . $deleted_val . " WHERE id=" . $mysqli->real_escape_string($id);

if (!$result = $mysqli->query($sql))
		error("MYSQL " . $mysqli->errno . ": " . $mysqli->error);
	
if ($mysqli->affected_rows == 0)
	custom_error("INVALID_ID", "Указанный id не существует или удален");

send_answer_and_exit("OK");

?>