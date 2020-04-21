export const getDateString = function(date) {
  return date.getFullYear() + '-' + (date.getMonth()+1).pad(2) + '-' + date.getDate().pad(2)
}
