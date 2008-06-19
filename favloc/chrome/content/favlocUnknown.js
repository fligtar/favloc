/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is FavLoc
 *
 * The Initial Developer of the Original Code is Justin Scott.
 * Portions created by the Initial Developer are Copyright (C) 2006
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s): (none)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */
var FavLoc;

var FavLocUnknown = {
	//Populate dropdown menu from saved preferences
	init: function() {
		FavLoc = Components.classes['@fligtar.com/favloc;1'].getService().wrappedJSObject;

		//see http://lxr.mozilla.org/mozilla/source/toolkit/mozapps/downloads/src/nsHelperAppDlg.js.in
		//if true, we're using the executable save-only box
		if (document.getElementById('normalBox') && document.getElementById('normalBox').collapsed == true) {
			document.getElementById('open').parentNode.collapsed = true;
			document.getElementById('rememberChoice').parentNode.collapsed = true;
			document.getElementById('normalBox').collapsed = false;
			
			var separators = document.getElementById('normalBox').getElementsByTagName('separator');
			for (var i = 0; i < separators.length; ++i) {
				separators[i].collapsed = true;
			}
			
			document.getElementById('basicBox').collapsed = true;
			document.getElementById('normalBox').collapsed = false;
			window.sizeToContent();
		}

		var menu = document.getElementById('download-favloc');
		var popup = document.getElementById('favlocPopup');
		var menulist = document.getElementById('favlocList');

		
		if (!FavLoc.settings['show-download']) {
			menu.hidden = true;
			return false;
		}
		else
			menu.hidden = false;

		if (FavLoc.favorites.length > 0 && (FavLoc.names[0] != "" && FavLoc.favorites[0] != "")) {
			//Automatically selected favloc radio if pref is set
			if (FavLoc.settings['automatically-select']) {
				document.getElementById('mode').selectedItem = document.getElementById('favlocRadio');
			}
		
			for (var i = 0; i < FavLoc.favorites.length; i++) {
				if (FavLoc.favorites[i] != "" && FavLoc.names[i] != "") {
					var menuitem = document.createElement('menuitem');
					menuitem.setAttribute('label', FavLoc.names[i]);
					menuitem.setAttribute('value', FavLoc.favorites[i]);
					popup.appendChild(menuitem);
					//Automatically selected last saved location if pref is set
					if (FavLoc.settings['default-last-saved'] && FavLoc.lastSaved == FavLoc.favorites[i]) {
						menulist.selectedItem = menuitem;
					}
				}
			}
		}
		else {
			document.getElementById('favlocList').disabled = true;
			document.getElementById('favlocRadio').disabled = true;
		}
		
		var radiogroup = document.getElementById("mode");
		radiogroup.addEventListener("select", function(e) { new FavLocUnknown.updateSelected(); }, false);
		//document.documentElement.setAttribute('ondialogaccept', 'FavLocUnknown.dialogAccept()');
                document.documentElement.setAttribute('ondialogaccept',
                        'if (FavLocUnknown.dialogAccept()) { ' + document.documentElement.getAttribute('ondialogaccept') + '}');
		
		return true;
	},
	
	//If user selects from the drop down box, change mode/radio button to favloc
	selectFavLoc: function() {
		document.getElementById("mode").selectedItem = document.getElementById("favlocRadio");
	},
	
	//Download file
	dialogAccept: function() {
		var browser = FavLoc.getBrowserWindow();
		
		if (document.getElementById("mode").selectedItem == document.getElementById("favlocRadio")) {
			var url = dialog.mLauncher.source.spec;
			var filename = dialog.mLauncher.suggestedFileName;
			var location = document.getElementById("favlocList").value;
			
			var dir = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
			dir.initWithPath(location);
			
			if (dir.exists()) {
				dir.append(filename);
				
				//Check file existance
				if(dir.exists()) {
					var newDir = FavLoc.handleOverwrite(filename, location, FavLoc.overwrite, window);
					if (newDir != false) {
						dir = newDir;
					}
				}
			
				window.close();
				var chosenData = new browser.AutoChosen(dir, browser.makeURI(url));
				browser.internalSave(url, null, "", null, null, null, null, chosenData, null, true);
				FavLoc.setLastSaved(location);
			} else {
				alert(gFavLocBundle.GetStringFromName("favloc.nolongerexists"));
			}
                        
                        return false;
		}
		
                return true;
	},
	
	//enable/disable remember choice checkbox based on which mode is selected
	updateSelected: function() {
		radiogroup = document.getElementById("mode");
		
		if (radiogroup.selectedItem == document.getElementById("favlocRadio")) {
			if(document.getElementById("rememberChoice"))
				document.getElementById("rememberChoice").disabled = true;
			if(document.getElementById("alwaysHandle"))
				document.getElementById("alwaysHandle").disabled = true;
		}
		else {
			if(document.getElementById("rememberChoice"))
				document.getElementById("rememberChoice").disabled = false;
			if(document.getElementById("alwaysHandle"))
				document.getElementById("alwaysHandle").disabled = false;
		}
	}

};

window.addEventListener("load",  function(e) { new FavLocUnknown.init(); }, false);