/**
 * sidebar.js
 * Управляет открытием/закрытием сайдбара на мобильных (выезжающая панель)
 * и скрытием/показом сайдбара на десктопах с сохранением состояния в localStorage.
 * На десктопах используется атрибут data-sidebar-hidden на <html> для предотвращения мерцания.
 */

// Ждём полной загрузки DOM, чтобы все элементы были доступны
document.addEventListener('DOMContentLoaded', () => {
  // Получаем ссылку на элемент сайдбара по его id
  const sidebar = document.getElementById('sidebar');
  // Получаем ссылку на элемент затемнения фона по его id
  const overlay = document.getElementById('sidebarOverlay');
  // Получаем ссылку на кнопку гамбургера по его id
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  // Получаем ссылку на кнопку закрытия сайдбара по его id
  const closeBtn = document.getElementById('sidebarCloseBtn');

  // Проверяем, существуют ли на странице сайдбар и кнопка гамбургера
  if (!sidebar || !hamburgerBtn) return; // Если какого-то нет, выходим из функции

  // Ключ для хранения состояния сайдбара в localStorage
  const STORAGE_KEY = 'sidebar-hidden';
  // Ссылка на корневой элемент <html> для управления атрибутом data-sidebar-hidden
  const html = document.documentElement;

  // Функция проверки, является ли текущая ширина экрана мобильной
  function isMobile() {
    // Возвращаем true, если ширина окна 1024px или меньше
    return window.innerWidth <= 1024;
  }

  // Объявляем функцию открытия сайдбара (мобильный режим)
  function openSidebar() {
    // Добавляем класс 'open' к сайдбару, чтобы запустить анимацию выезда
    sidebar.classList.add('open');
    // Если overlay существует, добавляем класс 'active' для показа затемнения
    if (overlay) {
      overlay.classList.add('active');
    }
    // Запрещаем прокрутку основного содержимого страницы
    document.body.style.overflow = 'hidden';
  }

  // Объявляем функцию закрытия сайдбара (мобильный режим)
  function closeSidebar() {
    // Удаляем класс 'open' у сайдбара, чтобы он уехал обратно
    sidebar.classList.remove('open');
    // Если overlay существует, убираем класс 'active' для скрытия затемнения
    if (overlay) {
      overlay.classList.remove('active');
    }
    // Восстанавливаем возможность прокрутки страницы
    document.body.style.overflow = '';
  }

  // Функция для переключения видимости сайдбара на десктопе (использует атрибут data-sidebar-hidden)
  function toggleDesktopSidebar() {
    // Проверяем, есть ли сейчас атрибут data-sidebar-hidden
    if (html.hasAttribute('data-sidebar-hidden')) {
      // Если атрибут есть – сайдбар скрыт, убираем атрибут (показываем сайдбар)
      html.removeAttribute('data-sidebar-hidden');
      // Записываем состояние в localStorage: 'false' – сайдбар видим
      localStorage.setItem(STORAGE_KEY, 'false');
    } else {
      // Если атрибута нет – сайдбар видим, добавляем атрибут (скрываем сайдбар)
      html.setAttribute('data-sidebar-hidden', '');
      // Записываем состояние в localStorage: 'true' – сайдбар скрыт
      localStorage.setItem(STORAGE_KEY, 'true');
    }
  }

  // Главный обработчик клика по гамбургеру
  function handleHamburgerClick() {
    // Проверяем, находимся ли мы на мобильном экране
    if (isMobile()) {
      // Мобильное поведение: переключаем выезжающую панель
      if (sidebar.classList.contains('open')) {
        // Если открыта – закрываем
        closeSidebar();
      } else {
        // Иначе – открываем
        openSidebar();
      }
    } else {
      // Десктопное поведение: показать или скрыть сайдбар через атрибут data-sidebar-hidden
      toggleDesktopSidebar();
    }
  }

  // Функция инициализации состояния сайдбара при загрузке страницы
  function initSidebarState() {
    // Если мы на десктопе
    if (!isMobile()) {
      // Считываем сохранённое состояние из localStorage
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'true') {
        // Если было скрыто – добавляем атрибут data-sidebar-hidden
        html.setAttribute('data-sidebar-hidden', '');
      } else {
        // Иначе убираем атрибут (на случай, если он мог остаться)
        html.removeAttribute('data-sidebar-hidden');
      }
      // На десктопе больше ничего не делаем с атрибутом
    } else {
      // На мобильных всегда убираем атрибут, чтобы не мешал вёрстке
      html.removeAttribute('data-sidebar-hidden');
      // Закрываем мобильную панель (если вдруг была открыта)
      closeSidebar();
    }
  }

  // Обработчик изменения размера окна
  function handleResize() {
    if (isMobile()) {
      // Перешли в мобильный режим: убираем атрибут и закрываем мобильную панель, если была открыта
      html.removeAttribute('data-sidebar-hidden');
      closeSidebar();
    } else {
      // Перешли в десктопный режим: восстанавливаем сохранённое состояние атрибута
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'true') {
        // Если было скрыто – добавляем атрибут
        html.setAttribute('data-sidebar-hidden', '');
      } else {
        // Иначе убираем атрибут
        html.removeAttribute('data-sidebar-hidden');
      }
    }
  }

  // Назначаем обработчик клика на гамбургер
  hamburgerBtn.addEventListener('click', handleHamburgerClick);

  // Если кнопка закрытия существует, назначаем обработчик для закрытия сайдбара
  if (closeBtn) {
    closeBtn.addEventListener('click', closeSidebar);
  }

  // Если overlay существует, при клике на затемнение тоже закрываем сайдбар
  if (overlay) {
    overlay.addEventListener('click', closeSidebar);
  }

  // Добавляем глобальный обработчик нажатия клавиш
  document.addEventListener('keydown', (event) => {
    // Проверяем, что нажата клавиша Escape и сайдбар открыт (мобильная панель)
    if (event.key === 'Escape' && sidebar.classList.contains('open')) {
      // Закрываем сайдбар
      closeSidebar();
    }
  });

  // Автоматическое закрытие мобильной панели при клике на ссылку внутри сайдбара
  sidebar.addEventListener('click', (event) => {
    // Проверяем, что клик был на элементе <a> (или внутри него)
    const link = event.target.closest('a');
    if (isMobile() && link) {
      // Закрываем сайдбар (переход по ссылке произойдёт после этого)
      closeSidebar();
    }
  });

  // Добавляем обработчик изменения размера окна
  window.addEventListener('resize', handleResize);

  // Вызываем инициализацию при загрузке
  initSidebarState();
});
