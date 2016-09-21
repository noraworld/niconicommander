$(function() {

  var settings = {
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

  chrome.storage.sync.get(settings, function(storage) {
    settings.playAndPauseKeyCode     = Number(storage.playAndPauseKeyCode);
    settings.nextFrameKeyCode        = Number(storage.nextFrameKeyCode);
    settings.prevFrameKeyCode        = Number(storage.prevFrameKeyCode);
    settings.jumpToStartKeyCode      = Number(storage.jumpToStartKeyCode);
    settings.jumpToEndKeyCode        = Number(storage.jumpToEndKeyCode);
    settings.backToPrevFrameKeyCode  = Number(storage.backToPrevFrameKeyCode);
    settings.changeScreenModeKeyCode = Number(storage.changeScreenModeKeyCode);
    settings.jumpToFrameKeyCode      = Number(storage.jumpToFrameKeyCode);
    settings.onbeforeunloadWarning   = Boolean(storage.onbeforeunloadWarning);
  });

  // ページを離れるときに警告
  window.onbeforeunload = function() {
    if (settings.onbeforeunloadWarning === true) {
      return '動画の読み込みがリセットされる可能性があります';
    }
  };

  // スタートやエンドに移動してしまったときの前の位置を保持する変数
  var back;
  // autoBlur内のsetTimeout止めるための変数
  var timerId;

  // 再生する / 停止する
  function playAndPause() {
    scrollToPlayer();
    var player = document.getElementById('external_nicoplayer');
    status = player.ext_getStatus();
    if (status == 'playing')
      player.ext_play(false);
    else if (status == 'paused')
      player.ext_play(true);
    document.onkeydown = function(e) {
      return !(e.keyCode == 32);
    }
  };

  // 次のフレームに移動する
  function nextFrame() {
    scrollToPlayer();
    var player = document.getElementById('external_nicoplayer');
    var totalTime = player.ext_getTotalTime();
    var loadedRatio = player.ext_getLoadedRatio();
    var loadedTime = totalTime * loadedRatio;
    var player = document.getElementById('external_nicoplayer');
    var playtime = player.ext_getPlayheadTime();
    var next = playtime + 1;
    player.ext_setPlayheadTime(next);
    var checkNext = player.ext_getPlayheadTime();
    while (playtime >= checkNext && next < loadedTime) {
      next = next + 1;
      player.ext_setPlayheadTime(next);
      checkNext = player.ext_getPlayheadTime();
    }
  };

  // 前のフレームに移動する
  function prevFrame() {
    scrollToPlayer();
    var player = document.getElementById('external_nicoplayer');
    var playtime = player.ext_getPlayheadTime();
    var prev = playtime - 1;
    player.ext_setPlayheadTime(prev);
    var checkPrev = player.ext_getPlayheadTime();
    while (playtime <= checkPrev && prev > 0) {
      prev = prev - 1;
      player.ext_setPlayheadTime(prev);
      checkPrev = player.ext_getPlayheadTime();
    }
  };

  // 動画の一番最初に移動する
  function jumpToStart() {
    scrollToPlayer();
    var player = document.getElementById('external_nicoplayer');
    back = player.ext_getPlayheadTime();
    player.ext_setPlayheadTime(0);
  };

  // 動画の一番最後に移動する
  function jumpToEnd() {
    scrollToPlayer();
    var player = document.getElementById('external_nicoplayer');
    back = player.ext_getPlayheadTime();
    var endtime = player.ext_getTotalTime();
    player.ext_setPlayheadTime(endtime);
  };

  // スタートやエンドに戻ってしまったときに元の位置に戻る
  function backToPrevFrame() {
    if (back !== null) {
      scrollToPlayer();
      var player = document.getElementById('external_nicoplayer');
      player.ext_setPlayheadTime(back);
    }
  };

  function jumpToTimeRatio(timeRatio) {
    scrollToPlayer();
    var player = document.getElementById('external_nicoplayer');
    timeRatio = (timeRatio - 48) / 10;
    timeRatio = player.ext_getTotalTime() * timeRatio;
    player.ext_setPlayheadTime(timeRatio);
  }

  // フルスクリーンモードにする / 解除する
  function changeScreenMode() {
    scrollToPlayer();
    var player = document.getElementById('external_nicoplayer');
    var fullScreen = player.ext_getVideoSize();
    if (fullScreen == 'normal') {
      player.ext_setVideoSize('fit');
    } else if (fullScreen == 'fit') {
      player.ext_setVideoSize('normal');
    }
  };

  // 時間を指定して移動する
  function jumpToFrame() {
    scrollToPlayer();
    inputOfJumpTo = prompt('移動先時間(形式: 25:25):');
    if (inputOfJumpTo.match(/^\d{1,3}:\d{1,2}$/)) {
      inputOfJumpTo = inputOfJumpTo.split(':');
      inputOfJumpTo[0] = Number(inputOfJumpTo[0]);
      inputOfJumpTo[1] = Number(inputOfJumpTo[1]);
      if (inputOfJumpTo[1] >= 60)
        alert('秒数は60秒以内で入力してください');
      else {
        var jumpTo;
        jumpTo = inputOfJumpTo[0] * 60;
        jumpTo = jumpTo + inputOfJumpTo[1] + 1;
        var player = document.getElementById('external_nicoplayer');
        var totalTime = player.ext_getTotalTime();
        if (jumpTo <= totalTime)
          player.ext_setPlayheadTime(jumpTo);
        else
          alert('指定された時間は動画の再生時間を超えています');
      }
    }
    else
      alert('正しい形式で入力してください(例 25:25)');
  };

  // コメント入力欄にフォーカスする
  function inputComment() {
    scrollToPlayer();
    clearTimeout(timerId);
    document.getElementById('external_nicoplayer').focus();
  };

  // 動画プレイヤーまでスクロールする
  function scrollToPlayer() {
    var player = document.getElementById('external_nicoplayer');
    var rect = player.getBoundingClientRect();
    var positionY = rect.top;
    var dElm = document.documentElement;
    var dBody = document.body;
    var scrollY = dElm.scrollTop || dBody.scrollTop;
    var y = positionY + scrollY - 50;
    scrollTo(0, y);
  };

  // ショートカットキーに応じて関数を呼び出す
  document.addEventListener('keydown', function(event) {

    if ((document.activeElement.nodeName === 'INPUT' && document.activeElement.getAttribute('type') === 'text') || document.activeElement.isContentEditable || document.activeElement.nodeName == 'INPUT' || document.activeElement.nodeName == 'TEXTAREA') {
      if (event.keyCode == 27) {
        document.activeElement.blur();
      }
      return false;
    }

    if (event.keyCode == 27) {
      if (document.activeElement == document.getElementById('external_nicoplayer')) {
        autoBlur();
      }
    }

    if (document.activeElement !== document.getElementById('external_nicoplayer') && !(document.activeElement.nodeName === 'INPUT' && document.activeElement.getAttribute('type') === 'text') && !(document.activeElement.isContentEditable)) {
      if (event.keyCode == 32 || event.keyCode == settings.playAndPauseKeyCode) {
        playAndPause();
      } else if (event.keyCode == 39 || event.keyCode == settings.nextFrameKeyCode) {
        nextFrame();
      } else if (event.keyCode == 37 || event.keyCode == settings.prevFrameKeyCode) {
        prevFrame();
      } else if (event.keyCode == settings.jumpToStartKeyCode) {
        jumpToStart();
      } else if (event.keyCode == settings.jumpToEndKeyCode) {
        jumpToEnd();
      } else if (event.keyCode == settings.backToPrevFrameKeyCode) {
        backToPrevFrame();
      } else if (event.keyCode == settings.changeScreenModeKeyCode) {
        changeScreenMode();
      } else if (event.keyCode == settings.jumpToFrameKeyCode) {
        jumpToFrame();
      } else if (event.keyCode == 67) {
        inputComment();
      } else if (event.keyCode >= 48 && event.keyCode <= 57) {
        jumpToTimeRatio(event.keyCode);
      }
    }
  }, true);

  // 常にプレイヤーからフォーカスを外す
  $('#external_nicoplayer').on('focus', function() {
    $(this).blur();
  });

});
