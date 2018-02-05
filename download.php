<?php
	
	//"file:///storage/0ab9ce9f-ab71-4bea-898e-a7928eb0c8e6"
	//download.php?file=0ab9ce9f-ab71-4bea-898e-a7928eb0c8e6
	
	if (!isset($_GET['file'])) {
		echo "File not specified"; exit;
	} else {
		$file = $_GET['file'];
	}
	
	if (!isset($_GET['filename'])) {
		$filename = "File";
	} else {
		$filename = $_GET['filename'];
	}
	
	$filename = "files/test_pdf.pdf";
	if (file_exists($filename)) {
		header('Content-Type: application/octet-stream');
		header('Content-Disposition: attachment; filename='.basename($filename));
		header('Expires: 0');
		header('Cache-Control: must-revalidate');
		header('Pragma: public');
		header('Content-Length: ' . filesize($filename));
		ob_clean();
		flush();
		readfile($filename);
	} else {
		echo "Requested file does not exist";
	}

?>