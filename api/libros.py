import csv
import sys
import os
from fpdf import FPDF
import datetime
from tkinter import *
from functools import partial
from tkinter import filedialog

PRODUCTOS = {}
TOTAL_POR_PRODUCTO = {}
TOTAL_POR_CATEGORIAS = {}
PATH_CATALOGO = ""
PATH_VENTA = ""

def formatKey(key):
  return key.upper().strip()

def formatMoney(money):
  return '${:,.2f}'.format(float(money))

def toLocal(money):
  return money.replace('.','').replace(',','.')

def cargarProductos(ruta):
  with open(ruta+'productos.csv') as productos_file:
    productos = csv.reader(productos_file, delimiter=',')
    line_count = 0
    for producto in productos:
      if line_count > 0:
        PRODUCTOS[formatKey(producto[1])] = {
          'id': producto[0],
          'precio': producto[7],
          'categoria': producto[2]
        }
        TOTAL_POR_CATEGORIAS[producto[2]] = {}
      line_count += 1
  CATEGORIAS = list(TOTAL_POR_CATEGORIAS.keys())

def hacerCuadernillos(ruta):
  with open(ruta+'venta.csv') as ventas_file:
    ventas = csv.reader(ventas_file, delimiter=',')
    pdf = FPDF(orientation = 'P', unit = 'mm', format='A4') 
    pdf.add_page()
    pdf.set_font('Helvetica', 'B', 6)
    today = datetime.date.today()
    tomorrow = today + datetime.timedelta(days = (2 if (today.weekday() == 5) else 1))
    numero_ruta = ""
    total_del_dia = 0

    ########### HACER CUADERNILLO
    numero_pedido = 0
    for venta in ventas:
      if numero_pedido > 0:
        # HEADER
        if numero_pedido == 1:
          numero_ruta = venta[14]
          pdf.set_font('Helvetica', 'B', 12)
          pdf.multi_cell(w = 0, h = 3, txt = venta[14], border = 0, align = 'C', fill = 0)
          pdf.multi_cell(w = 0, h = 3, txt = '', border = 0, align = 'R', fill = 0)
          pdf.set_font('Helvetica', 'B', 8) 
          pdf.multi_cell(w = 0, h = 3, txt = f'CUADERNILLO DEL << {tomorrow.strftime("%d")} DE {tomorrow.strftime("%b").upper()} DEL {tomorrow.strftime("%Y")} >>', border = 0, align = 'C', fill = 0)
          pdf.multi_cell(w = 0, h = 3, txt = '', border = 0, align = 'R', fill = 0)

        # HEADER TABLA  
        pdf.set_font('Helvetica', 'B', 5)
        pdf.set_fill_color(244, 220, 219)
        pdf.multi_cell(w = 0, h = 3, txt = f'PEDIDO NUMERO - {numero_pedido}', border = 0, align = 'L', fill = 0)
        pdf.set_font('Helvetica', 'B', 5) 
        pdf.cell(w = 45, h = 3, txt = 'Cliente', border = 1, align = 'C', fill = 1)
        pdf.cell(w = 85, h = 3, txt = 'Descripcion', border = 1, align = 'C', fill = 1)
        pdf.cell(w = 20, h = 3, txt = 'Cantidad', border = 1, align = 'C', fill = 1)
        pdf.cell(w = 20, h = 3, txt = 'Precio', border = 1, align = 'C', fill = 1)
        pdf.multi_cell(w = 20, h = 3, txt = 'Subtotal', border = 1, align = 'C', fill = 1)

        #CONTENIDO TABLA
        productos_de_cliente = venta[5].split(',')
        total_cajas_pedido = 0
        total_del_dia += float(toLocal(venta[6]))
        for producto in productos_de_cliente:
          cant_prod = producto.split('x', 1)
          total_cajas_pedido += int(cant_prod[0])
          pdf.set_font('Helvetica', '', 5)
          pdf.set_fill_color(249, 249, 249)
          pdf.cell(w = 45, h = 3, txt = str(venta[13].encode("ascii", "replace").decode("utf-8")), border = 1, align = 'C', fill = 0)
          pdf.cell(w = 85, h = 3, txt = str(formatKey(cant_prod[1])), border = 1, align = 'C', fill = 0)
          pdf.cell(w = 20, h = 3, txt = str(cant_prod[0]), border = 1, align = 'C', fill = 0)
          pdf.cell(w = 20, h = 3, txt = formatMoney(PRODUCTOS[formatKey(cant_prod[1])]['precio']), border = 1, align = 'C', fill = 0)
          sub_total = float(PRODUCTOS[formatKey(cant_prod[1])]['precio']) * int(cant_prod[0])
          pdf.multi_cell(w = 20, h = 3, txt = formatMoney(sub_total), border = 1, align = 'R', fill = 0)

          # AGRUPAR PRODUCTOS
          if cant_prod[1].upper() in TOTAL_POR_PRODUCTO.keys():
            TOTAL_POR_PRODUCTO[str(formatKey(cant_prod[1]))] = TOTAL_POR_PRODUCTO[str(formatKey(cant_prod[1]))] + int(cant_prod[0])
          else:
            TOTAL_POR_PRODUCTO[str(formatKey(cant_prod[1]))] = int(cant_prod[0])

        pdf.set_font('Helvetica', 'B', 5) 
        pdf.multi_cell(w = 0, h = 3, txt = f' Total cajas: {total_cajas_pedido}', border = 0, align = 'R', fill = 0)
        pdf.multi_cell(w = 0, h = 3, txt = f' Total a pagar: {formatMoney(float(toLocal(venta[6])))}', border = 0, align = 'R', fill = 0)
      numero_pedido += 1
    pdf.set_font('Helvetica', 'B', 12) 
    pdf.multi_cell(w = 0, h = 8, txt = f' Total del Dia: {formatMoney(total_del_dia)}', border = 0, align = 'C', fill = 0)
    pdf.add_page()


    ########### HACER HOJA DE CARGA
    pdf.set_font('Helvetica', 'B', 12)
    pdf.multi_cell(w = 0, h = 3, txt = venta[14], border = 0, align = 'C', fill = 0)
    pdf.multi_cell(w = 0, h = 3, txt = '', border = 0, align = 'R', fill = 0)
    pdf.set_font('Helvetica', 'B', 8) 
    pdf.multi_cell(w = 0, h = 3, txt = f'HOJA DE CARGA DEL << {tomorrow.strftime("%d")} DE {tomorrow.strftime("%b").upper()} DEL {tomorrow.strftime("%Y")} >>', border = 0, align = 'C', fill = 0)
    pdf.multi_cell(w = 0, h = 6, txt = '', border = 0, align = 'R', fill = 0)

    # ORDENAR POR CATEGORIA
    for producto in TOTAL_POR_PRODUCTO.keys():
      TOTAL_POR_CATEGORIAS[PRODUCTOS[producto]['categoria']][producto] = TOTAL_POR_PRODUCTO[producto]

    # HEADER TABLA 
    pdf.set_font('Helvetica', 'B', 8) 
    pdf.cell(w = 130, h = 5, txt = 'Descripcion', border = 1, align = 'C', fill = 0)
    pdf.cell(w = 20, h = 5, txt = 'Cantidad', border = 1, align = 'C', fill = 0)
    pdf.multi_cell(w = 0, h = 5, txt = 'SKU', border = 1, align = 'C', fill = 0)
    total_cajas_pedido_ruta = 0
    for categoria in TOTAL_POR_CATEGORIAS.keys():
      productos_por_categoria = TOTAL_POR_CATEGORIAS[categoria].keys()
      if len(productos_por_categoria) > 0:
        pdf.set_fill_color(244, 220, 219)
        pdf.set_font('Helvetica', 'B', 8) 
        pdf.multi_cell(w = 0, h = 5, txt = categoria, border = 0, align = 'C', fill = 1)
      for producto in productos_por_categoria:
        total_cajas_pedido_ruta += int(TOTAL_POR_PRODUCTO[producto])
        pdf.set_font('Helvetica', '', 8) 
        pdf.cell(w = 130, h = 5, txt = producto, border = 1, align = 'C', fill = 0)
        pdf.cell(w = 20, h = 5, txt = str(TOTAL_POR_PRODUCTO[producto]), border = 1, align = 'C', fill = 0)
        pdf.multi_cell(w = 0, h = 5, txt = str(PRODUCTOS[producto].get('id', {})), border = 1, align = 'C', fill = 0)
    pdf.set_font('Helvetica', 'B', 12) 
    pdf.multi_cell(w = 0, h = 8, txt = '', border = 0, align = 'C', fill = 0)
    pdf.multi_cell(w = 0, h = 8, txt = f' Total productos de la ruta: {total_cajas_pedido_ruta}', border = 0, align = 'C', fill = 0)
      
  name_file = f'/Users/fernandogabe/Desktop/LIBRO-{tomorrow.strftime("%b%d").upper()}-{numero_ruta.upper()}.pdf'
  pdf.output(name_file)

print('/csv/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2NDA4MzI0MDgsImV4cCI6MTY0MDgzNDIwOH0.JtFe9RGscEW-3OaVYh31N8vrVo36RKGLgd9ynXsOxqE/producto.csv')
cargarProductos('/Desktop/cc_admin/api/csv/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2NDA4MzI0MDgsImV4cCI6MTY0MDgzNDIwOH0.JtFe9RGscEW-3OaVYh31N8vrVo36RKGLgd9ynXsOxqE/')
hacerCuadernillos('/Desktop/cc_admin/api/csv/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2NDA4MzI0MDgsImV4cCI6MTY0MDgzNDIwOH0.JtFe9RGscEW-3OaVYh31N8vrVo36RKGLgd9ynXsOxqE/')