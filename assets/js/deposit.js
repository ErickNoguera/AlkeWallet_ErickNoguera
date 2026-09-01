/* ============================================================
   Alke Wallet - Administracion de fondos (deposit.html)
   Evento "Realizar deposito" / retiro con actualizacion
   dinamica del saldo.
   ============================================================ */

$(function () {
  AW.protegerPagina();
  renderNavbar('deposit');

  const u = AW.usuarioActual();
  $('#saldoDeposito').text(AW.formatCLP(u.saldo));

  const $form = $('#formDeposito');
  const $msg = $('#msgDeposito');

  $form.on('submit', function (e) {
    e.preventDefault();
    $msg.addClass('d-none');

    const monto = Number($('#monto').val());
    const operacion = $('input[name="operacion"]:checked').val(); // 'deposito' | 'retiro'
    const descripcion = $('#descripcion').val().trim() ||
      (operacion === 'deposito' ? 'Deposito de fondos' : 'Retiro de fondos');

    if (!$form[0].checkValidity() || !monto || monto <= 0) {
      $form.addClass('was-validated');
      return;
    }

    if (operacion === 'retiro' && monto > u.saldo) {
      mostrar('danger', 'Saldo insuficiente para realizar el retiro.');
      return;
    }

    // Actualiza el saldo del usuario y lo persiste
    u.saldo += (operacion === 'deposito' ? monto : -monto);
    AW.guardarUsuario(u);

    AW.agregarTransaccion({
      id: AW.uid('t'),
      userId: u.id,
      tipo: operacion,
      monto: monto,
      fecha: AW.hoyISO(),
      contraparte: operacion === 'deposito' ? 'Recarga propia' : 'Retiro a banco',
      descripcion: descripcion
    });

    // Animacion del contador de saldo con jQuery
    $({ val: u.saldo - (operacion === 'deposito' ? monto : -monto) }).animate(
      { val: u.saldo },
      {
        duration: 500,
        step: function () { $('#saldoDeposito').text(AW.formatCLP(Math.round(this.val))); },
        complete: function () { $('#saldoDeposito').text(AW.formatCLP(u.saldo)); }
      }
    );
    $('#navSaldo').text(AW.formatCLP(u.saldo));

    mostrar('success',
      (operacion === 'deposito' ? 'Deposito realizado' : 'Retiro realizado') +
      ' por ' + AW.formatCLP(monto) + '.');

    $form[0].reset();
    $form.removeClass('was-validated');
  });

  function mostrar(tipo, texto) {
    $msg
      .removeClass('d-none alert-success alert-danger')
      .addClass('alert-' + tipo)
      .text(texto)
      .hide().fadeIn(200);
  }
});
