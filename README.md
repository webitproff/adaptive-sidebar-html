# adaptive-sidebar-html

**Detailed Guide: Creating an Adaptive Sidebar for COTONTI CMF**

<img width="1292" height="809" alt="adaptive-sidebar-html_001" src="https://github.com/user-attachments/assets/b75ca62b-7b16-498d-9a6a-794ecf471781" />
<img width="1296" height="809" alt="adaptive-sidebar-html_002" src="https://github.com/user-attachments/assets/5639bd60-b96c-4491-b454-82a360ded757" />
<img width="1290" height="805" alt="adaptive-sidebar-html_003" src="https://github.com/user-attachments/assets/7ec2685c-c189-4d90-b69d-f37a9464d779" />
<img width="1292" height="807" alt="adaptive-sidebar-html_004" src="https://github.com/user-attachments/assets/079f09b4-6e97-42ec-8c40-daa96b5a4057" />
<img width="425" height="804" alt="adaptive-sidebar-html_005" src="https://github.com/user-attachments/assets/9b4d9525-fd0e-47a4-9ec2-d2d69c84ce14" />
<img width="425" height="806" alt="adaptive-sidebar-html_006" src="https://github.com/user-attachments/assets/15961812-4b0e-407f-814a-bf9c34b387b6" />
<img width="421" height="804" alt="adaptive-sidebar-html_007" src="https://github.com/user-attachments/assets/d8a418ff-6d5b-4928-ab60-e4b5d08a034b" />
<img width="427" height="808" alt="adaptive-sidebar-html_008" src="https://github.com/user-attachments/assets/e05c2cbd-0f8f-4262-9f9a-8d39d26a2c1b" />

---

## Introduction

In this article, we will step by step analyze how to turn an ordinary side panel into a modern adaptive sidebar that is always visible on wide screens and smoothly slides out on mobile devices when a hamburger button is pressed. All solutions are based on a real project "COTONTI CMF" – an exchange monitor service. We won't just copy the code; we'll understand the logic behind every decision so you can apply it in your own projects.

By the end of this read, you will know precisely:
- How to design the HTML structure for a flexible sidebar.
- How to use CSS variables and media queries to implement responsiveness and theme switching.
- How to split JavaScript into independent modules to avoid confusion.
- How to handle opening/closing the sidebar, blocking scrolling, and working with the overlay.

We will focus all our attention on the **sidebar** – its markup, styling, and behavioral logic. A secondary but important part will be the light/dark theme switching, as it directly affects the sidebar's appearance. Other modules (tabs, swap buttons, demo search) will be mentioned briefly – they are not the focus of the article.

---

## 1. Architecture and General Concept

Before writing code, let's imagine how the page should work.

On desktop (screen width greater than 1024 pixels) we see:
- A header with a logo, navigation, and buttons.
- Below the header – the main area divided into two parts: a sidebar 300px wide on the left, and the main content on the right.
- The sidebar is stuck to the top and does not scroll with the page – it stays in place thanks to `position: sticky`.
- The hamburger (three bars) is hidden.

On a mobile device (width ≤1024px) the behavior changes:
- The header becomes more compact, navigation disappears, and the hamburger appears.
- The sidebar is no longer part of the flow – it is fixed over the content but initially shifted off the left edge of the screen.
- When the hamburger is pressed, the sidebar smoothly slides in from the left, and the main content is dimmed by a semi-transparent overlay.
- The sidebar can be closed in three ways: the "Collapse" button, clicking on the overlay, or pressing the Escape key.
- After closing, the sidebar slides back, the overlay disappears, and the page scrolling is restored.

Additionally, the whole page supports two color schemes – dark (default) and light. The choice is saved in localStorage.

This is exactly the UX we will implement. The key idea is **one HTML code, with all behavior determined by CSS media queries and a small JavaScript module**. No duplication of the sidebar for mobile and desktop versions.

---

## 2. Preparing the File Structure

For ease of maintenance, we will separate the code into individual files:

