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

var FavLocOptions = {
	//Populate the listbox from preferences
	init: function() {
		FavLoc = Components.classes['@fligtar.com/favloc;1'].getService().wrappedJSObject;
		
        var listbox = document.getElementById('favorites');
		
		for(var i = 0; i < FavLoc.favorites.length; i++) {
			if(FavLoc.favorites[i] != "" && FavLoc.names[i] != "") {
				var row = document.createElement('listitem');
				var cell = document.createElement('listcell');
				cell.setAttribute('label', FavLoc.names[i]);
				row.appendChild(cell);
				var cell2 = document.createElement('listcell');
				cell2.setAttribute('label', FavLoc.favorites[i]);
				row.appendChild(cell2);
				listbox.appendChild(row);
			}
		}
        
        //Populate checkboxes from settings
		document.getElementById('show-context-attachment').checked = FavLoc.settings['show-context-attachment'];
        document.getElementById('show-context-allattachments').checked = FavLoc.settings['show-context-allattachments'];
        document.getElementById('show-context-allattachmentsbox').checked = FavLoc.settings['show-context-allattachmentsbox'];
		document.getElementById('show-context-image').checked = FavLoc.settings['show-context-image'];
		document.getElementById('show-context-link').checked = FavLoc.settings['show-context-link'];
		document.getElementById('show-file').checked = FavLoc.settings['show-file'];
		document.getElementById('show-download').checked = FavLoc.settings['show-download'];
		document.getElementById('automatically-select').checked = FavLoc.settings['automatically-select'];
		document.getElementById('default-last-saved').checked = FavLoc.settings['default-last-saved'];
        
        //Disable settings that don't apply to the current application
        document.getElementById('show-context-attachment').disabled = !FavLoc.isThunderbird;
        document.getElementById('show-context-allattachments').disabled = !FavLoc.isThunderbird;
        document.getElementById('show-context-allattachmentsbox').disabled = !FavLoc.isThunderbird;
        document.getElementById('show-context-image').disabled = FavLoc.isThunderbird;
        document.getElementById('show-context-link').disabled = FavLoc.isThunderbird;
        document.getElementById('show-file').disabled = FavLoc.isThunderbird;
        
        document.getElementById('overwrite').selectedItem = document.getElementById('overwrite-' + FavLoc.overwrite);
		
		document.getElementById('name').addEventListener("input", function(e) { new FavLocOptions.enableAddButton(); }, false);
   },
   
	//Show options window
	showOptions: function() {
		var optionsWindow = window.openDialog("chrome://favloc/content/favlocOptions.xul", "","chrome,resizable,centerscreen,close=no,modal");
		optionsWindow.focus();
	},

	//Open filepicker to select folder
	openFilePicker: function() {
		var nsIFilePicker = Components.interfaces.nsIFilePicker;
		var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
		fp.init(window, FavLoc.bundle.GetStringFromName("favloc.options-filepicker"), nsIFilePicker.modeGetFolder);
		var res = fp.show();
		if(res == nsIFilePicker.returnOK){
			document.getElementById("location").value = fp.file.path;
		}
		this.enableAddButton();
	},
	
	//Enable/disable add button based on input
	enableAddButton: function() {
		var name = document.getElementById("name").value;
		var location = document.getElementById("location").value;
		var addloc = document.getElementById("addloc");
		
		if(name != "" && location != "") {
			addloc.disabled=false;
		}
		else {
			addloc.disabled=true;
		}
	},
	
	//Enable delete, move up, move down buttons when an item is selected
	enableControlButtons: function() {
		var listbox = document.getElementById('favorites');
		var selected = listbox.selectedItem;
		if(selected) {
			var index = listbox.getIndexOfItem(selected);
			var lastIndex = listbox.getRowCount() - 1;
	
			if(index != 0)
				document.getElementById("uploc").disabled = false;
			else
				document.getElementById("uploc").disabled = true;
				
			if(index != lastIndex)
				document.getElementById("downloc").disabled = false;
			else
				document.getElementById("downloc").disabled = true;
				
			document.getElementById("delloc").disabled = false;
		}	
	},
	
	//Disable delete, move up, move down buttons when an item is deleted
	disableControlButtons: function() {
		document.getElementById("uploc").disabled = true;
		document.getElementById("downloc").disabled = true;
		document.getElementById("delloc").disabled = true;	
	},
	
	//Add new favorite location to the listbox
	addNewLoc: function() {
		var name = document.getElementById('name');
		var location = document.getElementById('location');
		
        var listbox = document.getElementById('favorites');

		var row = document.createElement('listitem');
		var cell = document.createElement('listcell');
		cell.setAttribute('label', name.value);
		row.appendChild(cell);
		var cell2 = document.createElement('listcell');
		cell2.setAttribute('label', location.value);
		row.appendChild(cell2);
		listbox.appendChild(row);

        name.value = "";
		location.value = ""
        this.enableAddButton();
	},
	
	//Delete location from the listbox
	deleteLoc: function() {
		var listbox = document.getElementById('favorites');
		var selected = listbox.selectedItem;

		listbox.removeItemAt(listbox.getIndexOfItem(selected));
		
		this.disableControlButtons();
	},
	
	//Move location up in listbox
	moveLocUp: function() {
		var listbox = document.getElementById('favorites');
		var selected = listbox.selectedItem;
		var previous = listbox.getPreviousItem(selected, 1);
		
		listbox.insertBefore(selected, previous);
		listbox.selectItem(selected);
	},
	
	//Move location down in listbox
	moveLocDown: function() {
		var listbox = document.getElementById('favorites');
		var selected = listbox.selectedItem;
		var next = listbox.getNextItem(selected, 2);
		
		listbox.insertBefore(selected, next);
		listbox.selectItem(selected);
	},
   
   //Save the listbox to preferences file
	setOptions: function() {
		var browser = FavLoc.getBrowserWindow();
		
		var name = document.getElementById("name").value;
		var location = document.getElementById("location").value;
		
		if(name != '' && location != '') {
			var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);

			var flags = promptService.BUTTON_TITLE_YES * promptService.BUTTON_POS_0 +
					  promptService.BUTTON_TITLE_NO * promptService.BUTTON_POS_2 +
					  promptService.BUTTON_TITLE_CANCEL * promptService.BUTTON_POS_1;

			var response = promptService.confirmEx(window, FavLoc.bundle.GetStringFromName("favloc.options-notadded-title"), FavLoc.bundle.GetStringFromName("favloc.options-notadded"), flags, null, null, null, null, {});
			if(response == 0) {
				//Save
				this.addNewLoc();
			}
			else if(response == 2) {
				//Do not save... so continue
			}
			else if(response == 1) {
				//Cancel
				return false;
			}
		}
		
		var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
		
		var favorites = "";
		var names = "";
        var listbox = document.getElementById('favorites');
		var listcell = document.getElementsByTagName("listcell");
        var rows = listbox.getRowCount();
		
        for(var i = 0; i < (rows*2); i=i+2) {
			if(favorites != "")
				favorites += "|";
			if(names != "")
				names += "|";
				
			names += listcell[i].getAttribute("label");
			favorites += listcell[i+1].getAttribute("label");
        }
        
		prefs.setCharPref("extensions.favloc.favorites", favorites);
		prefs.setCharPref("extensions.favloc.names", names);
        prefs.setCharPref("extensions.favloc.overwrite", document.getElementById('overwrite').selectedItem.value);
		
		prefs.setBoolPref("extensions.favloc.show-context-image", document.getElementById('show-context-image').checked);
		prefs.setBoolPref("extensions.favloc.show-context-link", document.getElementById('show-context-link').checked);
        prefs.setBoolPref("extensions.favloc.show-context-attachment", document.getElementById('show-context-attachment').checked);
        prefs.setBoolPref("extensions.favloc.show-context-allattachments", document.getElementById('show-context-allattachments').checked);
        prefs.setBoolPref("extensions.favloc.show-context-allattachmentsbox", document.getElementById('show-context-allattachmentsbox').checked);
		prefs.setBoolPref("extensions.favloc.show-file", document.getElementById('show-file').checked);
		prefs.setBoolPref("extensions.favloc.show-download", document.getElementById('show-download').checked);
		prefs.setBoolPref("extensions.favloc.automatically-select", document.getElementById('automatically-select').checked);
		prefs.setBoolPref("extensions.favloc.default-last-saved", document.getElementById('default-last-saved').checked);
		
		FavLoc.load();
        if (FavLoc.isThunderbird) {
            browser.FavLocContext.init('attachment');
            browser.FavLocContext.init('allattachments');
            browser.FavLocContext.init('allattachmentsbox');
        }
        else {
            browser.FavLocFile.init();
            browser.FavLocContext.init('image');
            browser.FavLocContext.init('link');
        }
		window.close();
		
		return true;
   }
   	
};