<?php

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

?>