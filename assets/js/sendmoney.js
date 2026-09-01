/* ============================================================
   Alke Wallet - Enviar dinero (sendmoney.html)
   - Simula transferencias a contactos
   - Autocompletar de contactos con jQuery UI
   - Alta de contactos mediante modal de Bootstrap
   - Simulacion de recepcion de fondos propios
   ============================================================ */

$(function () {
  AW.protegerPagina();
  renderNavbar('sendmoney');

  const u = AW.usuarioActual();
  $('#saldoEnvio').text(AW.formatCLP(u.saldo));

  /* ---------- Contactos: autocompletar + listado ---------- */
  function refrescarContactos() {
    const contactos = AW.contactosUsuario(u.id);

    // Autocompletar con jQuery UI en el campo "Buscar contacto"
    $('#buscarContacto').autocomplete({
      minLength: 0,
      source: contactos.map(c => ({
        label: c.nombre + ' (' + c.email + ')',
        value: c.nombre,
        email: c.email
      })),
      select: function (event, ui) {
        $('#contactoEmail').val(ui.item.email);
      }
    }).on('focus', function () {
      $(this).autocomplete('search', '');
    });

    // Listado visible de contactos
    const $ul = $('#listaContactos').empty();
    if (!contactos.length) {
      $ul.append('<p class="text-muted small mb-0">Aun no tienes contactos.</p>');
    }
    contactos.forEach(function (c) {
      $ul.append(
        '<button type="button" class="list-group-item list-group-item-action" ' +
          'data-nombre="' + c.nombre + '" data-email="' + c.email + '">' +
          c.nombre + '<small class="text-muted d-block">' + c.email + '</small>' +
        '</button>'
      );
    });

    $ul.find('button').on('click', function () {
      $('#buscarContacto').val($(this).data('nombre'));
      $('#contactoEmail').val($(this).data('email'));
    });
  }
  refrescarContactos();

  /* ---------- Transferencia ---------- */
  const $form = $('#formEnvio');
  const $msg = $('#msgEnvio');

  $form.on('submit', function (e) {
    e.preventDefault();
    $msg.addClass('d-none');

    const nombre = $('#buscarContacto').val().trim();
    const monto = Number($('#montoEnvio').val());
    const descripcion = $('#descripcionEnvio').val().trim() || 'Transferencia';

    if (!$form[0].checkValidity() || !nombre || !monto || monto <= 0) {
      $form.addClass('was-validated');
      return;
    }

    if (monto > u.saldo) {
      mostrar('danger', 'Saldo insuficiente para completar la transferencia.');
      return;
    }

    u.saldo -= monto;
    AW.guardarUsuario(u);
    AW.agregarTransaccion({
      id: AW.uid('t'),
      userId: u.id,
      tipo: 'enviado',
      monto: monto,
      fecha: AW.hoyISO(),
      contraparte: nombre,
      descripcion: descripcion
    });

    actualizarSaldo();
    mostrar('success', 'Enviaste ' + AW.formatCLP(monto) + ' a ' + nombre + '.');
    $form[0].reset();
    $form.removeClass('was-validated');
  });

  /* ---------- Simular recepcion de fondos propios ---------- */
  $('#btnRecibir').on('click', function () {
    const monto = Number(prompt('Monto a recibir (simulado):', '20000'));
    if (!monto || monto <= 0) return;

    u.saldo += monto;
    AW.guardarUsuario(u);
    AW.agregarTransaccion({
      id: AW.uid('t'),
      userId: u.id,
      tipo: 'recibido',
      monto: monto,
      fecha: AW.hoyISO(),
      contraparte: 'Abono recibido',
      descripcion: 'Fondos propios'
    });

    actualizarSaldo();
    mostrar('success', 'Recibiste ' + AW.formatCLP(monto) + '.');
  });

  /* ---------- Alta de contacto (modal Bootstrap) ---------- */
  $('#formContacto').on('submit', function (e) {
    e.preventDefault();

    if (!this.checkValidity()) {
      $(this).addClass('was-validated');
      return;
    }

    const nombre = $('#nuevoNombre').val().trim();
    const email = $('#nuevoEmail').val().trim();

    AW.agregarContacto({ id: AW.uid('c'), ownerId: u.id, nombre: nombre, email: email });
    refrescarContactos();

    this.reset();
    $(this).removeClass('was-validated');
    bootstrap.Modal.getInstance(document.getElementById('modalContacto')).hide();
    mostrar('success', 'Contacto "' + nombre + '" agregado.');
  });

  function actualizarSaldo() {
    $('#saldoEnvio').text(AW.formatCLP(u.saldo));
    $('#navSaldo').text(AW.formatCLP(u.saldo));
  }

  function mostrar(tipo, texto) {
    $msg
      .removeClass('d-none alert-success alert-danger')
      .addClass('alert-' + tipo)
      .text(texto)
      .hide().fadeIn(200);
  }
});
