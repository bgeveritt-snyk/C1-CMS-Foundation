BrowserPageBinding.prototype = new PageBinding;
BrowserPageBinding.prototype = new PageBinding;
BrowserPageBinding.prototype.constructor = BrowserPageBinding;
BrowserPageBinding.superclass = PageBinding.prototype;

BrowserPageBinding.ACTION_ONLOAD = "browserpage loaded";
BrowserPageBinding.ACTION_TABSHIFT = "browserpage tabshift";

BrowserPageBinding.DEVICE_LIST = "${root}/content/views/browser/deviceoptions.xml?consoleId=" + Application.CONSOLE_ID;
BrowserPageBinding.DEVICE_TOUCHVIEW_FRAMEOVERLAY_ID = "deviceframeoverlay";

/**
 * @class
 */
function BrowserPageBinding() {

	/**
	 * @type {SystemLogger}
	 */
	this.logger = SystemLogger.getLogger("BrowserPageBinding");

	/**
	 * @type {string}
	 */
	this._startURL = null;

	/**
	 * See below...
	 * @type {Map<string><object>}
	 */
	this._currents = new Map();

	/**
	 * This will be set to an index in the map declared above. it has two properties: 
	 *     history {List<string>}
	 *     index {int}
	 * @type {object}
	 */
	this._current = null;


	/**
	 * @type {string}
	 */
	this._targetUrl = null;

	/**
	 * @type {string}
	 */
	this._customUrl = null;

	/**
	 * @type {boolean}
	 */
	this._isRequirePublicNet = true;

	/**
	 * @type {boolean}
	 */
	this._isHistoryBrowsing = false;

	/**
	 * @type {boolean}
	 */
	this._isPushingUrl = false;

	/**
	 * @type {boolean}
	 */
	this._isDisposing = false;

	/**
	 * @type {BrowserTabBoxBinding}
	 */
	this._box = null;

	/**
	 * Timeout to hide the cover that blocks external URLs.
	 * @type {function}
	 */
	this._blockertimeout = null;


	/**
	 * Locker to validate that result of async request is actual
	 * @type {string}
	 */
	this._asyncLocker = null;

	/*
	 * Returnable.
	 */
	return this;
}

/**
 * Identifies binding.
 */
BrowserPageBinding.prototype.toString = function () {

	return "[BrowserPageBinding]";
}

/**
 * @overloads {PageBinding#onBindingRegister}
 */
BrowserPageBinding.prototype.onBindingRegister = function () {

	BrowserPageBinding.superclass.onBindingRegister.call(this);
	this.subscribe(BroadcastMessages.SYSTEM_ACTIONPROFILE_PUBLISHED);
	this.subscribe(BroadcastMessages.SYSTEMTREEBINDING_REFRESHED_AFTER);
	
	this.addActionListener(WindowBinding.ACTION_ONLOAD);
	this.addActionListener(TabBoxBinding.ACTION_SELECTED);
	this.addActionListener(TabBoxBinding.ACTION_UPDATED);
	this.addActionListener(BrowserTabBinding.ACTIONVENT_CLOSE);
	this.addActionListener(ViewBinding.ACTION_LOADED);
	this.addActionListener(PageBinding.ACTION_INITIALIZED);

	
	this.addActionListener(SplitterBinding.ACTION_DRAGSTART);
	this.addActionListener(SplitterBinding.ACTION_DRAGGED);
	

}

/**
 * @implements {IBroadcastListener}
 * @param {string} broadcast
 * @param {object} arg
 */
BrowserPageBinding.prototype.handleBroadcast = function (broadcast, arg) {

	BrowserPageBinding.superclass.handleBroadcast.call(this, broadcast, arg);

	switch (broadcast) {
		case BroadcastMessages.SYSTEM_ACTIONPROFILE_PUBLISHED:
			if (arg.syncHandle == this.getSyncHandle() && !(arg.source instanceof GenericViewBinding) && arg.actionProfile) {
				var self = this;
				//IE Require timeout for first time
				setTimeout(function () {
					self.push(arg.actionProfile.Node, true);
				}, 0);
			}
			break;
		case BroadcastMessages.SYSTEMTREEBINDING_REFRESHED_AFTER:
			if (arg.syncHandle == this.getSyncHandle()) {
				this.refreshView();
			}
			break;
	}
}

