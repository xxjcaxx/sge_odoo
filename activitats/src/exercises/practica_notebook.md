
# Pràctica: Anàlisi de Dades d'una Lliga de Futbol amb Odoo i Pandas

## Objectiu
L'objectiu d'aquesta pràctica és utilitzar Python per a connectar-se a una instància d'Odoo 19, generar dades simulades d'una competició esportiva i analitzar-les estadísticament utilitzant les llibreries **Pandas**, **NumPy** i **Matplotlib**.

---

## 1. Configuració i Connexió a Odoo
D'acord amb la documentació d'Odoo 19, la comunicació es realitzarà mitjançant l'API **External JSON-2** fent peticions POST a la ruta `/json/2/<model>/<method>`.

### Tasca 1.1: Importació de llibreries
Importa les llibreries necessàries: `requests`, `pandas`, `numpy` i `matplotlib.pyplot`.

### Tasca 1.2: Paràmetres de connexió
Defineix les variables per a la IP del servidor, el nom de la base de dades i l'**API Key** generada des del perfil d'usuari d'Odoo.

```python
import requests
import json
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Paràmetres (completa amb les teues dades)
URL_BASE = "http://<EL_TEU_VPS>:8069/json/2"
API_KEY = "<LA_TEUA_API_KEY>"
DB = "<NOM_DB>"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
    "X-Odoo-Database": DB
}
```

---

## 2. Generació de la Temporada a Odoo
El model d'Odoo `lliga.futbol` disposarà d'un mètode anomenat `generar_temporada` que realitza les següents accions al servidor:
1. Crea equips aleatoris amb un nivell de qualitat.
2. Genera un calendari de partits.
3. Simula resultats realistes (on els equips amb més qualitat tenen més probabilitats de guanyar).

### Tasca 2.1: Execució de la lògica de negoci
Crida al mètode `generar_temporada` del model `lliga.futbol`.

```python
# Crida per a generar les dades
payload = {"params": {}}
response = requests.post(f"{URL_BASE}/lliga.futbol/generar_temporada", headers=headers, json=payload)
print("Temporada generada:", response.json())
```

---

## 3. Extracció de dades i Classificació
El model `lliga.futbol` té un camp **Many2many computat** anomenat `classificacio_ids`. Aquest camp calcula en temps real els punts, gols a favor, gols en contra i la posició de cada equip.

### Tasca 3.1: Lectura de la classificació
Utilitza el mètode `read` per a obtenir la llista d'equips i les seues estadístiques des del camp computat.

```python
# Obtenir la classificació
payload = {
    "params": {
        "fields": ["name", "classificacio_ids"]
    }
}
# Nota: Caldrà fer un segon read sobre els IDs obtinguts de 'classificacio_ids' 
# o usar un mètode que retorne el recordset expandit.
```

---

## 4. Anàlisi de Dades amb Pandas
Un cop obtingudes les dades, crea un **DataFrame** de Pandas per a mostrar la classificació final al Notebook.

### Tasca 4.1: Mostrar la taula de classificació
Ordena el DataFrame per punts de forma descendent.

---

## 5. Visualització Estadística
Utilitza **Matplotlib** per a respondre a les següents qüestions visuals:

### Tasca 5.1: Evolució de punts
Genera una gràfica de línies que mostre l'evolució dels punts de tots els equips al llarg de les jornades (eix X: Jornades, eix Y: Punts).

### Tasca 5.2: Balanç de Gols
Crea una gràfica de barres comparant els gols a favor i els gols en contra de cada equip.

### Tasca 5.3: Correlació Qualitat/Puntuació
Utilitza **NumPy** per a calcular si existeix una correlació entre la qualitat aleatòria assignada inicialment a l'equip i la seua puntuació final, i mostra-ho en un diagrama de dispersió (*scatter plot*).

---

## Entrega
Lliura el fitxer `.ipynb` amb totes les cel·les executades i les gràfiques visibles. Recorda que el servidor Odoo ha d'estar actiu per a que el professor puga validar la connexió.