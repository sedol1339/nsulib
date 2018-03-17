<!doctype html>
<html>
<head>
	<meta charset=utf-8>
	<title>Image viewer</title>
	<link rel="stylesheet" href="/leaflet/leaflet.css"/>
	<script src="/leaflet/leaflet.js"></script>
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
	<img src="<?php if (isset($_GET['src'])) {echo $_GET['src'];} else {echo "null";} ?>" style="max-width:100%; box-shadow: 0 0 10px rgba(0,0,0,0.35);"></img>
</body>