/**
 * Refresh Generic View
 */
BrowserPageBinding.prototype.refreshView = function () {

	var genericViewTab = this._box.getGeneticViewTabBinding();
	var browserTab = this._box.getBrowserTabBinding();
	var selectedTreeNode = this.getSystemTree().getFocusedTreeNodeBindings().getFirst();
	if (selectedTreeNode) {
		selectedTreeNode.focus();
		this.push(selectedTreeNode.node, true, true);
	} else {
		this.push(this.getSystemPage().node, false, true);
	}
}

/**
 * @overloads {Binding#onBindingDispose}
 */
BrowserPageBinding.prototype.onBindingDispose = function () {

	/*
	 * This will instruct Prism not to  
	 * disable forced cache when closing.
	 * @see {BrowserPageBinding#handleEvent}
	 */
	BrowserPageBinding.superclass.onBindingDispose.call(this);
	this._isDisposing = true;
}

/**
 * @overloads {PageBinding#setPageArgument}
 * @param {HashMap<string><string>}
 */
BrowserPageBinding.prototype.setPageArgument = function (map) {

	BrowserPageBinding.superclass.setPageArgument.call(this, map);

	var url = map["URL"];
	if (url && this._isPageBindingInitialized) {
		this.setURL(url);
	} else {
		this._startURL = url;
	}
	if (!this.systemViewDefinition){
  
		this.systemViewDefinition = map["SystemViewDefinition"];
		//NEWUI Add tree to Browser
		var explorerdocument = this.bindingDocument;
		var explorerpanel = this.bindingWindow.bindingMap.explorerpanel;
		// construct ViewBinding
		var viewBinding = ViewBinding.newInstance(explorerdocument);
		viewBinding.setType(ViewBinding.TYPE_EXPLORERVIEW);
		viewBinding.setDefinition(this.systemViewDefinition);

		explorerpanel.add(viewBinding);

		viewBinding.attach();
		viewBinding.initialize();

		this._viewBinding = viewBinding;
		if (map.image)
			this.image = map.image;
	}

	
}

/**
 * @overwrites {PageBinding#onBeforePageInitialize}
 */
BrowserPageBinding.prototype.onBeforePageInitialize = function () {

	BrowserPageBinding.superclass.onBeforePageInitialize.call(this);

	this._box = window.bindingMap.browsertabbox;

	var navbar = window.bindingMap.navbar;
	navbar.addActionListener(ButtonBinding.ACTION_COMMAND, this);

	var contextmenu = window.bindingMap.contextmenu;
	contextmenu.addActionListener(MenuItemBinding.ACTION_COMMAND, this);

	var devicepopup = window.bindingMap.devicepopup;
	devicepopup.addActionListener(MenuItemBinding.ACTION_COMMAND, this);


	if (this._startURL) {
		this.setURL(this._startURL);
		this._startURL = null;
	}
}

/**
 * Prepare cover to block external URLs.
 * @overloads {PageBinding#onAfterPageInitialize}
 */
BrowserPageBinding.prototype.onAfterPageInitialize = function () {

	BrowserPageBinding.superclass.onAfterPageInitialize.call(this);

	var self = this;
	var blocker = this.bindingWindow.bindingMap.blocker;

	if (blocker != null) {
		DOMEvents.addEventListener(blocker.bindingElement, DOMEvents.MOUSEDOWN, {
			handleEvent: function () {
				blocker.hide();
				if (self._blockertimeout != null) {
					clearTimeout(self._blockertimeout);
				}
			}
		});
	}

	this.loadDeviceList();

	this.reflex(); //?

	if (this._startURL) {
		this._isPushingUrl = false;
		this.setURL(this._startURL);
		this._startURL = null;
	}

	this._clearHistory();
	this._updateBroadcasters();

	//TODO move this
	this._box.getGeneticViewTabBinding().tree.addActionListener(GenericViewBinding.ACTION_COMMAND, this);


}