```
project/
  index.html
  css/
    styles.css
  js/
    theme.js
    sidebar.js
    tabs.js
    swap.js
    search-demo.js
```

The main heroes of our article are `index.html`, `css/styles.css`, and `js/sidebar.js`. We will touch on `theme.js` and `tabs.js` in the context of the sidebar. The rest (`swap.js`, `search-demo.js`) will be left without detailed analysis – they solve local tasks and do not affect responsiveness.

---

## 3. HTML Markup: Framework and Key Elements

Let's start with `index.html`. It contains all the semantic structure but not a single line of styles or scripts (except external Bootstrap and Font Awesome libraries).

### 3.1. Header and Hamburger

The header (`<header class="header">`) is divided into three logical parts:
- Left: hamburger button + logo.
- Center: navigation menu (hidden on mobile using classes `d-none d-lg-flex`).
- Right: theme button and "Sign In" button.

The hamburger code:
```html
<button class="hamburger" id="hamburgerBtn">
  <i class="fas fa-bars"></i>
</button>
```
Initially, the hamburger is hidden via CSS (`display: none`), and only the media query for width ≤1024px makes it visible. We will attach the click handler for opening/closing the sidebar to this element.

### 3.2. Overlay – Background Dimming

Immediately after the header, but before the main layout, there is an empty `<div>`:
```html
<div class="sidebar-overlay" id="sidebarOverlay"></div>
```
It will only be shown in the mobile version when the sidebar is open. In desktop mode it is permanently hidden (`display: none`). Clicking on it will also close the sidebar.

### 3.3. Main Layout Container and Sidebar

The main container `<div class="layout">` unites the sidebar and the main content. It is a flex container that arranges its children in a row on desktop and in a column on mobile.

The sidebar itself (`<aside class="sidebar" id="sidebar">`) contains several internal blocks:
- Chips (tab buttons) "All Currencies" and "Favorites".
- Search block with two fields and a swap button.
- Container with the currency list.
- Placeholder for empty favorites.
- "Collapse" button (shown only on mobile).

The crucial identifier `id="sidebar"` allows JavaScript to easily find the element.

Note the initial class `visible` on the favorites placeholder – we use it to control visibility via JS.

### 3.4. Main Content and Footer

Inside `<main class="main-content">` is everything to the right of the sidebar: headings, calculator, blog. The calculator layout is not critical for the sidebar topic.

The footer is standard, sticking to the bottom of the page thanks to flex.

---

## 4. CSS: Sidebar Styling and Responsiveness

All styles are collected in `css/styles.css`. We grouped them by meaning and provided comments. Let's examine the key points responsible for the sidebar's behavior.

### 4.1. CSS Variables and Themes

At the very beginning of the file, we define variables for the dark and light themes. The switching is based on the `data-bs-theme` attribute on the `<html>` element:

```css
:root,
[data-bs-theme="dark"] {
  --sidebar-bg: #1b1e22;
  /* ... */
}
[data-bs-theme="light"] {
  --sidebar-bg: #f8f9fa;
  /* ... */
}
```

The sidebar itself uses the variable:
```css
.sidebar {
  background: var(--sidebar-bg);
  /* ... */
}
```
Thus, changing the attribute automatically updates the background and other colors without reloading the page.

### 4.2. Default Sidebar Styles for Desktop

By default, the sidebar behaves as `sticky`:
```css
.sidebar {
  width: 300px;
  position: sticky;
  top: 56px;          /* header height */
  height: calc(100vh - 56px);
  overflow-y: auto;
  transition: transform 0.3s ease;
  /* ... */
}
```
Why `sticky` and not `fixed`? Because we need the sidebar to participate in the flex container flow and not overlap the content. `Sticky` works exactly like that: the element behaves as a normal block until it reaches the specified `top`, then it "sticks". As a result, the content on the right never goes under the sidebar.

### 4.3. Media Query: Mobile Version

When the screen width is 1024px or less, a media query kicks in and completely overrides the sidebar's behavior:

