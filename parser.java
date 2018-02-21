import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.TreeSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

class Info {
	String short_title, full_title;
	String link;
	public Info(String short_title, String full_title, String link) {
		this.short_title = short_title;
		this.full_title = full_title;
		this.link = link;
	}
	public String toString() { 
	    return this.short_title + " " + this.full_title + " " + this.link;
	}
}

class Linking {
	int faculty, subject, teacher;
	Set<Integer> groups = new TreeSet<Integer>();
	public Linking(int faculty, int subject, int teacher) {
		this.faculty = faculty;
		this.subject = subject;
		this.teacher = teacher;
	}
	public String toString() {
	    return this.faculty + " " + this.subject + " " + this.teacher + " " + Arrays.toString(groups.toArray());
	}
}

public class Main {
	
	static Map<Integer, Info> faculties = new HashMap<Integer, Info>();
	static Map<Integer, Info> groups = new HashMap<Integer, Info>();
	static Map<Integer, Info> subjects = new HashMap<Integer, Info>();
	static Map<Integer, Info> teachers = new HashMap<Integer, Info>();
	static List<Linking> linkings = new ArrayList<Linking>();
	
	static Random r = new Random();
	
	static List<String[]> names_and_mimes = getNamesAndMimes();

	public static void main(String[] args) {

		faculties.put(faculties.size() + 1, new Info("ГГФ", "Геолого-геофизический факультет", "https://table.nsu.ru/faculty/ggf"));
		faculties.put(faculties.size() + 1, new Info("ММФ", "Механико-математический факультет", "https://table.nsu.ru/faculty/mmf"));
		faculties.put(faculties.size() + 1, new Info("ФЕН", "Факультет естественных наук", "https://table.nsu.ru/faculty/fen"));
		faculties.put(faculties.size() + 1, new Info("ФФ", "Физический факультет", "https://table.nsu.ru/faculty/ff"));
		faculties.put(faculties.size() + 1, new Info("ФИТ", "Факультет информационных технологий", "https://table.nsu.ru/faculty/fit"));
		faculties.put(faculties.size() + 1, new Info("ЭФ", "Экономический факультет", "https://table.nsu.ru/faculty/ef"));
		faculties.put(faculties.size() + 1, new Info("ГИ", "Гуманитарный институт", "https://table.nsu.ru/faculty/gi"));
		faculties.put(faculties.size() + 1, new Info("ИФП", "Институт философии и права", "https://table.nsu.ru/faculty/iphp"));
		faculties.put(faculties.size() + 1, new Info("ИМП", "Институт медицины и психологии", "https://table.nsu.ru/faculty/imp"));
		
		/*for(int i = 0; i < 10; i++) {
			System.out.println(randomFileName() + "\n");
		}*/
		
		parseShedule();
		fillDatabaseLists();
	}
	
