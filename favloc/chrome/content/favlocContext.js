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

var FavLocContext = {
	//Populate image context submenu from saved preferences
	init: function(type) {
		FavLoc = Components.classes['@fligtar.com/favloc;1'].getService().wrappedJSObject;
		
		var menu = document.getElementById('context-favloc-' + type);
		var popup = document.getElementById('context-favloc-popup-' + type);
		
		if(!FavLoc.settings['show-context-' + type]) {
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
					menuitem.addEventListener("command", function(e) { new FavLocContext.download(type, this.value); }, false);
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
		
		if (type.indexOf('attachment') == -1) {
			document.getElementById("contentAreaContextMenu").addEventListener("popupshowing", function(e) { new FavLocContext.checkContext(); }, false);
		}
		
		return true;
	},
	
	//Checks to see if the FavLoc menu should be displayed
	checkContext: function() {
		if(gContextMenu != null) {
			if(FavLoc.settings['show-context-image'] == true)
				gContextMenu.showItem("context-favloc-image", gContextMenu.onImage);
			if(FavLoc.settings['show-context-link'] == true)
				gContextMenu.showItem("context-favloc-link", gContextMenu.onLink);  	
		}
	},
	
	//Download file
	download: function(type, location) {
		var url;
		
		if(type == 'image')
			url = gContextMenu.imageURL;
		else if (type.indexOf('attachment') != -1) {		
			if (type == 'attachment') {
				var selectedAttachments = document.getElementById('attachmentList').selectedItems;
				for (var a = 0; a < selectedAttachments.length; a++) {
					FavLocContext.downloadAttachment(selectedAttachments[a].attachment, location);
				}
			}
			else {
				for (index in currentAttachments) {
					FavLocContext.downloadAttachment(currentAttachments[index], location);
				}
			}
			
			return true;
		}
		else if (type == 'link')
			url = gContextMenu.linkURL;
		
		var browser = FavLoc.getBrowserWindow();
		
		var dir = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		dir.initWithPath(location);
		
		//Check directory existance
		if(dir.exists()) {
			var filename = browser.getDefaultFileName(null, browser.makeURI(url), null, null);
			dir.append(filename);
			
			//Check file existance
			if(dir.exists()) {
				var newDir = FavLoc.handleOverwrite(filename, location, FavLoc.overwrite, window);
				if (newDir != false) {
					dir = newDir;
				}
			}
			
			var chosenData = new browser.AutoChosen(dir, browser.makeURI(url));
			
			if (gContextMenu.onLink) {
				browser.internalSave(url, null, "", null, null, null, null, chosenData, null, true);
			}
			else if(gContextMenu.onImage) {
			 	browser.saveImageURL(url, null, null, null, true, null, chosenData);
			}
		} else {
			alert(FavLoc.bundle.GetStringFromName("favloc.nolongerexists"));
		}
		
		return true;
	},
	
	//Download attachment
	downloadAttachment: function(attachment, location) {
		var browser = FavLoc.getBrowserWindow();
		
		var dir = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		dir.initWithPath(location);
		
		//Check directory existance
		if(dir.exists()) {
			dir.append(attachment.displayName);
			
			//Check file existance
			if(dir.exists()) {
				var newDir = FavLoc.handleOverwrite(attachment.displayName, location, FavLoc.overwrite, window);
				if (newDir != false) {
					dir = newDir;
				}
			}
			
			var chosenData = new browser.AutoChosen(dir, browser.makeURI(attachment.url));
			
			browser.internalSave(attachment.url, null, "", null, null, null, null, chosenData, null, true);

		} else {
			alert(FavLoc.bundle.GetStringFromName("favloc.nolongerexists"));
		}
	}
	
};