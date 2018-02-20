import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
	//static int faculties_length = 0, groups_length = 0, subjects_length = 0, teachers_length = 0;

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
		
		parseShedule();
		fillDatabaseLists();
		fillMaterials();
	}
	
	static void fillMaterials() {
		
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
		
		//Факультеты:
		runSQL(conn, "ALTER TABLE `faculties` CHANGE `id` `id` INT(10) UNSIGNED NOT NULL");
		runSQL(conn, "DELETE FROM `faculties` WHERE 1");
		for (Integer id : faculties.keySet()) {
			Info entry = faculties.get(id);
			String sql = "INSERT INTO `faculties`(`id`, `title`, `short_title`) VALUES ('" + escapeString("" + id)
				+ "','" + escapeString(entry.full_title) + "','" + escapeString(entry.short_title) + "')";
			runSQL(conn, sql);
		}
		runSQL(conn, "ALTER TABLE `faculties` CHANGE `id` `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT");
		runSQL(conn, "ALTER TABLE `faculties` AUTO_INCREMENT = " + escapeString("" + (faculties.size() + 1)));
		
		//предметы:
		runSQL(conn, "ALTER TABLE `subjects` CHANGE `id` `id` INT(10) UNSIGNED NOT NULL");
		runSQL(conn, "DELETE FROM `subjects` WHERE 1");
		for (Integer id : subjects.keySet()) {
			Info entry = subjects.get(id);
			String sql = "INSERT INTO `subjects`(`id`, `title`, `short_title`) VALUES ('" + escapeString("" + id)
				+ "','" + escapeString(entry.full_title) + "','" + escapeString(entry.short_title) + "')";
			runSQL(conn, sql);
		}
		runSQL(conn, "ALTER TABLE `subjects` CHANGE `id` `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT");
		runSQL(conn, "ALTER TABLE `subjects` AUTO_INCREMENT = " + escapeString("" + (subjects.size() + 1)));
		
		//преподаватели:
		runSQL(conn, "ALTER TABLE `teachers` CHANGE `id` `id` INT(10) UNSIGNED NOT NULL");
		runSQL(conn, "DELETE FROM `teachers` WHERE 1");
		for (Integer id : teachers.keySet()) {
			Info entry = teachers.get(id);
			String sql = "INSERT INTO `teachers`(`id`, `name`, `short_name`) VALUES ('" + escapeString("" + id)
				+ "','" + escapeString(entry.full_title) + "','" + escapeString(entry.short_title) + "')";
			runSQL(conn, sql);
		}
		runSQL(conn, "ALTER TABLE `teachers` CHANGE `id` `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT");
		runSQL(conn, "ALTER TABLE `teachers` AUTO_INCREMENT = " + escapeString("" + (teachers.size() + 1)));
		
		//связи:
		runSQL(conn, "DELETE FROM `relations` WHERE 1");
		for (Linking linking : linkings) {
			String sql = "INSERT INTO `relations`(`faculty`, `subject`, `teacher`) VALUES ('" + escapeString("" + linking.faculty)
			+ "','" + escapeString("" + linking.subject) + "','" + escapeString("" + linking.teacher) + "')";
			runSQL(conn, sql);
		}
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
			//System.exit(0);
			}
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
		System.out.print(s + "...");
		try {
			conn.createStatement().executeUpdate(s);
			System.out.print("Success\n");
			
		} catch (SQLException e) {
			e.printStackTrace();
			System.exit(0);
		}
	}
}
