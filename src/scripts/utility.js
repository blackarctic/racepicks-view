module.exports = {
  entryIconClasses (entry) {
    let classes = {}
    classes['fa-' + entry.icon] = true
    classes[entry.color] = true
    return classes
  },
  numEnding (num) {
    let digits = String(num).split('')
    let lastDigit = digits[digits.length - 1]
    switch (lastDigit) {
      case '0': return 'th'
      case '1': return 'st'
      case '2': return 'nd'
      case '3': return 'rd'
      case '4': return 'th'
      case '5': return 'th'
      case '6': return 'th'
      case '7': return 'th'
      case '8': return 'th'
      case '9': return 'th'
    }
  }
}