	static void fillDatabaseLists() {
		Connection conn = null;
		try {
			Class.forName("com.mysql.jdbc.Driver").newInstance();
			conn = DriverManager.getConnection(
					"jdbc:mysql://vh216217.eurodir.ru:3306/vh216217_library?characterEncoding=utf8", "vh216217_user", "Nexus1339~");
			System.out.println ("Database connection established");
		} catch (Exception e) {
			System.out.println("Connection failed");
			e.printStackTrace();
			System.exit(0);
		}
		
		//Очистка материалов:
		runSQL(conn, "DELETE FROM `materials` WHERE 1");
		
		//Факультеты:
		//runSQL(conn, "ALTER TABLE `faculties` CHANGE `id` `id` INT(10) UNSIGNED NOT NULL");
		runSQL(conn, "DELETE FROM `faculties` WHERE 1");
		for (Integer id : faculties.keySet()) {
			Info entry = faculties.get(id);
			String sql = "INSERT INTO `faculties`(`id`, `title`, `short_title`) VALUES ('" + escapeString("" + id)
				+ "','" + escapeString(entry.full_title) + "','" + escapeString(entry.short_title) + "')";
			runSQL(conn, sql);
		}
		//runSQL(conn, "ALTER TABLE `faculties` CHANGE `id` `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT");
		runSQL(conn, "ALTER TABLE `faculties` AUTO_INCREMENT = " + escapeString("" + (faculties.size() + 1)));
		
		//предметы:
		//runSQL(conn, "ALTER TABLE `subjects` CHANGE `id` `id` INT(10) UNSIGNED NOT NULL");
		runSQL(conn, "DELETE FROM `subjects` WHERE 1");
		for (Integer id : subjects.keySet()) {
			Info entry = subjects.get(id);
			String sql = "INSERT INTO `subjects`(`id`, `title`, `short_title`) VALUES ('" + escapeString("" + id)
				+ "','" + escapeString(entry.full_title) + "','" + escapeString(entry.short_title) + "')";
			runSQL(conn, sql);
		}
		//runSQL(conn, "ALTER TABLE `subjects` CHANGE `id` `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT");
		runSQL(conn, "ALTER TABLE `subjects` AUTO_INCREMENT = " + escapeString("" + (subjects.size() + 1)));
		
		//преподаватели:
		//runSQL(conn, "ALTER TABLE `teachers` CHANGE `id` `id` INT(10) UNSIGNED NOT NULL");
		runSQL(conn, "DELETE FROM `teachers` WHERE 1");
		for (Integer id : teachers.keySet()) {
			Info entry = teachers.get(id);
			String sql = "INSERT INTO `teachers`(`id`, `name`, `short_name`) VALUES ('" + escapeString("" + id)
				+ "','" + escapeString(entry.full_title) + "','" + escapeString(entry.short_title) + "')";
			runSQL(conn, sql);
		}
		//runSQL(conn, "ALTER TABLE `teachers` CHANGE `id` `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT");
		runSQL(conn, "ALTER TABLE `teachers` AUTO_INCREMENT = " + escapeString("" + (teachers.size() + 1)));
		
		//связи:
		runSQL(conn, "DELETE FROM `relations` WHERE 1");
		for (Linking linking : linkings) {
			String sql = "INSERT INTO `relations`(`faculty`, `subject`, `teacher`) VALUES ('" + escapeString("" + linking.faculty)
			+ "','" + escapeString("" + linking.subject) + "','" + escapeString("" + linking.teacher) + "')";
			runSQL(conn, sql);
		}
		
		//материалы:
		Map<Integer, Double> modifier_1 = new HashMap<Integer, Double>();
		modifier_1.put(1, 0.1); //ГГФ
		modifier_1.put(2, 1.0); //ММФ
		modifier_1.put(3, 0.4); //ФЕН
		modifier_1.put(4, 0.5); //ФФ
		modifier_1.put(5, 1.5); //ФИТ
		modifier_1.put(6, 0.0); //ЭФ
		modifier_1.put(7, 0.1); //ГИ
		modifier_1.put(8, 0.2); //ИФП
		modifier_1.put(9, 0.0); //ИМП
		Map<Integer, Double> modifier_2 = new HashMap<Integer, Double>();
		for(int i = 0; i <= subjects.size(); i++) {
			//double d = Math.random() * 8 - 4;
			//double d2 = (d < -3) ? 0 : Math.pow(2, d);
			//modifier_2.put(i, d2);
			modifier_2.put(i, Math.random());
		}
		
		for (Linking linking : linkings) {
			double modifier = modifier_1.get(linking.faculty) * modifier_2.get(linking.subject);
			long amount_teacher = Math.round(Math.pow(2, Math.random() * 3.5) * modifier);
			long amount_student = Math.round(Math.pow(2, Math.random() * 3.5) * modifier);
			long amount_literature = Math.round(Math.pow(2, Math.random() * 2) * modifier);
			if (r.nextInt(50) == 0) {
				amount_teacher *= 25;
				amount_student *= 25;
				amount_literature *= 25;
			}
			System.out.println("amount for linking " + linking.faculty + " " + linking.subject + " " + linking.teacher + 
					": " + amount_teacher + " " + amount_student + " " + amount_literature + " (mod1 = " + 
					modifier_1.get(linking.faculty) + ", mod2 = " + modifier_2.get(linking.subject) + ")");
			for (int i = 0; i < amount_teacher + amount_student + amount_literature; i++) {
				//создаем учебный материал
				
				int f = linking.faculty;
				int s = linking.subject;
				int t = linking.teacher;
				
				String type;
				if (i < amount_teacher) {
					type = "TEACHER";
				} else if (i < amount_teacher + amount_student) {
					type = "STUDENT";
				} else {
					type = "LITERATURE";
				}
				
				String link = null;
				String title = null;
				String mime = null;
				String filename = null;
				long filesize = 0;
				int random_id = r.nextInt(names_and_mimes.size());
				title = names_and_mimes.get(random_id)[0];
				if (r.nextInt(5) == 0) {
					//link
					link = "http://some-site/" + r.nextInt(25);
				} else {
					//file
					mime = names_and_mimes.get(random_id)[1];
					filesize = Integer.parseInt(names_and_mimes.get(random_id)[2]);
					filename = names_and_mimes.get(random_id)[3];
				}
				
				String author = getRandomAuthorName(false);
				
				String year = getRandomYear();
				
				String commentary = getRandomCommentary();
				
				int uploader = getRandomUploader();
				
				long ip = r.nextInt(256) + 256 * r.nextInt(256) + 256 * 256 * r.nextInt(256) + 256 * 256 * 256 * r.nextInt(256);
				
				String[] rnd = getRandomDates();
				String uploaded = rnd[0];
				String edited = rnd[1];
				
				int viewed = r.nextInt(3) * r.nextInt(3) * r.nextInt(3) * r.nextInt(3);
				int downloaded = (int) (viewed * Math.random() * Math.random() * Math.random());
				
				//------------------------------------------------
				
				StringBuilder s1 = new StringBuilder();
				StringBuilder s2 = new StringBuilder();
				
				s1.append("`faculty`"); s2.append("'" + f + "'");
				s1.append(", `subject`"); s2.append("," + "'" + s + "'");
				s1.append(", `teacher`"); s2.append("," + "'" + t + "'");
				s1.append(", `type`"); s2.append("," + "'" + escapeString(type) + "'");
				s1.append(", `title`"); s2.append("," + "'" + escapeString(title) + "'");
				if (link != null) {
					s1.append(", `link`"); s2.append("," + "'" + escapeString(link) + "'");
				}
				else {
					if (mime != null) {
						s1.append(", `mime`"); s2.append("," + "'" + escapeString(mime) + "'");
					}
					s1.append(", `file`"); s2.append("," + "'" + escapeString(filename) + "'");
					s1.append(", `filesize`"); s2.append("," + "'" + filesize + "'");
				}
				if (author != null) {
					s1.append(", `author`"); s2.append("," + "'" + escapeString(author) + "'");
				}
				if (year != null) {
					s1.append(", `year`"); s2.append("," + "'" + escapeString(year) + "'");
				}
				s1.append(", `uploader`"); s2.append("," + "'" + uploader + "'");
				s1.append(", `ip`"); s2.append("," + "UNHEX('" + Long.toHexString(ip) + "')");
				s1.append(", `uploaded`"); s2.append("," + "'" + escapeString(uploaded) + "'");
				s1.append(", `edited`"); s2.append("," + "'" + escapeString(edited) + "'");
				s1.append(", `viewed`"); s2.append("," + "'" + viewed + "'");
				if (link == null) {
					s1.append(", `downloaded`"); s2.append("," + "'" +downloaded + "'");
				}
				if (commentary != null) {
					s1.append(", `commentary`"); s2.append("," + "'" + escapeString(commentary) + "'");
				}
				
				//------------------------------------------------
				
				String part1 = "INSERT INTO materials (" + s1 + ") ";
				String part2 = "VALUES (" + s2 + ")";
				
				//System.out.println();
				//System.out.println(part1);
				//System.out.println(part2);
				
				runSQL(conn, part1 + part2);
			}
		}
		
		System.out.println("This is fine!");
	}
	
