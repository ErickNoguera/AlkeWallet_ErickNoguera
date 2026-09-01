# Alke Wallet - Erick Noguera

Front-end dinamico de una billetera digital, desarrollado para el **Modulo 2:
Fundamentos del desarrollo Front-end**. Permite iniciar sesion, administrar
fondos, simular transferencias entre contactos y consultar el historial de
transacciones.

## Tecnologias

- HTML5 semantico
- CSS3 (diseno responsive, paleta fintech)
- JavaScript (ES6)
- [Bootstrap 5.3](https://getbootstrap.com/) (grid, navbar, formularios, modales)
- [jQuery 3.7](https://jquery.com/) + jQuery UI (manipulacion del DOM, eventos,
  animaciones y autocompletar)

> Bootstrap, jQuery y jQuery UI se cargan por CDN, por lo que se necesita
> conexion a internet la primera vez que se abre la app.

## Estructura del proyecto

```
AlkeWallet_ErickNoguera/
├── index.html          Punto de entrada (redirige a login)
├── login.html          Inicio de sesion
├── menu.html           Menu principal / resumen financiero
├── deposit.html        Depositos y retiros
├── sendmoney.html      Envio de dinero y gestion de contactos
├── transactions.html   Historial de transacciones
└── assets/
    ├── css/
    │   └── styles.css  Estilos generales y responsive
    └── js/
        ├── app.js          Logica comun: almacenamiento, sesion, navbar
        ├── login.js        Validacion de credenciales
        ├── menu.js         Resumen y ultimos movimientos
        ├── deposit.js      Evento "Realizar deposito" / retiro
        ├── sendmoney.js    Transferencias, autocompletar y nuevo contacto
        └── transactions.js Render y filtro del historial
```

## Como ejecutar

Abrir `index.html` en el navegador (o servir la carpeta con Live Server en
Visual Studio Code).

## Cuenta de prueba

| Campo      | Valor              |
|------------|--------------------|
| Correo     | `usuario@alke.com` |
| Contrasena | `alke1234`         |

Tambien esta disponible el boton **"Usar credenciales de prueba"** en la
pantalla de login.

## Funcionalidades

- **Inicio de sesion** con validacion de credenciales y guardian de sesion en
  las pantallas internas.
- **Administracion de fondos:** ver saldo, realizar depositos y retiros con
  validacion de saldo disponible.
- **Envio y recepcion de fondos:** transferencias simuladas a contactos,
  autocompletar en la busqueda de contactos y simulacion de recepcion de
  fondos propios.
- **Historial de transacciones:** registro completo con filtro por tipo y
  resumen de monto neto.

Los datos se guardan en `localStorage`, por lo que persisten entre recargas del
navegador.

## Estrategia de ramas (GIT)

| Rama                     | Contenido                          |
|--------------------------|------------------------------------|
| `main`                   | Codigo estable                     |
| `feature/login`          | Funcionalidad de login             |
| `feature/transacciones`  | Envio y recepcion de fondos        |
| `feature/depositos`      | Depositos y saldo                  |

## Modulo: Fundamentos de Bases de Datos Relacionales

La carpeta [`database/`](database/) contiene el entregable del modulo de bases de
datos: el script `AlkeWallet.sql` (MySQL 8), el diagrama entidad-relacion y el
documento Word con todas las sentencias SQL y resultados. Ver
[`database/README.md`](database/README.md).