/**
 * Add node to order
 * @param {string} url
 * @return
 */
BrowserPageBinding.prototype.push = function (node, isManual, isForce) {

	this._asyncLocker = null;
	this.bindingWindow.bindingMap.cover.hide();
	var self = this;
	if (typeof (node) == "string" || node instanceof String) {
		self.pushURL(node, isManual);
	}
	if (node instanceof SystemNode) {
		var entityToken = node.getEntityToken();
		if (entityToken) {
			if (this._entityToken != entityToken || isForce) {
				TreeService.GetBrowserUrlByEntityToken(entityToken, function (result) {
					setTimeout(function () {
						if (result) {
							self.pushURL(result, isManual);
						} else {
							self.pushToken(node, isManual);
						} 
					}, 0);
				});
				this._entityToken = entityToken;
			}
		}
	}

}

/**
 * Add Url to order
 * @param {string} url
 * @return
 */
BrowserPageBinding.prototype.pushURL = function (url, isManual) {

	this.isBrowserTab = false;

	if (url && url != this._box.getLocation()) {
		this._isPushingUrl = isManual;
		if (this._customUrl) {
			this._targetUrl = this.getAbsoluteUrl(url);
			this.setCustomUrl(this._customUrl);
		} else {
			this.setURL(url);
		}
		this._updateAddressBar(url);
		this.bindingWindow.bindingMap.addressbar.showAddreesbar();
	}

}

BrowserPageBinding.prototype.getAbsoluteUrl = function (url) {
	var a = document.createElement("a");
	a.href = url;
	return a.href;
}


/**
 * Add Url to order
 * @param {string} url
 * @return
 */
BrowserPageBinding.prototype.pushToken = function (node, isManual) {

	this.isBrowserTab = false;

	var tab = this._box.getGeneticViewTabBinding();
	this._box.select(tab, true);
	tab.tree.setNode(node);
	this._updateHistory({ node: node });
	this._updateBroadcasters();
	this.bindingWindow.bindingMap.addressbar.showBreadcrumb(node);
	if (!isManual) {
		this.getSystemTree()._focusTreeNodeByEntityToken(node.getEntityToken());
	}
}


/**
 * Load URL in selected tab.
 * @param {string} url
 * @return
 */
BrowserPageBinding.prototype.setURL = function (url) {

	this.isBrowserTab = true;

	var cover = window.bindingMap.cover;
	cover.show();
	this._box.setURL(url);
}

/**
 * @implements {IActionListener}
 * @overloads {PageBinding#handleAction}
 * @param {Action} action
 */
BrowserPageBinding.prototype.handleAction = function (action) {

	BrowserPageBinding.superclass.handleAction.call(this, action);

	var binding = action.target;

	switch (action.type) {

		case WindowBinding.ACTION_ONLOAD:
			this._handleDocumentLoad(binding);
			action.consume();
			break;

		case ButtonBinding.ACTION_COMMAND:
		case MenuItemBinding.ACTION_COMMAND:
			this._handleCommand(binding.getProperty("cmd"), binding);
			action.consume();
			break;

		case TabBoxBinding.ACTION_SELECTED:
			this._handleSelectedTab();
			action.consume();
			break;

		case TabBoxBinding.ACTION_UPDATED:
			this._handleTabBoxUpdate();
			action.consume();
			break;

		case BrowserTabBinding.ACTIONVENT_CLOSE:
			this._isDisposing = true;
			action.consume();
			break;
		case GenericViewBinding.ACTION_COMMAND:
			this.getSystemTree().handleBroadcast(BroadcastMessages.SYSTEMTREEBINDING_FOCUS, action.target.node.getEntityToken());
			break;
		case ViewBinding.ACTION_LOADED:
			this.dispatchAction(StageBinding.ACTION_DECK_LOADED);
			action.consume();
			break;
		case PageBinding.ACTION_INITIALIZED:
			if (binding instanceof SystemPageBinding) {
				EventBroadcaster.broadcast(BroadcastMessages.STAGEDECK_CHANGED, this.getSyncHandle());
				this.removeActionListener(PageBinding.ACTION_INITIALIZED);
				action.consume();
			}
			break;
		case SplitterBinding.ACTION_DRAGSTART:
			window.bindingMap.cover.show();
			break;
		case SplitterBinding.ACTION_DRAGGED:
			window.bindingMap.cover.hide();
			break;
	}
}

