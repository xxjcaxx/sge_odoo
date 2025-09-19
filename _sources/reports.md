# Reports

El motor de reports utilitza una combinació de **QWeb, BootStrap i Wkhtmltopdf**.

```{admonition} Consell
:class: tip

Pot ser que el wkhtmltopdf de la distribució no funcione. Cal anar a https://github.com/wkhtmltopdf/wkhtmltopdf/releases/ i descarregar el '''.deb''' de la versió estable més alta. S'instal·larà amb '''dpkg -i'''

Amb '''wkhtmltopdf -V''' podem comprovar si la versió correcta s'ha instal·lat. 
```
Un report consta de dos elements:

-   Un registre en la base de dades en el model:
    **ir.actions.report.xml** amb els paràmetres bàsics
-   Una vista `Qweb`  per al contingut.

Per exemple, en el xml:

``` xml
<report
        id="report_session"
        model="openacademy.session"
        string="Session Report"
        name="openacademy.report_session_view"
        file="openacademy.report_session"
        report_type="qweb-pdf" />

    <template id="report_session_view">
        <t t-call="report.html_container">
            <t t-foreach="docs" t-as="doc">
                <t t-call="report.external_layout">
                    <div class="page">
                        <h2 t-field="doc.name"/>
                        <p>From <span t-field="doc.start_date"/> to <span t-field="doc.end_date"/></p>
                        <h3>Attendees:</h3>
                        <ul>
                            <t t-foreach="doc.attendee_ids" t-as="attendee">
                                <li><span t-field="attendee.name"/></li>
                            </t>
                        </ul>
                    </div>
                </t>
            </t>
        </t>
    </template>
```

Els reports simplifiquen amb l\'etiqueta **report** la creació d\'un
action de tipus report. Automàticament situen un botó dalt del tree o
form per imprimir.

Una mínima template que funciona:

``` xml
<template id="report_invoice">
    <t t-call="report.html_container">
        <t t-foreach="docs" t-as="o">
            <t t-call="report.external_layout">
                <div class="page">
                    <h2>Report title</h2>
                    <p>This object's name is <span t-field="o.name"/></p>
                </div>
            </t>
        </t>
    </t>
</template>
```

Analitzem aquesta template:

-   **external_layout**: Afegeix la capçalera i el peu per defecte de
    Odoo.
-   Dins de
    ```xml
    <div class="page">
    ```
    Està el contingut del report.
-   **id**: A de ser el mateix que el name del report.
-   **docs**: Llista d\'objectes a imprimir. (Paregut a self)

Es poden afegir css locals o externs al report heredant el template e
insertant el css:

``` xml
<template id="report_saleorder_style" inherit_id="report.layout">
  <xpath expr="//style" position="after">
    <style type="text/css">
      .example-css-class {
        background-color: red;
      }
    </style>
  </xpath>
</template>
```

Per afegir una imatge de la base de dades:

``` xml
<span t-field="doc.logo" t-field-options="{&quot;widget&quot;: &quot;image&quot;, &quot;class&quot;: &quot;img-rounded&quot;}"/>
```

**Notes sobre QWeb**

QWeb és el motor de plantilles de Odoo. Els elements són etiquetes XML
que comencen per **t-**

-   t-field: Per mostrar el contingut d\'un field
-   t-if: Per fer condicionals. Per fer un condicional en funció de si
    un field està o no, sols cal ficar el field en questió dins del
    condicional.

``` xml
  <t t-if="viatge.hotel">
    <!-- ... -->
  </t>
```

-   t-foreach: Per fer bucles per els elements d\'un one2many, per
    exemple.

**Depurar els reports**

Because reports are standard web pages, they are available through a URL
and output parameters can be manipulated through this URL, for instance
the HTML version of the Invoice report is available through
<http://localhost:8069/report/html/account.report_invoice/1> (if account
is installed) and the PDF version through
<http://localhost:8069/report/pdf/account.report_invoice/1>.

Més informació
<https://www.odoo.com/documentation/8.0/reference/reports.html>
