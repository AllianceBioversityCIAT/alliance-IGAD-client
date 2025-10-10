export default defineEventHandler(async (event) => {
  const data = await $fetch('https://api.clarisa.cgiar.org/api/countries')
  return data
})