	static void parseShedule() {
		
		for (Integer id : faculties.keySet()) {
			Info entry = faculties.get(id);
			String faculty_page = get(entry.link, "utf-8");
			Matcher m = Pattern.compile("<a href='(?<link>\\/group\\/[^']*)'>(?<name>[^<]*)<\\/a>").matcher(faculty_page);
			while(m.find()) {
				String link = ("https://table.nsu.ru" + m.group("link"));
				String name = m.group("name");
				Info info = new Info(name, "" + id, link);
				System.out.println(groups.size() + 1 + ": " + info);
				groups.put(groups.size() + 1, info);
			}
		}
		for (Integer id : groups.keySet()) {
			Info entry = groups.get(id);
			String group_page = get(entry.link, "utf-8");
			/*
			 * Весь блок:
			 * <td><div class='cell'><span class='type lek' data-toggle='tooltip' data-placement='right' title='лекция'>лек</span>
			 * <div class='subject' data-toggle='tooltip' data-placement='top' title='Основы математического анализа'>ОМА</div>
			 * <div class='room'>Ауд. МА</div><a href='/teacher/092337' class='tutor'>Подвигин И.В.</a></div></td><td>
			 * 
			 * Часть для разбора:
			 * title='Основы математического анализа'>ОМА</div>
			 * <div class='room'>Ауд. МА</div><a href='/teacher/092337' class='tutor'>Подвигин И.В.
			 * 
			 * title='(?<sbjfull>[^']*)'>(?<sbjshort>[^<]*)<\\/div>(<div class='room'>[^<]*<\\/div>)?<a href='(?<tchrlink>[^']*)' class='tutor'>(?<tchrshort>[^<]*)
			 */
			System.out.println(entry.link);
			Matcher m = Pattern.compile("title='(?<sbjfull>[^']*)'>(?<sbjshort>[^<]*)<\\/div>(<div class='room'>[^<]*<\\/div>)?<a href='(?<tchrlink>[^']*)' class='tutor'>(?<tchrshort>[^<]*)").matcher(group_page);
			while(m.find()) {
				System.out.println("FOUND " + m.group("sbjfull") + " " + m.group("sbjshort") + " " + m.group("tchrlink") + " " + m.group("tchrshort"));
				//Предмет:
				String subject_full = m.group("sbjfull"), subject_short = m.group("sbjshort");
				int id_subject = -1;
				for (Integer id_local : subjects.keySet()) {
					Info entry_sbj = subjects.get(id_local);
					if (entry_sbj.full_title.equalsIgnoreCase(subject_full)) {
						id_subject = id_local;
						break;
					}
				}
				if (id_subject == -1) {
					id_subject = subjects.size() + 1;
					subjects.put(id_subject, new Info(subject_short, subject_full, null));
					System.out.println("New subject " + id_subject + " | " + subject_full + " | " + subject_short);
				}
				//Преподаватель:
				String teacher_link = m.group("tchrlink");
				int id_teacher = -1;
				for (Integer id_local : teachers.keySet()) {
					Info entry_teacher = teachers.get(id_local);
					if (entry_teacher.link.equals(teacher_link)) {
						id_teacher = id_local;
						break;
					}
				}
				if (id_teacher == -1) {
					String teacher_page = get("https://table.nsu.ru" + teacher_link, "utf-8");
					Matcher m_local = Pattern.compile("<title>(?<fullname>.*) \\| Расписание занятий НГУ").matcher(teacher_page);
					m_local.find();
					String full_name = m_local.group("fullname");
					String short_name = m.group("tchrshort");
					id_teacher = teachers.size() + 1;
					teachers.put(id_teacher, new Info(short_name, full_name, teacher_link));
					System.out.println("New teacher " + id_teacher + " | " + full_name + " | " + short_name);
				}
				//Linking:
				int id_faculty = Integer.parseInt(entry.full_title);
				Linking linking = null;
				for (Linking l: linkings) {
					if (l.faculty == id_faculty && l.subject == id_subject && l.teacher == id_teacher) {
						linking = l;
						break;
					}
				}
				if (linking == null) {
					linking = new Linking(id_faculty, id_subject, id_teacher);
					linkings.add(linking);
					System.out.println("added new linking");
				}
				linking.groups.add(id);
				System.out.println(linking);
			}
			//break;
			//System.exit(0);
		}
		System.out.println("Количество факультетов: " + faculties.size());
		System.out.println("Количество групп: " + groups.size());
		System.out.println("Количество предметов: " + subjects.size());
		System.out.println("Количество преподавателей: " + teachers.size());
		System.out.println("Количество связей: " + linkings.size());
	}