```css
@media (max-width: 1024px) {
  .sidebar {
    position: fixed;
    top: 56px;
    left: 0;
    height: calc(100vh - 56px);
    transform: translateX(-100%);
    width: 280px;
    z-index: 1060;
  }
  .sidebar.open {
    transform: translateX(0);
  }
  .sidebar-close-mobile { display: block; }
  .layout { flex-direction: column; }
  /* ... */
}
```

What's happening here:
- The sidebar becomes `fixed` to sit above the content.
- Initially, it is shifted off the left edge by 100% of its width using `transform: translateX(-100%)`. This hides it visually.
- When JavaScript adds the class `open`, `transform: translateX(0)` is applied, and the sidebar smoothly slides in. The smoothness is provided by `transition: transform 0.3s ease` defined in the base styles.
- We increase `z-index` to 1060 (the overlay has 1050) so the sidebar is above the dimming.
- The close button, previously hidden (`display: none`), now appears.
- The main container `layout` switches to a vertical direction – the content goes down.

Thus, the same HTML element adapts to different devices purely through CSS.

### 4.4. Overlay

The overlay is initially hidden and activated by adding the `active` class via JavaScript:
```css
.sidebar-overlay {
  display: none;
  position: fixed;
  top: 56px; left: 0;
  width: 100%; height: calc(100% - 56px);
  background: rgba(0,0,0,0.4);
  z-index: 1050;
}
.sidebar-overlay.active {
  display: block;
}
```
When we click on it, we remove the `active` class, which hides the dimming.

### 4.5. Additional Responsiveness for Very Narrow Screens

A second media query (`max-width: 600px`) rearranges the calculator fields into a column. It is not directly related to the sidebar but demonstrates the flexibility of the approach.

---

## 5. JavaScript: Sidebar Control Logic

Now let's move on to what makes the sidebar open and close. The code is in `js/sidebar.js` and is a pure module with no dependencies on other scripts.

### 5.1. Initialization and Element Selection

Everything starts after the DOM is fully loaded:
```javascript
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const closeBtn = document.getElementById('sidebarCloseBtn');
  if (!sidebar || !hamburgerBtn) return;
  // ... functions and handlers
});
```
We check for the presence of key elements, and if they don't exist, we simply exit – this allows the script to be used on pages without a sidebar.

### 5.2. Open and Close Functions

```javascript
function openSidebar() {
  sidebar.classList.add('open');
  if (overlay) overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeSidebar() {
  sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}
```
The logic is simple:
- Add/remove the `open` class – this triggers the CSS animation for sliding in.
- Add/remove the `active` class on the overlay.
- Block/unblock page scrolling by setting `overflow` on `body`. This is crucial so that the content under the overlay does not scroll.

### 5.3. Event Handlers

The hamburger gets a `toggleSidebar` function that switches the state:
```javascript
hamburgerBtn.addEventListener('click', () => {
  sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
});
```
The close button and clicking on the overlay call `closeSidebar()`.

Additionally, we listen for the Escape key press on the whole page:
```javascript
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && sidebar.classList.contains('open')) {
    closeSidebar();
  }
});
```
This allows closing the sidebar without a mouse – improving accessibility.

### 5.4. Resize Handler – An Important Detail

Imagine: a user opened the sidebar on a mobile device (width 600px), then rotated the device or resized the window to 1200px. If nothing is done, the sidebar will remain in the `open` state, but because the media query no longer applies `transform`, the sidebar will snap to its usual place and be visible. However, `body` will still have `overflow: hidden`, and the page will stop scrolling. To prevent this, we added:
```javascript
window.addEventListener('resize', () => {
  if (window.innerWidth > 1024) {
    closeSidebar();
  }
});
```
When transitioning to desktop mode, we forcibly close the sidebar, remove the overlay, and restore scrolling. This makes the interface reliable.

### 5.5. Why We Don't Use Bootstrap for the Sidebar

