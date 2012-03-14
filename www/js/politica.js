//
// NOTE(vivi): This is obviously a big unsorted pile of all the javascript
// we need. It should be split as some point, as needed.
//
// TODO(vivi): Replace some of these with jQuery methods.


// -----------------------------------------------------
// DOM and NET Utils

function elem(id) {
  return document.getElementById(id);
}


function toggleDiv(id) {
  var el = elem(id);
  if (el.style.display == "none") {
    el.style.display = "block";
  } else {
    el.style.display = "none";
  }
}


function clearValue(targetId, origText) {
  var el = elem(targetId);
  if (el && el.value == origText) {
    el.value = '';
  }
}


function sendPayload_(url, opt_callback, opt_method, opt_payload) {
  var method = opt_method || "GET";

  var xmlhttp = null;
  if (window.XMLHttpRequest) {  // code for all new browsers
    xmlhttp = new XMLHttpRequest();
  } else if (window.ActiveXObject) {  // code for IE5 and IE6
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }

  if (xmlhttp != null) {
    xmlhttp.onreadystatechange = onPayloadResponse_(xmlhttp, opt_callback);
    xmlhttp.open(method, url, true);
    if (opt_method == "POST") {
      xmlhttp.setRequestHeader("Content-type",
                               "application/x-www-form-urlencoded");
    }
    xmlhttp.send(opt_payload);
  }
}


function onPayloadResponse_(xmlhttp, opt_callback, opt_err) {
  return function() {
    if (xmlhttp.readyState == 4) {// 4 = "loaded"
      if (xmlhttp.status == 200) {// 200 = OK
        if (opt_callback) {
          opt_callback(xmlhttp.responseText);
        }
      } else {
        if (opt_err) {
          opt_err(xmlhttp);
        }
      }
    }
  }
}


function loadHandler() {
}

// end utils


// -----------------------------------------------------
// Europarlamentare


var parts = document.location.href.split("?");
var globalSimParams = parts.length == 2 ? parts[1] : '';

function getSimResults(values) {
  // make up an URL with the right values added in GET
  var arr = values.split(",");
  var newGlobalSimParams = 'p1=' + arr[0] +
    '&p2=' + arr[1] +
    '&p14=' + arr[2] +
    '&p39=' + arr[3] +
    '&p7=' + arr[4] +
    '&p6=' + arr[5] +
    '&p40=' + arr[6] +
    '&pb=' + arr[7] +
    '&pa=' + arr[8] +
    '&cid=10&sid=2';

  if (globalSimParams != newGlobalSimParams) {
    globalSimParams = newGlobalSimParams;
    var div = elem('sim_results');
    div.innerHTML = "Simulez alegerile... please wait.";
    setTimeout('updateEuroResults_(\'eurosim.php?'+globalSimParams+'\')', 1000);
  }
}


function updateEuroResults_(url) {
  sendPayload_(url, function(r) {
    var div = elem('sim_results');
    if (div) {
      div.innerHTML = r;
    }
  });
}


// -----------------------------------------------------
// Person page javascript

function togglePhotoSuggestForm() {
  toggleDiv('suggest_photo');
}


function sendPhoto() {
  var url = getInputValue('suggest_photo_input');
  var pid = getInputValue('ps_pid');
  var type = getInputValue('ps_type');

  var sendUrl = "/api/suggest_edit.php?value=" + escape(url) + "&pid=" + pid +
                "&type=" + type;

  sendPayload_(sendUrl, function() {
    var div = elem('suggest_photo');
    if (div) {
      div.innerHTML = "Mulțumesc pentru sugestie. Ea va fi adăugată imediat "+
                      "ce un moderator o va verifica.";
    }
  });
}


function getInputValue(id) {
  var el = elem(id);
  return el ? el.value : '';
}


// -----------------------------------------------------
// Youtube player stuff - for presidential candidate pages.


function onYouTubePlayerReady(playerId) {
  var ytplayer = elem("myytplayer");
  if (ytplayer) {
    ytplayer.playVideo();
  }
}


function getSize() {
  var myWidth = 0, myHeight = 0;
  if( typeof( window.innerWidth ) == 'number' ) {
    //Non-IE
    myWidth = window.innerWidth;
    myHeight = window.innerHeight;
  } else if (document.documentElement &&
      (document.documentElement.clientWidth ||
       document.documentElement.clientHeight)) {
    //IE 6+ in 'standards compliant mode'
    myWidth = document.documentElement.clientWidth;
    myHeight = document.documentElement.clientHeight;
  } else if (document.body &&
      (document.body.clientWidth || document.body.clientHeight)) {
    //IE 4 compatible
    myWidth = document.body.clientWidth;
    myHeight = document.body.clientHeight;
  }
  return {
    width: myWidth,
    height: myHeight
  }
}


