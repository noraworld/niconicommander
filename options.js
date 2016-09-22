var defaultKey = {
  togglePlayAndPauseKeyCode:   'k',
  jumpToBeginningKeyCode:      'h',
  jumpToEndKeyCode:            'e',
  prevFrameKeyCode:            'j',
  nextFrameKeyCode:            'l',
  jumpToSpecifiedFrameKeyCode: 't',
  backToBeforeFrameKeyCode:    'b',
  changeScreenModeKeyCode:     'f',
  onbeforeunloadWarning:      true,
  checkCommandAvailability:  false,
  scrollToPlayerKeyCode:      true,
};

$(function() {
  loadOptions();
  
  $('#save').on('click', saveOptions);
  $('#reset').on('click', resetOptions);
  
  initShortcutInput('toggle-play-and-pause');
  initShortcutInput('jump-to-beginning');
  initShortcutInput('jump-to-end');
  initShortcutInput('prev-frame');
  initShortcutInput('next-frame');
  initShortcutInput('jump-to-specified-frame');
  initShortcutInput('back-to-before-frame');
  initShortcutInput('change-screen-mode');
});

function loadOptions() {
  chrome.storage.sync.get(defaultKey, function(storage) {
    updateInputText('toggle-play-and-pause',   storage.togglePlayAndPauseKeyCode);
    updateInputText('jump-to-beginning',       storage.jumpToBeginningKeyCode);
    updateInputText('jump-to-end',             storage.jumpToEndKeyCode);
    updateInputText('prev-frame',              storage.prevFrameKeyCode);
    updateInputText('next-frame',              storage.nextFrameKeyCode);
    updateInputText('jump-to-specified-frame', storage.jumpToSpecifiedFrameKeyCode);
    updateInputText('back-to-before-frame',    storage.backToBeforeFrameKeyCode);
    updateInputText('change-screen-mode',      storage.changeScreenModeKeyCode);
    document.getElementById('onbeforeunload-warning').checked = storage.onbeforeunloadWarning;
    document.getElementById('check-command-availability').checked = storage.checkCommandAvailability;
    document.getElementById('scroll-to-player').checked = storage.scrollToPlayerKeyCode;
  });
}

function updateInputText(inputID, keyCode) {
  document.getElementById(inputID).value = keyCode;
  document.getElementById(inputID).keyCode = keyCode;
}

function saveOptions() {
  var togglePlayAndPauseKeyCode   = document.getElementById('toggle-play-and-pause').value;
  var jumpToBeginningKeyCode      = document.getElementById('jump-to-beginning').value;
  var jumpToEndKeyCode            = document.getElementById('jump-to-end').value;
  var prevFrameKeyCode            = document.getElementById('prev-frame').value;
  var nextFrameKeyCode            = document.getElementById('next-frame').value;
  var jumpToSpecifiedFrameKeyCode = document.getElementById('jump-to-specified-frame').value;
  var backToBeforeFrameKeyCode    = document.getElementById('back-to-before-frame').value;
  var changeScreenModeKeyCode     = document.getElementById('change-screen-mode').value;
  var onbeforeunloadWarning       = document.getElementById('onbeforeunload-warning').checked;
  var checkCommandAvailability    = document.getElementById('check-command-availability').checked;
  var scrollToPlayerKeyCode       = document.getElementById('scroll-to-player').checked;

  var validateFlag = [];
  validateFlag[0]  = checkValidate('toggle-play-and-pause');
  validateFlag[1]  = checkValidate('jump-to-beginning');
  validateFlag[2]  = checkValidate('jump-to-end');
  validateFlag[3]  = checkValidate('prev-frame');
  validateFlag[4]  = checkValidate('next-frame');
  validateFlag[5]  = checkValidate('jump-to-specified-frame');
  validateFlag[6]  = checkValidate('back-to-before-frame');
  validateFlag[7]  = checkValidate('change-screen-mode');
  validateFlag[8]  = checkValidateChecked('onbeforeunload-warning');
  validateFlag[9]  = checkValidateChecked('check-command-availability');
  validateFlag[10] = checkValidateChecked('scroll-to-player');

  // when some input is wrong
  for (var i = 0; i < validateFlag.length; i++) {
    if (validateFlag[i] === false) {
      return false;
    }
  }

  chrome.storage.sync.set({
    togglePlayAndPauseKeyCode:   togglePlayAndPauseKeyCode,
    jumpToBeginningKeyCode:      jumpToBeginningKeyCode,
    jumpToEndKeyCode:            jumpToEndKeyCode,
    prevFrameKeyCode:            prevFrameKeyCode,
    nextFrameKeyCode:            nextFrameKeyCode,
    jumpToSpecifiedFrameKeyCode: jumpToSpecifiedFrameKeyCode,
    backToBeforeFrameKeyCode:    backToBeforeFrameKeyCode,
    changeScreenModeKeyCode:     changeScreenModeKeyCode,
    onbeforeunloadWarning:       onbeforeunloadWarning,
    checkCommandAvailability:    checkCommandAvailability,
    scrollToPlayerKeyCode:       scrollToPlayerKeyCode
  }, function() {
    var status = $('#status');
    status.text('Saved');
    setTimeout(function() {
      status.text('');
    }, 1500);
  });
}