Many projects use Bootstrap's offcanvas component, but in our case we needed a more flexible solution: the sidebar on desktops must be `sticky`, not just hidden. Standard offcanvas is always `fixed` and requires additional wrapping. Our approach is lighter and gives full control over animation and behavior.

---

## 6. Theme Switching and Its Connection to the Sidebar

Although theme switching is not the main focus of the article, it directly affects the sidebar, so let's examine the key points.

The task of the `theme.js` module is to manage the `data-bs-theme` attribute on the `<html>` element and save the choice in `localStorage`. Why `<html>` and not `body`? Because the CSS variables responsible for colors are tied to this attribute:

```css
[data-bs-theme="light"] {
  --sidebar-bg: #f8f9fa;
}
```

When the user clicks the theme button, we read the current attribute, invert it, and update:
```javascript
html.setAttribute('data-bs-theme', newTheme);
localStorage.setItem('index-mono-theme', newTheme);
```
That's it! All elements, including the sidebar, instantly recolor thanks to the variables.

At startup, we check the saved value or system preferences to immediately set the correct theme without flickering. For this, the `<html>` already has `data-bs-theme="dark"` written in, and JS, if needed, changes it to `light`. This guarantees that the page will be dark until the script runs.

The button icon (moon/sun) is also updated in the `setTheme` function.

This approach isolates the theme logic from other modules and allows easy reuse.

---

## 7. Tabs in the Sidebar (tabs.js) – Briefly

The `tabs.js` file handles switching between "All Currencies" and "Favorites". It's part of the sidebar, but its implementation is simple and does not affect responsiveness. When a chip button is clicked, we:

- Move the `active` class to the appropriate button.
- Show/hide the currencies container (`allCurrenciesContainer`).
- Show/hide the "No favorite directions" placeholder using the `visible` class.

No complex logic, just visibility toggling. It's only important to check that all elements exist.

---

## 8. Other Modules: swap.js and search-demo.js

These files solve local tasks and do not require a detailed examination in an article about the sidebar.

`swap.js` contains a function that swaps the values of two fields (by their `id`) – this is for user convenience. Swap buttons exist both in the sidebar and in the main calculator.

`search-demo.js` is a temporary placeholder that shows an `alert` when the "Find" button is pressed. In the future, an AJAX request can be added here.

Their presence demonstrates how new features can be added without affecting the core sidebar logic.

---

## 9. Why This Separation Matters

Extracting styles into a separate file and splitting JavaScript into modules provides several advantages:

1. **HTML cleanliness** – the markup remains semantic and easy to read.
2. **Reusability** – the `theme.js` module can be included on any page that needs a theme.
3. **Ease of maintenance** – to fix a sidebar bug, you go to a single file `sidebar.js`.
4. **Parallel work** – several developers can simultaneously edit different modules without conflicts.

Our project doesn't use bundlers (Webpack, Vite) or ES6 imports, but that's a conscious decision – for a small service, simple separation with `defer` is sufficient.

---

## 10. Conclusion

We have traveled the entire path from idea to a fully functional adaptive sidebar. On wide screens it is always visible, on mobile it slides out on demand. The color theme switches without reloading. The code is divided into logical parts, and each line has a clear explanation.

You can apply this approach in any project: an online store, admin panel, landing page. The main thing is to understand that responsiveness is built into CSS, and JavaScript only manages states.

Now you have not just a set of files, but a deep understanding of how to create a modern, convenient, and maintainable interface. Happy developing!

___

RU
**Подробное руководство: создание адаптивного сайдбара для COTONTI CMF**

*Версия для публичной статьи – без полных листингов, но с подробным разбором ключевых моментов.*

---

## Введение

В этой статье мы шаг за шагом разберём, как превратить обычную боковую панель в современный адаптивный сайдбар, который на широких экранах всегда видим, а на мобильных устройствах плавно выезжает по нажатию кнопки-гамбургера. Все решения основаны на реальном проекте «COTONTI CMF» – сервисе мониторинга обменников. Мы не просто скопируем код, а поймём логику каждого решения, чтобы вы могли применить её в своих проектах.

