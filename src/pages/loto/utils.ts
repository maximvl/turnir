export function generateTicket() {
  // returns random number of 5 digits
  return Math.floor(10000 + Math.random() * 90000).toString()
}
