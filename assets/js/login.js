/* ============================================================
   Alke Wallet - Pantalla de inicio de sesion (login.html)
   Valida credenciales y crea la sesion del usuario.
   ============================================================ */

$(function () {
  // Si ya existe una sesion activa, ir directo al menu
  if (AW.usuarioActual()) {
    window.location.href = 'menu.html';
    return;
  }

  const $form = $('#formLogin');
  const $alert = $('#loginAlert');

  $form.on('submit', function (e) {
    e.preventDefault();
    $alert.addClass('d-none').text('');

    // Validacion nativa de HTML5 + estilos de Bootstrap
    if (!$form[0].checkValidity()) {
      $form.addClass('was-validated');
      return;
    }

    const email = $('#email').val().trim();
    const password = $('#password').val();

    const usuario = AW.iniciarSesion(email, password);

    if (!usuario) {
      $alert
        .removeClass('d-none')
        .text('Credenciales incorrectas. Verifica tu correo y contrasena.')
        .hide().fadeIn(200);
      $('#password').val('');
      return;
    }

    // Ingreso correcto
    $('#btnLogin').prop('disabled', true).text('Ingresando...');
    setTimeout(() => { window.location.href = 'menu.html'; }, 400);
  });

  // Rellena las credenciales de la cuenta demo
  $('#btnDemo').on('click', function () {
    $('#email').val('usuario@alke.com');
    $('#password').val('alke1234');
  });
});
