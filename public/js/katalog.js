(function () {
  var kartu = [].slice.call(document.querySelectorAll('.kartu'));
  var input = document.getElementById('q');
  var form = document.getElementById('form-cari');
  var info = document.getElementById('hasil');
  var kosong = document.getElementById('kosong');
  var params = new URLSearchParams(location.search);
  var kat = params.get('kategori') || '';
  input.value = params.get('q') || '';
  [].forEach.call(document.querySelectorAll('.saring a'), function (a) {
    if (a.getAttribute('data-kat') === kat) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  function tampil() {
    var kata = input.value.trim().toLowerCase();
    var n = 0;
    kartu.forEach(function (k) {
      var cocok = (!kat || k.dataset.kategori === kat) && (!kata || k.dataset.teks.indexOf(kata) > -1);
      k.hidden = !cocok;
      if (cocok) n++;
    });
    info.textContent = n + ' buku ditemukan';
    kosong.hidden = n > 0;
  }
  input.addEventListener('input', tampil);
  form.addEventListener('submit', function (e) { e.preventDefault(); tampil(); });
  tampil();
})();
