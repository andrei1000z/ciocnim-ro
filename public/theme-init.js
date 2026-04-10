try {
  var t = localStorage.getItem('c_theme');
  if (t === 'dark') {
    ;
  } else if (t === 'light') {
    document.documentElement.classList.add('light');
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme:dark)').matches) {
    ;
  } else {
    document.documentElement.classList.add('light');
  }
} catch (e) {
  document.documentElement.classList.add('light');
}
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(function () {});
}
