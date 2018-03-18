function recognize_mime(entry) {
	if (entry.link) return "LINK";
	if (!entry.mime) return "UNKNOWN";
	if (entry.mime == "application/pdf") return "PDF";
	if (
		entry.mime.startsWith("application/vnd.")
		|| entry.mime.startsWith("application/ms")
	) return "MS-OFFICE";
	if (
		entry.mime == "image/gif"
		|| entry.mime == "image/jpeg"
		|| entry.mime == "image/pjpeg"
		|| entry.mime == "image/png"
		|| entry.mime == "image/tiff"
		|| entry.mime == "image/webp"
		|| entry.mime == "image/vnd.microsoft.icon"
		|| entry.mime == "image/x-icon"
	) return "IMAGE";
	if (entry.mime == "image/vnd.djvu") return "DJVU";
	if (entry.mime.startsWith("text/")) return "TEXT";
	if (
		entry.mime == "application/zip"
		|| entry.mime == "application/gzip"
		|| entry.mime == "application/x-rar-compressed"
		|| entry.mime == "application/x-tar"
		|| entry.mime == "application/x-bzip2"
		|| entry.mime == "application/x-7z-compressed"
		|| entry.mime == "application/vnd.android.package-archive"
		|| entry.mime == "application/x-gtar"
	) return "ARCHIVE";
	if (
		entry.mime == "application/x-msdownload"
		|| entry.mime == "application/x-msdos-program"
		|| entry.mime == "application/x-ms-installer"
		|| entry.mime == "application/x-elf"
	) return "EXECUTABLE";
	return "UNKNOWN";
}

function preview_is_accessible(entry) {
	var type = recognize_mime(entry);
	if (type == "LINK") {
		console.error("Warning: calling \"preview_is_accessible()\" for LINK type!");
		return false;
	}
	if (type == "PDF") return true;
	if (type == "MS-OFFICE") return true;
	if (type == "IMAGE") return true;
	if (type == "DJVU") return true;
	if (type == "ARCHIVE") return false;
	if (type == "EXECUTABLE") return false;
	
	//text, djvu, unknown
	if (entry.filesize < 1 * 1024 * 1024) {
		return true;
	} else {
		return false;
	}
}

function load_preview(frame_preview, frame_error, id, entry) {
	
	var warning_sign_str = "<img src='/img/warning.png' style='display:inline-block;height:1.5em;margin-right:0.5em;margin-bottom:0.35em;vertical-align:middle;'></img>";
	
	var loading_img_show = function() {
		frame_preview.css("background", "url(../img/loading.gif) center center no-repeat");
	};
	var loading_img_hide = function() {
		frame_preview.css("background", "");
	};
	
	var type = recognize_mime(entry);
	
	if (type == "PDF") {
		if (PDFObject.supportsPDFs) {
			frame_preview.show();
			loading_img_show();
			PDFObject.embed("/download.php?id=" + id, frame_preview[0]);
			var embed = frame_preview.children("embed").first();
			if (embed.length) { //exists
				loading_img_show();
				embed.on("load", loading_img_hide);
			}
		} else {
			frame_error
			.empty()
			.append(
				$('<span>').
				html(warning_sign_str + "Ваш браузер не позволяет отображать PDF-файлы").
				css("font-size", "10pt")
			)
			.show();
		}
	} else if (type == "DJVU") {
		frame_preview.show();
		loading_img_show();
		frame_preview.append(
			$('<iframe>')
			.prop('id', 'content_iframe')
			.prop('frameBorder', '0')
			.prop('src', "/djvu-viewer/djvu-viewer.php?src=" + encodeURIComponent("/download.php?id=" + id))
			.css('width', '100%')
			.css('height', '100%')
			.on("load", loading_img_hide)
		);
	} else if (type == "MS-OFFICE") {
		frame_preview.show();
		loading_img_show();
		frame_preview.append(
			$('<iframe>')
			.prop('id', 'content_iframe')
			.prop('frameBorder', '0')
			.prop('src', "http://docs.google.com/gview?embedded=true&url=" + /*window.location.origin*/ encodeURIComponent("http://nsulib.ru" + "/download.php?id=" + id))
			.css('width', '100%')
			.css('height', '100%')
			.on("load", loading_img_hide)
			/*.on("error", display_error) НЕ РАБОТАЕТ. Due to cross domain restriction, there's no way to detect whether a page is successfully loaded or if the page can't be loaded due to client errors (HTTP 4xx errors) and server errors (HTTP 5xx errors). 
			https://stackoverflow.com/questions/12062081/catch-x-frame-options-error-in-javascript
			https://bugs.chromium.org/p/chromium/issues/detail?id=365457 */
		);
	} else if (type == "IMAGE") {
		frame_preview.show();
		loading_img_show();
		frame_preview.append(
			$('<iframe>')
			.prop('id', 'content_iframe')
			.prop('frameBorder', '0')
			.css('width', '100%')
			.css('height', '100%')
			.prop('src', "/image_viewer.php?src=/download.php?id=" + id)
			.on("load", loading_img_hide)
		);
	} else {
		if (type == "UNKNOWN") {
			frame_preview.append(
				$("<div>")
				.attr('id',  "article_frame_content_header")
				.text("Формат файла не распознан. Файл отображен как текстовый.")
			);
		}
		frame_preview.show();
		loading_img_show();
		frame_preview.append(
			$('<iframe>')
			.prop('id', 'content_iframe')
			.prop('frameBorder', '0')
			.prop('src', "/download.php?plaintext&id=" + id)
			.prop('type', 'text/plain')
			.css('width', '100%')
			.css('height', '100%')
			.on("load", loading_img_hide)
		);
	} 
}