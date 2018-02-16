<?php

$uploaddir = '';
$uploadfile = $uploaddir . basename($_FILES['file']['name']);

/*echo $_FILES['file']['name'] . ' ';
echo $_FILES['file']['tmp_name'] . ' ';
echo $_FILES['file']['type'] . ' ';
echo $_FILES['file']['size'] . ' ';
echo $_FILES['file']['error'] . ' ';*/

if (move_uploaded_file($_FILES['file']['tmp_name'], $uploadfile)) {
    echo "Файл корректен и был успешно загружен.\n";
} else {
    echo "Возможная атака с помощью файловой загрузки!\n";
}

?>