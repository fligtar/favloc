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
const Cc = Components.classes;
const Ci = Components.interfaces;

function FavLocComponent() {
    this.wrappedJSObject = this;
    
    Cc['@mozilla.org/moz/jssubscript-loader;1'].getService(Ci.mozIJSSubScriptLoader)
            .loadSubScript('chrome://global/content/strres.js');
    this.bundle = srGetStrBundle("chrome://favloc/locale/favloc.properties");
    
    this.load();
}

FavLocComponent.prototype = {
    bundle: null,
    favorites: [],
    names: [],
    settings: [],
	lastSaved: '',
    overwrite: 'prompt',
    isThunderbird: false,
    
    //Load all settings
    load: function() {
        this.detectApp();
        this.loadFavorites();
        this.loadNames();
        this.loadSettings();
		this.loadLastSaved();
        this.loadOverwrite();
    },
    
    //Load favorite locations from prefs
	loadFavorites: function() {
		var prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("");

		var favorites = [];
		
		if (prefs.getPrefType("extensions.favloc.favorites") == prefs.PREF_STRING) {
			var favoriteList = prefs.getCharPref("extensions.favloc.favorites");
			favorites = favoriteList.split("|");
		}
		prefs = null;
		
		this.favorites = favorites;
		
		return this.favorites;
	},
	
    //Load favorite location names from prefs
	loadNames: function() {
		var prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("");

		var names = [];
		
		if (prefs.getPrefType("extensions.favloc.names") == prefs.PREF_STRING) {
			var nameList = prefs.getCharPref("extensions.favloc.names");
			names = nameList.split("|");
		}
		prefs = null;
		
		this.names = names;
		
		return this.names;
	},
	
    //Load the last saved location from prefs
	loadLastSaved: function() {
		var prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("");
		
		if (prefs.getPrefType("extensions.favloc.last-saved") == prefs.PREF_STRING) {
			this.lastSaved = prefs.getCharPref("extensions.favloc.last-saved");
		}
		prefs = null;
		
		return this.lastSaved;
	},
    
    //Load the overwrite settings from prefs
    loadOverwrite: function() {
		var prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("");
		
		if (prefs.getPrefType("extensions.favloc.overwrite") == prefs.PREF_STRING) {
			this.overwrite = prefs.getCharPref("extensions.favloc.overwrite");
		}
		prefs = null;
		
		return this.overwrite;
	},
    
    //Load settings from prefs
    loadSettings: function() {
		var prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("");

        var settings = ['show-context-image',
                        'show-context-link',
                        'show-context-attachment',
                        'show-context-allattachments',
                        'show-context-allattachmentsbox',
                        'show-file',
                        'show-download',
                        'automatically-select',
                        'default-last-saved'];

        for (var i = 0; i < settings.length; i++) {
            if (prefs.getPrefType("extensions.favloc." + settings[i]) == prefs.PREF_BOOL) {
                this.settings[settings[i]] = prefs.getBoolPref("extensions.favloc." + settings[i]);
            }
            else {
                this.settings[settings[i]] = true;
            }
		}
		
		prefs = null;
		return this.settings;
	},
	
    //Set the last saved location
	setLastSaved: function(location) {
		var prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("");
		
		prefs.setCharPref("extensions.favloc.last-saved", location);
		this.lastSaved = location;
		
		prefs = null;
		return true;
	},
    
    //Handle saving to a file that already exists, returning the nsIFile
    //of the new location or false to cancel
    handleOverwrite: function(filename, location, overwrite, window) {
        dump('FavLoc: Handling overwrite for ' + filename + '... ');
        
        var dir = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
        dir.initWithPath(location);
        dir.append(filename);
                
        switch (overwrite) {
            //Prompt the user for choice
            case 'prompt':
                dump('Prompting user... ');
                var promptService = Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);

                var flags = promptService.BUTTON_TITLE_IS_STRING * promptService.BUTTON_POS_0 +
                            promptService.BUTTON_TITLE_IS_STRING * promptService.BUTTON_POS_2 +
                            promptService.BUTTON_TITLE_IS_STRING * promptService.BUTTON_POS_1;

                var response = promptService.confirmEx(window,
                                    this.bundle.GetStringFromName('favloc.overwrite-prompttitle'),
                                    this.bundle.GetStringFromName('favloc.overwrite-promptmessage'),
                                    flags,
                                    this.bundle.GetStringFromName('favloc.overwrite-overwrite'),
                                    this.bundle.GetStringFromName('favloc.overwrite-rename'),
                                    this.bundle.GetStringFromName('favloc.overwrite-unique'),
                                    null, {});

                if(response == 0) {
                    //Overwrite
                    return this.handleOverwrite(filename, location, 'overwrite', window);
                }
                else if(response == 2) {
                    //Unique
                    return this.handleOverwrite(filename, location, 'unique', window);
                }
                else if(response == 1) {
                    //Rename
                    return this.handleOverwrite(filename, location, 'rename', window);
                }
                break;
            
            //Overwrite the existing file
            case 'overwrite':
                dump('Overwriting to ' + dir.target + '\n\n');
                return dir;
                break;
            
            //Create a unique filename by appending incrementing integers until the file doesn't exist
            case 'unique':
                
                var i = 1;
                var testFilename = '';
                var dot = filename.lastIndexOf('.');
                var extension = (dot !== -1) ? filename.substr(dot, filename.length) : '';
                filename = filename.substr(0, dot);
                    
                while (dir.exists()) {
                    //testFilename = filename + ' (' + i + ')';
                    testFilename = filename + ' (' + i + ')' + extension;
                    dir.initWithPath(location);
                    dir.append(testFilename);
                    i++;
                }
                
                dump('Unique to ' + dir.target + '\n\n');
                return dir;

                break;
            
            //Manually rename file by showing the file picker dialog
            case 'rename':
                var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
                
                fp.init(window, this.bundle.GetStringFromName('favloc.overwrite-filepickertitle'), fp.modeSave);
                fp.displayDirectory = dir;
                fp.defaultString = filename;
                if (filename.indexOf('.') !== -1) {
                    fp.defaultExtension = filename.substring(filename.lastIndexOf('.'), filename.length);
                }
        
                if(fp.show() != fp.returnCancel) {
                    dump('Renaming to ' + dir.target + '\n\n');
                    return fp.file;
                }
                
                break;
        }
        
        dump('User cancelled... returning false\n\n');
        return false;
	},
	
    //Get the browser window
	getBrowserWindow: function() {
		var mediator = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
		var browser;
		
		if(mediator.getMostRecentWindow("navigator:browser")) {
			browser = mediator.getMostRecentWindow("navigator:browser");
		}
		else if (mediator.getMostRecentWindow("mail:3pane")) {
			browser = mediator.getMostRecentWindow("mail:3pane");
		}
		else {
			browser = null;
		}
		
		return browser;
	},
    
    //Determine if we're using Thunderbird
    detectApp: function() {
        if("@mozilla.org/xre/app-info;1" in Components.classes) {
			var info = Components.classes["@mozilla.org/xre/app-info;1"].createInstance(Components.interfaces.nsIXULAppInfo);
			if (info.name == 'Thunderbird') {
                this.isThunderbird = true;
                return true;
            }
        }
        
        this.isThunderbird = false;
        return false;
    },

    QueryInterface: function(iid) {
        if (iid.equals(Ci.nsISupports)) {
            return this;
        }
        else
        {
            throw Components.results.NS_ERROR_NO_INTERFACE;
        }
    }
};

