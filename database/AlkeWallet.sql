-- =====================================================================
--  Proyecto : Alke Wallet
--  Modulo   : Fundamentos de Bases de Datos Relacionales
--  Autor    : Erick Noguera
--  Motor    : MySQL 8  (probado en sqliteonline.com - modo MySQL 8)
--  Archivo  : AlkeWallet.sql  -  script completo en orden de ejecucion
-- =====================================================================
--  Nota de diseno: el atributo "contrasena" se nombra sin tilde para
--  garantizar portabilidad del identificador entre motores/consolas.
--  El atributo "correo" corresponde a "correo electronico" del enunciado.
-- =====================================================================


-- =====================================================================
--  LECCION 1  -  Creacion y verificacion de la base de datos
-- =====================================================================
CREATE DATABASE IF NOT EXISTS AlkeWallet
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE AlkeWallet;

-- Verificacion (ejecutar y capturar el resultado)
SHOW DATABASES;
-- SHOW TABLES;                 -- vacio hasta ejecutar la Leccion 4
-- DESCRIBE usuario;            -- disponible tras crear las tablas


-- =====================================================================
--  LECCION 4  -  DDL: definicion de tablas, claves e indices
-- =====================================================================
--  Se crea primero "moneda" porque "usuario" y "transaccion" la
--  referencian por clave foranea.
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS transaccion;
DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS moneda;

-- Entidad: Moneda -----------------------------------------------------
CREATE TABLE moneda (
  currency_id     INT           NOT NULL AUTO_INCREMENT,
  currency_name   VARCHAR(50)   NOT NULL,
  currency_symbol VARCHAR(5)    NOT NULL,
  CONSTRAINT pk_moneda          PRIMARY KEY (currency_id),
  CONSTRAINT uq_moneda_nombre   UNIQUE (currency_name)
) ENGINE=InnoDB;