К концу чтения вы будете точно знать:
- Как правильно спроектировать HTML-структуру для гибкого сайдбара.
- Как с помощью CSS-переменных и медиазапросов реализовать адаптивность и переключение тем.
- Как разделить JavaScript на независимые модули, чтобы не запутаться.
- Как обрабатывать открытие/закрытие сайдбара, блокировать прокрутку и работать с оверлеем.

Всё внимание мы уделим именно **сайдбару** – его разметке, стилизации и логике поведения. Второстепенной, но важной частью станет переключение светлой и тёмной темы, потому что оно напрямую влияет на внешний вид сайдбара. Остальные модули (вкладки, кнопки обмена, демо-поиск) упомянем кратко – они не являются фокусом статьи.

---

## 1. Архитектура и общая концепция

Прежде чем писать код, давайте представим, как должна работать страница.

На десктопе (ширина экрана больше 1024 пикселей) мы видим:
- Шапку с логотипом, навигацией и кнопками.
- Под шапкой – основную область, разделённую на две части: слева сайдбар шириной 300px, справа – основной контент.
- Сайдбар приклеен к верху и не скроллится вместе со страницей – он остаётся на месте благодаря `position: sticky`.
- Гамбургер (три полоски) скрыт.

На мобильном устройстве (ширина ≤1024px) поведение меняется:
- Шапка становится компактнее, навигация исчезает, появляется гамбургер.
- Сайдбар больше не часть потока – он фиксируется поверх контента, но изначально сдвинут за левый край экрана.
- При нажатии на гамбургер сайдбар плавно выезжает слева, а основной контент затемняется полупрозрачным оверлеем.
- Закрыть сайдбар можно тремя способами: кнопкой «Свернуть», кликом по оверлею или клавишей Escape.
- После закрытия сайдбар уезжает обратно, оверлей исчезает, прокрутка страницы восстанавливается.

Дополнительно вся страница поддерживает две цветовые схемы – тёмную (по умолчанию) и светлую. Выбор сохраняется в localStorage.

Именно такой UX мы и будем воплощать. Ключевая идея – **один HTML-код, а всё поведение определяют CSS-медиазапросы и небольшой JavaScript-модуль**. Никакого дублирования сайдбара для мобильной и десктопной версий.

---

## 2. Подготовка файловой структуры

Для удобства поддержки мы разнесём код по отдельным файлам:

```
project/
  index.html
  css/
    styles.css
  js/
    theme.js
    sidebar.js
    tabs.js
    swap.js
    search-demo.js
```

Основные герои нашей статьи – `index.html`, `css/styles.css` и `js/sidebar.js`. Файлы `theme.js` и `tabs.js` мы затронем в контексте сайдбара. Остальные (`swap.js`, `search-demo.js`) оставим без подробного разбора – они решают локальные задачи и не влияют на адаптивность.

---

## 3. HTML-разметка: каркас и ключевые элементы

Начнём с `index.html`. Он содержит всю семантическую структуру, но ни строчки стилей или скриптов (кроме внешних библиотек Bootstrap и Font Awesome).

### 3.1. Шапка и гамбургер

Шапка (`<header class="header">`) разделена на три логические части:
- Левая: кнопка-гамбургер + логотип.
- Центральная: навигационное меню (скрыто на мобильных с помощью классов `d-none d-lg-flex`).
- Правая: кнопка темы и кнопка «Войти».

Код гамбургера:
```html
<button class="hamburger" id="hamburgerBtn">
  <i class="fas fa-bars"></i>
</button>
```
Изначально гамбургер скрыт через CSS (`display: none`), и только медиазапрос для ширины ≤1024px делает его видимым. Именно на этот элемент мы повесим обработчик клика для открытия/закрытия сайдбара.

### 3.2. Overlay – затемнение фона

