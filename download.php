<?php
	
	//download.php?file=0C10C51-F44C98-DAB86D-E7039
	
	if (!isset($_GET['file'])) {
		echo "File not specified"; exit;
	} else {
		$file = "files/" . $_GET['file'];
	}
	
	if (!isset($_GET['filename'])) {
		$filename = basename($file);
	} else {
		$filename = $_GET['filename'];
	}
	
	// dirname(__FILE__)
	
	if (file_exists($file)) {
		header('Content-Type: application/octet-stream');
		header('Content-Disposition: attachment; filename=' . $filename);
		header('Expires: 0');
		header('Cache-Control: must-revalidate');
		header('Pragma: public');
		header('Content-Length: ' . filesize($file));
		ob_clean();
		flush();
		readfile($file);
	} else {
		echo "Requested file does not exist";
	}

?>