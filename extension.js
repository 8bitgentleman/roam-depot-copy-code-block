
async function copyCode(e){
  // datomic query to pull the block string. Only supports blocks with a single code block inside
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
  // copy codeblock to clipboard
  navigator.clipboard.writeText(code).then(function() {
  }, function(err) {
    console.error('Async: Could not copy text: ', err);
  });
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

  // check if a button exists
  let checkForButton = DOMLocation.getElementsByClassName('copy-code-button').length;

  if (!checkForButton) {
      var mainButton = createCopyButton();
      var settingsBar = DOMLocation.getElementsByClassName("rm-code-block__settings-bar")[0].lastElementChild;
      
      mainButton.addEventListener("click", copyCode, false);

      settingsBar.insertAdjacentElement("beforebegin", mainButton);
      console.log(DOMLocation.getElementsByClassName('copy-code-button'))
  }   
}

// still need to do this for every page reload
//maybe need a mutation observer?
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