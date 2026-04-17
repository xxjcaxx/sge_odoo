
### Pràctica: Motor de Joc de Cartes (ORM Pro)

**Objectiu:** Implementar la lògica de gestió d'una baralla de cartes i les mans dels jugadors utilitzant exclusivament programació en Python amb l'ORM d'Odoo.

#### 1. Models i Sobreescriptura de Mètodes
Creeu els models `exc2.deck` (baralla) i `exc2.card` (carta). El model `deck` ha de tenir una relació **One2many** cap a `card`.

*   **Tasca 1 (Sobreescriptura):** Implementeu el mètode `create` al model `deck` per a generar automàticament les 48 cartes de la baralla en el moment de la seua creació.
    ```python
    def create(self, values):
        # Sobreescriptura per a generar la baralla automàticament
        new_id = super(Deck, self).create(values)
        for i in [1, 2, 3, 4, 5, 6, 7, 8, 9, 'J', 'Q', 'K']:
            for j in [['♣', 'C'], ['♠', 'S'], ['♥', 'H'], ['♦', 'D']]:
                self.env['exc2.card'].create({
                    'name': str(i) + "" + str(j),
                    'identificator': str(i) + "" + str(j),
                    'deck': new_id.id
                })
        # Inicialització del Many2many 'free' usant la tripleta (4, id)
        new_id.write({'free_cards_ids': [(4, card.id) for card in new_id.card_ids]})
        return new_id
    ```

#### 2. Operacions de Conjunts i Recordsets
Implementeu mètodes per a practicar les **Set Operations**:
*   **Mètode `merge_hands`:** Rep dos recordsets de cartes i retorna la unió (`|`), intersecció (`&`) o diferència (`-`) d'aquestes per a gestionar mans de jugadors.

#### 3. Gestió Avançada de Registres (ORM API)
Heu de crear mètodes que utilitzen les següents funcions:
*   **Accés i Cerca:** Useu `search()` per trobar cartes d'un pal concret, `browse()` per obtenir recordsets a partir d'IDs, i `exists()` per verificar si una carta ha estat eliminada.
*   **Validació:** Useu `ensure_one()` en mètodes que sols accepten una única baralla i `ref()` per a obtenir referències d'**External IDs** definits en fitxers de dades.
*   **Accions:** Implementeu mètodes per a duplicar baralles amb `copy()` i per a buidar la baralla amb `unlink()`.

#### 4. Escriptura en Many2many (Tripletes)
Implementeu un mètode `gestionar_ma` que utilitze les **tripletes de dades** per a modificar un camp Many2many de cartes:
*   Afegir una carta específica: `(4, id, 0)`.
*   Substituir tota la mà per una nova llista: `(6, 0, [ids])`.
*   Eliminar totes les cartes de la mà: `(5, 0, 0)`.

#### 5. El Repte: Programació Funcional de l'ORM
Heu de crear un mètode anomenat `obtenir_cartes_premium` que complisca el següent:
*   **Requisit:** S'ha de realitzar en **una sola línia de codi** (o una expressió única), sense utilitzar estructures de control com `if` o `for`.
*   **Lògica:** Ha d'agafar totes les cartes de la baralla actual, filtrar (`filtered`) les que siguen de 'Cors' (♥), ordenar-les (`sorted`) pel seu identificador de forma descendent i, finalment, retornar una llista amb els seus noms (`mapped`).

---

### Avaluació Automàtica (JSON-2)
La verificació es farà des d'una web externa. Heu de proporcionar:
1.  **IP del VPS** on corre Odoo en Docker.
2.  **Nom del mòdul** i **Nom del model** (`exc2.deck`).
3.  **API Key** vàlida per a l'autenticació Bearer.

El sistema d'avaluació cridarà a la ruta `/json/2/exc2.deck/<nom_metode>` passant els paràmetres necessaris en el `body`. Es comprovarà que:
*   El mètode `create` genera exactament 48 cartes.
*   Les funcions de programació funcional retornen els valors exactes esperats.
*   Les operacions de `write` en Many2many s'executen correctament seguint les tripletes d'Odoo.