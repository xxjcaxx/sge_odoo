# -*- coding: utf-8 -*-
{
    'name': "Roma Aeterna",

    'summary': """
        Role Game about the Republican period of Roma""",

    'description': """
A captivating MMORPG (Massively Multiplayer Online Role-Playing Game) set in the tumultuous Republican period of ancient Rome. This innovative and engaging game is brought to life as an Odoo module, seamlessly integrating with your existing business operations.

Step into the sandals of a Roman citizen and embark on a journey through the political, military, and cultural landscapes of the Roman Republic. As a player, you'll have the opportunity to:

1. **Choose Your Path:** Decide your destiny by selecting one of several character classes, each with its unique abilities. Will you be a cunning politician, a fearless general, or a skilled craftsman?

2. **Immerse in History:** Explore an exquisitely detailed and historically accurate rendition of ancient Rome, complete with iconic landmarks, bustling forums, and epic battlefields.

3. **Conquer the Republic:** Engage in epic battles, command legions, and engage in political intrigue to climb the ranks of the Roman Senate. Form alliances, forge rivalries, and shape the fate of the Republic.

4. **Economic Mastery:** Build and manage your economic empire through trade, resource management, and craftsmanship. Control the flow of wealth in the Republic and amass power.

5. **Dynamic Quests:** Embark on quests inspired by actual historical events, shaping your character's story and the course of the Republic. Solve mysteries, uncover conspiracies, and participate in grand Roman celebrations.

6. **Community and Politics:** Interact with a vast community of players, form factions, and participate in player-driven political campaigns. Run for office, draft laws, and influence the course of the Republic in a true MMORPG fashion.

7. **Craftsmanship and Trade:** Develop your skills as a blacksmith, architect, or merchant. Contribute to the growth of the Republic by creating valuable goods, constructing magnificent buildings, and trading resources.

8. **Team-Based Battles:** Team up with other players to participate in large-scale battles, recreating historic conflicts like the Punic Wars or the Social War. Coordinate strategies to secure victory for your faction.

9. **Strategic Alliances:** Form alliances with other players and create powerful coalitions to defend against external threats or dominate the political arena.

"Republica Romana: Rise of the Senate" offers an immersive MMORPG experience that combines historical accuracy with engaging gameplay. Whether you seek the thrill of political power, the glory of battle, or the prosperity of trade, this Odoo module-based game allows you to shape the destiny of the Roman Republic in an epic online adventure. Do you have what it takes to rise to the top and become a legend in the annals of Roman history? Join the Republica Romana today and find out!
    """,

    'author': "My Company",
    'website': "https://www.yourcompany.com",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/16.0/odoo/addons/base/data/ir_module_category_data.xml
    # for the full list
    'category': 'Uncategorized',
    'version': '0.1',

    # any module necessary for this one to work correctly
    'depends': ['base','mail'],

    # always loaded
    'data': [
        'security/ir.model.access.csv',
         'views/battle.xml',
        'views/buildings.xml',
        'views/citicens.xml',
        'views/citys.xml',
        'views/players.xml',
        'views/views.xml',
        'views/templates.xml',
        'demo/buildings.xml', 'demo/templates.xml',
        'crons/cron_game.xml'
    ],
    # only loaded in demonstration mode
    'demo': [
        'demo/demo.xml',
    ],
}
