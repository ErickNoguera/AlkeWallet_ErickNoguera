/* ============================================================
   Alke Wallet - Logica comun a todas las pantallas
   Maneja: almacenamiento (localStorage), sesion, datos semilla
   y el render de la barra de navegacion.
   ============================================================ */

const AW = {
  KEYS: {
    users: 'aw_users',
    session: 'aw_session',
    contacts: 'aw_contacts',
    transactions: 'aw_transactions'
  },

  /* ---------- Utilidades ---------- */
  formatCLP(valor) {
    return '$' + Number(valor || 0).toLocaleString('es-CL');
  },

  hoyISO() {
    return new Date().toISOString();
  },

  formatFecha(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('es-CL') + ' ' +
           d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  },

  uid(prefijo) {
    return prefijo + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  },

  /* ---------- Acceso a almacenamiento ---------- */
  leer(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch (e) {
      return [];
    }
  },

  escribir(key, valor) {
    localStorage.setItem(key, JSON.stringify(valor));
  },

  _diasAtras(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
  },

  /* ---------- Datos semilla ---------- */
  init() {
    if (localStorage.getItem(this.KEYS.users)) return;

    const userId = 'user_demo';

    this.escribir(this.KEYS.users, [{
      id: userId,
      nombre: 'Erick Noguera',
      email: 'usuario@alke.com',
      password: 'alke1234',
      saldo: 150000
    }]);

    this.escribir(this.KEYS.contacts, [
      { id: this.uid('c'), ownerId: userId, nombre: 'Maria Perez', email: 'maria@alke.com' },
      { id: this.uid('c'), ownerId: userId, nombre: 'Juan Soto', email: 'juan@alke.com' },
      { id: this.uid('c'), ownerId: userId, nombre: 'Camila Rojas', email: 'camila@alke.com' }
    ]);

    this.escribir(this.KEYS.transactions, [
      { id: this.uid('t'), userId, tipo: 'deposito', monto: 100000, fecha: this._diasAtras(6), contraparte: 'Carga inicial', descripcion: 'Apertura de cuenta' },
      { id: this.uid('t'), userId, tipo: 'recibido', monto: 75000, fecha: this._diasAtras(4), contraparte: 'Juan Soto', descripcion: 'Pago compartido' },
      { id: this.uid('t'), userId, tipo: 'enviado', monto: 25000, fecha: this._diasAtras(2), contraparte: 'Maria Perez', descripcion: 'Almuerzo' }
    ]);
  },

  /* ---------- Sesion ---------- */
  usuarioActual() {
    const id = localStorage.getItem(this.KEYS.session);
    if (!id) return null;
    return this.leer(this.KEYS.users).find(u => u.id === id) || null;
  },

  guardarUsuario(usuario) {
    const users = this.leer(this.KEYS.users);
    const i = users.findIndex(u => u.id === usuario.id);
    if (i >= 0) {
      users[i] = usuario;
      this.escribir(this.KEYS.users, users);
    }
  },

  iniciarSesion(email, password) {
    const u = this.leer(this.KEYS.users).find(x =>
      x.email.toLowerCase() === String(email).toLowerCase() && x.password === password
    );
    if (u) {
      localStorage.setItem(this.KEYS.session, u.id);
      return u;
    }
    return null;
  },

  cerrarSesion() {
    localStorage.removeItem(this.KEYS.session);
    window.location.href = 'login.html';
  },

  // Redirige al login si no hay sesion activa (guardian de pantallas internas)
  protegerPagina() {
    if (!this.usuarioActual()) {
      window.location.href = 'login.html';
    }
  },

  /* ---------- Transacciones ---------- */
  transaccionesUsuario(userId) {
    return this.leer(this.KEYS.transactions)
      .filter(t => t.userId === userId)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  },

  agregarTransaccion(tx) {
    const todas = this.leer(this.KEYS.transactions);
    todas.push(tx);
    this.escribir(this.KEYS.transactions, todas);
  },

  esIngreso(tipo) {
    return tipo === 'deposito' || tipo === 'recibido';
  },

  /* ---------- Contactos ---------- */
  contactosUsuario(userId) {
    return this.leer(this.KEYS.contacts).filter(c => c.ownerId === userId);
  },

  agregarContacto(contacto) {
    const todos = this.leer(this.KEYS.contacts);
    todos.push(contacto);
    this.escribir(this.KEYS.contacts, todos);
  }
};

// Inicializa los datos semilla al cargar cualquier pagina
AW.init();

/* ------------------------------------------------------------
   renderNavbar: inyecta la barra de navegacion en las
   pantallas internas. Recibe el id de la seccion activa.
   ------------------------------------------------------------ */
function renderNavbar(activo) {
  const u = AW.usuarioActual();
  if (!u) return;

  const link = (href, texto, id) =>
    '<li class="nav-item">' +
      '<a class="nav-link ' + (activo === id ? 'active' : '') + '" href="' + href + '">' + texto + '</a>' +
    '</li>';

  const html =
    '<nav class="navbar navbar-expand-lg navbar-dark aw-navbar">' +
      '<div class="container">' +
        '<a class="navbar-brand fw-bold" href="menu.html"><span class="aw-logo-dot"></span> Alke Wallet</a>' +
        '<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#awNav">' +
          '<span class="navbar-toggler-icon"></span>' +
        '</button>' +
        '<div class="collapse navbar-collapse" id="awNav">' +
          '<ul class="navbar-nav me-auto">' +
            link('menu.html', 'Inicio', 'menu') +
            link('deposit.html', 'Depositar', 'deposit') +
            link('sendmoney.html', 'Enviar dinero', 'sendmoney') +
            link('transactions.html', 'Movimientos', 'transactions') +
          '</ul>' +
          '<div class="d-flex align-items-center gap-3">' +
            '<span class="text-white-50 small d-none d-lg-inline">Hola, ' + u.nombre.split(' ')[0] + '</span>' +
            '<span class="badge aw-badge-saldo" id="navSaldo">' + AW.formatCLP(u.saldo) + '</span>' +
            '<button class="btn btn-sm btn-outline-light" id="btnLogout">Cerrar sesion</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</nav>';

  $('#navbar').html(html);
  $('#btnLogout').on('click', () => AW.cerrarSesion());
}
