<?php

//error_reporting(0);

include($_SERVER['DOCUMENT_ROOT'] . '/php/.login_data');
include($_SERVER['DOCUMENT_ROOT'] . '/php/include.php');

if (empty($_GET["pass"]))
	exit;

$pass = $_GET["pass"];

if ($pass != $rel_pass)
	exit;
	
$mysqli = new mysqli($db_host, $db_user, $db_password, $db_schema);

if ($mysqli->connect_errno) {
	echo "Не удалось подключиться к MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error; exit;
}

if (!$mysqli->set_charset("utf8")) {
	echo "Ошибка при загрузке набора символов utf8: " . $mysqli->error; exit;
}

//relations

$relations = array();
		
$sql = "SELECT faculty, subject, teacher FROM relations";

if (!$result = $mysqli->query($sql)) {
	echo "Запрос $sql не удался: (" . $mysqli->errno . ") " . $mysqli->error;
	exit;
}

while ($row = $result->fetch_assoc()) {
	$a = array();
	array_push($a, intval($row["faculty"]), intval($row["subject"]), intval($row["teacher"]));
	array_push($relations, $a);
}

//faculties

$faculties = array();
		
$sql = "SELECT id, title, short_title FROM faculties";

if (!$result = $mysqli->query($sql)) {
	echo "Запрос $sql не удался: (" . $mysqli->errno . ") " . $mysqli->error;
	exit;
}

while ($row = $result->fetch_assoc()) {
	$a = array();
	array_push($a, $row["title"], $row["short_title"]);
	$faculties[$row["id"]] = $a;
}

//subjects

$subjects = array();
		
$sql = "SELECT id, title, short_title FROM subjects";

if (!$result = $mysqli->query($sql)) {
	echo "Запрос $sql не удался: (" . $mysqli->errno . ") " . $mysqli->error;
	exit;
}

while ($row = $result->fetch_assoc()) {
	$a = array();
	array_push($a, $row["title"], $row["short_title"]);
	$subjects[$row["id"]] = $a;
}

//teachers

$teachers = array();
		
$sql = "SELECT id, name, short_name FROM teachers";

if (!$result = $mysqli->query($sql)) {
	echo "Запрос $sql не удался: (" . $mysqli->errno . ") " . $mysqli->error;
	exit;
}

while ($row = $result->fetch_assoc()) {
	$a = array();
	array_push($a, $row["name"], $row["short_name"]);
	$teachers[$row["id"]] = $a;
}

//finishing

$all = array();
$all["faculties"] = $faculties;
$all["subjects"] = $subjects;
$all["teachers"] = $teachers;
$all["relations"] = $relations;

$all_str = json_encode($all, JSON_UNESCAPED_UNICODE);

file_put_contents("init.json", $all_str);

header("Content-Type: text/plain");
echo "Success\n\n";
echo $all_str;

exit;

?>