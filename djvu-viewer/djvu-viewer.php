<!doctype html>
<html>
<head>
	<meta charset=utf-8>
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
	<title>DJVU viewer</title>
	<link type="text/css" rel="stylesheet" href="Djvu_html5.css">
	<script src="djvu_html5/djvu_html5.nocache.js"></script>
	<script>
		/*var img_src = "<?php
			//if (isset($_GET['src'])) {echo $_GET['src'];} else {echo "null";}
		?>";
		document.addEventListener("DOMContentLoaded", function() {
			//document.body.style.display = "";
			document.addEventListener("DOMContentLoaded", function() {
				var img = document.createElement('img');
				img.src = img_src;
				document.body.appendChild(img);
			});
			var map = L.map('map').setView([0, 0], 0);
			L.tileLayer(img_src, {
				attribution: '',
				maxZoom: 5,
			}).addTo(map);
		});*/
	</script>
</head>
<body>
	<div id="djvuContainer" file="<?php if (isset($_GET['src'])) {echo $_GET['src'];} else {echo "null";} ?>"></div>
	<script type="text/javascript">
		var DJVU_CONTEXT = {
				background: "#666",
				uiHideDelay: 1500,
		};
	</script>
</body>