Сразу после шапки, но до основного макета, идёт пустой `<div>`:
```html
<div class="sidebar-overlay" id="sidebarOverlay"></div>
```
Он будет показан только в мобильной версии, когда сайдбар открыт. В десктопном режиме он постоянно скрыт (`display: none`). Его клик также будет закрывать сайдбар.

### 3.3. Основной контейнер layout и сайдбар

Главный контейнер `<div class="layout">` объединяет сайдбар и основной контент. Это флекс-контейнер, который в десктопе выстраивает детей в строку, а на мобильных – в колонку.

Сам сайдбар (`<aside class="sidebar" id="sidebar">`) содержит несколько внутренних блоков:
- Чипсы (кнопки-вкладки) «Все валюты» и «Избранное».
- Поисковый блок с двумя полями и кнопкой обмена местами.
- Контейнер со списком валют.
- Заглушка для пустого избранного.
- Кнопка «Свернуть» (показывается только на мобильных).

Важнейший идентификатор `id="sidebar"` позволяет JavaScript легко найти элемент.

Обратите внимание на начальный класс `visible` у заглушки избранного – мы используем его для управления видимостью через JS.

### 3.4. Основной контент и подвал

В `<main class="main-content">` находится всё, что справа от сайдбара: заголовки, калькулятор, блог. Вёрстка калькулятора здесь не принципиальна для темы сайдбара.

Подвал стандартный, прижимается к низу страницы благодаря флексам.

---

## 4. CSS: стилизация и адаптивность сайдбара

Все стили собраны в `css/styles.css`. Мы сгруппировали их по смысловым блокам и снабдили комментариями. Разберём ключевые моменты, отвечающие за поведение сайдбара.

### 4.1. CSS-переменные и темы

В самом начале файла мы определяем переменные для тёмной и светлой тем. Переключение основано на атрибуте `data-bs-theme` у элемента `<html>`:

```css
:root,
[data-bs-theme="dark"] {
  --sidebar-bg: #1b1e22;
  /* ... */
}
[data-bs-theme="light"] {
  --sidebar-bg: #f8f9fa;
  /* ... */
}
```

Сам сайдбар использует переменную:
```css
.sidebar {
  background: var(--sidebar-bg);
  /* ... */
}
```
Таким образом, смена атрибута автоматически обновляет фон и другие цвета без перезагрузки страницы.

### 4.2. Базовые стили сайдбара для десктопа

По умолчанию сайдбар ведёт себя как `sticky`:
```css
.sidebar {
  width: 300px;
  position: sticky;
  top: 56px;          /* высота шапки */
  height: calc(100vh - 56px);
  overflow-y: auto;
  transition: transform 0.3s ease;
  /* ... */
}
```
Почему `sticky`, а не `fixed`? Потому что нам нужно, чтобы сайдбар участвовал в потоке flex-контейнера и не перекрывал контент. `Sticky` работает именно так: элемент ведёт себя как обычный блок, пока не достигнет указанного `top`, а затем «прилипает». В результате контент справа никогда не заезжает под сайдбар.

### 4.3. Медиазапрос: мобильная версия

При ширине экрана 1024px и меньше срабатывает медиазапрос, который полностью переопределяет поведение сайдбара:

```css
@media (max-width: 1024px) {
  .sidebar {
    position: fixed;
    top: 56px;
    left: 0;
    height: calc(100vh - 56px);
    transform: translateX(-100%);
    width: 280px;
    z-index: 1060;
  }
  .sidebar.open {
    transform: translateX(0);
  }
  .sidebar-close-mobile { display: block; }
  .layout { flex-direction: column; }
  /* ... */
}
```

Что здесь происходит:
- Сайдбар становится `fixed`, чтобы находиться поверх контента.
- Изначально он сдвинут за левый край на 100% своей ширины с помощью `transform: translateX(-100%)`. Это скрывает его визуально.
- Когда JavaScript добавляет класс `open`, применяется `transform: translateX(0)`, и сайдбар плавно выезжает. Плавность обеспечивается `transition: transform 0.3s ease`, заданным в базовых стилях.
- Увеличиваем `z-index` до 1060 (оверлей имеет 1050), чтобы сайдбар был поверх затемнения.
- Кнопка закрытия, ранее скрытая (`display: none`), теперь показывается.
- Основной контейнер `layout` переключается на вертикальное направление – контент уходит вниз.

