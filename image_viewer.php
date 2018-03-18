<!doctype html>
<html>
<head>
	<meta charset=utf-8>
	<title>Image viewer</title>
</head>
<body>
	<img src="<?php if (isset($_GET['src'])) {echo $_GET['src'];} else {echo "null";} ?>" style="max-width:100%; box-shadow: 0 0 10px rgba(0,0,0,0.35);"></img>
</body>