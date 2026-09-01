/* ============================================================
   Alke Wallet - Menu principal (menu.html)
   Muestra el resumen financiero y los ultimos movimientos.
   ============================================================ */

$(function () {
  AW.protegerPagina();
  renderNavbar('menu');

  const u = AW.usuarioActual();
  const txs = AW.transaccionesUsuario(u.id);

  // Totales de ingresos y egresos a partir del historial
  const ingresos = txs.filter(t => AW.esIngreso(t.tipo)).reduce((s, t) => s + t.monto, 0);
  const egresos  = txs.filter(t => !AW.esIngreso(t.tipo)).reduce((s, t) => s + t.monto, 0);

  $('#saldoActual').text(AW.formatCLP(u.saldo));
  $('#totalIngresos').text(AW.formatCLP(ingresos));
  $('#totalEgresos').text(AW.formatCLP(egresos));
  $('#nombreUsuario').text(u.nombre);

  // Ultimos movimientos (maximo 4)
  const $lista = $('#ultimosMovimientos').empty();

  if (!txs.length) {
    $lista.append('<li class="list-group-item text-muted">Sin movimientos aun.</li>');
  } else {
    txs.slice(0, 4).forEach(function (t) {
      const ingreso = AW.esIngreso(t.tipo);
      $lista.append(
        '<li class="list-group-item d-flex justify-content-between align-items-center">' +
          '<span>' +
            '<span class="aw-dot ' + (ingreso ? 'aw-dot-in' : 'aw-dot-out') + '"></span>' +
            t.contraparte + ' <small class="text-muted">- ' + AW.formatFecha(t.fecha) + '</small>' +
          '</span>' +
          '<strong class="' + (ingreso ? 'text-success' : 'text-danger') + '">' +
            (ingreso ? '+ ' : '- ') + AW.formatCLP(t.monto) +
          '</strong>' +
        '</li>'
      );
    });
  }

  // Animacion de entrada de las tarjetas con jQuery
  $('.aw-card-anim').each(function (i) {
    $(this)
      .css({ opacity: 0, top: '20px' })
      .delay(80 * i)
      .animate({ opacity: 1, top: '0px' }, 400);
  });
});
