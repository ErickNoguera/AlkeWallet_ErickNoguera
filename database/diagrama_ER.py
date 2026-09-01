# -*- coding: utf-8 -*-
"""
Genera el diagrama entidad-relacion de Alke Wallet como imagen PNG.
Uso:  python diagrama_ER.py
Salida: diagrama_ER.png  (en la misma carpeta)
"""
import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

AZUL = "#4f2d7f"
GRIS_BORDE = "#3a1f61"
FONDO_CAB = "#4f2d7f"
FONDO_ATR = "#f1ecf7"

def entidad(ax, x, y, titulo, filas, w=3.2):
    """Dibuja una entidad estilo tabla con cabecera y lista de atributos."""
    fila_h = 0.42
    cab_h = 0.55
    h = cab_h + fila_h * len(filas)
    # cuerpo
    ax.add_patch(FancyBboxPatch((x, y - h), w, h,
                 boxstyle="round,pad=0.02,rounding_size=0.06",
                 linewidth=1.6, edgecolor=GRIS_BORDE, facecolor=FONDO_ATR, zorder=3))
    # cabecera
    ax.add_patch(FancyBboxPatch((x, y - cab_h), w, cab_h,
                 boxstyle="round,pad=0.02,rounding_size=0.06",
                 linewidth=1.6, edgecolor=GRIS_BORDE, facecolor=FONDO_CAB, zorder=4))
    ax.text(x + w / 2, y - cab_h / 2, titulo, ha="center", va="center",
            color="white", fontsize=11, fontweight="bold", zorder=5)
    for i, (texto, marca) in enumerate(filas):
        ty = y - cab_h - fila_h * (i + 0.5)
        peso = "bold" if marca in ("PK", "PK,FK") else "normal"
        etiqueta = texto if not marca else f"{texto}  ({marca})"
        ax.text(x + 0.18, ty, etiqueta, ha="left", va="center",
                fontsize=9, fontweight=peso, color="#1f2333", zorder=5)
    return {"x": x, "y": y, "w": w, "h": h, "cx": x + w / 2, "top": y,
            "bottom": y - h, "left": x, "right": x + w}

def rel(ax, p1, p2, card1="1", card2="N", etiqueta="", rad=0.0):
    a = FancyArrowPatch(p1, p2, connectionstyle=f"arc3,rad={rad}",
                        arrowstyle="-", linewidth=1.5, color=GRIS_BORDE, zorder=2)
    ax.add_patch(a)
    ax.text(p1[0], p1[1] + 0.18, card1, ha="center", va="center",
            fontsize=9, fontweight="bold", color=AZUL, zorder=6)
    ax.text(p2[0], p2[1] + 0.18, card2, ha="center", va="center",
            fontsize=9, fontweight="bold", color=AZUL, zorder=6)
    if etiqueta:
        mx, my = (p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2
        ax.text(mx, my, etiqueta, ha="center", va="center", fontsize=8,
                style="italic", color="#555",
                bbox=dict(boxstyle="round,pad=0.2", fc="white", ec="none"), zorder=6)

def main():
    fig, ax = plt.subplots(figsize=(11, 8))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 10)
    ax.axis("off")

    moneda = entidad(ax, 4.4, 9.3, "moneda", [
        ("currency_id", "PK"),
        ("currency_name", "UNIQUE"),
        ("currency_symbol", ""),
    ])

    usuario = entidad(ax, 0.6, 6.0, "usuario", [
        ("user_id", "PK"),
        ("nombre", ""),
        ("correo", "UNIQUE"),
        ("contrasena", ""),
        ("saldo", ""),
        ("currency_id", "FK"),
        ("fecha_creacion", ""),
    ])

    transaccion = entidad(ax, 8.0, 6.2, "transaccion", [
        ("transaction_id", "PK"),
        ("sender_user_id", "FK"),
        ("receiver_user_id", "FK"),
        ("currency_id", "FK"),
        ("importe", ""),
        ("transaction_date", ""),
    ])

    # moneda 1 --- N usuario
    rel(ax, (moneda["left"], moneda["top"] - 0.9),
            (usuario["cx"], usuario["top"]),
            "1", "N", "es usada por", rad=0.15)
    # moneda 1 --- N transaccion
    rel(ax, (moneda["right"], moneda["top"] - 0.9),
            (transaccion["cx"], transaccion["top"]),
            "1", "N", "denomina", rad=-0.15)
    # usuario 1 --- N transaccion (sender)
    rel(ax, (usuario["right"], usuario["top"] - 1.2),
            (transaccion["left"], transaccion["top"] - 1.0),
            "1", "N", "envia (sender)", rad=0.08)
    # usuario 1 --- N transaccion (receiver)
    rel(ax, (usuario["right"], usuario["top"] - 2.4),
            (transaccion["left"], transaccion["top"] - 2.0),
            "1", "N", "recibe (receiver)", rad=-0.08)

    ax.set_title("Alke Wallet  -  Modelo Entidad-Relacion (MySQL 8)",
                 fontsize=13, fontweight="bold", color=AZUL, pad=16)

    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "diagrama_ER.png")
    fig.savefig(out, dpi=170, bbox_inches="tight", facecolor="white")
    print("Generado:", out)

if __name__ == "__main__":
    main()