	public static String get(String url, String encoding) {
		try {
			Thread.sleep(100);
		} catch (InterruptedException e1) {
			e1.printStackTrace();
		}
		try {
			URL _url = new URL(url);
			BufferedReader in = new BufferedReader(
	        new InputStreamReader(_url.openStream(), encoding));

	        String inputLine;
	        StringBuilder sb = new StringBuilder();
	        while ((inputLine = in.readLine()) != null)
	            sb.append(inputLine);
	        in.close();
	        return sb.toString();
		} catch (IOException e) {
			e.printStackTrace();
			return null;
		}
		
	}

	public static String escapeString(String x) {
		boolean escapeDoubleQuotes = true;
        StringBuilder sBuilder = new StringBuilder(x.length() * 11/10);

        int stringLength = x.length();

        for (int i = 0; i < stringLength; ++i) {
            char c = x.charAt(i);

            switch (c) {
            case 0: /* Must be escaped for 'mysql' */
                sBuilder.append('\\');
                sBuilder.append('0');

                break;

            case '\n': /* Must be escaped for logs */
                sBuilder.append('\\');
                sBuilder.append('n');

                break;

            case '\r':
                sBuilder.append('\\');
                sBuilder.append('r');

                break;

            case '\\':
                sBuilder.append('\\');
                sBuilder.append('\\');

                break;

            case '\'':
                sBuilder.append('\\');
                sBuilder.append('\'');

                break;

            case '"': /* Better safe than sorry */
                if (escapeDoubleQuotes) {
                    sBuilder.append('\\');
                }

                sBuilder.append('"');

                break;

            case '\032': /* This gives problems on Win32 */
                sBuilder.append('\\');
                sBuilder.append('Z');

                break;

            case '\u00a5':
            case '\u20a9':
                // escape characters interpreted as backslash by mysql
                // fall through

            default:
                sBuilder.append(c);
            }
        }

        return sBuilder.toString();
    }
	