/*
 * Clear history
 */
BrowserPageBinding.prototype._clearHistory = function () {
	if (!this._current) {

		this._current = {
			history: new List(),
			index: parseInt(-1)
		};
	}

	while (this._current.history.getLength() > 1) {
		this._current.history.del(0);
		this._current.index = this._current.history.getLength() - 1;
	}
}


/**
 * Handle selected tab.
 * @param {BrowserTabBoxBinding} tabbox
 */
BrowserPageBinding.prototype._handleSelectedTab = function () {

	var tab = this._box.getSelectedTabBinding();
	if (tab.getLabel() != null) {
		tab.dispatchAction(DockTabBinding.ACTION_UPDATE_VISUAL);
	}
	if (Types.isFunction(tab.getEntityToken)) {
		tab.dispatchAction(DockTabBinding.ACTION_UPDATE_TOKEN);
	}


	if (!this._current) {
		this._current = {
			history: new List(),
			index: parseInt(-1)
		};
	}
	this._updateBroadcasters();

	/*
	 * Broadcast contained markup for various panels to intercept. Since the markup   
	 * extraction requires a server roundtrip, we check for subscribers first.
	 */
	if (EventBroadcaster.hasSubscribers(BroadcastMessages.XHTML_MARKUP_ON)) {
		if (tab.browserwindow != null) {
			var markup = WindowBinding.getMarkup(tab.browserwindow);
			EventBroadcaster.broadcast(BroadcastMessages.XHTML_MARKUP_ON, markup);
		}
	}

	/*
	 * Dispatch event for plugins to hook.
	 */
	this.dispatchAction(BrowserPageBinding.ACTION_TABSHIFT);
}

/**
 * @param {BrowserTabBoxBinding} tabbox
 */
BrowserPageBinding.prototype._handleTabBoxUpdate = function () {

	//var box = this._box;

	//switch (box.updateType) {

	//    case TabBoxBinding.UPDATE_DETACH:
	//    case TabBoxBinding.UPDATE_ATTACH:

	//        var tabs = UserInterface.getBinding(box.getTabsElement());
	//        if (box.getTabBindings().getLength() == 1) {
	//            if (tabs.isVisible) {
	//                tabs.hide();
	//                this.reflex();
	//            }
	//        } else {
	//            if (!tabs.isVisible) {
	//                tabs.show();
	//                this.reflex();
	//            }
	//        }
	//        break;
	//}
}

/**
 * Handle loaded document.
 * @param {WindowBinding} binding
 */
BrowserPageBinding.prototype._handleDocumentLoad = function (binding) {

	var url = new String(binding.getContentDocument().location);

	this._asyncLocker = KeyMaster.getUniqueKey();

	/*
	 * Update stuff.
	 */
	this._updateAddressBar(url);
	this._updateHistory(url);
	this._updateBroadcasters();
	this._updateDocument();
	this._updateTabBox(url);

	/*
	 * Cache control.
	 */
	if (Client.isPrism == true) {
		Prism.enableCache();
	}


	/*
	 * Broadcast contained markup for various panels to intercept. Since the markup   
	 * extraction requires a server roundtrip, we check for subscribers first.
	 */
	if (EventBroadcaster.hasSubscribers(BroadcastMessages.XHTML_MARKUP_ON)) {
		var markup = WindowBinding.getMarkup(binding);
		EventBroadcaster.broadcast(BroadcastMessages.XHTML_MARKUP_ON, markup);
	}

	/*
	 * Hide the cover.
	 */
	var cover = window.bindingMap.cover;
	if (cover.isVisible) {
		cover.hide();
	}

	if (!this._isPushingUrl) {
		var self = this;
		var asyncLocker = this._asyncLocker;
		TreeService.GetEntityTokenByPageUrl(url, function (entityToken) {
			if (asyncLocker === self._asyncLocker) {
				self._entityToken = entityToken;
				EventBroadcaster.broadcast(
					BroadcastMessages.SYSTEMTREEBINDING_FOCUS,
					entityToken
				);
			}
		});
		
	}

	/*
	 * Dispatch event for Browser plugins to hook into.
	 */
	this.dispatchAction(BrowserPageBinding.ACTION_ONLOAD);

	this._isPushingUrl = false;

	if (this.isBrowserTab) {
		var tab = this._box.getBrowserTabBinding();
		this._box.select(tab);
	}

}