Таким образом, один и тот же HTML-элемент адаптируется под разные устройства исключительно за счёт CSS.

### 4.4. Overlay

Оверлей изначально скрыт и активируется добавлением класса `active` через JavaScript:
```css
.sidebar-overlay {
  display: none;
  position: fixed;
  top: 56px; left: 0;
  width: 100%; height: calc(100% - 56px);
  background: rgba(0,0,0,0.4);
  z-index: 1050;
}
.sidebar-overlay.active {
  display: block;
}
```
При клике на него мы убираем класс `active`, что скрывает затемнение.

### 4.5. Дополнительный адаптив для очень узких экранов

Второй медиазапрос (`max-width: 600px`) перестраивает поля калькулятора в столбик. К сайдбару это прямого отношения не имеет, но показывает гибкость подхода.

---

## 5. JavaScript: логика управления сайдбаром

Теперь перейдём к тому, что заставляет сайдбар открываться и закрываться. Код находится в `js/sidebar.js` и представляет собой чистый модуль без зависимостей от других скриптов.

### 5.1. Инициализация и поиск элементов

Всё начинается после полной загрузки DOM:
```javascript
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const closeBtn = document.getElementById('sidebarCloseBtn');
  if (!sidebar || !hamburgerBtn) return;
  // ... функции и обработчики
});
```
Мы проверяем наличие ключевых элементов и, если их нет, просто выходим – это позволяет использовать скрипт на страницах без сайдбара.

### 5.2. Функции открытия и закрытия

```javascript
function openSidebar() {
  sidebar.classList.add('open');
  if (overlay) overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeSidebar() {
  sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}
```
Логика проста:
- Добавляем/убираем класс `open` – именно он запускает CSS-анимацию выезда.
- Добавляем/убираем класс `active` у оверлея.
- Блокируем/разблокируем прокрутку страницы через `overflow` у `body`. Это важно, чтобы под оверлеем контент не скроллился.

### 5.3. Обработчики событий

На гамбургер вешается функция `toggleSidebar`, которая переключает состояние:
```javascript
hamburgerBtn.addEventListener('click', () => {
  sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
});
```
Кнопка закрытия и клик по оверлею вызывают `closeSidebar()`.

Дополнительно мы слушаем нажатие клавиши Escape на всей странице:
```javascript
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && sidebar.classList.contains('open')) {
    closeSidebar();
  }
});
```
Так сайдбар можно закрыть без использования мыши – это улучшает доступность.

### 5.4. Обработчик ресайза – важная деталь

Представьте: пользователь открыл сайдбар на мобильном (ширина 600px), а затем повернул устройство или изменил размер окна до 1200px. Если ничего не предпринять, сайдбар останется в состоянии `open`, но так как медиазапрос уже не применяет `transform`, сайдбар встанет на своё обычное место и будет видим. Однако `body` останется с `overflow: hidden`, и страница перестанет скроллиться. Чтобы избежать этого, мы добавили:
```javascript
window.addEventListener('resize', () => {
  if (window.innerWidth > 1024) {
    closeSidebar();
  }
});
```
При переходе в десктопный режим мы принудительно закрываем сайдбар, убираем оверлей и восстанавливаем прокрутку. Это делает интерфейс надёжным.

### 5.5. Почему мы не используем Bootstrap для сайдбара?

Многие проекты применяют offcanvas-компонент Bootstrap, но в нашем случае требовалось более гибкое решение: сайдбар на десктопах должен быть именно `sticky`, а не просто скрытым. Стандартный offcanvas всегда является `fixed` и требует дополнительной обёртки. Наш подход легче и даёт полный контроль над анимацией и поведением.