	public static void runSQL(Connection conn, String s) {
		System.out.println(s);
		try {
			conn.createStatement().executeUpdate(s);
			
		} catch (SQLException e) {
			e.printStackTrace();
			System.exit(0);
		}
	}
	
	static List<String[]> getNamesAndMimes() {
		for (File child : new File("D:\\nsulib\\files").listFiles()) {
			child.delete();
		}
		File dir = new File("D:\\nsulib\\files_src");
		File[] directoryListing = dir.listFiles();
		List<String[]> names_and_mimes = new ArrayList<String[]>();
		for (File child : directoryListing) {
			String[] name_mime;
			try {
				name_mime = new String[4];
				name_mime[0] = child.getName();
				if (name_mime[0].length() > 130) {
					name_mime[0] = name_mime[0].substring(0, 130) + "…";
				}
				if (child.getName().endsWith(".djvu")) {
					name_mime[1] = "image/vnd.djvu";
				} else if (child.getName().endsWith(".pdf")) {
					name_mime[1] = "application/pdf";
				} else if (child.getName().endsWith(".txt")) {
					name_mime[1] = "text/plain";
				} else if (child.getName().endsWith(".rar")) {
					name_mime[1] = "application/x-rar-compressed";
				} else if (child.getName().endsWith(".rar")) {
					name_mime[1] = "application/x-rar-compressed";
				} else if (child.getName().endsWith(".7z")) {
					name_mime[1] = "application/x-7z-compressed";
				} else if (child.getName().endsWith(".7z")) {
					name_mime[1] = "application/x-7z-compressed";
				} else if (child.getName().endsWith(".fb2")) {
					name_mime[1] = "text/xml";
				} else if (child.getName().endsWith(".cpp")) {
					name_mime[1] = "text/plain";
				} else if (child.getName().endsWith(".c")) {
					name_mime[1] = "text/plain";
				} else if (child.getName().endsWith(".bat")) {
					name_mime[1] = "text/plain";
				} else {
					name_mime[1] = Files.probeContentType(child.toPath());
				}
				name_mime[2] = "" + child.length();
				System.out.println(name_mime[0] + " " + name_mime[1]);
				
				String filename = randomFileName();
				try {
					File new_file = new File("D:\\nsulib\\files\\" + filename);
					if (new_file.exists())
						throw new IOException("Duplicate " + new_file.getAbsolutePath());
					Files.copy(child.toPath(), new_file.toPath(),
							StandardCopyOption.REPLACE_EXISTING);
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
					System.exit(0);
				}
				name_mime[3] = filename;
				names_and_mimes.add(name_mime);
			} catch (IOException e){
				e.printStackTrace();
			}
		}
		return names_and_mimes;
	}
	
