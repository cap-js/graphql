const astToLimit = (topArg, skipArg) => ({
  rows: { val: topArg.value.value },
  offset: { val: skipArg?.value.value || 0 }
})

module.exports = astToLimit
