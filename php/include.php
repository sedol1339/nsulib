<?php

	error_reporting(0);

	function error($message) {
		header('HTTP/1.1 400 Bad Request');
		header('Content-Type: text/html; charset=utf-8');
		echo $message;
		exit;
	}
	
	function custom_error($error_code, $message) {
		header('HTTP/1.1 400 ' . $error_code);
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
	
	function _mysql_connect() {
		
		include('.login_data');
		
		$mysqli = new mysqli($db_host, $db_user, $db_password, $db_schema);

		if ($mysqli->connect_errno)
			error("Не удалось подключиться к MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error);

		if (!$mysqli->set_charset("utf8"))
			error("Ошибка при загрузке набора символов utf8: " . $mysqli->error);
		
		return $mysqli;
	}

?>