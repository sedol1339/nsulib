import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
	List<Integer> groups = new ArrayList<Integer>();
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
		parseShedule();
		fillDatabaseLists();
		fillMaterials();
	}
	
	static void fillMaterials() {
		
	}
	
	static void fillDatabaseLists() {
		
	}
	
	static void parseShedule() {
		
		faculties.put(faculties.size() + 1, new Info("ГГФ", "Геолого-геофизический факультет", "https://table.nsu.ru/faculty/ggf"));
		faculties.put(faculties.size() + 1, new Info("ММФ", "Механико-математический факультет", "https://table.nsu.ru/faculty/mmf"));
		faculties.put(faculties.size() + 1, new Info("ФЕН", "Факультет естественных наук", "https://table.nsu.ru/faculty/fen"));
		faculties.put(faculties.size() + 1, new Info("ФФ", "Физический факультет", "https://table.nsu.ru/faculty/ff"));
		faculties.put(faculties.size() + 1, new Info("ФИТ", "Факультет информационных технологий", "https://table.nsu.ru/faculty/fit"));
		faculties.put(faculties.size() + 1, new Info("ЭФ", "Экономический факультет", "https://table.nsu.ru/faculty/ef"));
		faculties.put(faculties.size() + 1, new Info("ГИ", "Гуманитарный институт", "https://table.nsu.ru/faculty/gi"));
		faculties.put(faculties.size() + 1, new Info("ИФП", "Институт философии и права", "https://table.nsu.ru/faculty/iphp"));
		faculties.put(faculties.size() + 1, new Info("ИМП", "Институт медицины и психологии", "https://table.nsu.ru/faculty/imp"));
		
		for (Integer id : faculties.keySet()) {
			Info entry = faculties.get(id);
			String faculty_page = get(entry.link, "utf-8");
			Matcher m = Pattern.compile("<a href='(?<link>\\/group\\/[^']*)'>(?<name>[^<]*)<\\/a>").matcher(faculty_page);
			while(m.find()) {
				String link = ("https://table.nsu.ru" + m.group("link"));
				String name = m.group("name");
				Info info = new Info(name, name, link);
				System.out.println(groups.size() + 1 + ": " + info);
				groups.put(groups.size() + 1, info);
			}
		}
		for (Integer id : groups.keySet()) {
			Info entry = groups.get(id);
			String group_page = get(entry.link, "utf-8");
			//test
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
				System.out.println("FIND " + m.group("sbjfull") + " " + m.group("sbjshort") + " " + m.group("tchrlink") + " " + m.group("tchrshort"));
			}
			//end test
			//System.exit(0);
		}
	}

	public static String get(String url, String encoding) {
		try {
			Thread.sleep(500);
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

}
