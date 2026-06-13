/**
 * tabs.js
 * Управляет переключением вкладок в сайдбаре: «Все валюты» и «Избранное».
 * При клике на вкладку показывает соответствующий контейнер и выделяет активную кнопку.
 */

// Ждём полной загрузки DOM, чтобы гарантировать доступность всех элементов
document.addEventListener('DOMContentLoaded', () => {
  // Получаем кнопку «Все валюты» по её идентификатору
  const tabAll = document.getElementById('tabAll');
  // Получаем кнопку «Избранное» по её идентификатору
  const tabFav = document.getElementById('tabFav');
  // Получаем контейнер со списком всех валют
  const allCurrenciesContainer = document.getElementById('allCurrenciesContainer');
  // Получаем элемент-заглушку, который показывается при пустом избранном
  const favoritesEmpty = document.getElementById('favoritesEmpty');

  // Проверяем, что все нужные элементы присутствуют на странице
  if (!tabAll || !tabFav || !allCurrenciesContainer || !favoritesEmpty) {
    return; // Если хоть один отсутствует, прекращаем выполнение скрипта
  }

  // Функция, которая активирует вкладку «Все валюты»
  function showAllCurrencies() {
    // Добавляем класс 'active' кнопке «Все валюты», делая её визуально выделенной
    tabAll.classList.add('active');
    // Убираем класс 'active' у кнопки «Избранное»
    tabFav.classList.remove('active');
    // Показываем контейнер со списком валют
    allCurrenciesContainer.style.display = 'block';
    // Скрываем заглушку «Избранные направления отсутствуют»
    favoritesEmpty.classList.remove('visible');
  }

  // Функция, которая активирует вкладку «Избранное»
  function showFavorites() {
    // Выделяем кнопку «Избранное»
    tabFav.classList.add('active');
    // Снимаем выделение с кнопки «Все валюты»
    tabAll.classList.remove('active');
    // Скрываем контейнер со списком валют
    allCurrenciesContainer.style.display = 'none';
    // Показываем заглушку (в реальном приложении здесь был бы список избранных валют)
    favoritesEmpty.classList.add('visible');
  }

  // При клике на кнопку «Все валюты» вызываем функцию showAllCurrencies
  tabAll.addEventListener('click', showAllCurrencies);
  // При клике на кнопку «Избранное» вызываем функцию showFavorites
  tabFav.addEventListener('click', showFavorites);
});