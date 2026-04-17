export function createExercise({ slug, specificFields = [], createTests = () => [] }) {
  return {
    slug,
    specificFields,
    createTests,
  }
}
