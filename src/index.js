import createObserver from "roamjs-components/dom/createObserver";

const config = {
  tabTitle: "Code Block Copy Button",
  settings: [
    {
      id: "enable-inline-code-copy-button",
      name: "Enable copy button on inline code blocks",
      description:
        "If enabled, a copy button will appear on inline code blocks",
      default: true,
      action: {
        type: "switch",
        onChange: (evt) => {
          inlineCopyEnabled = evt.target.checked;
          onunload();
          createObservers();
        },
      },
    },
  ],
};

var runners = {
  menuItems: [],
  observers: [],
};

var inlineCopyEnabled = true;

async function copyCode(e) {
  let codeBlock = e.target.closest(".rm-code-block");
  
  // select the parent codeblock
  let code = codeBlock.querySelector(".cm-content").innerText;
  console.log(code);
  
  navigator.clipboard.writeText(code).then(
    function () {},
    function (err) {
      console.error("Async: Could not copy text: ", err);
    },
  );
}

async function copyInlineCode(e) {
  let codeBlock = e.target.closest("code");
  let code = codeBlock.innerText;

  navigator.clipboard.writeText(code).then(
    function () {},
    function (err) {
      console.error("Async: Could not copy text: ", err);
    },
  );
}

const createIconButton = (icon, blockUID) => {
  const popoverButton = document.createElement("span");
  popoverButton.className =
    "bp3-button bp3-minimal bp3-small copy-code-button  dont-focus-block";
  popoverButton.tabIndex = 0;

  const popoverIcon = document.createElement("span");
  popoverIcon.className = `bp3-icon bp3-icon-${icon}`;
  popoverIcon.id = blockUID;
  popoverButton.appendChild(popoverIcon);

  return popoverButton;
};

function createButton(blockUID, DOMLocation) {
  // check if a button exists
  let checkForButton =
    DOMLocation.getElementsByClassName("copy-code-button").length;

  if (!checkForButton) {
    var mainButton = createIconButton("clipboard", blockUID);
    var settingsBar = DOMLocation.getElementsByClassName(
      "rm-code-block__settings-bar",
    )[0].lastElementChild;

    mainButton.addEventListener("click", copyCode, false);

    settingsBar.insertAdjacentElement("beforebegin", mainButton);
    // console.log(DOMLocation.getElementsByClassName('copy-code-button'))
  }
}

function createInlineButton(blockUID, DOMLocation) {
  // check if a button exists
  let checkForButton =
    DOMLocation.getElementsByClassName("copy-code-button").length;

  if (!checkForButton) {
    let button = createIconButton("clipboard", blockUID);
    button.style.paddingRight = "10px";
    button.style.paddingBottom = "2px";

    button.addEventListener("click", copyInlineCode, false);

    DOMLocation.insertAdjacentElement("afterbegin", button);
  }
}

function removeObservers() {
  // loop through observers and disconnect
  for (let index = 0; index < runners["observers"].length; index++) {
    const element = runners["observers"][index];
    element.disconnect();
  }
}
// MARK: create observer
function createObservers() {
  
  // find all code blocks on page
  var codeBlockObserver = createObserver(() => {
    
    if (document.querySelectorAll(".rm-code-block")) {
      var codeBlocks = document.querySelectorAll(".rm-code-block");
      
      for (let i = 0; i < codeBlocks.length; i++) {
        // get the blockuid from the parent div.id
        let blockUID = codeBlocks[i].closest(".roam-block").id.split("-");
        
        blockUID = blockUID[blockUID.length - 1];

        // add the copy button
        createButton(blockUID, codeBlocks[i]);
      }
    }
  });
  // save observers globally so they can be disconnected later
  runners["observers"].push(codeBlockObserver);

  if (inlineCopyEnabled) {
    var inlineCodeBlockObserver = createObserver(() => {
      if (document.querySelectorAll("code")) {
        var inlineCodeBlocks = document.querySelectorAll("code");
        for (let i = 0; i < inlineCodeBlocks.length; i++) {
          // get the blockuid from the parent div.id
          let blockParent = inlineCodeBlocks[i].closest(".roam-block");
          let blockUID = blockParent.id.split("-");
          blockUID = blockUID[blockUID.length - 1];

          // add the copy button
          createInlineButton(blockUID, inlineCodeBlocks[i]);
        }
      }
    });
    // save observers globally so they can be disconnected later
    runners["observers"].push(inlineCodeBlockObserver);
  }
}

function setSettingDefault(extensionAPI, settingId, settingDefault) {
  const storedSetting = extensionAPI.settings.get(settingId);
  if (storedSetting === null) {
    extensionAPI.settings.set(settingId, settingDefault);
    return settingDefault;
  }
  return storedSetting;
}

function onload({ extensionAPI }) {
  console.log("load copy code block plugin");

  inlineCopyEnabled = setSettingDefault(
    extensionAPI,
    "enable-inline-code-copy-button",
    true,
  );
  extensionAPI.settings.panel.create(config);

  createObservers();
}

function onunload() {
  console.log("unload copy code block plugin");
  // remove all parts of the button
  const buttons = document.querySelectorAll(".copy-code-button");
  buttons.forEach((btn) => {
    btn.remove();
  });
  removeObservers();
}

export default {
  onload,
  onunload,
};
