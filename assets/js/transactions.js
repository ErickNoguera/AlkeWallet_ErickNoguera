/* ============================================================
   Alke Wallet - Historial de transacciones (transactions.html)
   Renderiza la tabla de movimientos con filtro por tipo.
   ============================================================ */

$(function () {
  AW.protegerPagina();
  renderNavbar('transactions');

  const u = AW.usuarioActual();

  const ETIQUETAS = {
    deposito: 'Deposito',
    retiro: 'Retiro',
    enviado: 'Enviado',
    recibido: 'Recibido'
  };

  function render() {
    const filtro = $('#filtroTipo').val();
    const busqueda = $('#buscarMovimiento').val().trim().toLowerCase();

    let txs = AW.transaccionesUsuario(u.id);

    if (filtro && filtro !== 'todos') {
      txs = txs.filter(t => t.tipo === filtro);
    }

    // Busqueda por texto en contraparte o descripcion
    if (busqueda) {
      txs = txs.filter(t =>
        (t.contraparte || '').toLowerCase().indexOf(busqueda) !== -1 ||
        (t.descripcion || '').toLowerCase().indexOf(busqueda) !== -1
      );
    }

    const $tbody = $('#tablaMovimientos tbody').empty();

    if (!txs.length) {
      $tbody.append(
        '<tr><td colspan="5" class="text-center text-muted py-4">' +
        'No hay movimientos que coincidan con la busqueda.</td></tr>'
      );
      $('#resumenMovimientos').text('0 movimientos');
      return;
    }

    txs.forEach(function (t) {
      const ingreso = AW.esIngreso(t.tipo);
      $tbody.append(
        '<tr>' +
          '<td>' + AW.formatFecha(t.fecha) + '</td>' +
          '<td><span class="badge aw-badge-' + t.tipo + '">' + (ETIQUETAS[t.tipo] || t.tipo) + '</span></td>' +
          '<td>' + t.contraparte + '</td>' +
          '<td class="text-muted">' + (t.descripcion || '-') + '</td>' +
          '<td class="text-end fw-semibold ' + (ingreso ? 'text-success' : 'text-danger') + '">' +
            (ingreso ? '+ ' : '- ') + AW.formatCLP(t.monto) +
          '</td>' +
        '</tr>'
      );
    });

    // Resumen: cantidad y monto neto
    const neto = txs.reduce((s, t) => s + (AW.esIngreso(t.tipo) ? t.monto : -t.monto), 0);
    $('#resumenMovimientos').text(txs.length + ' movimientos - Neto ' + AW.formatCLP(neto));

    // Aparicion progresiva de las filas con jQuery
    $('#tablaMovimientos tbody tr').hide().each(function (i) {
      $(this).delay(40 * i).fadeIn(150);
    });
  }

  $('#filtroTipo').on('change', render);
  $('#buscarMovimiento').on('input', render);

  render();
});
