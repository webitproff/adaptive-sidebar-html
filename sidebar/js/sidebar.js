/**
 * sidebar.js
 * Управляет открытием и закрытием боковой панели (сайдбара) на мобильных устройствах.
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

  // Объявляем функцию открытия сайдбара
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

  // Объявляем функцию закрытия сайдбара
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

  // Объявляем функцию переключения состояния сайдбара
  function toggleSidebar() {
    // Проверяем, открыт ли сайдбар в данный момент (есть ли класс 'open')
    if (sidebar.classList.contains('open')) {
      // Если открыт – закрываем его
      closeSidebar();
    } else {
      // Иначе – открываем
      openSidebar();
    }
  }

  // Назначаем обработчик клика на гамбургер: при клике вызываем toggleSidebar
  hamburgerBtn.addEventListener('click', toggleSidebar);

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
    // Проверяем, что нажата клавиша Escape и сайдбар открыт
    if (event.key === 'Escape' && sidebar.classList.contains('open')) {
      // Закрываем сайдбар
      closeSidebar();
    }
  });

  // Добавляем обработчик изменения размера окна
  window.addEventListener('resize', () => {
    // Если ширина окна становится больше 1024px (десктоп)
    if (window.innerWidth > 1024) {
      // Закрываем сайдбар и убираем overlay принудительно
      closeSidebar();
    }
  });
});