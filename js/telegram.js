/* Telegram Mini App bootstrap. Authentication must be validated by the backend. */
(function () {
  const tg = window.Telegram && window.Telegram.WebApp;
  window.MetaNovaTelegram = {
    isTelegram: Boolean(tg),
    initData: tg ? tg.initData : "",
    user: tg && tg.initDataUnsafe ? tg.initDataUnsafe.user || null : null,
    ready: function () {
      if (!tg) return;
      try { tg.ready(); tg.expand(); } catch (_) {}
    },
    setHeaderColor: function () {
      if (!tg) return;
      try { tg.setHeaderColor("#090b13"); tg.setBackgroundColor("#090b13"); } catch (_) {}
    }
  };
  window.MetaNovaTelegram.ready();
  window.MetaNovaTelegram.setHeaderColor();
})();