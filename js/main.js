(function () {
  var form = document.getElementById('formular');
  var modus = 'feier';
  var $ = function (id) { return document.getElementById(id); };
  var vName = $('v-name'), vListe = $('v-liste'), vPreis = $('v-preis'), vSumme = $('v-summe');
  var gaeste = $('gaeste'), gaesteZahl = $('gaeste-zahl'), gaesteTipp = $('gaeste-tipp');
  var bestaetigt = $('bestaetigt');

  var heute = new Date();
  var iso = function (d) { return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
  ['datum', 'anreise', 'abreise'].forEach(function (id) { $(id).min = iso(heute); });

  var datumText = function (wert) {
    if (!wert) return '';
    var d = new Date(wert + 'T12:00:00');
    return d.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  };
  var kurzDatum = function (wert) {
    if (!wert) return '';
    return new Date(wert + 'T12:00:00').toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
  };
  var gewaehlt = function (name) { var el = form.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : ''; };
  var zeile = function (dt, dd) { return dd ? '<dt>' + dt + '</dt><dd>' + dd + '</dd>' : ''; };
  var esc = function (s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  function naechte() {
    var a = $('anreise').value, b = $('abreise').value;
    if (!a || !b) return 0;
    var n = Math.round((new Date(b) - new Date(a)) / 86400000);
    return n > 0 ? n : 0;
  }

  function aktualisieren() {
    var name = $('name').value.trim();
    var html = '';
    if (modus === 'feier') {
      var g = +gaeste.value;
      gaesteZahl.innerHTML = g + ' <small>Gäste</small>';
      gaesteTipp.textContent = g >= 150
        ? 'Der ganze Wintergarten: Platz für bis zu 150 Gäste.'
        : g > 90 ? 'Der Wintergarten bietet Platz für bis zu 150 Gäste.'
        : 'Der Wintergarten ist teilbar, so passt der Raum zu Ihrer Runde.';
      vName.textContent = name || 'Feier im Wintergarten';
      $('v-bild').hidden = false;
      html += zeile('Anlass', gewaehlt('anlass'));
      html += zeile('Termin', datumText($('datum').value) || 'noch offen');
      html += zeile('Gäste', g + (g >= 150 ? ' (ganzer Saal)' : ''));
      html += zeile('Bewirtung', gewaehlt('essen'));
      html += zeile('Zimmer', $('mitzimmer').checked ? 'bitte mit anfragen' : '');
      vPreis.hidden = true;
    } else {
      var opt = $('zimmerart').selectedOptions[0];
      var n = naechte(), anzahl = +$('anzahl').value;
      vName.textContent = name || 'Übernachtung';
      $('v-bild').hidden = true;
      html += zeile('Anreise', kurzDatum($('anreise').value) || 'noch offen');
      html += zeile('Abreise', kurzDatum($('abreise').value) || 'noch offen');
      html += zeile('Nächte', n ? String(n) : '');
      html += zeile('Zimmer', anzahl + ' × ' + opt.dataset.kurz);
      vPreis.hidden = false;
      vSumme.textContent = n ? (n * anzahl * +opt.value).toLocaleString('de-DE') + ' €' : (anzahl * +opt.value) + ' € / Nacht';
    }
    vListe.innerHTML = html;
  }

  function setzeModus(neu, scrollen) {
    modus = neu;
    document.querySelectorAll('.umschalter button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.modus === neu ? 'true' : 'false'); });
    document.querySelectorAll('[data-teil]').forEach(function (t) { t.hidden = t.dataset.teil !== neu; });
    $('senden-knopf').textContent = neu === 'feier' ? 'Feier anfragen' : 'Zimmer anfragen';
    bestaetigt.hidden = true; bestaetigt.classList.remove('da');
    aktualisieren();
  }

  document.querySelectorAll('[data-modus]').forEach(function (el) {
    el.addEventListener('click', function () { setzeModus(el.dataset.modus); });
  });

  $('weniger').addEventListener('click', function () { gaeste.value = Math.max(10, +gaeste.value - 10); aktualisieren(); });
  $('mehr').addEventListener('click', function () { gaeste.value = Math.min(150, +gaeste.value + 10); aktualisieren(); });
  $('anreise').addEventListener('change', function () {
    var a = $('anreise').value;
    if (!a) return;
    $('abreise').min = a;
    if (!$('abreise').value || $('abreise').value <= a) {
      var d = new Date(a + 'T12:00:00'); d.setDate(d.getDate() + 1); $('abreise').value = iso(d);
    }
    aktualisieren();
  });
  form.addEventListener('input', aktualisieren);
  form.addEventListener('change', aktualisieren);
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    $('v-titel').textContent = 'Anfrage vorbereitet';
    bestaetigt.hidden = false;
    requestAnimationFrame(function () { requestAnimationFrame(function () { bestaetigt.classList.add('da'); }); });
  });
  form.addEventListener('input', function () { $('v-titel').textContent = 'Ihre Anfrage'; });

  // Daumenleiste auf dem Handy erst nach dem ersten Bildschirm zeigen
  var daumen = $('daumen');
  var hero = document.querySelector('.hero');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { daumen.classList.toggle('sichtbar', !e[0].isIntersecting); }, { threshold: 0.05 }).observe(hero);
  } else { daumen.classList.add('sichtbar'); }

  aktualisieren();
})();
