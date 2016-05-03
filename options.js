var tcDefaults = {
  playAndPauseKeyCode:     75,  // default: K
  nextFrameKeyCode:        76,  // default: L
  prevFrameKeyCode:        74,  // default: J
  jumpToStartKeyCode:      72,  // default: H
  jumpToEndKeyCode:        69,  // default: E
  backToPrevFrameKeyCode:  66,  // default: B
  changeScreenModeKeyCode: 83,  // default: S
  jumpToFrameKeyCode:      84,  // default: T
  onbeforeunloadWarning:   true // default: true
};

function recordKeyPress(e) {
  var normalizedChar = String.fromCharCode(e.keyCode).toUpperCase();
  e.target.value = normalizedChar;
  e.target.keyCode = normalizedChar.charCodeAt();

  e.preventDefault();
  e.stopPropagation();
};

function inputFilterNumbersOnly(e) {
  var char = String.fromCharCode(e.keyCode);
  if (!/[\d\.]$/.test(char) || !/^\d+(\.\d*)?$/.test(e.target.value + char)) {
    e.preventDefault();
    e.stopPropagation();
  }
};

function inputFocus(e) {
   e.target.value = "";
};

function inputBlur(e) {
   e.target.value = String.fromCharCode(e.target.keyCode).toUpperCase();
};

function updateShortcutInputText(inputId, keyCode) {
  document.getElementById(inputId).value = String.fromCharCode(keyCode).toUpperCase();
  document.getElementById(inputId).keyCode = keyCode;
}

// Saves options to chrome.storage
function save_options() {

  var playAndPauseKeyCode = document.getElementById('playAndPause').keyCode;
  var nextFrameKeyCode = document.getElementById('nextFrame').keyCode;
  var prevFrameKeyCode = document.getElementById('prevFrame').keyCode;
  var jumpToStartKeyCode = document.getElementById('jumpToStart').keyCode;
  var jumpToEndKeyCode = document.getElementById('jumpToEnd').keyCode;
  var backToPrevFrameKeyCode = document.getElementById('backToPrevFrame').keyCode;
  var changeScreenModeKeyCode = document.getElementById('changeScreenMode').keyCode;
  var jumpToFrameKeyCode = document.getElementById('jumpToFrame').keyCode;
  var onbeforeunloadWarning = document.getElementById('onbeforeunloadWarning').checked;

  playAndPauseKeyCode = isNaN(playAndPauseKeyCode) ? tcDefaults.playAndPauseKeyCode : playAndPauseKeyCode;
  nextFrameKeyCode = isNaN(nextFrameKeyCode) ? tcDefaults.nextFrameKeyCode : nextFrameKeyCode;
  prevFrameKeyCode = isNaN(prevFrameKeyCode) ? tcDefaults.prevFrameKeyCode : prevFrameKeyCode;
  jumpToStartKeyCode = isNaN(jumpToStartKeyCode) ? tcDefaults.jumpToStartKeyCode : jumpToStartKeyCode;
  jumpToEndKeyCode = isNaN(jumpToEndKeyCode) ? tcDefaults.jumpToEndKeyCode : jumpToEndKeyCode;
  backToPrevFrameKeyCode = isNaN(backToPrevFrameKeyCode) ? tcDefaults.backToPrevFrameKeyCode : backToPrevFrameKeyCode;
  changeScreenModeKeyCode = isNaN(changeScreenModeKeyCode) ? tcDefaults.changeScreenModeKeyCode : changeScreenModeKeyCode;
  jumpToFrameKeyCode = isNaN(jumpToFrameKeyCode) ? tcDefaults.jumpToFrameKeyCode : jumpToFrameKeyCode;

  chrome.storage.sync.set({
    playAndPauseKeyCode: playAndPauseKeyCode,
    nextFrameKeyCode: nextFrameKeyCode,
    prevFrameKeyCode: prevFrameKeyCode,
    jumpToStartKeyCode: jumpToStartKeyCode,
    jumpToEndKeyCode: jumpToEndKeyCode,
    backToPrevFrameKeyCode: backToPrevFrameKeyCode,
    changeScreenModeKeyCode: changeScreenModeKeyCode,
    jumpToFrameKeyCode: jumpToFrameKeyCode,
    onbeforeunloadWarning: onbeforeunloadWarning
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = '保存しました';
    setTimeout(function() {
      status.textContent = '';
    }, 1500);
  });
}

// Restores options from chrome.storage
function restore_options() {
  chrome.storage.sync.get(tcDefaults, function(storage) {
    updateShortcutInputText('playAndPause', storage.playAndPauseKeyCode);
    updateShortcutInputText('nextFrame', storage.nextFrameKeyCode);
    updateShortcutInputText('prevFrame', storage.prevFrameKeyCode);
    updateShortcutInputText('jumpToStart', storage.jumpToStartKeyCode);
    updateShortcutInputText('jumpToEnd', storage.jumpToEndKeyCode);
    updateShortcutInputText('backToPrevFrame', storage.backToPrevFrameKeyCode);
    updateShortcutInputText('changeScreenMode', storage.changeScreenModeKeyCode);
    updateShortcutInputText('jumpToFrame', storage.jumpToFrameKeyCode);
    document.getElementById('onbeforeunloadWarning').checked = storage.onbeforeunloadWarning;
  });
}

function restore_defaults() {
  chrome.storage.sync.set(tcDefaults, function() {
    restore_options();
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = '設定を初期化しました';
    setTimeout(function() {
      status.textContent = '';
    }, 1500);
  });
}

function initShortcutInput(inputId) {
  document.getElementById(inputId).addEventListener('focus', inputFocus);
  document.getElementById(inputId).addEventListener('blur', inputBlur);
  document.getElementById(inputId).addEventListener('keypress', recordKeyPress);
}

document.addEventListener('DOMContentLoaded', function () {
  restore_options();

  document.getElementById('save').addEventListener('click', save_options);
  document.getElementById('restore').addEventListener('click', restore_defaults);

  initShortcutInput('playAndPause');
  initShortcutInput('nextFrame');
  initShortcutInput('prevFrame');
  initShortcutInput('jumpToStart');
  initShortcutInput('jumpToEnd');
  initShortcutInput('backToPrevFrame');
  initShortcutInput('changeScreenMode');
  initShortcutInput('jumpToFrame');
  // initShortcutInput('slowerKeyInput');
  // initShortcutInput('fasterKeyInput');

  // document.getElementById('rewindTime').addEventListener('keypress', inputFilterNumbersOnly);
  // document.getElementById('advanceTime').addEventListener('keypress', inputFilterNumbersOnly);
  // document.getElementById('speedStep').addEventListener('keypress', inputFilterNumbersOnly);
})