-- Entidad: Usuario --------------------------------------------------
CREATE TABLE usuario (
  user_id      INT            NOT NULL AUTO_INCREMENT,
  nombre       VARCHAR(100)   NOT NULL,
  correo       VARCHAR(150)   NOT NULL,
  contrasena   VARCHAR(255)   NOT NULL,
  saldo        DECIMAL(15,2)  NOT NULL DEFAULT 0.00,
  currency_id  INT            NOT NULL,
  CONSTRAINT pk_usuario          PRIMARY KEY (user_id),
  CONSTRAINT uq_usuario_correo   UNIQUE (correo),
  CONSTRAINT chk_usuario_saldo   CHECK (saldo >= 0),
  CONSTRAINT fk_usuario_moneda   FOREIGN KEY (currency_id)
        REFERENCES moneda (currency_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE INDEX idx_usuario_moneda ON usuario (currency_id);

-- Entidad: Transaccion --------------------------------------------
CREATE TABLE transaccion (
  transaction_id    INT            NOT NULL AUTO_INCREMENT,
  sender_user_id    INT            NOT NULL,
  receiver_user_id  INT            NOT NULL,
  currency_id       INT            NOT NULL,
  importe           DECIMAL(15,2)  NOT NULL,
  transaction_date  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_transaccion            PRIMARY KEY (transaction_id),
  CONSTRAINT chk_transaccion_importe   CHECK (importe > 0),
  CONSTRAINT chk_transaccion_distinta  CHECK (sender_user_id <> receiver_user_id),
  CONSTRAINT fk_tx_sender   FOREIGN KEY (sender_user_id)
        REFERENCES usuario (user_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_tx_receiver FOREIGN KEY (receiver_user_id)
        REFERENCES usuario (user_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_tx_moneda   FOREIGN KEY (currency_id)
        REFERENCES moneda (currency_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Indices compuestos para acelerar el historial de transacciones
CREATE INDEX idx_tx_sender_fecha   ON transaccion (sender_user_id, transaction_date);
CREATE INDEX idx_tx_receiver_fecha ON transaccion (receiver_user_id, transaction_date);

-- Verificacion de la estructura (ejecutar y capturar)
SHOW TABLES;
DESCRIBE moneda;
DESCRIBE usuario;
DESCRIBE transaccion;
SHOW CREATE TABLE transaccion;

-- ---- Tarea Plus Leccion 4: agregar fecha de creacion --------------
ALTER TABLE usuario
  ADD COLUMN fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  AFTER currency_id;


-- =====================================================================
--  LECCION 3  -  DML: insercion de datos de prueba
-- =====================================================================
INSERT INTO moneda (currency_name, currency_symbol) VALUES
  ('Peso chileno',           '$'),
  ('Dolar estadounidense',   'US$'),
  ('Euro',                   'EUR'),
  ('Real brasileno',         'R$');

INSERT INTO usuario (nombre, correo, contrasena, saldo, currency_id) VALUES
  ('Erick Noguera', 'erick@alke.com',  'hash_pbkdf2_erick',  250000.00, 1),
  ('Maria Perez',   'maria@alke.com',  'hash_pbkdf2_maria',  120000.00, 1),
  ('Juan Soto',     'juan@alke.com',   'hash_pbkdf2_juan',    80000.00, 1),
  ('Camila Rojas',  'camila@alke.com', 'hash_pbkdf2_camila',    500.00, 2),
  ('Bruno Lima',    'bruno@alke.com',  'hash_pbkdf2_bruno',    1500.00, 4);

INSERT INTO transaccion
  (sender_user_id, receiver_user_id, currency_id, importe, transaction_date) VALUES
  (1, 2, 1, 25000.00, '2026-08-01 10:15:00'),
  (2, 3, 1, 10000.00, '2026-08-03 14:20:00'),
  (1, 3, 1,  5000.00, '2026-08-05 09:00:00'),
  (3, 1, 1,  7500.00, '2026-08-10 18:45:00'),
  (4, 5, 2,    50.00, '2026-08-12 12:30:00');


-- =====================================================================
--  CONSULTAS OBLIGATORIAS DEL ENUNCIADO
-- =====================================================================

-- (1) Nombre de la moneda elegida por un usuario especifico (user_id = 1)
SELECT u.user_id,
       u.nombre,
       m.currency_name,
       m.currency_symbol
FROM usuario u
INNER JOIN moneda m ON m.currency_id = u.currency_id
WHERE u.user_id = 1;

-- (2) Todas las transacciones registradas
SELECT t.transaction_id,
       t.sender_user_id,
       t.receiver_user_id,
       t.importe,
       m.currency_symbol,
       t.transaction_date
FROM transaccion t
INNER JOIN moneda m ON m.currency_id = t.currency_id
ORDER BY t.transaction_date;

-- (3) Todas las transacciones realizadas por un usuario especifico
--     (emisor = user_id 1)
SELECT t.transaction_id,
       t.sender_user_id,
       t.receiver_user_id,
       t.importe,
       t.transaction_date
FROM transaccion t
WHERE t.sender_user_id = 1
ORDER BY t.transaction_date;

--     Variante: enviadas O recibidas por el usuario 1
SELECT *
FROM transaccion
WHERE sender_user_id = 1 OR receiver_user_id = 1
ORDER BY transaction_date;

-- (4) DML para modificar el correo electronico de un usuario especifico
UPDATE usuario
SET correo = 'erick.noguera@alke.com'
WHERE user_id = 1;

-- (5) Eliminar los datos de una transaccion (fila completa)
DELETE FROM transaccion
WHERE transaction_id = 5;


-- =====================================================================
--  LECCION 2  -  Consultas a una o varias tablas
-- =====================================================================

-- SELECT basicas sobre usuario
SELECT * FROM usuario;
SELECT nombre, correo, saldo FROM usuario;

-- Filtros dinamicos con WHERE y operadores logicos
SELECT nombre, saldo
FROM usuario
WHERE saldo >= 100000 AND currency_id = 1;

SELECT nombre, correo
FROM usuario
WHERE nombre LIKE 'M%' OR saldo < 1000;

-- INNER JOIN entre transaccion y usuario (emisor y receptor)
SELECT t.transaction_id,
       ue.nombre AS emisor,
       ur.nombre AS receptor,
       t.importe,
       t.transaction_date
FROM transaccion t
INNER JOIN usuario ue ON ue.user_id = t.sender_user_id
INNER JOIN usuario ur ON ur.user_id = t.receiver_user_id
ORDER BY t.transaction_date;

-- Sub-consultas: total de transacciones por usuario (como emisor)
SELECT u.user_id,
       u.nombre,
       (SELECT COUNT(*)
          FROM transaccion t
         WHERE t.sender_user_id = u.user_id)              AS cantidad_enviadas,
       (SELECT COALESCE(SUM(t.importe), 0)
          FROM transaccion t
         WHERE t.sender_user_id = u.user_id)              AS total_enviado
FROM usuario u
ORDER BY total_enviado DESC;

-- Funciones de agregacion con GROUP BY
SELECT t.sender_user_id,
       COUNT(*)        AS operaciones,
       SUM(t.importe)  AS suma_importe,
       AVG(t.importe)  AS promedio_importe
FROM transaccion t
GROUP BY t.sender_user_id;

-- ---- Tarea Plus Leccion 2: vista top-5 usuarios con mayor saldo ----
CREATE OR REPLACE VIEW v_top5_saldo AS
SELECT u.user_id,
       u.nombre,
       u.saldo,
       m.currency_symbol
FROM usuario u
INNER JOIN moneda m ON m.currency_id = u.currency_id
ORDER BY u.saldo DESC
LIMIT 5;

SELECT * FROM v_top5_saldo;


-- =====================================================================
--  LECCION 3  -  Transaccionalidad y principios ACID
-- =====================================================================

-- Transferencia atomica: descuenta al emisor, abona al receptor y
-- registra el movimiento. Las tres operaciones ocurren o ninguna.
START TRANSACTION;
  UPDATE usuario SET saldo = saldo - 15000 WHERE user_id = 1;
  UPDATE usuario SET saldo = saldo + 15000 WHERE user_id = 2;
  INSERT INTO transaccion (sender_user_id, receiver_user_id, currency_id, importe)
  VALUES (1, 2, 1, 15000.00);
COMMIT;

-- Actualizar el saldo de un usuario luego de una transaccion (aislada)
UPDATE usuario SET saldo = saldo - 5000 WHERE user_id = 3;

-- Simular un error de integridad referencial y revertir la operacion.
-- El receptor 999 no existe -> la FK fk_tx_receiver falla y el
-- ROLLBACK deshace tambien el UPDATE previo (atomicidad).
START TRANSACTION;
  UPDATE usuario SET saldo = saldo - 1000 WHERE user_id = 1;
  INSERT INTO transaccion (sender_user_id, receiver_user_id, currency_id, importe)
  VALUES (1, 999, 1, 1000.00);   -- ERROR 1452: falla la clave foranea
ROLLBACK;

-- Verificacion: el saldo del usuario 1 NO cambio por el bloque revertido
SELECT user_id, nombre, saldo FROM usuario WHERE user_id IN (1, 2, 3);

-- ---- Tarea Plus Leccion 3: cargar 50 transacciones aleatorias ------
-- Usa una CTE recursiva como secuencia 1..50. RAND(seed) genera
-- valores distintos y reproducibles por fila. Se asume user_id
-- contiguo de 1..N (N = numero de usuarios).
SET @n_usuarios = (SELECT COUNT(*) FROM usuario);

INSERT INTO transaccion
  (sender_user_id, receiver_user_id, currency_id, importe, transaction_date)
WITH RECURSIVE serie AS (
  SELECT 1 AS n
  UNION ALL
  SELECT n + 1 FROM serie WHERE n < 50
)
SELECT
  emisor,
  CASE WHEN receptor = emisor
       THEN (emisor MOD @n_usuarios) + 1
       ELSE receptor END,
  1,
  ROUND(1000 + RAND(n)     * 49000, 2),
  NOW() - INTERVAL FLOOR(RAND(n * 7) * 43200) MINUTE
FROM (
  SELECT n,
         FLOOR(1 + RAND(n)      * @n_usuarios) AS emisor,
         FLOOR(1 + RAND(n * 13) * @n_usuarios) AS receptor
  FROM serie
) AS base;

SELECT COUNT(*) AS total_transacciones FROM transaccion;


-- =====================================================================
--  FIN DEL SCRIPT
-- =====================================================================
