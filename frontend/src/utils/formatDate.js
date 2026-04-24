export const formatDate = (value) => {
  if (!value) return null
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
