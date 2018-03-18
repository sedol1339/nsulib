function checkpoint(param) {
	if (param) {
		var str = new Error("Checkpoint (" + param + "):").stack;
	} else {
		var str = new Error("Checkpoint:").stack;
	}
	str = str.substring(7,str.length);
	var parts = str.split("\n");
	var last_index = 0;
	for (var i = 2; i < parts.length; i++) {
		if (parts[i].startsWith("    at HTMLDocument.<anonymous>")) {
			last_index = i;
			break;
		}
	}
	if (last_index && last_index != parts.length - 1) {
		str = parts[0] + "\n" + parts.slice(2, last_index + 1).join("\n");
	} else {
		str = parts[0] + "\n" + parts.slice(2).join("\n");
	}
	console.log(str);
}