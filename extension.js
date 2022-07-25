
async function copyCode(e){
  // datomic query to pull the block string. Only supports blocks with a single code block inside
  // console.log(e)
  // console.log(e.path)
  // console.log(e.srcElement.id)
  let blockUID = e.srcElement.id
  let query = `[:find ?s .
      :in $ ?uid
      :where 
        [?e :block/uid ?uid]
        [?e :block/string ?s]
        ]`;

  let blockString = window.roamAlphaAPI.q(query,blockUID);

  // remove code block markdown using regex
  let code = blockString.match(/```(?:\b.*\b)\n([\s\S]*?)```/)[1];
  console.log(code)
  // copy codeblock to clipboard
  navigator.clipboard.writeText(code).then(function() {
  }, function(err) {
    console.error('Async: Could not copy text: ', err);
  });
  console.log(blockUID, code);
}

function createButton(blockUID, DOMLocation){
  const createCopyButton = () => {
      const copySpan = document.createElement("span");
      copySpan.className = "copy-code-button";

      const copyButton = document.createElement("button");
      copyButton.innerText  = `Copy`;
      copyButton.className = "bp3-button bp3-minimal bp3-small";
      copyButton.id = blockUID;
      copySpan.appendChild(copyButton);

      return copySpan;
  };
  var nameToUse = 'copy-code-button';

  // var checkForButton = DOMLocation.getElementsByClassName(nameToUse);
  let checkForButton
  if (!checkForButton) {
      var mainButton = createCopyButton();
      var settingsBar = DOMLocation.getElementsByClassName("rm-code-block__settings-bar")[0].lastElementChild;
      
      // nextIconButton.insertAdjacentElement("afterend", mainButton);

      mainButton.addEventListener("click", copyCode, false);
      // settingsBar.appendChild(mainButton);
      settingsBar.insertAdjacentElement("beforebegin", mainButton);
  }   
}

function destroyButton(){

  // remove all parts of the button
  const buttons = document.querySelectorAll('.copy-code-button');
  // console.log(buttons)
  buttons.forEach(tog => {
      tog.remove();
  });
}

// find all code blocks on page
let codeBlocks = document.querySelectorAll(".rm-code-block")
for (let i = 0; i < codeBlocks.length; i++) {
  // get the blockuid from the parent div.id
  let blockUID = codeBlocks[i].closest(".roam-block").id.split("-")
  blockUID = blockUID[blockUID.length - 1]

  // add the copy button
  createButton(blockUID, codeBlocks[i])
}

function onload() {
  console.log("load copy code block plugin");

  // find all code blocks on page
  let codeBlocks = document.querySelectorAll(".rm-code-block")
  for (let i = 0; i < codeBlocks.length; i++) {
      // get the blockuid from the parent div.id
      let blockUID = codeBlocks[i].closest(".roam-block").id.split("-")
      blockUID = blockUID[blockUID.length - 1]

      // add the copy button
      createButton(blockUID, codeBlocks[i])
  }
}

function onunload() {
  console.log("unload copy code block plugin");
  // remove all parts of the button
  const buttons = document.querySelectorAll('.copy-code-button');
  // console.log(buttons)
  buttons.forEach(btn => {
      btn.remove();
  });
}

export default {
onload,
onunload
};