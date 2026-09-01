# Alke Wallet - Modulo: Fundamentos de Bases de Datos Relacionales

Diseno e implementacion de la base de datos relacional **AlkeWallet** (MySQL 8):
modelo entidad-relacion, DDL, DML, consultas y transaccionalidad ACID.

## Archivos

| Archivo | Contenido |
|---|---|
| `AlkeWallet.sql` | Script completo en orden de ejecucion: `CREATE DATABASE`, DDL de las 3 tablas con PK/FK/CHECK/indices, datos de prueba, las 5 consultas obligatorias, consultas de la Leccion 2, bloques `START TRANSACTION`/`COMMIT`/`ROLLBACK` y tareas plus. |
| `diagrama_ER.png` | Diagrama entidad-relacion generado con `diagrama_ER.py`. |
| `diagrama_ER.py` | Genera el diagrama ER (requiere `matplotlib`). |
| `generar_documento.py` | Genera el entregable Word (requiere `python-docx`). |
| `Alke_Wallet_Bases_de_Datos_Erick_Noguera.docx` | **Entregable**: documento con todas las sentencias SQL, resultados esperados, tablas ACID / RDBMS, modelo ER y recuadros para pegar las capturas. |

## Entidades

- **moneda** (`currency_id` PK, `currency_name`, `currency_symbol`)
- **usuario** (`user_id` PK, `nombre`, `correo`, `contrasena`, `saldo`, `currency_id` FK -> moneda)
- **transaccion** (`transaction_id` PK, `sender_user_id` FK -> usuario, `receiver_user_id` FK -> usuario, `currency_id` FK -> moneda, `importe`, `transaction_date`)

> `currency_id` se anade en `usuario` y en `transaccion` porque el enunciado exige
> la consulta "moneda elegida por un usuario" y la FK de `transaccion` a la moneda,
> aunque no lo liste como atributo. `contrasena` se nombra sin tilde por portabilidad.

## Como ejecutar

1. Abre [sqliteonline.com](https://sqliteonline.com) en **modo MySQL 8** (o cualquier MySQL 8).
2. Copia y ejecuta el contenido de `AlkeWallet.sql` (esta ordenado para correr de principio a fin).
3. Toma las capturas indicadas en el Anexo B del documento Word.

## Regenerar los artefactos

```bash
pip install python-docx matplotlib
python diagrama_ER.py
python generar_documento.py
```