/**
 * @param {string} url
 */
BrowserPageBinding.prototype._updateAddressBar = function (url) {

	var bar = this.bindingWindow.bindingMap.addressbar;
	if (bar != null) {
		var asyncLocker = this._asyncLocker;
		var self = this;
		PageService.ConvertRelativePageUrlToAbsolute(url, function (result) {
			if (asyncLocker === self._asyncLocker) {
				bar.setValue(result);
			}
		});
		
	}
}

/**
 * @param {string} url
 */
BrowserPageBinding.prototype._updateTabBox = function (url) {

	//TODO: check and remove this
	var def = ViewDefinitions["Composite.Management.Browser"];
	def.argument = { "URL": url };

}

/*
 * Update history.
 * @param {object} item
 */
BrowserPageBinding.prototype._updateHistory = function (item) {

	if (this._isHistoryBrowsing == true) {
		this._isHistoryBrowsing = false;
	} else {

		/*
		 * Clicking the same link twice should not update history, so we 
		 * made the code below. But since this would not enable user to 
		 * go back after a HTTP POST submit, the fix was disabled again. 
		 * Funny thing is - try uncomment this code and check it out... 
		 *
		var last = this._current.history.getLast ();
		if ( last != null ) {
			alert ( url.toString () + "\n" + last.toString () + "\n" + ( url == last ));
		}
		*/

		while (this._current.history.getLength() - 1 > this._current.index) {
			this._current.history.extractLast();
		}
		this._current.history.add(item);
		this._current.index++;

	}
}

/**
 * Handle command (navbar or contextmenu).
 * @param {string} cmd
 * @param {Binding} binding
 */
BrowserPageBinding.prototype._handleCommand = function (cmd, binding) {

	/*
	 * Because of a bug in the history object in Prism 0.91,
	 * we cannot invoke history.back and stuff. We have 
	 * to load new URLs from our own history. This will 
	 * destroy native history.back in document, so please 
	 * fix at some point... 
	 * @see https://bugzilla.mozilla.org/show_bug.cgi?id=429550
	 */
	switch (cmd) {
		case "back":
			this._isHistoryBrowsing = true;
			var item = this._current.history.get(--this._current.index);
			this.push(item && item.node ? item.node : item);
			break;
		case "forward":
			this._isHistoryBrowsing = true;
			var item = this._current.history.get(++this._current.index);
			this.push(item && item.node ? item.node : item);

			break;
		case "refresh":
			this.getSystemTree()._handleCommandBroadcast(BroadcastMessages.SYSTEMTREEBINDING_REFRESH);
			break;
		case "home":
			this.push(this.getSystemPage().node);
			break;
		case "toggletree":
			var toggletreebutton = this.bindingWindow.bindingMap.toggletreebutton;
			var explorerpanel = this.bindingWindow.bindingMap.explorerpanel;
			if (toggletreebutton.isChecked) {
				explorerpanel.show();
			} else {
				explorerpanel.hide();
			}
			this.reflex();
			break;
		case "seoassistant":
			StageBinding.handleViewPresentation("Composite.Management.SEOAssistant");
			var self = this;
			setTimeout(function () {
				self.getContentDocument().location.reload();
			}, 250);
			break;
			break;
		case "setscreen":
			this._box.focus();
			var w = binding.getProperty("w");
			var h = binding.getProperty("h");
			var touch = binding.getProperty("touch");
			this._customUrl = binding.getProperty("url");;
			this._isRequirePublicNet = binding.getProperty("requirepublicnet");
			if (this._customUrl) {
				this.setCustomUrl(this._customUrl);
			} else {
				if (this._targetUrl) {
					this.setURL(this._targetUrl);
					this._targetUrl = null;
				}
				var browserView = this._box.getBrowserTabBinding();
				this._box.select(browserView, true);
			}
			this.setScreen(new Dimension(w, h), touch);

			//set screen button image
			var setscreenbutton = this.bindingWindow.bindingMap.setscreenbutton;
			if (binding.image) {
				setscreenbutton.setImage(binding.image);
			}

			break;

		case DockTabPopupBinding.CMD_VIEWSOURCE: /* notice dependencies */
			this._viewSource(cmd);
			break;
	}
}

