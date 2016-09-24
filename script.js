$(function() {

  var settings = {
    // オプションで変更可能なキーコード
    togglePlayAndPauseKeyCode:   'k',
    jumpToBeginningKeyCode:      'h',
    jumpToEndKeyCode:            'e',
    prevFrameKeyCode:            'j',
    nextFrameKeyCode:            'l',
    volumeDownKeyCode:           'd',
    volumeUpKeyCode:             'u',
    toggleMuteKeyCode:           'm',
    toggleViewCommentKeyCode:    'v',
    jumpToSpecifiedFrameKeyCode: 't',
    backToBeforeFrameKeyCode:    'b',
    changeScreenModeKeyCode:     'f',
    onbeforeunloadWarning:      true,
    checkCommandAvailability:  false,
    scrollToPlayerKeyCode:      true,
  };
  var fixed = {
    // 固定のキーコード
    togglePlayAndPauseKeyCode: ' ',           // space
    prevFrameKeyCode:          'ArrowLeft',   // left-arrow
    nextFrameKeyCode:          'ArrowRight',  // right-arrow
    isEscape:                  'Escape',      // esc
    inputCommentKeyCode:       'c',
  };

  chrome.storage.sync.get(settings, function(storage) {
    settings.togglePlayAndPauseKeyCode   = storage.togglePlayAndPauseKeyCode;
    settings.jumpToBeginningKeyCode      = storage.jumpToBeginningKeyCode;
    settings.jumpToEndKeyCode            = storage.jumpToEndKeyCode;
    settings.prevFrameKeyCode            = storage.prevFrameKeyCode;
    settings.nextFrameKeyCode            = storage.nextFrameKeyCode;
    settings.volumeDownKeyCode           = storage.volumeDownKeyCode;
    settings.volumeUpKeyCode             = storage.volumeUpKeyCode;
    settings.toggleMuteKeyCode           = storage.toggleMuteKeyCode;
    settings.toggleViewCommentKeyCode    = storage.toggleViewCommentKeyCode;
    settings.jumpToSpecifiedFrameKeyCode = storage.jumpToSpecifiedFrameKeyCode;
    settings.backToBeforeFrameKeyCode    = storage.backToBeforeFrameKeyCode;
    settings.changeScreenModeKeyCode     = storage.changeScreenModeKeyCode;
    settings.onbeforeunloadWarning       = Boolean(storage.onbeforeunloadWarning);
    settings.checkCommandAvailability    = Boolean(storage.checkCommandAvailability);
    settings.scrollToPlayerKeyCode       = Boolean(storage.scrollToPlayerKeyCode);
    generateCheckCommandAvailabilityMessages();
  });

  // スタートやエンドに移動してしまったときの前の位置を保持する
  var back = null;
  // c を押したときにプレイヤーへのフォーカスを許す
  var allowFocusPlayer = false;
  // プレイヤーにフォーカス中にもう一度 c を押したときに有効になり
  // 有効化されている間はescを押したりクリックしたりしない限りは
  // 一切のコマンドが無効化される
  var commentable = false;
  // c を押すことでプレイヤーへのフォーカスが許可されたかどうか
  // マウス操作によるプレイヤーへのフォーカスと区別するために使用する
  var allowFocusPlayerFromKey = false;
  var commandInitial;
  var enabled;
  var disabled;

  function generateCheckCommandAvailabilityMessages() {
    // if -> 簡略化表示, else -> 正式表示
    if (settings.checkCommandAvailability === true) {
      commandInitial  = '<div id="niconicommander-status"><strong><span style="color:blue;">有効</span></strong></div>';
      commandEnabled  = '<strong><span style="color:blue;">有効</span></strong>';
      commandDisabled = '<strong><span style="color:red;">無効</span></strong>';
    }
    else {
      commandInitial  = '<div id="niconicommander-status"><strong>niconicommander: <span style="color:blue;">有効</span></strong></div>';
      commandEnabled  = '<strong>niconicommander: <span style="color:blue;">有効</span></strong>';
      commandDisabled = '<strong>niconicommander: <span style="color:red;">無効</span></strong><br>有効にするにはescを押すかプレイヤー以外をクリック';
    }
    // コマンドの有効/無効メッセージを表示する(最初は有効で表示)
    $('body').append(commandInitial);
    $('#niconicommander-status').css('top', $(window).scrollTop());
  }

  // メッセージを追従させる
  $(document).scroll(function() {
    $('#niconicommander-status').css('top', $(this).scrollTop());
  });

  // ページを離れるときに警告
  window.onbeforeunload = function() {
    if (settings.onbeforeunloadWarning === true) {
      return '動画の読み込みがリセットされる可能性があります';
    }
  }

  // クリックすると無効化されているコマンドが有効化される
  $('body').on('click', function() {
    allowFocusPlayer = false;
    commentable = false;
    allowFocusPlayerFromKey = false;
    checkCommandAvailability();
  });
  // 動画プレイヤーにマウス移動した(クリックした、フォーカスしたこととみなす)ときに
  // c を一回だけ押している状態だったらすべて解除する
  $('#external_nicoplayer').on('mousemove', function() {
    if (allowFocusPlayer === true && commentable === false && allowFocusPlayerFromKey === true) {
      allowFocusPlayer = false;
      commentable = false;
      allowFocusPlayerFromKey = false;
      checkCommandAvailability();
    }
    else {
      return false;
    }
  });

  // ショートカットキーに応じて関数を呼び出す
  window.addEventListener('keydown', function(event) {
    // 円マークをバックスラッシュに変換
    var eventKey = encodeYenSignToBackslash(event.key);

    // escが押されたらコマンドが有効化されアクティブフォーカスが外れる
    if (eventKey == fixed.isEscape) {
      allowFocusPlayer = false;
      commentable = false;
      allowFocusPlayerFromKey = false;
      activeBlur();
      checkCommandAvailability();
    }

    // 装飾キーをエスケープ
    if (event.metaKey || event.ctrlKey || event.altKey) {
      return false;
    }

    // コメント入力中はコマンドを無効化する
    if (commentable === true) {
      return false;
    }

    // c が一回押された状態(プレイヤーにファーカスしている状態)でもう一度 c を押すと
    // コメント可能状態となり一切のコマンドが無効化される
    // ただし c が一回押された状態で別のキーを押すと
    // プレイヤーへのフォーカスが外れて状態がリセットされる
    // プレイヤーにフォーカスしている状態やコメント入力状態でも
    // escを押したりクリックしたりすると状態は解除されコマンドが有効化される(別記)
    if (allowFocusPlayer === true && eventKey == fixed.inputCommentKeyCode) {
      commentable = true;
      allowFocusPlayerFromKey = false;
      checkCommandAvailability();
      return false;
    }
    else if (allowFocusPlayer === true && eventKey != fixed.inputCommentKeyCode) {
      allowFocusPlayer = false;
      commentable = false;
      allowFocusPlayerFromKey = false;
      checkCommandAvailability();
    }

    // 入力フォームにフォーカスがあるときはショートカットを無効化
    if ((document.activeElement.nodeName === 'INPUT'
    || document.activeElement.nodeName == 'TEXTAREA'
    || document.activeElement.getAttribute('type') === 'text')
    || document.activeElement.isContentEditable === true) {
      return false;
    }
    else if (allowFocusPlayer === false) {
      activeBlur();
    }

    // オプションのキーと固定のキーに関しては
    // 元々サイトで実装されているイベントリスナーを
    // 無効化してこちらの処理のみを実行する
    Object.keys(settings).forEach(function(key) {
      if (eventKey == settings[key]) {
        event.stopPropagation();
        if (settings.scrollToPlayerKeyCode === true) {
          scrollToPlayer();
        }
      }
    });
    Object.keys(fixed).forEach(function(key) {
      if (eventKey == fixed[key]) {
        event.stopPropagation();
        if (settings.scrollToPlayerKeyCode === true) {
          scrollToPlayer();
        }
      }
    });

    // ショートカットキーから関数を呼び出す
    switch (eventKey) {
      // オプションのキーコード
      case settings.togglePlayAndPauseKeyCode:   togglePlayAndPause();   break;  // default: k
      case settings.jumpToBeginningKeyCode:      jumpToBeginning();      break;  // default: h
      case settings.jumpToEndKeyCode:            jumpToEnd();            break;  // default: e
      case settings.prevFrameKeyCode:            prevFrame();            break;  // default: j
      case settings.nextFrameKeyCode:            nextFrame();            break;  // default: l
      case settings.volumeDownKeyCode:           volumeDown();           break;  // default: d
      case settings.volumeUpKeyCode:             volumeUp();             break;  // default: u
      case settings.toggleMuteKeyCode:           toggleMute();           break;  // default: m
      case settings.toggleViewCommentKeyCode:    toggleViewComment();    break;  // default: v
      case settings.jumpToSpecifiedFrameKeyCode: jumpToSpecifiedFrame(); break;  // default: t
      case settings.backToBeforeFrameKeyCode:    backToBeforeFrame();    break;  // default: b
      case settings.changeScreenModeKeyCode:     changeScreenMode();     break;  // default: s
      // 固定のキーコード
      case fixed.togglePlayAndPauseKeyCode: event.preventDefault();  togglePlayAndPause();                       break;  // space
      case fixed.prevFrameKeyCode:          event.preventDefault();  prevFrame();                                break;  // left-arrow
      case fixed.nextFrameKeyCode:          event.preventDefault();  nextFrame();                                break;  // right-arrow
      case fixed.isEscape:                  event.preventDefault();  releaseFullScreenMode();                    break;  // esc
      case fixed.inputCommentKeyCode:       allowFocusPlayer = true; inputComment(); checkCommandAvailability(); break;  // c
    }

    // 数字のキーを押すとその数字に対応する割合まで動画を移動する
    // キーボードの 3 を押すと動画全体の 30% の位置に移動する
    // 固定のキーコード
    if (eventKey >= '0' && eventKey <= '9') {
      jumpToTimerRatio(eventKey);
    }

  }, true);

  // 現在コマンドが有効なのか無効なのかを表示する
  function checkCommandAvailability() {
    if (allowFocusPlayer === true && commentable === true) {
      $('#niconicommander-status').html(commandDisabled);
    }
    else {
      $('#niconicommander-status').html(commandEnabled);
    }
  }

  // 再生/停止
  function togglePlayAndPause() {
    var player = document.getElementById('external_nicoplayer');
    status = player.ext_getStatus();
    if (status == 'playing')
      player.ext_play(false);
    else if (status == 'paused')
      player.ext_play(true);
  }

  // 次のフレームに移動
  function nextFrame() {
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
  }

  // 前のフレームに移動
  function prevFrame() {
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
  }

  // 動画の一番最初に移動
  function jumpToBeginning() {
    var player = document.getElementById('external_nicoplayer');
    back = player.ext_getPlayheadTime();
    player.ext_setPlayheadTime(0);
  }

  // 動画の一番最後に移動
  function jumpToEnd() {
    var player = document.getElementById('external_nicoplayer');
    back = player.ext_getPlayheadTime();
    var endtime = player.ext_getTotalTime();
    player.ext_setPlayheadTime(endtime);
  }

  // スタートやエンドに戻ってしまったときに元の位置に移動
  function backToBeforeFrame() {
    if (back !== null) {
      var player = document.getElementById('external_nicoplayer');
      player.ext_setPlayheadTime(back);
    }
  }

  // 数字に対応する割合まで動画を移動
  function jumpToTimerRatio(timerRatio) {
    var player = document.getElementById('external_nicoplayer');
    timerRatio = Number(timerRatio) / 10;
    timerRatio = player.ext_getTotalTime() * timerRatio;
    player.ext_setPlayheadTime(timerRatio);
  }

  // フルスクリーンモード/解除
  function changeScreenMode() {
    var player = document.getElementById('external_nicoplayer');
    var fullScreen = player.ext_getVideoSize();
    if (fullScreen == 'normal') {
      player.ext_setVideoSize('fit');
    } else if (fullScreen == 'fit') {
      player.ext_setVideoSize('normal');
    } else {
      return false;
    }
  }

  // フルスクリーンモード解除(esc専用)
  function releaseFullScreenMode() {
    var player = document.getElementById('external_nicoplayer');
    var fullScreenStatus = player.ext_getVideoSize();
    if (fullScreenStatus == 'fit') {
      player.ext_setVideoSize('normal');
    }
    else {
      return false;
    }
  }

  // 時間を指定して移動
  function jumpToSpecifiedFrame() {
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
  }

  // 音量ダウン
  function volumeDown() {
    var player = document.getElementById('external_nicoplayer');
    var volume = Number(player.ext_getVolume());
    if (volume >= 0) {
      player.ext_setVolume(volume - 10);
    }
  }

  // 音量アップ
  function volumeUp() {
    var player = document.getElementById('external_nicoplayer');
    var volume = Number(player.ext_getVolume());
    if (volume <= 100) {
      player.ext_setVolume(volume + 10);
    }
  }

  // ミュート/解除
  function toggleMute() {
    var player = document.getElementById('external_nicoplayer');
    if (player.ext_isMute() === true) {
      player.ext_setMute(false);
    }
    else {
      player.ext_setMute(true);
    }
  }

  // コメント表示/非表示
  function toggleViewComment() {
    var player = document.getElementById('external_nicoplayer');
    if (player.ext_isCommentVisible() === true) {
      player.ext_setCommentVisible(false);
    }
    else {
      player.ext_setCommentVisible(true);
    }
  }

  // コメント入力欄にフォーカス
  function inputComment() {
    allowFocusPlayerFromKey = true;
    document.getElementById('external_nicoplayer').focus();
    checkCommandAvailability();
  }

  // 円マークをバックスラッシュに変換する
  function encodeYenSignToBackslash(key) {
    // 165 -> Yen Sign
    if (key.charCodeAt() == 165) {
      key = '\\';
    }
    return key;
  }

  // 動画プレイヤーまでスクロール
  function scrollToPlayer() {
    var player = document.getElementById('external_nicoplayer');
    var rect = player.getBoundingClientRect();
    var positionY = rect.top;
    var dElm = document.documentElement;
    var dBody = document.body;
    var scrollY = dElm.scrollTop || dBody.scrollTop;
    var y = positionY + scrollY - 100;
    scrollTo(0, y);
  }

  // アクティブフォーカスを外す
  function activeBlur() {
    document.activeElement.blur();
  }

  // 常にプレイヤーからフォーカスを外す
  $('#external_nicoplayer').on('focus', function() {
    if (allowFocusPlayer === false) {
      $(this).blur();
    }
    else {
      return false;
    }
  });

});
