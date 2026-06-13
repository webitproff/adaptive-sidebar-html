/**
 * theme.js
 * Управление переключением светлой и тёмной темы.
 * Сохраняет выбор пользователя в localStorage,
 * обновляет атрибут data-bs-theme у <html> и меняет иконку.
 */
(() => {
  // Получаем корневой элемент <html>
  const html = document.documentElement;
  // Кнопка переключения темы
  const themeToggle = document.getElementById('themeToggle');
  // Иконка внутри кнопки
  const themeIcon = themeToggle.querySelector('i');

  /**
   * Устанавливает тему и обновляет иконку
   * @param {string} theme - 'dark' или 'light'
   */
  function setTheme(theme) {
    // Задаём атрибут data-bs-theme на <html> — именно на него смотрят CSS-переменные
    html.setAttribute('data-bs-theme', theme);
    // Меняем иконку: солнце для светлой, луна для тёмной
    themeIcon.className = theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
  }

  // Определяем начальную тему
  function getInitialTheme() {
    // Проверяем localStorage
    const saved = localStorage.getItem('index-mono-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    // Если нет сохранённой — смотрим системные предпочтения
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
    // По умолчанию тёмная
    return 'dark';
  }

  const currentTheme = getInitialTheme();
  setTheme(currentTheme);

  // Переключение по клику
  themeToggle.addEventListener('click', () => {
    // Определяем текущую тему из атрибута
    const isLight = html.getAttribute('data-bs-theme') === 'light';
    const newTheme = isLight ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('index-mono-theme', newTheme);
  });
})();