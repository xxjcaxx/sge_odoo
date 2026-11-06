# Business Intelligence

Odoo és un bom punt de partida per a fer BI ja que presenta una base de dades estructurada molt completa amb tota la informació de l'empresa en el mateix lloc. Les últimes versions tenen uns `Dashboards` interessants. La limitació és doble:

* La versió Community no té la ferramenta de SpreadSheet sobre la que es poden crear Dashboards nous ni la possibilitat de crear-ne nous sense entrar a OWL. 
* Inclús la versió Enterprise és menys potent que ferramentes especialitzades com PowerBI, Grafana, Apache Superset, Metabase, Kibana, Tableau...

Per tant, anem a buscar una alternativa. Una de les més fàcils d'implantar amb Docker i Odoo és `Metabase`.

## Metabase

Per afegir Metabase al nostre projecte Odoo el podem posar al mateix `Docker Compose`:  

```yml
services:
  odoo:
    container_name: odooprofe
    image: odoo:18.0
    depends_on:
      - db
    ports:
      - "8069:8069"
    volumes:
      - odoo-web-data:/var/lib/odoo
      - ./config:/etc/odoo
      - ./addons:/mnt/extra-addons
    environment:
      - HOST=db
      - USER=odoo
      - PASSWORD=odoo
    command: ["--dev=all", "-u", "modul", "-d", "basededades"]
    tty: true

  db:
    container_name: postgresqlprofe
    image: postgres:15
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=postgres
      - POSTGRES_USER=odoo
      - POSTGRES_PASSWORD=odoo
    volumes:
      - odoo-db-data:/var/lib/postgresql/data

  nginx:
    build:
      context: ./nginx
      dockerfile: Dockerfile 
    container_name: nginx
    depends_on:
      - odoo
    ports:
      - "80:80"
      - "443:443"

  metabase:
      container_name: metabase
      image: metabase/metabase:latest
      depends_on:
        - db
      ports:
        - "3000:3000"
      volumes:
        - metabase-data:/metabase-data
      environment:
        TZ: Europe/Madrid 

volumes:
  odoo-web-data:
  odoo-db-data:
  metabase-data:
```

Quan entrem a `localhost:3000` ens apareix un assistent de configuració. És important dir que en el servidor hem de posar `db`, el nom de la base de dades creada per a Odoo i els usuaris i contrasenyes d'Odoo per a la base de dades. 