function inlinePlay(url) {
  removeInlinePlayer();

  var wrapper = elem("playerwrapper");
  wrapper.style.display = 'block';

  wrapper.innerHTML =
      '<div id="ytcontrols" style="background:#EEEEEE;padding:4px;">' +
      '<a href="javascript:removeInlinePlayer();">Închide</a></div>' +
      '<div id="ytapiplayer"></div>';

  var size = getSize();

  wrapper.style.top = (size.height - 400) + 'px';
  wrapper.style.left = (size.width - 460) + 'px';

  var params = { allowScriptAccess: "always" };
  var atts = { id: "myytplayer" };
  swfobject.embedSWF(url + "&enablejsapi=1&playerapiid=ytplayer", "ytapiplayer",
                 "425", "356", "8", null, null, params, atts);
}

function removeInlinePlayer() {
  var wrapper = elem("playerwrapper");
  wrapper.style.display = 'none';
  wrapper.innerHTML = '<div id="ytapiplayer"></div>';
}


// -----------------------------------------------------
// Functions related to tagging of laws.


// Adding and removing vote tags.
function addVoteTag(room, year, idvote) {
  var tag = getInputValue('input_' + idvote);
  var inverse = getInputValue('select_' + idvote);

  if (tag) {
    // Here's where we make a request to the API.
    var url = '/api/add_vote_tag.php' +
        '?room=' + room +
        '&year=' + year +
        '&idvote=' + idvote +
        '&tag=' + tag +
        '&inverse=' + inverse;

    sendPayload_(url, function(response) {
      toggleDiv('holder_' + idvote);
      elem('input_' + idvote).value = '';
    });
  }
}


function removeVoteTag(room, year, idvote, tag, idtag) {
  // Here's where we make a request to the API.
  var url = '/api/add_vote_tag.php' +
      '?room=' + room +
      '&year=' + year +
      '&idvote=' + idvote +
      '&tag=' + tag +
      '&delete=' + 1;

  sendPayload_(url, function(response) {
	  if (response == 'done') {
	    elem('tag_' + idtag).innerHTML = '';
	  }
    window.console.log('done!? ' + response);
  });
}


/**
 * Handles the click on a '+' on a score-card page. The method will then load
 * the individual votes for this person on this tag id and display them
 * in the according div.
 * @param personId
 * @param room
 * @param year
 * @param tagId
 */
function compassShowDetailsFor(personId, room, year, tagId) {
  var url = '/api/compass_vote_details.php' +
      '?room=' + room +
      '&year=' + year +
      '&tagId=' + tagId +
      '&personId=' + personId;

  sendPayload_(url, function(response) {
    var el = elem('compass_vote_details_' + tagId + '_' + personId);
	  el.innerHTML = response;

    toggleDiv('compass_vote_details_' + tagId + '_' + personId);

    var img = elem('compass_details_link_' + tagId + '_' + personId);
    if (img.src.indexOf('/images/plus.png') > 0) {
      img.src = '/images/minus.png';
    } else {
      img.src = '/images/plus.png';
    }
  });
}


// -----------------------------------------------------
// Functions for code that's in the user's my account page.

function myAccountAddPerson() {
  // First of all, find the data on the page.
  var nameAll = elem('person_name_all').value;
  var displayName = elem('person_display_name').value;
  var photoUrl = elem('person_photo_url').value;

  if (nameAll == '' || displayName == '') {
    // The user didn't enter a full name and a compact name, warn.
    alert('N-ai completat numele compact sau numele complet.');
    return;
  }

  // Set the fields to empty values so that if we click again we don't
  // add the person twice.
  elem('person_name_all').value = '';
  elem('person_display_name').value = '';
  elem('person_photo_url').value = '';

  // Now call the server hook to add the person to the db.
  var url = '/hooks/add_new_person.php' +
      '?name_all=' + nameAll +
      '&display_name=' + displayName +
      '&photo_url=' + photoUrl;

  elem('person_add_message').innerHTML =
      'Așteatpă... <img src=/images/activity_indicator.gif>';
  sendPayload_(url, function(response) {
    elem('person_add_message').innerHTML = response;
  });
}