function resetOptions() {
  chrome.storage.sync.set(defaultKey, function() {
    loadOptions();

    // reset error marks
    for (var i = 0; i < $('input').length; i++) {
      $('input').eq(i).parent().children('.invalid-value').remove();
      $('input').eq(i).css('border', '1px solid #cccccc');
    }

    var status = $('#status');
    status.text('Reset');
    setTimeout(function() {
      status.text('');
    }, 1500);
  });
}

function initShortcutInput(inputID) {
  document.getElementById(inputID).addEventListener('focus',    inputFocus);
  document.getElementById(inputID).addEventListener('blur',     inputBlur);
  document.getElementById(inputID).addEventListener('keypress', recordKeyPress);
}

function inputFocus(event) {
  event.target.value = '';
  $(this).css('border', '1px solid #cccccc');
}

function inputBlur(event) {
  event.target.value = event.target.keyCode;
}

function recordKeyPress(event) {
  var nomalizedChar = encodeYenSignToBackslash(event.key);
  event.target.value = nomalizedChar;
  event.target.keyCode = nomalizedChar;
  event.preventDefault();
  event.stopPropagation();
}

function encodeYenSignToBackslash(key) {
  // 165 -> Yen Sign
  if (key.charCodeAt() == 165) {
    key = '\\';
  }
  return key;
}

function checkValidate(inputID) {
  var inputID = '#' + inputID;
  $(inputID).parent().children('.invalid-value').remove();
  if ($(inputID).val().match(/^[0-9a-zA-Z-^\\@\[\];:,./_=~|`{}+*<>?!"#$%&'()]{1}$/) === null) {
    // some input is wrong.
    $(inputID).css('border', '1px solid red');
    $(inputID).parent().append('<div class="invalid-value">Invalid value</div>');
    var errorFlag = true;
  } else {
    $(inputID).css('border', '1px solid #cccccc');
  }

  // return value: true -> save the options, false -> do not save.
  if (errorFlag === true) {
    return false;
  } else {
    return true;
  }
}

function checkValidateChecked(inputID) {
  var inputID = '#' + inputID;
  $(inputID).parent().children('.invalid-value').remove();
  if ($(inputID).prop('checked') !== true && $(inputID).prop('checked') !== false) {
    // checkbox value is wrong
    $(inputID).css('border', '1px solid red');
    $(inputID).parent().append('<div class="invalid-value">Invalid value</div>');
    var errorFlag = true;
  } else {
    $(inputID).css('border', '1px solid #cccccc');
  }

  // return value: true -> save the options, false -> do not save
  if (errorFlag === true) {
    return false;
  } else {
    return true;
  }
}
