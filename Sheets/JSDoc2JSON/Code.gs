function jsDoc2JSON(input) {
  input = UrlFetchApp.fetch("https://raw.githubusercontent.com/custom-functions/google-sheets/main/functions/DOUBLE.gs").getBlob().getDataAsString()
  const jsDocJSON = {};
  const jsDocComment = input.match(/\/\*\*.*\*\//s);
  const jsDocDescription = jsDocComment ? jsDocComment[0].match(/^[^@]*/s) : false;
  const description = jsDocDescription ? jsDocDescription[0].split("*").map(el => el.trim()).filter(el => el !== '' && el !== '/').join(" ") : false;
  const jsDocTags = jsDocComment ? jsDocComment[0].match(/@.*(?=\@)/s) : false;
  const rawTags = jsDocTags ? jsDocTags[0].split("*").map(el => el.trim()).filter(el => el !== '') : false;
  const tags = [];
  let components;
  rawTags.forEach(el => {
    if (el.startsWith("@param ")) { // https://jsdoc.app/tags-param.html
      components = el.match(/^\@(param)(?: )\{(.*)\}(?: )(?:(?=\[)(?:\[(.*?)\])|(?!\[)(?:(.*?)))(?:(?= )(?: )(?:\- )?(.*)|(?! )$)/i);
      if (components) {
        components = components.filter(el => el !== undefined);
        tags.push({
          "tag": "param",
          "type": components[2] ? components[2] : null,
          "name": components[3] ? components[3] : null,
          "description": components[4] ? components[4] : null,
        });
      } else {
        components = el.match(/^\@(param) (?:(?=\[)(?:\[(.*)\]$)|(?!\[)(?:([^\s]+)$))/i);
        if (components) {
          components = components.filter(el => el !== undefined);
          tags.push({
            "tag": "param",
            "type": components[2] ? components[2] : null,
            "name": components[3] ? components[3] : null,
            "description": components[4] ? components[4] : null,
          });
        } else {
          console.log(`invalid @param tag: ${el}`);
        }
      }
    } else if (el.startsWith("@return ") || el.startsWith("@returns ")) { // https://jsdoc.app/tags-returns.html
      components = el.match(/^\@(returns?)(?: )\{(.*)\}(?:(?= )(?: )(?:\- )?(.*)|(?! )$)/i);
      if (components) {
        components = components.filter(el => el !== undefined);
        tags.push({
          "tag": "return",
          "type": components[2] ? components[2] : null,
          "description": components[3] ? components[3] : null,
        });
      } else {
        console.log(`invalid @return tag: ${el}`);
      }
    } else {
      console.log(`unknown tag: ${el}`);
    }
  });

  jsDocJSON.description = description;
  jsDocJSON.tags = tags;

  console.log(JSON.stringify(jsDocJSON, null, 2));
}


// https://jsdoc.app/tags-param.html

// ^\@(param) (?:(?=\[)(?:\[(.*)\]$)|(?!\[)(?:([^\s]+)$))
//   @param somebody

// ^\@(param)(?: )\{(.*)\}(?: )(?:(?=\[)(?:\[(.*?)\])|(?!\[)(?:(.*?)))(?:(?= )(?: )(?:\- )?(.*)|(?! )$)
//   @param {string} somebody
//   @param {string} somebody Somebody's name.
//   @param {string} somebody - Somebody's name.
//   @param {string} employee.name - The name of the employee.
//   @param {Object[]} employees - The employees who are responsible for the project.
//   @param {string} employees[].department - The employee's department.
//   @param {string=} somebody - Somebody's name.
//   @param {*} somebody - Whatever you want.
//   @param {string} [somebody=John Doe] - Somebody's name.
//   @param {(string|string[])} [somebody=John Doe] - Somebody's name, or an array of names.
//   @param {string} [somebody] - Somebody's name.



// https://jsdoc.app/tags-returns.html

// ^\@(returns)(?: )\{(.*)\}(?:(?= )(?: )(?:\- )?(.*)|(?! )$)
// 	@returns {number}
// 	@returns {number} Sum of a and b
// 	@returns {(number|Array)} Sum of a and b or an array that contains a, b and the sum of a and b.
// 	@returns {Promise} Promise object represents the sum of a and b