// -----------------------------------------------------
// Functions for declaration utils.

// A namespace for the functions related to declarations.
var declarations = {};

declarations.initSelectHandlers = function() {
  // Go through all the divs on the page that are 'select' enabled and install
  // a select handler on all of them.

  // Keep a model in memory so that I can have the original text with tags and
  // all of that so I can mark selects on the tagged text.
  $(".declaration").mouseup(function(foo) {
    // Wrap this in a timeout so that we let the browser deselect the text
    // first, and only then run this method for when the user clicks to
    // deselect a text.
    setTimeout(function() {
      var selectedText = $.trim(declarations.getSelectedText());
      if (selectedText == '') return;

      var selection = declarations.getCurrentSelection();

      var startNode = selection.getRangeAt(0).startContainer;
      var startWordId = declarations.getWordTokenIdBefore(startNode);
      var startDeclarationId = declarations.getDeclarationIdFor(startNode);

      var endNode = selection.getRangeAt(0).endContainer;
      var endWordId = declarations.getWordTokenIdBefore(endNode);
      var endDeclarationId = declarations.getDeclarationIdFor(endNode);

      console.log('startDecl ' + startDeclarationId + ' endDecl ' +
                  endDeclarationId + ' ' + startWordId + ' ' + endWordId);

      // We selected some pretty random stuff, so we just return.
      if (startWordId == -1 || endWordId == -1 ||
          startDeclarationId != endDeclarationId) {
        return;
      }

      console.log('declaration id ' + startDeclarationId + ' start word ' +
                  startWordId);

      // Somehow figure out the word numbers for the beginning and end of the
      // selected passage. We will store those numbers as the markers for the
      // passage that was declared as important, and then we'll also highlight
      // that particular passage.

      console.log('"' + selectedText +
          '"\n\nVrei să marchezi asta ca important?');
    }, 0);
  });
};


/**
 * Given a node, returns the declaration id that's holding it.
 *
 * @param {Node} node A node that probably belongs into one of the snippets
 *     on the page.
 * @return {Number} The id of the declaration that holds the node that is
 *     passed in as a parameter.
 */
declarations.getDeclarationIdFor = function(node) {
  // Walk the DOM up until we find a node that says 'declaration-'
  while (!node.getAttribute ||
      !node.getAttribute('id') ||
      node.getAttribute('id').indexOf('declaration-') != 0) {
    node = node.parentNode;
    if (!node) return -1;
  }

  return node.getAttribute('id').match(/declaration-(\d+)/)[1];
};


/**
 * Returns the word's token id that this node represents or
 * @param {Node} wordNode A node that probably belongs into one of the snippets
 *     on the page.
 * @return {Number} The id of the declaration that holds the node that is
 *     passed in as a parameter.
 */
declarations.getWordTokenIdBefore = function(wordNode) {
  var node = wordNode;
  // First, see if this is part of a node that holds a word id or a declaration
  // id.
  while (!node.getAttribute ||
      !node.getAttribute('id') ||
      (node.getAttribute('id').indexOf('word-') == -1 &&
       node.getAttribute('id').indexOf('declaration-') == -1)) {
    node = node.parentNode;
    if (!node) return -1;
  }

  var nodeId = node.getAttribute('id');
  // If the beginning of the selection was part of a marked word, just return
  // that.
  if (/word-(\d+)/.test(nodeId)) {
    return nodeId.match(/word-(\d+)/)[1];
  }

  // At this point we know that wordNode is a text node in between words, so we
  // just iterate all the children of the declaration node.
  for (var i = 0; i < node.childNodes.length; i++) {
    if (node.childNodes[i] == wordNode) {
      nodeId = node.childNodes[i - 1].getAttribute('id');
      return nodeId.match(/word-(\d+)/)[1];
    }
  }
  return -1;
};


declarations.getSelectedText = function() {
  var t = '';
  if(window.getSelection) {
    t = window.getSelection();
  } else if(document.getSelection) {
    t = document.getSelection();
  } else if(document.selection) {
    t = document.selection.createRange().text;
  }
  return t;
};


/**
 * Returns the selection object. This object will be used to get the next or
 * previous dom elements at the next one so that we can figure out what the
 * user has selected.
 *
 * @return {Selection}
 */
declarations.getCurrentSelection = function() {
  if(window.getSelection) {
    return window.getSelection();
  } else if(document.getSelection) {
    return document.getSelection();
  } else if(document.selection) {
    return document.selection;
  }
  return null;
};
