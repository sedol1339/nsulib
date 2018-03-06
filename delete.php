<?php

//error_reporting(0);

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

if (empty($_POST)) error("Пустой запрос");

$id = $_POST["id"];
$action = $_POST["action"];

if (empty($action)) error ("action not specified");
if (empty($id)) error ("id not specified");
if (!is_numeric($id) || $id <= 0) error("Некорректно указан id");

if ($action == "delete") {
	$deleted_val = "true";
} else if ($action == "restore") {
	$deleted_val = "false";
} else {
	error ("unknown action");
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
	error("Указанный id не существует");

send_answer_and_exit("OK");

?>