/**
 * View source.
 * @param {string} cmd
 */
BrowserPageBinding.prototype._viewSource = function (cmd) {

	var doc = this.getContentDocument();
	var def = ViewDefinitions["Composite.User.SourceCodeViewer"];

	def.argument = {
		action: cmd,
		doc: doc
	}
	def.label = this.label;
	StageBinding.presentViewDefinition(def);
}

/**
 * Update broadcasters.
 */
BrowserPageBinding.prototype._updateBroadcasters = function () {

	var back = window.bindingMap.broadcasterHistoryBack;
	var forward = window.bindingMap.broadcasterHistoryForward;
	var browserview = window.bindingMap.broadcasterBrowserView;

	if (this._current.index > 0) {
		back.enable();
	} else {
		back.disable();
	}
	if (this._current.index < this._current.history.getLength() - 1) {
		forward.enable();
	} else {
		forward.disable();
	}

	if (this._box.getGeneticViewTabBinding().isSelected) {
		browserview.disable();
	} else {
		browserview.enable();
	}

	

	
}

/**
 * Update hosted document (performed on load).
 */
BrowserPageBinding.prototype._updateDocument = function () {

	var win = this.getContentWindow();
	var doc = this.getContentDocument();

	//Do not add context menu to UI Pages
	if (!UserInterface.getBinding(doc.body))
		DOMEvents.addEventListener(doc, DOMEvents.CONTEXTMENU, this);
	DOMEvents.addEventListener(win, DOMEvents.UNLOAD, this);
	DOMEvents.addEventListener(win, DOMEvents.MOUSEDOWN, this);

	/*
	 * Paralyze links leading to external websites.
	 */
	if (doc.links.length > 0) {

		var self = this;
		var span = this.bindingDocument.getElementById("externalurl");
		var blocker = this.bindingWindow.bindingMap.blocker;

		var handler = {
			handleEvent: function (e) {
				DOMEvents.preventDefault(e);
				var link = DOMEvents.getTarget(e);
				span.firstChild.data = link.href;
				blocker.show();
				self._blockertimeout = setTimeout(function () {
					blocker.hide();
				}, 2300);
			}
		}

		var link, i = 0;
		while ((link = doc.links[i++]) != null) {
			if (link.href.indexOf("//") > -1) {
				var host = link.href.split("//")[1].split("/")[0];
				if (host != window.location.host) {
					DOMEvents.addEventListener(link, DOMEvents.CLICK, handler);
				}
			}
		}
	}
}

/**
 * Get document from selected tab.
 * @return {DOMDocument}
 */
BrowserPageBinding.prototype.getContentDocument = function () {

	return this._box.getContentDocument();
}

/**
 * Get window from selected tab.
 * @return {DOMDocumentView}
 */
BrowserPageBinding.prototype.getContentWindow = function () {

	return this._box.getContentWindow();
}

/**
 * @overloads {PageBinding#handleEvent}
 * @implements {IEventListener}
 * @param {Event} e
 */
