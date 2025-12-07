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

async function copyCode(e, blockUID) {  
  let eid = `[:block/uid "${blockUID}"]`
  
  let codeBlock = window.roamAlphaAPI.data.pull("[:block/string]", eid)[":block/string"]
  
  // Modified regex to handle hyphens and other special characters in language names
  const codeBlockRegex = /```([a-zA-Z0-9+#\-_ ]*)([\s\S]*?)```/;
  
  // Find the match in the markdown string
  const match = codeBlock.match(codeBlockRegex);
  
  // If a match is found, return an object with the language and code block content
  if (match) {
    const language = match[1]?.trim() || null; // If no language is specified, set it to null
    const code = match[2].trim();
    
    try {
      await navigator.clipboard.writeText(code);
      // Add visual feedback
      const icon = e.target.closest('.copy-code-button')?.querySelector('.bp3-icon');
      if (icon) {
        icon.classList.remove('bp3-icon-clipboard');
        icon.classList.add('bp3-icon-tick');
        setTimeout(() => {
          icon.classList.remove('bp3-icon-tick');
          icon.classList.add('bp3-icon-clipboard');
        }, 1000);
      }
    } catch (err) {
      console.error("Could not copy text: ", err);
    }
  }
}

async function copyInlineCode(e) {
  let codeBlock = e.target.closest("code");
  let code = codeBlock.innerText;

  try {
    await navigator.clipboard.writeText(code);
    // Add visual feedback
    const icon = e.target.closest('.copy-code-button')?.querySelector('.bp3-icon');
    if (icon) {
      icon.classList.remove('bp3-icon-clipboard');
      icon.classList.add('bp3-icon-tick');
      setTimeout(() => {
        icon.classList.remove('bp3-icon-tick');
        icon.classList.add('bp3-icon-clipboard');
      }, 1000);
    }
  } catch (err) {
    console.error("Could not copy text: ", err);
  }
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

    mainButton.addEventListener("click", function(e) {      
      copyCode(e, blockUID);
    }, false);

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
    button.classList.add("inline-copy-code-button");

    button.addEventListener("click", copyInlineCode, false);

    DOMLocation.insertAdjacentElement("afterbegin", button);
  }
}

function injectStyles() {
  const styleId = "copy-code-button-styles";

  // Check if styles already exist
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      code .inline-copy-code-button {
        opacity: 0;
        width: 0 !important;
        min-width: 0 !important;
        padding: 0 !important;
        margin: 0 !important;
        border: none !important;
        overflow: hidden;
        transition: opacity 0.2s ease-in-out 0.5s, width 0.2s ease-in-out 0.5s, padding 0.2s ease-in-out 0.5s, margin 0.2s ease-in-out 0.5s;
      }

      code:hover .inline-copy-code-button {
        opacity: 1;
        width: auto !important;
        padding: 5px !important;
        margin: 0 2px !important;
      }
    `;
    document.head.appendChild(style);
  }
}

function removeStyles() {
  const styleElement = document.getElementById("copy-code-button-styles");
  if (styleElement) {
    styleElement.remove();
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

  injectStyles();
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
  removeStyles();
}

export default {
  onload,
  onunload,
};
