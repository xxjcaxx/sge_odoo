
### Pràctica: Gestió de Mòduls amb Git i Odoo 19 en Docker

**Objectiu:** Configurar un repositori Git en el VPS per a gestionar el codi personalitzat d'Odoo, desplegar un mòdul amb un model específic i permetre la validació automàtica mitjançant la ruta `/doc`.

#### 1. Requisits per al funcionament correcte
Per a que el sistema reconega el nou mòdul i siga accessible externament, s'han de complir els següents punts:
*   **Mapeig de Volums:** El fitxer `docker-compose.yml` ha de tenir una línia en la secció de `volumes` que connecte una carpeta local (per exemple, `./addons`) amb la ruta `/mnt/extra-addons` del contenidor.
*   **Configuració d'Odoo:** El fitxer `odoo.conf` ha d'incloure `/mnt/extra-addons` en el paràmetre `addons_path`.
*   **Permisos de fitxers:** La carpeta `addons` ha de tenir permisos d'escriptura i lectura per a l'usuari que executa el Docker per a evitar errors al crear o carregar mòduls.
*   **Visibilitat de la IP:** El port **8069** ha d'estar obert en el firewall del VPS per a que la web de validació puga consultar la documentació.

#### 2. Configuració de Git al VPS
Heu de versionar la vostra configuració i els vostres mòduls.
1.  Situeu-vos a la carpeta on teniu el `docker-compose.yml`.
2.  Inicieu el repositori: `git init`.
3.  Creeu un fitxer **`.gitignore`** per a evitar pujar dades innecessàries, ignorant les carpetes de dades de PostgreSQL i la sessió d'Odoo.
4.  Creeu una carpeta anomenada **`addons`**.

#### 3. Creació del mòdul: `practica_git_sge`
Heu de crear un mòdul nou (podeu usar el comandament `scaffold`) dins de la carpeta `addons`.
*   **Nom del mòdul:** `practica_git_sge`.
*   **Contingut:** El mòdul ha de definir un nou model de dades a Python.
*   **Nom del model:** El model s'ha d'anomenar exactament **`model.practica`**.
    *   *Exemple de codi a `models/models.py`:*
        ```python
        from odoo import models, fields
        class ModelPractica(models.Model):
            _name = 'model.practica'
            _description = 'Model de prova per a la pràctica de Git'
            name = fields.Char(string="Nom de prova", required=True)
        ```

#### 4. Desplegament i Actualització
Una vegada creat el mòdul, cal que Odoo el reconega:
1.  Pugeu el codi al vostre repositori públic (GitHub/GitLab).
2.  Al VPS, executeu `docker compose restart odoo` per a que el servidor detecte la nova carpeta.
3.  Entreu a Odoo en mode desenvolupador, aneu a **Aplicacions > Actualitzar llista de mòduls** i instal·leu `practica_git_sge`.

#### 5. Entrega i Avaluació Automàtica
Heu d'entregar l'URL del vostre repositori públic a la web proporcionada pel professor. El sistema realitzarà les següents comprovacions:
*   **Existència del Repositori:** Comprovarà que el link és accessible.
*   **Estructura de Carpetes:** Validarà que existeix una carpeta `addons` i, dins d'aquesta, la carpeta `practica_git_sge`.
*   **Validació Odoo (/doc):** La web farà una petició a `http://la_teua_ip:8069/doc/model.practica`. A partir d'Odoo 19, aquesta ruta genera automàticament documentació per a cada model existent a la base de dades. Si el model s'ha creat i instal·lat correctament, la ruta retornarà un **200 OK** amb la informació del model.