BrowserPageBinding.prototype.handleEvent = function (e) {

	BrowserPageBinding.superclass.handleEvent.call(this, e);

	var cover = window.bindingMap.cover;
	var element = DOMEvents.getTarget(e);

	switch (e.type) {

		case DOMEvents.CONTEXTMENU:
			var contextmenu = window.bindingMap.contextmenu;
			var p1 = DOMUtil.getUniversalMousePosition(e);
			var p2 = this.boxObject.getUniversalPosition();
			var p3 = new Point(p1.x - p2.x, p1.y - p2.y);
			contextmenu.snapToPoint(p3);
			DOMEvents.preventDefault(e);
			break;

		case DOMEvents.UNLOAD:

			if (!this._isDisposing) {
				cover.show();
				if (Client.isPrism) {
					Prism.disableCache();
				}
			}
			break;
		case DOMEvents.MOUSEDOWN:
			this._box.focus();
		case DOMEvents.WHEEL:

			if (element.id == BrowserPageBinding.DEVICE_TOUCHVIEW_FRAMEOVERLAY_ID) {
				this._box.focus();
				var delta = e.deltaY || e.detail || e.wheelDelta;
				delta = Math.abs(delta) < 50 ? 50 * Math.sign(delta) : delta;
				var doc = this._box.getFrameElement().contentWindow.document;
				doc.documentElement.scrollTop += delta;
				doc.body.scrollTop += delta; // Chrome
	}
			break;

		case DOMEvents.CLICK:
			if (element.id == BrowserPageBinding.DEVICE_TOUCHVIEW_FRAMEOVERLAY_ID) {
				this._box.focus();
				element.style.display = "none";
				var frame = this._box.getFrameElement();
				var framePosition = frame.getBoundingClientRect();
				var el = frame.contentWindow.document.elementFromPoint(e.clientX - framePosition.left, e.clientY - framePosition.top);
				if (el) {
					if (el.tagName && ["input", "textarea"].indexOf(el.tagName.toLowerCase()) > -1 && ["text", "textarea", "email", "password", "url", "radio", "checkbox"].indexOf(el.type.toLowerCase()) > -1) {
						el.focus();
}
					el.click();
				}
				element.style.display = "block";
			}
			break;
	}
}


BrowserPageBinding.prototype.loadDeviceList = function () {
	var request = DOMUtil.getXMLHTTPRequest();
	var url = Resolver.resolve(BrowserPageBinding.DEVICE_LIST);
	var devicepopup = window.bindingMap.devicepopup;
	devicepopup.empty();
	var bindingDocument = this.bindingDocument;
	request.open("get", url, true);
	request.onreadystatechange = function () {
		if (request.readyState == 4) {
			if (request.status == 200) {
				var response = request.responseXML;
				new List(response.getElementsByTagName("group")).each(function (devicegroup) {
					var groupBinding = MenuGroupBinding.newInstance(bindingDocument);
					devicepopup.add(groupBinding);
					groupBinding.attach();
					new List(devicegroup.getElementsByTagName("device")).each(function (device) {


						var label = device.getAttribute("label");
						var image = device.getAttribute("image");
						var w = device.getAttribute("w");
						var h = device.getAttribute("h");
						var touch = device.getAttribute("touch");
						var requirepublicnet = device.getAttribute("requirepublicnet");
						
						var urlProperty = device.getAttribute("url");

						var itemBinding = MenuItemBinding.newInstance(bindingDocument);
						itemBinding.setImage(image);
						itemBinding.setLabel(label);
						itemBinding.setProperty("cmd", "setscreen");
						itemBinding.setProperty("w", w);
						itemBinding.setProperty("h", h);
						itemBinding.setProperty("touch", touch);
						itemBinding.setProperty("requirepublicnet", requirepublicnet);
						itemBinding.setProperty("url", urlProperty);
						groupBinding.add(itemBinding);
						itemBinding.attach();

						if (!Application.isOnPublicNet && requirepublicnet) {
							itemBinding.disable();
						}
					});
				});

			}
		}
	};
	request.send(null);
}


/**
 * Set client width for browser iframe
 * @param {int} width
 */
