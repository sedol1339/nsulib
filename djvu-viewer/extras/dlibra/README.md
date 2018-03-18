# How to add DjVu-HTML5 Viewer as a plugin in dLibra 5?

It's very simple. Follow the instructions below, replacing `dlibra-webapp` with the location of your dLibra Web application.

1. [Download](https://github.com/mateusz-matela/djvu-html5/releases) and unpack the latest version.
2. Copy the `extras/dlibra/djvu_html5` folder into a new folder `dlibra-webapp/WEB-INF/formats`.
3. Create a new folder `dlibra-webapp/formats/djvu_html5` and copy  the `img`, `djvu_html5` and `djvu_worker` folders into it, as well as the `Djvu_html5.css` file.
4. If you want the new plugin to be the default DjVu viewer, edit the `dlibra-webapp/WEB-INF/formats/djvu_html5/settings.xml` file and change the `overrides.browser` property to `true`. Change the same property to `false` in `dlibra-webapp/WEB-INF/formats/djvu/settings.xml`, if it's still there. You can do this change at any time in the future.
5. Restart you dLibra Web Application container.
