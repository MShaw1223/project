// runs before the first paint so a dark-mode visitor never sees a light flash; ThemeProvider takes
// over once React loads. A file rather than an inline script so the CSP can refuse inline scripts
(function () {
  try {
    var theme = localStorage.getItem("theme") || "system";
    var dark = theme === "dark" || (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  } catch (e) {}
})();