	static String getRandomAuthorName(boolean fromInside) {
		if (!fromInside && r.nextInt(2) == 0) {
			return null;
		}
		String name, surname;
		switch (r.nextInt(5)) {
		case 0: name = "А.Б."; break;
		case 1: name = "Г.Д."; break;
		case 2: name = "Е.А."; break;
		case 3: name = "В.П."; break;
		case 4: default: name = "Л.К."; break;
		}
		switch (r.nextInt(5)) {
		case 0: surname = "Рогов"; break;
		case 1: surname = "Сачков"; break;
		case 2: surname = "Усачев"; break;
		case 3: surname = "Мамонтов"; break;
		case 4: default: surname = "Котовский"; break;
		}
		String second = "";
		if(r.nextInt(5) == 0) {
			second = ", " + getRandomAuthorName(true);
		}
		return name + " " + surname + second;
	}
	
	static String getRandomYear() {
		switch (r.nextInt(7)) {
		case 0: return null;
		case 1: 
		case 2: return "2018";
		case 3: 
		case 4: return "2017";
		case 5: return "2016";
		case 6:
		default:
		}
		return "" + (2015 - r.nextInt(20));
	}
	
	static String[] tokens;
	static {
		String lorem_ipsum = "Aenean et enim at magna suscipit maximus quis id ipsum. Proin sed nibh neque. Nulla facilisi. Praesent fermentum erat sed tortor bibendum sollicitudin. Integer eu arcu id justo dapibus accumsan. Curabitur dictum volutpat nunc quis congue. Duis iaculis ex a cursus vulputate. Curabitur mollis id odio id mollis. Nunc tincidunt nisl ipsum, at viverra odio laoreet ac.\r\n" + 
				"\r\n" + 
				"Integer dapibus nunc ex, ac viverra arcu dictum in. Pellentesque sagittis nulla at nisl tempus scelerisque. Etiam id nunc lorem. Aliquam congue nisi mauris, ac efficitur est posuere sodales. Nullam at lectus nec ex fringilla pretium ac sit amet enim. Suspendisse ullamcorper lobortis pretium. Sed egestas enim sem, vel vehicula urna posuere ornare. Morbi vehicula leo vel augue rutrum, nec pulvinar risus posuere. Ut ornare ullamcorper enim, auctor ullamcorper nisl mollis interdum.\r\n" + 
				"\r\n" + 
				"Donec arcu nunc, pellentesque eu pulvinar a, rhoncus sed est. Aenean et augue vitae orci porttitor commodo vitae a ipsum. Integer metus metus, ultrices sit amet laoreet ultrices, scelerisque eu turpis. Pellentesque convallis fermentum nunc. Praesent arcu ligula, imperdiet at purus quis, tempor vehicula ipsum. Cras id purus consectetur, elementum eros finibus, elementum lacus. Suspendisse ultrices luctus rutrum. Curabitur sapien odio, rutrum sit amet eleifend non, blandit ac quam. Sed justo velit, ornare ac mi a, egestas aliquet leo. Nunc faucibus nisi in lorem tristique rutrum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam feugiat leo in arcu consequat, et semper tortor rhoncus. Etiam commodo est in auctor convallis.\r\n" + 
				"\r\n" + 
				"Nullam sodales velit laoreet velit tempus venenatis. Praesent eu risus lectus. Donec hendrerit turpis massa, nec lobortis mauris ullamcorper in. Vestibulum varius velit et lectus sagittis fringilla. Aenean lobortis est sed enim interdum, a pharetra risus placerat. Fusce a diam eros. Donec pulvinar elit nec nisl sollicitudin, suscipit cursus lacus rhoncus. Pellentesque egestas porta hendrerit. Proin sed finibus augue. Nam id nulla eu nisl lacinia aliquet id non diam. Nam venenatis nibh arcu, nec interdum diam dignissim a. Nunc luctus elementum imperdiet. Cras eget consectetur lacus. Duis nec volutpat tortor.\r\n" + 
				"\r\n" + 
				"Maecenas et lectus ac lacus tincidunt scelerisque. Donec viverra est nisi, nec aliquam tellus sollicitudin at. Nam pulvinar sapien nec massa egestas, id aliquam lectus pretium. Nulla rutrum nibh mattis varius faucibus. Ut vulputate purus ac tortor pulvinar, in imperdiet mauris blandit. Vestibulum sodales sem a faucibus elementum. Sed consectetur enim non lectus mattis, fermentum rhoncus libero eleifend. Nullam nisl dolor, fringilla eget neque ac, semper commodo enim. Mauris eleifend ante nec erat tincidunt rhoncus. Quisque interdum, justo eu dignissim mollis, risus ipsum varius arcu, non maximus elit sapien eget risus.\r\n" + 
				"\r\n" + 
				"Aliquam eget metus laoreet, cursus neque ac, ullamcorper orci. Ut eu ligula maximus, porttitor metus a, pretium dui. Duis in erat vitae metus posuere pretium. Integer ut volutpat turpis. Aenean leo nibh, venenatis ut velit a, lobortis tempor diam. Quisque sodales magna nec lectus molestie pellentesque. Phasellus placerat dolor in lacus posuere pharetra. Suspendisse vehicula commodo odio quis vestibulum.\r\n" + 
				"\r\n" + 
				"Maecenas faucibus, ex ac imperdiet consequat, orci mauris sollicitudin mi, gravida aliquet sapien est vitae odio. Curabitur sagittis enim id ipsum euismod commodo. Integer ac quam eu diam pretium dapibus. Aliquam elementum dui lacus, non vestibulum lacus semper a. Quisque in erat ut velit feugiat porttitor sed at ex. Phasellus non pellentesque purus. Suspendisse sed turpis sed libero fringilla mollis. Nam auctor sapien vitae risus auctor aliquam fermentum sit amet nibh. Morbi tincidunt ut massa eu volutpat. Cras finibus neque at neque eleifend convallis. Vestibulum sodales turpis eget elit molestie euismod. Vivamus consequat ex vel lorem porta, ac sollicitudin orci ultricies. Maecenas in sodales felis.";
		tokens = lorem_ipsum.split("[ .,\\r\\n]+");
		//System.out.println(Arrays.toString(tokens));
	}
	
