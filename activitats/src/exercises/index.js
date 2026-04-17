import { exercise as practicaAi } from './practica_ai'
import { exercise as practicaConstrains } from './practica_constrains'
import { exercise as practicaFieldsComputed } from './practica_fields_computed'
import { exercise as practicaFieldsRelacionals } from './practica_fields_relacionals'
import { exercise as practicaGitOdoo } from './practica_git_odoo'
import { exercise as practicaHerencia } from './practica_herencia'
import { exercise as practicaHolamonOdoo } from './practica_holamon_odoo'
import { exercise as practicaInstalarOdoo } from './practica_instalar_odoo'
import { exercise as practicaKanban } from './practica_kanban'
import { exercise as practicaNotebook } from './practica_notebook'
import { exercise as practicaOrm } from './practica_orm'
import { exercise as practicaReport } from './practica_report'
import { exercise as practicaSearch } from './practica_search'
import { exercise as practicaViews } from './practica_views'
import { exercise as practicaWebControllers } from './practica_web_controllers'
import { exercise as practicaXml } from './practica_xml'

const EXERCISES = [
  practicaAi,
  practicaConstrains,
  practicaFieldsComputed,
  practicaFieldsRelacionals,
  practicaGitOdoo,
  practicaHerencia,
  practicaHolamonOdoo,
  practicaInstalarOdoo,
  practicaKanban,
  practicaNotebook,
  practicaOrm,
  practicaReport,
  practicaSearch,
  practicaViews,
  practicaWebControllers,
  practicaXml,
]

export const EXERCISE_MAP = new Map(EXERCISES.map((exercise) => [exercise.slug, exercise]))
