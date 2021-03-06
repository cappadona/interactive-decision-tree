var branchHistory = []; // for storing history

// gather querystring params
var params = document.location.search.substr(1).split('&');
if(params[0] != ''){ loadData(params[0]); }

setActive();

// handle branch link clicks
$('.tree').on('click', 'li li a', function(e){
  e.preventDefault();
  targetBranch = $(e.target).attr('href');
  branchHistory.push('#'+$('.tree li.active').attr('id'));
  $('.tree li.active').removeClass('active').addClass('previous');
  $(targetBranch).addClass('active');
  addBackTo(targetBranch);
});

// handle back link clicks
$('.tree').on('click', 'a.back-branch', function(e){
  e.preventDefault();
  $('.tree li.active').removeClass('active')
  targetBranch = branchHistory.pop();
  $(targetBranch).removeClass('previous').addClass('active');
  addBackTo(targetBranch);
});

// add the back link to the active branch
function addBackTo(targetBranch){
  $('a.back-branch').remove();
  if(branchHistory.length > 0){
    $(targetBranch).append(
      '<a href="#" class="back-branch">&laquo; back</a>'
    );
  }
}

// return home
$('#tree-reset').click(function() {
  $('.tree li.active').removeClass('active')
  $('.previous').removeClass('previous')
  $('#branch-1').addClass('active')
  return false;
});

// jump to specified branch, if provided
function setActive(){
  if(params.length > 1){
    $('#'+params[1]).addClass('active');
  }else{
    $('.tree>li:first-child').addClass('active');
  }
}

// load XML data
function loadData(id){
  $.ajax({
    type: "GET",
    url: "xml/tree" + id + ".xml",
    dataType: "xml",
    success: function(xml){
      buildHTML(xml);
    }
  });
}

// construct HTML from XML (likely can be simplfied)
function buildHTML(xml){
  $('.tree').empty();
  $(xml).find('branch').each(
    function(){
      branchID = dasherize($(this).attr('id'));
      questionRaw = $(this).find('content').html();
      // Allow for HTML within branch content
      questionDecoded = $('<textarea>').html(questionRaw).text();
      $('.tree').append(
        '<li id="branch-'+branchID+'">'
          +'<div class="question">'+questionDecoded+'</div>'
        +'</li>'
      );
      if($(this).find('fork').length > 0){
        html = '<ul>';
        $(this).find('fork').each(
          function(){
            targetID = dasherize($(this).attr('target'));
            html += '<li><a href="#branch-'+targetID+'">';
            html += $(this).text();
            html += '</a></li>';
          }
        );
        html += '</ul>';
        var resetText = $(xml).find('resetText').text();
        $('#tree-reset').html( resetText );
        $('#branch-'+branchID).append(html);
      }
    }
  );
  setActive();
}

// helper to remove dots from branchIDs so jQuery doesn't try to be too clever
function dasherize(str){
  return str.replace(/\.+/g,'-');
}