	static String getRandomCommentary() {
		if(r.nextInt(2) == 0) {
			return null;
		}
				long symbols;
		if(r.nextInt(2) == 0) {
			symbols = r.nextInt(150);
		} else {
			symbols = 150 + (long) Math.pow(10, 3.582 * Math.random());
		}
		
		StringBuilder sb = new StringBuilder();
		sb.append(tokens[r.nextInt(tokens.length)].toLowerCase());
		sb.setCharAt(0, Character.toUpperCase(sb.charAt(0)));
		while (true) {
			if (sb.length() >= symbols)
				break;
			sb.append(" " + tokens[r.nextInt(tokens.length)].toLowerCase());
		}
		return sb.toString();
	}
	
	static int getRandomUploader() {
		int rnd = r.nextInt(1500);
		if (rnd > 800) return 1;
		if (rnd > 400) return 2;
		if (rnd > 200) return 3;
		if (rnd > 100) return 4;
		if (rnd > 50) return 5;
		if (rnd > 10) return 6;
		return 7;
	}
	
	static String[] getRandomDates() {
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		long cur_time = System.currentTimeMillis();
		long upload_time = cur_time - (long) ((86400 * 30 * 3) * 1000L * Math.random());
		long edit_time = (r.nextInt(3) != 0) ? upload_time : upload_time + (long) ((cur_time - upload_time) * Math.random());
		sdf.format(new Timestamp(cur_time));
		
		String[] ret = new String[2];
		ret[0] = sdf.format(new Timestamp(upload_time));
		ret[1] = sdf.format(new Timestamp(edit_time));
		
		return ret;
	}

	static String randomFileName() {
		StringBuilder sb = new StringBuilder();
		String characters = "0123456789ABCDEF";
		for (int i = 0; i < 24; i++) {
			sb.append(characters.charAt(r.nextInt(characters.length())));
			if (i > 0 && i % 6 == 0)
				sb.append("-");
		}
		return sb.toString();
	}
}
