/* eslint-disable no-extend-native */
/* eslint-disable no-useless-escape */

Number.prototype.pad = function(length, char = '0') { return String(this).padStart(length, char) }

String.prototype.replaceAll = function (find, replace) {
  const escaped_find = find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
  return this.replace(new RegExp(escaped_find, 'g'), replace);
}

Array.prototype.forEachAsync = async function asyncForEach(callback) {
  for (let i = 0; i < this.length; i++) {
    await callback(this[i], i, this)
  }
}
