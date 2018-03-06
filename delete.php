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

send_answer_and_exit("OK");

?>