

// Modules needed are `require`d, similar to CommonJS modules.
// In this case, creating a Widget that opens a new tab needs both the
// `widget` and the `tabs` modules.
var Widget = require("widget").Widget;
var tabs = require('tabs');
var Request = require("sdk/request").Request;
var { Hotkey } = require("sdk/hotkeys");
var ss = require("sdk/simple-storage");
var toolbarbutton = require("toolbarbutton");
var data = require("sdk/self").data;
var settings = require("simple-prefs");


var showHotKey = Hotkey({
  combo: "control-shift-z",
  onPress: function() {
    addLink(tabs.activeTab.url,0);
  }
});

var showHotKey = Hotkey({
  combo: "control-meta-z",
  onPress: function() {
    addLink(tabs.activeTab.url,0);
  }
});

function withAuth(callback){
    return Request({
      url: "http://zoomlinks.ru/authApi/checkAuth",
      onComplete: function (response) {
        if(!JSON.parse(response.text).isAuthenticated){ //isAuthenticated
            Request({
              url: "http://zoomlinks.ru/authApi/signIn",
              content: {username: settings.prefs.username, password: settings.prefs.password},
              onComplete: function (response) {
                //console.log(response.text);
                callback();
              }
            }).post();        
        }else{
         callback(); 
         
        }
      }
    }).get();    
}

function addLink(url,folder){
    withAuth(function(){
        Request({
          url: "http://zoomlinks.ru/rest/link",
          content: {url: url, folder: folder},
          onComplete: function (response) {
            console.log(response.text);
          }
        }).post();
    });

}
            
// createButton()
// Creates the add-on toolbar button
// 
// @return object
function createButton(options) {
    var menu = {
        id: 'MyAddon-menupopup',
        onShow: function() {},
        onHide: function() {},
        position: 'after_start',
        items: [
            {
                id: 'export-tabs',
                label: 'Add link (Ctrl+Shift+Z)',
                onCommand: function() {
                    addLink(tabs.activeTab.url,0);
                }
                //tooltiptext: ''
            },
            {
                id: 'export-tabs',
                label: 'Export tabs',
                onCommand: function() {
                    for each (var tab in tabs){
                        addLink(tab.url,0); 
                    }
                }
                //tooltiptext: ''
            }
        ]
    }

    return toolbarbutton.ToolbarButton({
        id: "Zoomlinks",
        label: "Zoomlinks",
        tooltiptext: "Zoomlinks",
        image: data.url("icons/zoomlinks_icon.png"),
        menu: menu,
        onCommand: function() {
            addLink(tabs.activeTab.url,0);

        }
    });
}


exports.main = function(options) {
    var button = createButton(options);
    
    // On install moves button into the toolbar
    if (options.loadReason == "install") {
        button.moveTo({
            toolbarID: "nav-bar",
            forceMove: false
        });
    }
    
    // Change the button's icon
    button.button().setAttribute('image', data.url("icons/zoomlinks_icon.png"))
};