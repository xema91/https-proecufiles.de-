/* ProECU Files - Multi-language + multi-currency (Phase 1)
   - Base currency: EUR
   - No external FX APIs (manual rates)
   - Persist language/currency in localStorage
*/

(() => {
  const STORAGE = {
    currency: 'proecu_currency',
    lang: 'proecu_lang'
  };

  // Editable manual FX rates (base: EUR)
  // Update here in Phase 2 or replace with live rates.
  const FX = {
    base: 'EUR',
    rates: {
      EUR: 1,
      USD: 1.09,
      GBP: 0.85,
      CHF: 0.97,
      CNY: 7.85,
      RUB: 98.0
    },
    decimals: {
      EUR: 0,
      USD: 0,
      GBP: 0,
      CHF: 0,
      CNY: 0,
      RUB: 0
    },
    symbols: {
      EUR: '€',
      USD: '$',
      GBP: '£',
      CHF: 'CHF',
      CNY: '¥',
      RUB: '₽'
    }
  };

  function getCurrency() {
    const saved = localStorage.getItem(STORAGE.currency);
    if (saved && FX.rates[saved]) return saved;
    return 'EUR';
  }

  function setCurrency(ccy) {
    if (!FX.rates[ccy]) return;
    localStorage.setItem(STORAGE.currency, ccy);
    applyCurrency(ccy);
  }

  function formatMoney(amount, ccy) {
    const dec = FX.decimals[ccy] ?? 0;
    const sym = FX.symbols[ccy] ?? ccy;
    const rounded = (Math.round(amount * Math.pow(10, dec)) / Math.pow(10, dec)).toFixed(dec);

    // Simple formatting: symbol before for $,£,€; after for CHF,CNY,RUB can vary, keep consistent.
    if (ccy === 'CHF') return `${rounded} ${sym}`;
    if (ccy === 'RUB') return `${rounded} ${sym}`;
    if (ccy === 'CNY') return `${sym}${rounded}`;
    return `${sym}${rounded}`;
  }

  function applyCurrency(ccy) {
    document.documentElement.dataset.currency = ccy;

    const els = document.querySelectorAll('[data-eur]');
    els.forEach(el => {
      const eur = Number(el.getAttribute('data-eur'));
      if (!Number.isFinite(eur)) return;
      const converted = eur * FX.rates[ccy];
      el.textContent = formatMoney(converted, ccy);
    });

    const labelEls = document.querySelectorAll('[data-currency-label]');
    labelEls.forEach(el => { el.textContent = ccy; });
  }

  function hookSelectors() {
    const currencySel = document.querySelector('[data-currency-select]');
    if (currencySel) {
      currencySel.value = getCurrency();
      currencySel.addEventListener('change', (e) => setCurrency(e.target.value));
    }
  }

  function hookLangPersistence() {
    const lang = document.documentElement.getAttribute('lang') || 'es';
    localStorage.setItem(STORAGE.lang, lang);

    const langSel = document.querySelector('[data-lang-select]');
    if (langSel) {
      langSel.value = lang;
      langSel.addEventListener('change', (e) => {
        const v = e.target.value;
        // Keep paths stable as /<lang>/
        window.location.href = `/${v}/`;
      });
    }
  }

  function init() {
    hookSelectors();
    hookLangPersistence();
    applyCurrency(getCurrency());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
