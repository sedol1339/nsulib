<?php

	//server-side file validation

	function validate_and_move_file($file_tmp_name) {
		if (filesize($file_tmp_name) > 500 * 1024 * 1024) {
			throw new Exception("Файл должен быть не больше 500 Мб");
		}
		$filename = strtoupper(md5_file($file_tmp_name));
		$path = "files/" . $filename;
		if (!file_exists($path) && !move_uploaded_file($file_tmp_name, $path)) {
			throw new Exception("Внутренняя ошибка сервера: move_uploaded_file");
		}
		$file_params = array(
			"name" => $filename,
			"size" => filesize($path),
			"path" => $path,
			"mime" => recognize_mime_type($path),
		);
		return $file_params;
	}
	
	function recognize_mime_type($file) {
		$result = new finfo();
		return $result->file($file, FILEINFO_MIME_TYPE);
	}

?>