---

## 6. Переключение темы и его связь с сайдбаром

Хотя переключение темы не основная тема статьи, оно напрямую влияет на сайдбар, поэтому разберём ключевые моменты.

Задача модуля `theme.js` – управлять атрибутом `data-bs-theme` на элементе `<html>` и сохранять выбор в `localStorage`. Почему именно `<html>`, а не `body`? Потому что CSS-переменные, отвечающие за цвета, привязаны к этому атрибуту:

```css
[data-bs-theme="light"] {
  --sidebar-bg: #f8f9fa;
}
```

Когда пользователь нажимает кнопку темы, мы считываем текущий атрибут, инвертируем его и обновляем:
```javascript
html.setAttribute('data-bs-theme', newTheme);
localStorage.setItem('index-mono-theme', newTheme);
```
Всё! Все элементы, включая сайдбар, мгновенно перекрашиваются благодаря переменным.

В начальный момент мы проверяем сохранённое значение или системные предпочтения, чтобы сразу установить нужную тему без мигания. Для этого в `<html>` заранее прописан `data-bs-theme="dark"`, а JS, если надо, меняет его на `light`. Это гарантирует, что до выполнения скрипта страница будет тёмной.

Иконка кнопки (луна/солнце) также обновляется в функции `setTheme`.

Такой подход изолирует логику темы от других модулей и позволяет легко её повторно использовать.

---

## 7. Вкладки в сайдбаре (tabs.js) – кратко

Файл `tabs.js` отвечает за переключение между «Все валюты» и «Избранное». Это часть сайдбара, но её реализация проста и не влияет на адаптивность. При клике на кнопку-чипс мы:

- Переносим класс `active` на нужную кнопку.
- Показываем/скрываем контейнер с валютами (`allCurrenciesContainer`).
- Показываем/скрываем заглушку «Избранные направления отсутствуют» через класс `visible`.

Никакой сложной логики, только переключение видимости. Важно лишь проверить, что все элементы существуют.

---

## 8. Остальные модули: swap.js и search-demo.js

Эти файлы решают локальные задачи и не требуют детального разбора в рамках статьи про сайдбар.

`swap.js` содержит функцию, которая меняет местами значения двух полей (по их `id`) – это нужно для удобства пользователей. Кнопки обмена есть и в сайдбаре, и в основном калькуляторе.

`search-demo.js` – временная заглушка, выводящая `alert` при нажатии на кнопку «Найти». В будущем сюда можно добавить AJAX-запрос.

Их наличие демонстрирует, как можно добавлять новые функции, не затрагивая основную логику сайдбара.

---

## 9. Почему такое разделение важно

Вынос стилей в отдельный файл и разбиение JavaScript на модули даёт несколько преимуществ:

1. **Чистота HTML** – разметка остаётся семантичной и легко читаемой.
2. **Переиспользование** – модуль `theme.js` можно подключить на любой странице, где нужна тема.
3. **Простота поддержки** – чтобы исправить баг с сайдбаром, вы идёте в один файл `sidebar.js`.
4. **Параллельная работа** – несколько разработчиков могут одновременно править разные модули без конфликтов.

Наш проект не использует сборщики (Webpack, Vite) и ES6-импорты, но это осознанное решение – для небольшого сервиса достаточно простого разделения с помощью `defer`.

---

## 10. Заключение

Мы прошли весь путь от идеи до полностью рабочего адаптивного сайдбара. На широких экранах он всегда на виду, на мобильных – выезжает по требованию. Цветовая тема переключается без перезагрузки. Код разделён на логические части, и каждая строка имеет понятное объяснение.

Этот подход вы можете применить в любом проекте: интернет-магазине, админке, лендинге. Главное – понимать, что адаптивность закладывается в CSS, а JavaScript лишь управляет состояниями.

Теперь у вас есть не просто набор файлов, а глубокое понимание того, как сделать современный, удобный и поддерживаемый интерфейс. Успешной разработки!
