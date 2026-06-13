/**
 * swap.js
 * Меняет местами значения полей «Отдаю» и «Получаю»
 * как в боковой панели (сайдбаре), так и в основном калькуляторе.
 */

// Ждём полной загрузки DOM, чтобы все элементы страницы были доступны
document.addEventListener('DOMContentLoaded', () => {
  // Находим кнопку обмена в сайдбаре по её идентификатору
  const swapSidebarBtn = document.getElementById('swapSidebarBtn');
  // Находим кнопку обмена в основном калькуляторе по её идентификатору
  const mainSwapBtn = document.getElementById('mainSwapBtn');

  /**
   * Функция, меняющая значения двух полей ввода/выбора по их id.
   * @param {string} id1 - id первого элемента
   * @param {string} id2 - id второго элемента
   */
  function swapValues(id1, id2) {
    // Получаем первый элемент со страницы
    const el1 = document.getElementById(id1);
    // Получаем второй элемент со страницы
    const el2 = document.getElementById(id2);
    // Если хотя бы один из элементов не найден, выходим из функции
    if (!el1 || !el2) return;

    // Сохраняем значение первого элемента во временную переменную
    const tempValue = el1.value;
    // Присваиваем первому элементу значение второго элемента
    el1.value = el2.value;
    // Присваиваем второму элементу сохранённое значение первого
    el2.value = tempValue;
  }

  // Проверяем, существует ли кнопка обмена в сайдбаре
  if (swapSidebarBtn) {
    // Назначаем обработчик клика на кнопку в сайдбаре
    swapSidebarBtn.addEventListener('click', () => {
      // Меняем местами содержимое полей «giveInput» и «receiveInput»
      swapValues('giveInput', 'receiveInput');
    });
  }

  // Проверяем, существует ли кнопка обмена в основном калькуляторе
  if (mainSwapBtn) {
    // Назначаем обработчик клика на основную кнопку обмена
    mainSwapBtn.addEventListener('click', () => {
      // Меняем местами выбранные значения в select’ах «giveSelect» и «receiveSelect»
      swapValues('giveSelect', 'receiveSelect');
    });
  }
});