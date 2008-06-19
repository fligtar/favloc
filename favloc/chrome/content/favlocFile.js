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

var FavLocFile = {
	//Populate file submenu from saved preferences
	init: function() {
		FavLoc = Components.classes['@fligtar.com/favloc;1'].getService().wrappedJSObject;
		
		var menu = document.getElementById('file-favloc');
		var popup = document.getElementById("file-favloc-popup");
		
		if(!FavLoc.settings['show-file']) {
				menu.hidden = true;
				return false;
		}
		else
			menu.hidden = false;			
		
		while(popup.hasChildNodes()) {
			popup.removeChild(popup.firstChild);
		}

		if(FavLoc.favorites.length > 0 && (FavLoc.names[0] != "" && FavLoc.favorites[0] != "")) {
			for(var i = 0; i < FavLoc.favorites.length; i++) {
				if(FavLoc.favorites[i] != "" && FavLoc.names[i] != "") {
					var menuitem = document.createElement('menuitem');
					menuitem.setAttribute('label', FavLoc.names[i]);
					menuitem.setAttribute('value', FavLoc.favorites[i]);
                                        menuitem.setAttribute('oncommand', 'FavLocFile.download(this);');
					//menuitem.addEventListener("command", function(e) { alert(this.value); alert(FavLoc.favorites[i]); new FavLocFile.download(this.value); }, false);
					popup.appendChild(menuitem);
				}
			}
		}
		else {
			var menuitem = document.createElement('menuitem');
			menuitem.setAttribute('label', "(" + FavLoc.bundle.GetStringFromName("favloc.noneset") + ")");
			menuitem.setAttribute('disabled', true);
			popup.appendChild(menuitem);
		}
		
		var menuitem = document.createElement('menuseparator');
		popup.appendChild(menuitem);
			
		var menuitem = document.createElement('menuitem');
		menuitem.setAttribute('id', "file-favloc-options");
		menuitem.setAttribute('label', FavLoc.bundle.GetStringFromName("favloc.popup-options"));
		menuitem.setAttribute('accesskey', FavLoc.bundle.GetStringFromName("favloc.popup-options-accesskey"));
		menuitem.addEventListener("command", function(e) { new FavLocOptions.showOptions(); }, false);
		popup.appendChild(menuitem);
		
		return true;
	},
	
	//Download file
	download: function(location) {
                location = location.getAttribute('value');
                
		var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
		
		if(prefs.getPrefType("extensions.favloc.savetype") == prefs.PREF_STRING) {
			var saveType = prefs.getCharPref("extensions.favloc.savetype");
		}
		else {
			var saveType = 'filename';
		}
					
		prefs = null;
		
		var aDocument = document.commandDispatcher.focusedWindow.document;
		var url = aDocument.location.href;
		var browser = FavLoc.getBrowserWindow();
		
		var dir = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		dir.initWithPath(location);
		
		//from saveDocument() contentAreaUtils.js
		var contentDisposition = null;
		  try {
			contentDisposition =
			  aDocument.defaultView
					   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
					   .getInterface(Components.interfaces.nsIDOMWindowUtils)
					   .getDocumentMetadata("content-disposition");
		  } catch (ex) {
			// Failure to get a content-disposition is ok
		  }
		
		if(dir.exists()) {
			var filename = browser.getDefaultFileName(null, browser.makeURI(url), aDocument, contentDisposition);

			if(filename.indexOf('.') == -1) {
				filename += '.' + browser.getDefaultExtension(aDocument.title, browser.makeURI(url), aDocument.contentType);
			}
			
			filename = browser.validateFileName(filename);
			dir.append(filename);
			
			//Check file existance
			if(dir.exists()) {
				var newDir = FavLoc.handleOverwrite(filename, location, FavLoc.overwrite, window);
				if (newDir != false) {
					dir = newDir;
				}
			}
			
			var chosenData = new browser.AutoChosen(dir, browser.makeURI(url));		
			
			browser.internalSave(url, aDocument, filename, contentDisposition, aDocument.contentType, false, null, chosenData, null, true);
		} else {
			alert(FavLoc.bundle.GetStringFromName("favloc.nolongerexists"));
		}
	}
	
};