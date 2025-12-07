import createObserver from "roamjs-components/dom/createObserver";

const config = {
  tabTitle: "Code Block Copy Button",
  settings: [
    {
      id: "enable-inline-code-copy-button",
      name: "Enable copy button on inline code blocks",
      description:
        "If enabled, a copy button will appear on inline code blocks on hover",
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
    {
      id: "enable-regular-code-copy-button",
      name: "Enable copy button on regular code blocks",
      description:
        "If enabled, a copy button will appear on regular code blocks",
      default: true,
      action: {
        type: "switch",
        onChange: (evt) => {
          regularCopyEnabled = evt.target.checked;
          onunload();
          createObservers();
        },
      },
    },
    {
      id: "inline-hover-delay",
      name: "Inline code button hover delay (seconds)",
      description:
        "How long to hover over inline code before the copy button appears",
      default: "0.5",
      action: {
        type: "input",
        placeholder: "0.5",
        onChange: (evt) => {
          const value = parseFloat(evt.target.value);
          if (!isNaN(value) && value >= 0) {
            inlineHoverDelay = value;
            updateInlineStyles();
          }
        },
      },
    },
    {
      id: "button-icon-style",
      name: "Button icon style",
      description:
        "Choose between a filled clipboard icon or an outlined duplicate icon",
      default: "clipboard",
      action: {
        type: "select",
        items: ["clipboard", "duplicate"],
        onChange: (evt) => {
          buttonIconStyle = evt;
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
var regularCopyEnabled = true;
var inlineHoverDelay = 0.5;
var buttonIconStyle = "clipboard";

// Helper function to extract block UID from an ID (from roamjs-components)
const getUidsFromId = (id) => {
  if (!id) return { blockUid: "", windowId: "" };
  const blockUid = id.substring(id.length - 9, id.length);
  const restOfHTMLId = id.substring(0, id.length - 10);
  const windowId =
    restOfHTMLId.match(/^block-input-([a-zA-Z0-9_-]+)$/)?.[1] || "";
  return {
    blockUid,
    windowId,
  };
};

// Helper function to extract block UID from a target element (inspired by roamjs-components)
const getBlockUidFromTarget = (target) => {
  // Check for block reference
  const ref = target.closest(".rm-block-ref");
  if (ref) {
    return ref.getAttribute("data-uid") || "";
  }

  // Get the roam block container
  const roamBlock = target.closest(".roam-block");
  if (!roamBlock) {
    return "";
  }

  // Try to find the block input element with the ID
  const blockInput = roamBlock.querySelector(".rm-block__input");
  if (blockInput && blockInput.id) {
    return getUidsFromId(blockInput.id).blockUid;
  }

  // Fallback: try to get from roam-block id if it exists
  if (roamBlock.id) {
    return getUidsFromId(roamBlock.id).blockUid;
  }

  return "";
};

async function copyCode(e, blockUID) {
  let code = null;

  try {
    let eid = `[:block/uid "${blockUID}"]`
    let blockData = window.roamAlphaAPI.data.pull("[:block/string]", eid);

    if (blockData && blockData[":block/string"]) {
      let codeBlock = blockData[":block/string"];

      // Modified regex to handle hyphens and other special characters in language names
      const codeBlockRegex = /```([a-zA-Z0-9+#\-_ ]*)([\s\S]*?)```/;

      // Find the match in the markdown string
      const match = codeBlock.match(codeBlockRegex);

      // If a match is found, extract the code
      if (match) {
        code = match[2].trim();
      }
    }
  } catch (err) {
    console.error("Could not fetch code from API: ", err);
  }

  // Fallback: try to get code directly from DOM
  if (!code) {
    const codeBlock = e.target.closest('.rm-code-block');
    if (codeBlock) {
      const codeContent = codeBlock.querySelector('.CodeMirror-code');
      if (codeContent) {
        code = codeContent.innerText;
      }
    }
  }

  // Copy the code if we found it
  if (code) {
    try {
      await navigator.clipboard.writeText(code);
      // Add visual feedback
      const icon = e.target.closest('.copy-code-button')?.querySelector('.bp3-icon');
      if (icon) {
        icon.classList.remove(`bp3-icon-${buttonIconStyle}`);
        icon.classList.add('bp3-icon-tick');
        setTimeout(() => {
          icon.classList.remove('bp3-icon-tick');
          icon.classList.add(`bp3-icon-${buttonIconStyle}`);
        }, 1000);
      }
    } catch (err) {
      console.error("Could not copy text: ", err);
    }
  } else {
    console.error("Could not find code to copy");
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
      icon.classList.remove(`bp3-icon-${buttonIconStyle}`);
      icon.classList.add('bp3-icon-tick');
      setTimeout(() => {
        icon.classList.remove('bp3-icon-tick');
        icon.classList.add(`bp3-icon-${buttonIconStyle}`);
      }, 1000);
    }
  } catch (err) {
    console.error("Could not copy text: ", err);
  }
}

const createIconButton = (blockUID) => {
  const popoverButton = document.createElement("span");
  popoverButton.className =
    "bp3-button bp3-minimal bp3-small copy-code-button  dont-focus-block";
  popoverButton.tabIndex = 0;

  const popoverIcon = document.createElement("span");
  popoverIcon.className = `bp3-icon bp3-icon-${buttonIconStyle}`;
  popoverIcon.id = blockUID;
  popoverButton.appendChild(popoverIcon);

  return popoverButton;
};

function createButton(blockUID, DOMLocation) {
  // check if a button exists
  let checkForButton =
    DOMLocation.getElementsByClassName("copy-code-button").length;

  if (!checkForButton) {
    var mainButton = createIconButton(blockUID);
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
    let button = createIconButton(blockUID);
    button.classList.add("inline-copy-code-button");

    button.addEventListener("click", copyInlineCode, false);

    DOMLocation.insertAdjacentElement("afterbegin", button);
  }
}

function updateInlineStyles() {
  const styleId = "copy-code-button-styles";
  const existingStyle = document.getElementById(styleId);

  if (existingStyle) {
    existingStyle.textContent = `
      code .inline-copy-code-button {
        opacity: 0;
        width: 0 !important;
        min-width: 0 !important;
        padding: 0 !important;
        margin: 0 !important;
        border: none !important;
        overflow: hidden;
        transition: opacity 0.2s ease-in-out ${inlineHoverDelay}s, width 0.2s ease-in-out ${inlineHoverDelay}s, padding 0.2s ease-in-out ${inlineHoverDelay}s, margin 0.2s ease-in-out ${inlineHoverDelay}s;
      }

      code:hover .inline-copy-code-button {
        opacity: 1;
        width: auto !important;
        padding: 5px !important;
        margin: 0 2px !important;
      }
    `;
  }
}

function injectStyles() {
  const styleId = "copy-code-button-styles";

  // Check if styles already exist
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    document.head.appendChild(style);
  }

  updateInlineStyles();
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
  if (regularCopyEnabled) {
    var codeBlockObserver = createObserver(() => {
      if (document.querySelectorAll(".rm-code-block")) {
        var codeBlocks = document.querySelectorAll(".rm-code-block");

        for (let i = 0; i < codeBlocks.length; i++) {
          const blockUID = getBlockUidFromTarget(codeBlocks[i]);

          if (blockUID) {
            // add the copy button
            createButton(blockUID, codeBlocks[i]);
          }
        }
      }
    });
    // save observers globally so they can be disconnected later
    runners["observers"].push(codeBlockObserver);
  }

  if (inlineCopyEnabled) {
    var inlineCodeBlockObserver = createObserver(() => {
      if (document.querySelectorAll("code")) {
        var inlineCodeBlocks = document.querySelectorAll("code");
        for (let i = 0; i < inlineCodeBlocks.length; i++) {
          const blockUID = getBlockUidFromTarget(inlineCodeBlocks[i]);

          if (blockUID) {
            // add the copy button
            createInlineButton(blockUID, inlineCodeBlocks[i]);
          }
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

  regularCopyEnabled = setSettingDefault(
    extensionAPI,
    "enable-regular-code-copy-button",
    true,
  );

  const hoverDelaySetting = setSettingDefault(
    extensionAPI,
    "inline-hover-delay",
    "0.5",
  );
  inlineHoverDelay = parseFloat(hoverDelaySetting);

  buttonIconStyle = setSettingDefault(
    extensionAPI,
    "button-icon-style",
    "clipboard",
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