var initModule = {
    ServiceCID: Components.ID("{6d242d50-af55-11db-abbd-0800200c9a66}"),
    ServiceContractID: "@fligtar.com/favloc;1",
    ServiceName: "FavLoc",
	
    registerSelf: function(compMgr, fileSpec, location, type) {
        compMgr = compMgr.QueryInterface(Ci.nsIComponentRegistrar);
        compMgr.registerFactoryLocation(this.ServiceCID, this.ServiceName, this.ServiceContractID, fileSpec, location,type);
    },

    unregisterSelf: function(compMgr, fileSpec, location) {
	compMgr = compMgr.QueryInterface(Ci.nsIComponentRegistrar);
	compMgr.unregisterFactoryLocation(this.ServiceCID,fileSpec);
    },

    getClassObject: function(compMgr, cid, iid) {
	if (!cid.equals(this.ServiceCID))
	    throw Components.results.NS_ERROR_NO_INTERFACE
	if (!iid.equals(Ci.nsIFactory))
	    throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
	return this.instanceFactory;
    },

    canUnload: function(compMgr) {
	return true;
    },

    instanceFactory: {
        createInstance: function (outer, iid) {
	    if (outer != null)
	      throw Components.results.NS_ERROR_NO_AGGREGATION;
	    return new FavLocComponent().QueryInterface(iid);
	}
    }
};

function NSGetModule(compMgr, fileSpec) {
    return initModule;
}