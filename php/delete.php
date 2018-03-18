<?php

	include($_SERVER['DOCUMENT_ROOT'] . '/php/include.php');

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
		
	$mysqli = _mysql_connect();

	//------------------------------

	$sql = "UPDATE materials SET deleted=" . $deleted_val . " WHERE id=" . $mysqli->real_escape_string($id);

	if (!$result = $mysqli->query($sql))
			error("MYSQL " . $mysqli->errno . ": " . $mysqli->error);
		
	if ($mysqli->affected_rows == 0)
		custom_error("INVALID_ID", "Указанный id не существует или удален");

	send_answer_and_exit("OK");

?>