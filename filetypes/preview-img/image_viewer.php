<!doctype html>
<html>
<head>
	<meta charset=utf-8>
	<title>Image viewer</title>
	<script src="/jquery-3.3.1.min.js"></script>
	<script>
		$(document).ready(function() {
			var width_default = window.innerWidth - 33;
			$('#image').css('width', width_default + 'px');
			var scale_tick = 0;
			var rotate = 0;
			$('#rotate_left').click(function() {
				rotate -= 90;
				$('#image').css('transform', 'rotate(' + rotate + 'deg)');
			});
			$('#rotate_right').click(function() {
				rotate += 90;
				$('#image').css('transform', 'rotate(' + rotate + 'deg)');
			});
			$(window).bind('mousewheel', function(event) {
				//Слава Аллаху, что этот код заработал!
				var getWidth = function() {
					return parseInt($('#image').css('width'), 10);
				};
				var getHeight = function() {
					return parseInt($('#image').css('height'), 10);
				};
				var change = event.originalEvent.wheelDeltaY; //+-120
				if (!change) return false;
				scale_tick += 3 * change / 120;
				if (scale_tick > 36) {
					scale_tick = 36;
					return false;
				}
				if (scale_tick < -18){
					scale_tick = -18;
					return false;
				}
				var scale = 1.0;
				if (scale_tick > 0) {
					for (var i = 0; i < scale_tick; i++) scale *= 1.1;
				} else if (scale_tick < 0) {
					for (var i = 0; i < -scale_tick; i++) scale /= 1.1;
				}
				//console.log(event.originalEvent);
				var percent_x = event.originalEvent.offsetX / getWidth();
				var percent_y = event.originalEvent.offsetY / getHeight();
				$('#image').css('width', Math.round(width_default * scale) + 'px');
				if (scale_tick > 0) {
					var screen_x = event.originalEvent.clientX;
					var screen_y = event.originalEvent.clientY;
					var new_offset_x = 8 + Math.round(getWidth() * percent_x) - screen_x;
					var new_offset_y = 8 + Math.round(getHeight() * percent_y) - screen_y;
					console.log(percent_y + " " + getHeight() + " " + screen_y + " " + new_offset_y);
					$(window).scrollLeft(new_offset_x);
					$(window).scrollTop(new_offset_y);
				}
				return false;
			});
		});
	</script>
	<style>
		body {
			margin: 0px;
		}
		#image {
			box-shadow: 0 0 10px rgba(0,0,0,0.35);
			user-select: none;
			height: auto;
			margin: 8px;
		}
		.body_zoom_out
		.arrow {
			width:30px;
			height:30px;
			background-size:100%;
			position:fixed;
			opacity: 0.2;
		}
		.arrow:hover {
			transform: scale(1.1, 1.1);
		}
		.arrow_left {
			background-image:url('/images/rotate_left.png');
			top:15px;
			right:50px;
		}
		.arrow_right {
			background-image:url('/images/rotate_right.png');
			top:15px;
			right:15px;
		}
	</style>
</head>
<body>
	<img id=image src="<?php if (isset($_GET['src'])) {echo $_GET['src'];} else {echo "null";} ?>"></img>
	<div id=rotate_left class="arrow arrow_left"></div>
	<div id=rotate_right class="arrow arrow_right"></div>
</body>