BrowserPageBinding.prototype.setCustomUrl = function (url) {
	var customView = this._box.getCustomViewTabBinding();
	var targetUrl = this._targetUrl ? this._targetUrl : this._box.getLocation();
	url = url.replace("{url}", targetUrl);
	url = url.replace("{encodedurl}", encodeURIComponent(this._isRequirePublicNet ? targetUrl.replace(/\/c1mode\(unpublished\)/, "") : targetUrl));
	//replace 2nd and next '?' to '&'
	url = url.replace(/(\?)(.+)/g, function (a, b, c) { return b + c.replace(/\?/g, "&") });
	if (customView.iframe.src) {
		customView.iframe.src = "about:blank";
		customView.iframe.onload = function () {
			customView.iframe.onload = null;
			customView.iframe.src = url;
		};
	} else {
		customView.iframe.src = url;
	}
	this._box.select(customView, true);
}

/**
 * Set client width for browser iframe
 * @param {int} width
 */
BrowserPageBinding.prototype.setScreen = function (dim, touch) {

	var frame = this._box.getFrameElement();
	var win = this._box.getBrowserWindow().bindingElement;

	frame.contentWindow.document.getElementsByTagName('body')[0].style.overflowX = "hidden";

	win.style.background = "#444";

	if (dim.w && dim.h && dim.h < win.offsetHeight) {
		frame.className = "deviceframe centeredXY";
	} else {
		frame.className = 'deviceframe';
	}
	if (dim.w) {
	   
		if (touch) {
			frame.style.width = dim.w + this.getScrollbarWidth() + "px";
		} else {
			frame.style.width = dim.w + "px";
		}
		win.style.overflowX = "auto";
	} else {
		frame.style.removeProperty("width");
		win.style.removeProperty("overflow-x");
	}
	if (dim.h) {
		frame.style.height = dim.h + "px";
		win.style.overflowY = "auto";
	} else {
		frame.style.removeProperty("height");
		win.style.removeProperty("overflow-y");
	}

	var frameOvl = document.getElementById(BrowserPageBinding.DEVICE_TOUCHVIEW_FRAMEOVERLAY_ID);

	if (touch && !frameOvl) {

		frameOvl = document.createElement('div');
		frameOvl.id = BrowserPageBinding.DEVICE_TOUCHVIEW_FRAMEOVERLAY_ID;
		win.appendChild(frameOvl);

		DOMEvents.addEventListener(frameOvl, DOMEvents.WHEEL, this);
		DOMEvents.addEventListener(frameOvl, DOMEvents.CLICK, this);
	}

	if (frameOvl) {
		frameOvl.style.display = touch ? "block" : "none";
	}

	if (touch) {
		frameOvl.style.marginLeft = "-" + (this.getScrollbarWidth() / 2) + "px";
		frameOvl.style.width = dim.w + "px";
		frameOvl.style.height = dim.h + "px";
		frameOvl.className = frame.className.indexOf('centeredXY') > 0 ? 'centeredXY' : 'centeredX';
	} 
}


BrowserPageBinding.prototype.getScrollbarWidth = function () {
	var div, width = this.getScrollbarWidth.width;
	if (width === undefined) {
		div = document.createElement('div');
		div.innerHTML = '<div style="width:50px;height:50px;position:absolute;left:-50px;top:-50px;overflow:auto;"><div style="width:1px;height:100px;"></div></div>';
		div = div.firstChild;
		document.body.appendChild(div);
		width = this.getScrollbarWidth.width = div.offsetWidth - div.clientWidth;
		document.body.removeChild(div);
	}
	return width;
};

/**
 * Return perspective handle for browser
 */
BrowserPageBinding.prototype.getSyncHandle = function () {

	return this.systemViewDefinition.handle;
}

/**
 * Get system tree
 */
BrowserPageBinding.prototype.getSystemTree = function () {

	return this._viewBinding.getContentWindow().bindingMap.tree;
}

/**
 * Get system tree
 */
BrowserPageBinding.prototype.getSystemPage = function () {

	return this._viewBinding.getContentWindow().bindingMap.page;
}