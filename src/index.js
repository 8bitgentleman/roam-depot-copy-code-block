import createObserver from "roamjs-components/dom/createObserver";

var runners = {
  menuItems: [],
  observers: [],
}

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
const createIconButton = (icon, blockUID) => {
  const popoverButton = document.createElement("span");
  popoverButton.className = "bp3-button bp3-minimal bp3-small copy-code-button";
  popoverButton.tabIndex = 0;

  const popoverIcon = document.createElement("span");
  popoverIcon.className = `bp3-icon bp3-icon-${icon}`;
  popoverIcon.id = blockUID;
  popoverButton.appendChild(popoverIcon);

  return popoverButton;
};

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
      var mainButton = createIconButton('clipboard', blockUID);
      var settingsBar = DOMLocation.getElementsByClassName("rm-code-block__settings-bar")[0].lastElementChild;
      
      mainButton.addEventListener("click", copyCode, false);

      settingsBar.insertAdjacentElement("beforebegin", mainButton);
      // console.log(DOMLocation.getElementsByClassName('copy-code-button'))
  }   
}

function onload() {
  console.log("load copy code block plugin");

  // find all code blocks on page
  var codeBlockObserver = createObserver(() => {
    if ( document.querySelectorAll(".rm-code-block")) {
        var codeBlocks = document.querySelectorAll(".rm-code-block")
        for (let i = 0; i < codeBlocks.length; i++) {
          // get the blockuid from the parent div.id
          let blockUID = codeBlocks[i].closest(".roam-block").id.split("-")
          blockUID = blockUID[blockUID.length - 1]
    
          // add the copy button
          createButton(blockUID, codeBlocks[i])
      }
    }
    });
 
// save observers globally so they can be disconnected later
runners['observers'] = [codeBlockObserver]

  
}

function onunload() {
  console.log("unload copy code block plugin");
  // remove all parts of the button
  const buttons = document.querySelectorAll('.copy-code-button');
  buttons.forEach(btn => {
      btn.remove();
  });
  // loop through observers and disconnect
  for (let index = 0; index < runners['observers'].length; index++) {
    const element = runners['observers'][index];
    element.disconnect()
}
}

export default {
onload,
onunload
};