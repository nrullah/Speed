/*
 * This file is part of Ext JS 4
 * 
 * Copyright (c) 2011 Sencha Inc
 * 
 * Contact:  http://www.sencha.com/contact
 * 
 * GNU General Public License Usage
 * This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.
 * 
 * If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.
 * 
 * 
 */



Ext.define('Ext.ux.desktop.Module', {
    mixins: {
        observable: 'Ext.util.Observable'
    },

    constructor: function (config) {
        this.mixins.observable.constructor.call(this, config);
        this.init();
    },    

    init: Ext.emptyFn,
    
    createWindow : function (config) {
        if(!this.window){
            return;
        }
        
        var desktop = this.app.getDesktop(),
            win = desktop.getModuleWindow(this.id),     
            wndCfg,       
            isReopen = !win && this.win;        

        win = win || this.win;

        if(!win){            
            wndCfg = this.window.call(window) || this._window;
            
            if(config){
                wndCfg = Ext.apply(wndCfg, config);
            }
            
            win = desktop.createWindow(wndCfg);
            win.moduleId = this.id;
            if(win.closeAction === "hide"){
                this.win = win;
                win.on("destroy", function () {
                    delete this.win;
                }, this);
            }
        }

        if(isReopen){
            desktop.windows.add(win);

            win.taskButton = desktop.taskbar.addTaskButton(win);
            win.animateTarget = win.taskButton.el;
        }        
        win.show();
        return win;
    },

    addWindow: function (window) {
        this.window = window;
        if(this.autoRun && !this.autoRunHandler){
            this.createWindow();
        }
    },

    setWindow : function (window) {
        this._window = window;
    },

    addLauncher : function (launcher) {
        this.launcher = launcher;

        if(!(this.launcher.handler || this.launcher.listeners && this.launcher.listeners.click)){
            this.launcher.handler = function() {
                this.createWindow();
            };
            this.launcher.scope = this;                
        }
        this.launcher.moduleId = this.id;
        this.app.desktop.taskbar.startMenu.menu.add(this.launcher);
    },

    run : function () {
        return this.createWindow();
    }
    
});




Ext.define('Ext.ux.desktop.ShortcutModel', {
    extend: 'Ext.data.Model',
    idProperty: "module",
    fields: [
       { name: 'name' },
       { name: 'iconCls' },
       { name: 'module' },
       { name: 'qtitle' },
       { name: 'qtip' },
       { name: 'x' },
       { name: 'y' },
       { name: 'sortIndex', type:"int" },
       { name: 'tempX', type: "int", useNull: true },
       { name: 'tempY', type: "int", useNull: true },
       { name: 'handler' },
       { name: 'textCls', defaultValue:"" },
       { name: 'hidden', type: "boolean" }
    ]
});




Ext.define('Ext.ux.desktop.Wallpaper', {
    extend: 'Ext.Component',

    alias: 'widget.wallpaper',
    style: "position:absolute;",

    cls: 'ux-wallpaper',
    html: '<img src="'+Ext.BLANK_IMAGE_URL+'">',

    stretch: false,
    wallpaper: null,

    afterRender: function () {
        var me = this;
        me.callParent();
        me.setWallpaper(me.wallpaper, me.stretch);
    },

    applyState: function () {
        var me = this, old = me.wallpaper;
        me.callParent(arguments);
        if (old != me.wallpaper) {
            me.setWallpaper(me.wallpaper);
        }
    },

    getState: function () {
        return this.wallpaper && { wallpaper: this.wallpaper };
    },

    setWallpaper: function (wallpaper, stretch) {
        var me = this, imgEl, bkgnd;

        me.stretch = (stretch === true);
        me.wallpaper = wallpaper;

        if (me.rendered) {
            imgEl = me.el.dom.firstChild;

            if (!wallpaper || wallpaper == Ext.BLANK_IMAGE_URL) {
                Ext.fly(imgEl).hide();
            } else if (me.stretch) {
                imgEl.src = wallpaper;

                me.el.removeCls('ux-wallpaper-tiled');
                Ext.fly(imgEl).setStyle({
                    width: '100%',
                    height: '100%'
                }).show();
            } else {
                Ext.fly(imgEl).hide();

                bkgnd = 'url('+wallpaper+')';
                me.el.addCls('ux-wallpaper-tiled');
            }

            me.el.setStyle({
                backgroundImage: bkgnd || ''
            });
        }
        return me;
    }
});



Ext.define('Ext.ux.desktop.StartMenu', {
    extend: 'Ext.panel.Panel',

    requires: [
        'Ext.menu.Menu',
        'Ext.toolbar.Toolbar'
    ],

    ariaRole: 'menu',

    cls: 'x-menu ux-start-menu',

    defaultAlign: 'bl-tl',

    iconCls: 'user',

    floating: true,

    shadow: true,

    hideTools : false,

    // We have to hardcode a width because the internal Menu cannot drive our width.
    // This is combined with changing the align property of the menu's layout from the
    // typical 'stretchmax' to 'stretch' which allows the the items to fill the menu
    // area.
    width: 300,

    initComponent: function() {
        var me = this, menu = me.menu;

        me.menu = new Ext.menu.Menu({
            cls: 'ux-start-menu-body',
            border: false,
            floating: false,
            items: menu
        });
        me.menu.layout.align = 'stretch';

        me.items = [me.menu];
        me.layout = 'fit';

        Ext.menu.Manager.register(me);
        me.callParent();
        // TODO - relay menu events

        me.toolbar = new Ext.toolbar.Toolbar(Ext.apply({
            dock: 'right',
            cls: 'ux-start-menu-toolbar',
            vertical: true,
            width: 100,
            hidden : me.hideTools,
            listeners: {
                add: function(tb, c) {
                    c.on({
                        click: function() {
                            me.hide();
                        }
                    });
                }
            }
        }, me.toolConfig));

        me.toolbar.layout.align = 'stretch';
        me.addDocked(me.toolbar);

        delete me.toolItems;
    },

    addMenuItem: function() {
        var cmp = this.menu;
        cmp.add.apply(cmp, arguments);
    },

    addToolItem: function() {
        var cmp = this.toolbar;
        cmp.add.apply(cmp, arguments);
    }
}); // StartMenu




Ext.define('Ext.ux.desktop.TaskBar', {
    extend: 'Ext.toolbar.Toolbar', // TODO - make this a basic hbox panel...

    requires: [
        'Ext.button.Button',
        'Ext.resizer.Splitter',
        'Ext.menu.Menu',

        'Ext.ux.desktop.StartMenu'
    ],

    alias: 'widget.taskbar',

    cls: 'ux-taskbar',

    
    startBtnText: 'Start',
    startBtnIconCls: 'ux-start-button-icon',
    standOut : false,
    dock: "bottom",
    quickStartWidth : 60,
    trayWidth : 80,
    trayClockConfig : true,
    height: 27,

    initComponent: function () {
        var me = this;

        me.startMenu = new Ext.ux.desktop.StartMenu(me.startConfig);

        me.quickStart = new Ext.toolbar.Toolbar(me.getQuickStart());
        me.quickStart.on("resize", function(){
            this.desktop.saveState();
        }, this, {buffer:100});

        me.windowBar = new Ext.toolbar.Toolbar(me.getWindowBarConfig());

        me.tray = new Ext.toolbar.Toolbar(me.getTrayConfig());
        me.tray.on("resize", function(){
            this.desktop.saveState();
        }, this, {buffer:100});

        me.items = [
            {
                xtype: 'button',
                cls: 'ux-start-button',
                iconCls: me.startBtnIconCls,
                menu: me.startMenu,
                //menuAlign: 'bl-tl',
                text: me.startBtnText
            },
            '-',
            me.quickStart,
            {
                xtype: 'splitter', html: '&#160;',
                hidden: me.hideQuickStart,
                height: 14, width: 4, // TODO - there should be a CSS way here
                style:"cursor:e-resize;",
                cls: 'x-toolbar-separator x-toolbar-separator-horizontal',
                listeners: {
                    "afterrender": function(){
                        this.tracker.onDrag = Ext.Function.createSequence(this.tracker.onDrag, this.tracker.performResize, this.tracker);
                    }
                }
            },
            //'-',
            me.windowBar,
            {
                xtype: 'splitter', html: '&#160;',
                hidden: me.hideTray,
                height: 14, width: 4, // TODO - there should be a CSS way here
                style:"cursor:w-resize;",
                cls: 'x-toolbar-separator x-toolbar-separator-horizontal',
                listeners: {
                    "afterrender": function(){
                        this.tracker.onDrag = Ext.Function.createSequence(this.tracker.onDrag, this.tracker.performResize, this.tracker);
                    }
                }
            },
            me.tray
        ];

        me.callParent();
    },

    afterLayout: function () {
        var me = this;
        me.callParent();
        me.windowBar.el.on('contextmenu', me.onButtonContextMenu, me);
    },

    
    getQuickStart: function () {
        var ret = Ext.apply({
            minWidth: 20,
            enableOverflow: true,
            width: this.quickStartWidth,         
            hidden: this.hideQuickStart   
        }, this.quickStartConfig);
        delete this.quickStartConfig;
        return ret;
    },

    
    getTrayConfig: function () {
        var ret = Ext.apply({
            width: this.trayWidth,         
            hidden: this.hideTray,
            items: []   
        }, this.trayConfig);
        delete this.trayConfig;

        if(this.trayClock){
            ret.items.push(Ext.isObject(this.trayClock) ? this.trayClock : { xtype: 'trayclock', flex: 1 });
        }

        return ret;
    },

    getWindowBarConfig: function () {
        return {
            flex: 1,
            cls: 'ux-desktop-windowbar',
            //items: [ '&#160;' ],
            layout: { overflowHandler: 'Scroller' }
        };
    },

    getWindowBtnFromEl: function (el) {
        var c = this.windowBar.getChildByElement(el);
        return c || null;
    },

    onButtonContextMenu: function (e) {
        var me = this, t = e.getTarget(), btn = me.getWindowBtnFromEl(t);
        if (btn) {
            e.stopEvent();
            me.windowMenu.theWin = btn.win;
            me.windowMenu.showBy(t);
        }
    },

    onWindowBtnClick: function (btn) {
        var win = btn.win;

        if (win.minimized || win.hidden) {
            btn.disable();
            win.show(null, function() {
                btn.enable();
            });
        } else if (win.active) {
            btn.disable();
            win.on('hide', function() {
                btn.enable();
            }, null, {single: true});
            win.minimize();
        } else {
            win.toFront();
        }
    },

    addTaskButton: function(win) {
        var config = {
            iconCls: win.iconCls,
            standOut : this.standOut,
            enableToggle: true,
            toggleGroup: 'all',
            width: 140,
            margins: '0 2 0 3',
            text: Ext.util.Format.ellipsis(win.title, 20),
            listeners: {
                click: this.onWindowBtnClick,
                scope: this
            },
            win: win
        };

        var cmp = this.windowBar.add(config);
        cmp.toggle(true);
        return cmp;
    },

    removeTaskButton: function (btn) {
        var found, me = this;
        me.windowBar.items.each(function (item) {
            if (item === btn) {
                found = item;
            }
            return !found;
        });
        if (found) {
            me.windowBar.remove(found);
        }
        return found;
    },

    setActiveButton: function(btn) {
        if (btn) {
            btn.toggle(true);
        } else {
            this.windowBar.items.each(function (item) {
                if (item.isButton) {
                    item.toggle(false);
                }
            });
        }
    }
});


Ext.define('Ext.ux.desktop.TrayClock', {
    extend: 'Ext.toolbar.TextItem',

    alias: 'widget.trayclock',

    cls: 'ux-desktop-trayclock',

    html: '&#160;',

    timeFormat: 'g:i A',

    tpl: '{time}',
    refreshInterval : 10000,

    initComponent: function () {
        var me = this;

        me.callParent();

        if (typeof(me.tpl) == 'string') {
            me.tpl = new Ext.XTemplate(me.tpl);
        }
    },

    afterRender: function () {
        var me = this;
        Ext.Function.defer(me.updateTime, 100, me);
        me.callParent();
    },

    onDestroy: function () {
        var me = this;

        if (me.timer) {
            window.clearTimeout(me.timer);
            me.timer = null;
        }

        me.callParent();
    },

    updateTime: function () {
        var me = this, time = Ext.Date.format(new Date(), me.timeFormat),
            text = me.tpl.apply({ time: time });
        if (me.lastText != text) {
            me.setText(text);
            me.lastText = text;
        }
        me.timer = Ext.Function.defer(me.updateTime, me.refreshInterval, me);
    }
});




Ext.define('Ext.ux.desktop.Desktop', {
    extend: 'Ext.panel.Panel',

    alias: 'widget.desktop',

    uses: [
        'Ext.util.MixedCollection',
        'Ext.menu.Menu',
        'Ext.view.View', // dataview
        'Ext.window.Window',

        'Ext.ux.desktop.TaskBar',
        'Ext.ux.desktop.Wallpaper'
    ],

    activeWindowCls: 'ux-desktop-active-win',
    inactiveWindowCls: 'ux-desktop-inactive-win',
    lastActiveWindow: null,

    border: false,
    html: '&#160;',
    layout: 'fit',

    xTickSize: 1,
    yTickSize: 1,

    app: null,

    
    shortcuts: null,

    
    shortcutItemSelector: 'div.ux-desktop-shortcut',

    shortcutEvent: "click",
    ddShortcut : true,
    shortcutDragSelector: true,
    shortcutNameEditing : false,
    alignToGrid : true,
    multiSelect : true,
    defaultWindowMenu : true,
    restoreText : 'Restore',
    minimizeText : 'Minimize',
    maximizeText : 'Maximize',
    closeText : 'Close',
    defaultWindowMenuItemsFirst : false,


    getState : function () {
        var shortcuts = [];
        
        this.shortcuts.each(function(record){
            var x = record.data.x,
                y = record.data.y;

            if(!Ext.isEmpty(x) || !Ext.isEmpty(y)){
                shortcuts.push({x:x,y:y, m:record.data.module});
            }
        });

        return {s:shortcuts, q:this.taskbar.quickStart.getWidth(), t:this.taskbar.tray.getWidth()}; 
    },

    applyState : function (state) {
        if(this.shortcuts && state.s){
            Ext.each(state.s, function(coord){
                this.shortcuts.each(function(shortcut){
                    if(shortcut.data.module == coord.m){
                        shortcut.data.x = coord.x;
                        shortcut.data.y = coord.y;
                        return false;
                    }
                }, this);
            }, this);
        }

        if(this.taskbar.quickStart && state.q){
            this.taskbar.quickStart.setWidth(state.q);
        }

        if(this.taskbar.tray && state.t){
            this.taskbar.tray.setWidth(state.t);
        }
    },

    
    shortcutTpl: [
        '<tpl for=".">',
            '<div class="ux-desktop-shortcut" style="{[this.getPos(values)]}">',
                '<div class="ux-desktop-shortcut-wrap">',
                '<div class="ux-desktop-shortcut-icon {iconCls}">',
                    '<img src="',Ext.BLANK_IMAGE_URL,'" title="{name}">',
                '</div>',
                '<div class="ux-desktop-shortcut-text {textCls}">{name}</div>',
                '</div>',
                '<div class="ux-desktop-shortcut-bg"></div>',
            '</div>',
        '</tpl>',
        '<div class="x-clear"></div>'
    ],

    
    taskbarConfig: null,

    windowMenu: null,

    initComponent: function () {
        var me = this;

        me.windowMenu = me.createWindowMenu();

        me.taskbar = new Ext.ux.desktop.TaskBar(me.taskbarConfig);
        this.dockedItems = this.dockedItems || [];
        this.dockedItems.push(me.taskbar);

        me.taskbar.windowMenu = me.windowMenu;
        me.taskbar.desktop = this;

        me.windows = new Ext.util.MixedCollection();

        if(me.contextMenu){
            me.contextMenu = Ext.ComponentManager.create(me.contextMenu, "menu");
        }

        if(me.shortcutContextMenu){
            me.shortcutContextMenu = Ext.ComponentManager.create(me.shortcutContextMenu, "menu");
        }

        var uItems = me.items;

        me.items = [
            { xtype: 'wallpaper', id: me.id+'_wallpaper', desktop: this },
            me.createDataView()
        ];

        if(Ext.isArray(uItems) && uItems.length>0){
            me.items = me.items.concat(uItems);
        }

        me.callParent();

        me.shortcutsView = me.items.getAt(1);
        me.shortcutsView.on('item'+me.shortcutEvent, me.onShortcutItemClick, me);

        var wallpaper = me.wallpaper;
        me.wallpaper = me.items.getAt(0);
        if (wallpaper) {
            me.setWallpaper(wallpaper, me.wallpaperStretch);            
        }
    },

    afterRender: function () {
        var me = this;
        me.callParent();
        me.el.on('contextmenu', me.onDesktopMenu, me);   
        me.wallpaper.on("resize", function(){
            me.getComponent(1).setSize(me.wallpaper.getSize());
        }, me);
        me.getComponent(1).setSize(me.wallpaper.getSize());

        me.tip = Ext.create("Ext.tip.ToolTip",{         
            delegate:".ux-desktop-shortcut",
            target:me.getComponent(1).el,
            trackMouse:true,
            listeners:{
                beforeshow:{
                    fn:this.showTip,
                    scope: this
                }
            }
        });        
    },

    showTip : function () {
        var view = this.getComponent(1),
            record = view.getRecord(this.tip.triggerElement);

        if(!record || Ext.isEmpty(record.get('qTip'))){
            this.tip.addCls("x-hide-visibility");
            return;
        }

        this.tip.removeCls("x-hide-visibility");

        if(!Ext.isEmpty(record.get('qTitle'))){
            this.tip.setTitle(record.get('qTitle'));
            this.tip.header.removeCls("x-hide-display");
        }
        else if(this.tip.header){
            this.tip.header.addCls("x-hide-display");
        }
        this.tip.update(record.get('qTip'));
    },

    //------------------------------------------------------
    // Overrideable configuration creation methods

    createDataView: function () {
        var me = this,            
            data;
        
        if(!me.shortcuts){
            data = [];

            Ext.each(this.app.modules, function (module) {
                var s = module.shortcut;
                if(module.shortcut && module.shortcut.hidden !== true){
                    if(me.shortcutDefaults){
                        Ext.applyIf(s, me.shortcutDefaults);
                    }

                    data.push(s);
                }
            }, me);
            
            me.shortcuts = Ext.create('Ext.data.Store', {
                model: 'Ext.ux.desktop.ShortcutModel',
                data: data,
                listeners: {
                    "add" : {
                        fn: this.addShortcutsDD,
                        delay:100,
                        scope: this
                     },
                    "remove" : {
                        fn: this.removeShortcutsDD,
                        scope: this
                    }
                }
            });

            if(this.sortShortcuts !== false){
                me.shortcuts.sort("sortIndex", "ASC");
            }

            me.shortcuts.on("datachanged", me.saveState, me, {buffer:100});
        }

        Ext.EventManager.onWindowResize(this.onWindowResize, this, { buffer: 100 });

        var plugins = [],
            tpl;

        if(this.shortcutDragSelector && this.multiSelect !== false){
            plugins.push(Ext.create('Ext.ux.DataView.DragSelector', {}));
        }

        if(this.shortcutNameEditing){
            this.labelEditor = Ext.create('Ext.ux.DataView.LabelEditor', {
                dataIndex : "name",
                autoSize: false,
                offsets:[-6,0],
                field : Ext.create('Ext.form.field.TextArea', {
                    allowBlank: false,
                    width:66,
                    growMin:20,
                    enableKeyEvents:true,
                    style:"overflow:hidden",
                    grow:true,
                    selectOnFocus:true,
                    listeners : {
                        keydown: function (field, e) {
                            if (e.getKey() == e.ENTER) {
                                this.labelEditor.completeEdit();
                            }
                        },
                        scope: this
                    }
                }),
                labelSelector : "ux-desktop-shortcut-text"
            });
            this.labelEditor.on("complete", function(editor, value, oldValue){
                this.app.fireEvent("shortcutnameedit", this.app, this.app.getModule(editor.activeRecord.data.module), value, oldValue);
            }, this);
            plugins.push(this.labelEditor);
        }

        tpl = Ext.isArray(me.shortcutTpl) ? new Ext.XTemplate(me.shortcutTpl) : me.shortcutTpl;
        tpl.getPos = Ext.Function.bind(function(values){
            var area = this.getComponent(0),
                x = Ext.isString(values.x) ? eval(values.x.replace('{DX}', 'area.getWidth()')) : values.x,
                y = Ext.isString(values.y) ? eval(values.y.replace('{DY}', 'area.getHeight()')) : values.y;
            return Ext.String.format("left:{0}px;top:{1}px;", values.x || values.tempX || 0, values.y || values.tempY || 0);
        }, this);
        
        return {
            xtype: 'dataview',
            overItemCls: 'x-view-over',
            multiSelect: this.multiSelect,
            trackOver: true,
            cls: "ux-desktop-view",
            itemSelector: me.shortcutItemSelector,
            store: me.shortcuts,
            plugins : plugins,
            style: {
                position: 'absolute'
            },
            x: 0, y: 0,
            tpl: tpl,
            selModel : {
                listeners : {
                    "select": function(sm, record){
                        this.resizeShortcutBg(record); 
                    },

                    "deselect": function(sm, record){
                        this.resizeShortcutBg(record); 
                    },

                    scope: this,
                    delay:10
                }
            },
            listeners : {
                "refresh" : this.arrangeShortcuts,
                "itemadd" : this.arrangeShortcuts,
                "itemremove" : this.arrangeShortcuts,
                "itemupdate" : this.onItemUpdate,                
                scope: this,
                buffer: 100
            }
        };
    },

    onItemUpdate : function (record, index, node) {
        this.removeShortcutsDD(record.store, record);
        this.addShortcutsDD(record.store, record);
        this.resizeShortcutBg(record);        
    },

    resizeShortcutBg: function(record){
        var node = Ext.get(this.getComponent(1).getNode(record));
            
        if(!node){
            return;
        }
            
        var wrap = node.child(".ux-desktop-shortcut-wrap"),
            bg = node.child(".ux-desktop-shortcut-bg"),
            w = wrap.getWidth(),
            h = wrap.getHeight();

        bg.setSize(w, h);
        node.setSize(w+2, h+2);
    },

    getFreeCell : function () {
        var x = 0,
            y = 0,
            view = this.getComponent(1),
            width = view.getWidth(),
            height = view.getHeight(),
            occupied,
            isOver;

        while(x < width){
            occupied = false;
            this.shortcuts.each(function(r){
                if(r.data.tempX == x && r.data.tempY == y){
                    occupied = true;
                    return false;
                }
            }, this);

            if(!occupied){
                return [x,y];
            }

            isOver = (y + 91*2 + 10) > height; 

            y = y + 91 + 10;

            if (isOver && y > 10) {            
                x = x + 66 + 10;
                y = 10;
            }

            x = x - (x % 66);
            y = y - (y % 91);
        }

        return [x, y];
    },

    shiftShortcutCell : function(record){
        var x = record.data.tempX,
            y = record.data.tempY,
            view = this.getComponent(1),
            height = view.getHeight(),
            newRecord;

         this.shortcuts.each(function(r){
            if(r.id != record.id && r.data.tempX == x && r.data.tempY == y){
                var node = Ext.get(view.getNode(r)),
                    wrap = node.child(".ux-desktop-shortcut-wrap"),
                    nodeHeight = 91,                    
                    isOver = (y + nodeHeight*2 + 10) > height;

                y = y + nodeHeight + 10;

                if (isOver && y > 10) {            
                    x = x + 66 + 10;
                    y = 10;
                }

                x = x - (x % 66);
                y = y - (y % 91);

                node.setXY([
		            x,
		            y
	            ]);

                r.data.x = "";
                r.data.y = "";
                r.data.tempX = x;
                r.data.tempY = y;
                newRecord = r;
                return false;
            }
         }, this);

         if(newRecord){
            this.shiftShortcutCell(newRecord);
         }
    },

    addShortcutsDD : function (store, records) {
        var me = this,
            view = this.rendered && this.getComponent(1);                           

        if(!this.rendered){
            this.on("afterlayout", function(){
                this.addShortcutsDD(store, records);
            }, this, {delay:500, single:true});

            return;
        }

        if(!view.rendered || !view.viewReady){
            view.on("viewready", function(){
                this.addShortcutsDD(store, records);
            }, this, {delay:500, single:true});

            return;
        }

        Ext.each(records, function(record){
            this.resizeShortcutBg(record);
        }, this);

        if(!this.ddShortcut){
            return;
        }
        
        Ext.each(records, function (r) {
            r.dd = new Ext.dd.DDProxy(view.getNode(r), "desktop-shortcuts-dd"); 
            r.dd.startDrag = function (x, y) {
                var dragEl = Ext.get(this.getDragEl()),
                    el = Ext.get(this.getEl()),
                    view = me.getComponent(1),
                    bg = el.child(".ux-desktop-shortcut-bg"),
                    wrap = el.child(".ux-desktop-shortcut-wrap");

                this.origXY = el.getXY();

                if (!view.isSelected(el)) {
                    view.getSelectionModel().select(view.getRecord(el));
                } 

                dragEl.applyStyles({border:"solid gray 1px"});
                dragEl.update(wrap.dom.innerHTML);
                dragEl.addCls(wrap.dom.className + " ux-desktop-dd-proxy");

                if(me.alignToGrid){
                    this.placeholder = me.body.createChild({
                        tag:"div",
                        cls:"ux-desktop-shortcut-proxy-bg"
                    });
                }

                wrap.hide(false);
                bg.hide(false);
            };

            r.dd.onDrag = function(e){
                if(me.alignToGrid){
                    var left = Ext.fly(this.getDragEl()).getLeft(true), //e.getX(),
                        top = Ext.fly(this.getDragEl()).getTop(true), //e.getY(),
                        xy = {
                            x : (left+33) - ((left+33) % 66),
                            y:  (top+45) - ((top+45) % 91)
                        };

                    this.placeholder.setXY([xy.x, xy.y]);
                }
            };
            
            r.dd.afterDrag = function () {
                var el = Ext.get(this.getEl()),
                    view = me.getComponent(1),
                    record = view.getRecord(el),
                    sm = view.getSelectionModel(),
                    left = el.getLeft(true),
                    top = el.getTop(true),
                    xy = {
                        x : (left+33) - ((left+33) % 66),
                        y:  (top+45) - ((top+45) % 91)
                    },
                    offsetX = xy.x - this.origXY[0],
                    offsetY = xy.y - this.origXY[1];
                    
                if(me.alignToGrid){
                    this.placeholder.destroy();
                }

                if(sm.getCount() > 1){                    
                    Ext.each(sm.getSelection(), function(r){
                        if(r.id != record.id){
                            var node = Ext.get(view.getNode(r)),
                                xy = node.getXY(),
                                ox = xy[0]+offsetX,
                                oy = xy[1]+offsetY;

                            node.setXY([ox,oy]);
                            r.data.x = ox;
                            r.data.y = oy;
                            r.data.tempX = ox;
                            r.data.tempY = oy;
                            if(me.alignToGrid){
                                me.shiftShortcutCell(r);
                            }
                        }
                    }, this);
                }

                el.setXY([xy.x, xy.y]);
                record.data.x = xy.x;
                record.data.y = xy.y;
                record.data.tempX = xy.x;
                record.data.tempY = xy.y;
                el.child(".ux-desktop-shortcut-bg").show(false);
                el.child(".ux-desktop-shortcut-wrap").show(false);
                if(me.alignToGrid){
                    me.shiftShortcutCell(record);
                }
                me.app.fireEvent("shortcutmove", me.app, me.app.getModule(record.data.module), record, xy);
                me.saveState();
            };
        }, this);
    },

    removeShortcutsDD : function (store, record) {        
        if(record.dd){
            record.dd.destroy();
            delete record.dd;            
        }
    },

    onWindowResize : function () {
        this.arrangeShortcuts(false, true);
    },

    arrangeShortcuts : function (ignorePosition, ignoreTemp) {
        var col = { index: 1, x: 10 },
            row = { index: 1, y: 10 },
            records = this.shortcuts.getRange(),
            area = this.getComponent(0),
            view = this.getComponent(1),
            height = area.getHeight();

        for (var i = 0, len = records.length; i < len; i++) {
            var record = records[i],
                tempX = record.get('tempX'),
                tempY = record.get('tempY'),
                x = record.get('x'),
                y = record.get('y'),
                xEmpty = Ext.isEmpty(x),
                yEmpty = Ext.isEmpty(y);

            if(ignoreTemp !== true){
                x = Ext.isEmpty(x) ? tempX : x;
                y = Ext.isEmpty(y) ? tempY : y;
            }

            if (Ext.isEmpty(x) || Ext.isEmpty(y) || ignorePosition === true) {
                this.setShortcutPosition(record, height, col, row, view);
            }
            else {                
                x = !xEmpty && Ext.isString(x) ? eval(x.replace('{DX}', 'area.getWidth()')) : x;
                y = !yEmpty && Ext.isString(y) ? eval(y.replace('{DY}', 'area.getHeight()')) : y;
                x = x - (x % (this.alignToGrid ? 66 : 1));
                y = y - (y % (this.alignToGrid ? 91 : 1));
                Ext.fly(view.getNode(record)).setXY([x, y]);
                if(!xEmpty && !yEmpty){
                    record.data.x = x;
                    record.data.y = y;
                }
                record.data.tempX = x;
                record.data.tempY = y;
            }
        }
    },

    setShortcutPosition : function (record, height, col, row, view) {
        var node = Ext.get(view.getNode(record)),
            wrap = node.child(".ux-desktop-shortcut-wrap"),
            nodeHeight = 91,
            isOver = (row.y + nodeHeight) > height;

        if (isOver && row.y > 10) {            
            col.index = col.index++;
            col.x = col.x + 66 + 10;
            row.index = 1;
            row.y = 10;
        }

        col.x = col.x - (col.x % (this.alignToGrid ? 66 : 1));
        row.y = row.y - (row.y % (this.alignToGrid ? 91 : 1));

        node.setXY([
		    col.x,
		    row.y
	    ]);

        //record.data.x = col.x;
        //record.data.y = row.y;
        record.data.tempX = col.x;
        record.data.tempY = row.y;

        row.index++;
        row.y = row.y + nodeHeight + 10;        
    },    

    createWindowMenu: function () {
        var me = this,
            menu,
            defaultConfig = me.defaultWindowMenu ? {
                defaultAlign: 'br-tr',
                items: [
                    { text: me.restoreText, handler: me.onWindowMenuRestore, scope: me },
                    { text: me.minimizeText, handler: me.onWindowMenuMinimize, scope: me },
                    { text: me.maximizeText, handler: me.onWindowMenuMaximize, scope: me },
                    '-',
                    { text: me.closeText, handler: me.onWindowMenuClose, scope: me }
                ]
            } : {};

        if(me.windowMenu && Ext.isArray(me.windowMenu.items)){
           defaultConfig.items = defaultConfig.items || [];
           defaultConfig.items = defaultWindowMenuItemsFirst ? defaultConfig.items.concat(me.windowMenu.items) : me.windowMenu.items.concat(defaultConfig.items);
           delete me.windowMenu.items;
        }

        menu = new Ext.menu.Menu(Ext.applyIf(me.windowMenu || {}, defaultConfig));
        if(me.defaultWindowMenu){
            menu.on("beforeshow", me.onWindowMenuBeforeShow, me);
        }
        menu.on("hide", me.onWindowMenuHide, me);

        return menu;
    },

    //------------------------------------------------------
    // Event handler methods

    onDesktopMenu: function (e) {
        var me = this, 
            menu = me.contextMenu,
            shortcut = e.getTarget(".ux-desktop-shortcut");
        e.stopEvent();
        if( shortcut && me.shortcutContextMenu){
            me.shortcutContextMenu.module = me.app.getModule(me.getComponent(1).getRecord(shortcut).get('module'));
            me.shortcutContextMenu.showAt(e.getXY());
            me.shortcutContextMenu.doConstrain();            
        }else if(menu){            
            if(shortcut){
                menu.module = me.app.getModule(me.getComponent(1).getRecord(shortcut).get('module'));
            }
            else{
                menu.module = null;
            }
            menu.showAt(e.getXY());
            menu.doConstrain();
        }
    },

    onShortcutItemClick: function (dataView, record) {
        var me = this, module = me.app.getModule(record.data.module),
            win;

        if(module && record.data.handler && Ext.isFunction(record.data.handler)){
            record.data.handler.call(this, module);
        }
        else{
            win = module && module.createWindow();
            if (win) {
              //  me.restoreWindow(win);
            }
        }
    },

    onWindowClose: function(win) {
        var me = this;
        me.windows.remove(win);
        me.taskbar.removeTaskButton(win.taskButton);
        me.updateActiveWindow();
    },

    //------------------------------------------------------
    // Window context menu handlers

    onWindowMenuBeforeShow: function (menu) {
        var me = this,
            items = menu.items.items, 
            win = menu.theWin;

        items[me.defaultWindowMenuItemsFirst ? 0 : (items.length - 5)].setDisabled(win.maximized !== true && win.hidden !== true); // Restore
        items[me.defaultWindowMenuItemsFirst ? 1 : (items.length - 4)].setDisabled(win.minimized === true); // Minimize
        items[me.defaultWindowMenuItemsFirst ? 2 : (items.length - 3)].setDisabled(win.maximized === true || win.hidden === true); // Maximize
    },

    onWindowMenuClose: function () {
        var me = this, win = me.windowMenu.theWin;

        win.close();
    },

    onWindowMenuHide: function (menu) {
        menu.theWin = null;
    },

    onWindowMenuMaximize: function () {
        var me = this, win = me.windowMenu.theWin;

        win.maximize();
        win.toFront();
    },

    onWindowMenuMinimize: function () {
        var me = this, win = me.windowMenu.theWin;

        win.minimize();
    },

    onWindowMenuRestore: function () {
        var me = this, win = me.windowMenu.theWin;

        me.restoreWindow(win);
    },

    //------------------------------------------------------
    // Dynamic (re)configuration methods

    getWallpaper: function () {
        return this.wallpaper.wallpaper;
    },

    setTickSize: function(xTickSize, yTickSize) {
        var me = this,
            xt = me.xTickSize = xTickSize,
            yt = me.yTickSize = (arguments.length > 1) ? yTickSize : xt;

        me.windows.each(function(win) {
            var dd = win.dd, resizer = win.resizer;
            dd.xTickSize = xt;
            dd.yTickSize = yt;
            resizer.widthIncrement = xt;
            resizer.heightIncrement = yt;
        });
    },

    setWallpaper: function (wallpaper, stretch) {
        this.wallpaper.setWallpaper(wallpaper, stretch);
        return this;
    },

    //------------------------------------------------------
    // Window management methods    

    showWindow : function (config, cls) {
        var w = this.createWindow(config, cls);
        w.show();
        return w;
    },

    centerWindow : function () {
        var me = this,
            xy;
            
        if (me.isVisible()) {
            xy = me.el.getAlignToXY(me.desktop.body, 'c-c');
            me.setPagePosition(xy);
        } else {
            me.needsCenter = true;
        }

        return me;
    },

    createWindow : function (config, cls) {
        var me = this, 
            win, 
            availWidth,
            availHeight,
            cfg = Ext.applyIf(config || {}, {
                stateful: false,
                isWindow: true,
                constrainHeader: true,
                minimizable: true,
                maximizable: true,
                center: me.centerWindow,                
                desktop: me
            });

        cls = cls || Ext.window.Window;
        win = me.add(new cls(cfg));

        if (cfg.maximized) {
            win.restorePos = [20,20];
        }

        me.windows.add(win);

        win.taskButton = me.taskbar.addTaskButton(win);
        win.animateTarget = win.taskButton.el;
        
        win.on({
            activate    : me.updateActiveWindow,
            beforeshow  : me.updateActiveWindow,
            deactivate  : me.updateActiveWindow,
            minimize    : me.minimizeWindow,
            destroy     : me.onWindowClose,
            titlechange : function (win) {
                if (win.taskButton) {
                    win.taskButton.setText(win.title);
                }
            },
            iconchange : function (win) {
                if (win.taskButton) {
                    win.taskButton.setIconCls(win.iconCls);
                }
            },
            scope : me
        });

        win.on({
            boxready : function () {
                if (win.dd) {
                    win.dd.xTickSize = me.xTickSize;
                    win.dd.yTickSize = me.yTickSize;
                }

                if (win.resizer) {
                    win.resizer.widthIncrement = me.xTickSize;
                    win.resizer.heightIncrement = me.yTickSize;
                }
            },
            single: true
        });

        if (win.closeAction == "hide") {
            win.on("close", function (win) {
                this.onWindowClose(win);
            }, this);
        } else {
            // replace normal window close w/fadeOut animation:
            win.doClose = function ()  {
                win.doClose = Ext.emptyFn; // dblclick can call again...
                win.el.disableShadow();
                win.el.fadeOut({
                    listeners : {
                        afteranimate : function () {
                            win.destroy();
                        }
                    }
                });
            };
        }

        availWidth = me.body.getWidth(true);
        availHeight = me.body.getHeight(true);

        if (win.height > availHeight) {
            win.height = availHeight;
        }

        if (win.width > availWidth) {
            win.width = availWidth;
        }

        return win;
    },

    getActiveWindow : function () {
        var win = null,
            zmgr = this.getDesktopZIndexManager();

        if (zmgr) {
            // We cannot rely on activate/deactive because that fires against non-Window
            // components in the stack.

            zmgr.eachTopDown(function (comp) {
                if (comp.isWindow && !comp.hidden) {
                    win = comp;
                    return false;
                }
                return true;
            });
        }

        return win;
    },

    getDesktopZIndexManager : function () {
        var windows = this.windows;
        // TODO - there has to be a better way to get this...
        return (windows.getCount() && windows.getAt(0).zIndexManager) || null;
    },

    getWindow : function (id) {
        return this.windows.get(id);
    },

    getModuleWindow : function (id) {
        var win;
        this.windows.each(function (w) {
            if (w.moduleId == id) {
                win = w;
                return false;
            }
        });
        return win;
    },

    minimizeWindow : function (win) {
        win.minimized = true;
        win.hide();
    },

    restoreWindow : function (win) {
        if (win.isVisible()) {
            win.restore();
            win.toFront();
        } else {
            win.show();
        }

        return win;
    },

    tileWindows : function () {
        var me = this, 
            availWidth = me.body.getWidth(true),
            x = me.xTickSize, 
            y = me.yTickSize, 
            nextY = y;

        me.windows.each(function (win) {
            if (win.isVisible() && !win.maximized) {
                var w = win.el.getWidth();

                // Wrap to next row if we are not at the line start and this Window will
                // go off the end
                if (x > me.xTickSize && x + w > availWidth) {
                    x = me.xTickSize;
                    y = nextY;
                }

                win.setPosition(x, y);
                x += w + me.xTickSize;
                nextY = Math.max(nextY, y + win.el.getHeight() + me.yTickSize);
            }
        });
    },

    cascadeWindows: function() {
        var x = 0, 
            y = 0,
            zmgr = this.getDesktopZIndexManager();

        if(zmgr){
            zmgr.eachBottomUp(function(win) {
                if (win.isWindow && win.isVisible() && !win.maximized) {
                    win.setPosition(x, y);
                    x += 20;
                    y += 20;
                }
            });
        }
    },

    checkerboardWindows : function() {
      var me = this, 
          availWidth = me.body.getWidth(true),
          availHeight = me.body.getHeight(true),
          x = 0, 
          y = 0,
          lastx = 0, 
          lasty = 0,
          square = 400;

      me.windows.each(function(win) {         
         if (win.isVisible()) {            
            win.setWidth(square);
            win.setHeight(square);

            win.setPosition(x, y);
            x += square;

            if (x + square > availWidth) {
               x = lastx;
               y += square;

               if (y > availHeight) {
                  lastx += 20;
                  lasty += 20;
                  x = lastx;
                  y = lasty;
               }
            }
         }
      }, me);
   },

   snapFitWindows : function() {
       var me = this, 
          availWidth = me.body.getWidth(true),
          availHeight = me.body.getHeight(true),
          x = 0, 
          y = 0,
          snapCount = 0,
          snapSize;

      me.windows.each(function(win) {
         if (win.isVisible()) {
            snapCount++;
         }
      });

      snapSize = parseInt(availWidth / snapCount);

      if (snapSize > 0) {
         me.windows.each(function(win) {
            if (win.isVisible()) {          
               win.setWidth(snapSize);
               win.setHeight(availHeight);

               win.setPosition(x, y);
               x += snapSize;
            }
         });
      }
   },

   snapFitVWindows : function(){
      var me = this, 
          availWidth = me.body.getWidth(true),
          availHeight = me.body.getHeight(true),
          x = 0, 
          y = 0,
          snapCount = 0,
          snapSize;

      me.windows.each(function(win) {
         if (win.isVisible()) {
            snapCount++;
         }
      });

      snapSize = parseInt(availHeight / snapCount);

      if (snapSize > 0) {
         me.windows.each(function(win) {
            if (win.isVisible()) {           
               win.setWidth(availWidth);
               win.setHeight(snapSize);

               win.setPosition(x, y);
               y += snapSize;
            }
         });
      }
   },

   closeWindows : function() {
      this.windows.each(function(win) {
         win.close();
      });
   },

   minimizeWindows : function() {
      this.windows.each(function(win) {
         this.minimizeWindow(win);
      }, this);
   },

    updateActiveWindow : function () {
        var me = this, activeWindow = me.getActiveWindow(), last = me.lastActiveWindow;
        if (activeWindow === last) {
            return;
        }

        if (last) {
            if (last.el.dom) {
                last.addCls(me.inactiveWindowCls);
                last.removeCls(me.activeWindowCls);
            }

            last.active = false;
        }

        me.lastActiveWindow = activeWindow;

        if (activeWindow) {
            activeWindow.addCls(me.activeWindowCls);
            activeWindow.removeCls(me.inactiveWindowCls);
            activeWindow.minimized = false;
            activeWindow.active = true;
        }

        me.taskbar.setActiveButton(activeWindow && activeWindow.taskButton);
    }
});



Ext.define('Ext.ux.desktop.App', {
    mixins: {
        observable: 'Ext.util.Observable'
    },
    
    requires: [
        'Ext.container.Viewport',

        'Ext.ux.desktop.Desktop'
    ],

    isReady: false,
    modules: null,

    constructor: function (config) {
        var me = this;
        me.addEvents(
            'ready',
            "shortcutmove",
            "shortcutnameedit",
            'beforeunload'
        );
        Ext.net.Desktop = this;
        me.mixins.observable.constructor.call(this, config);

        if (Ext.isReady) {
            Ext.Function.defer(me.init, 10, me);
        } else {
            Ext.onReady(me.init, me);
        }
    },

    init: function() {
        var me = this, desktopCfg;

        me.modules = me.getModules();
        me.getModules = function () {
            return this.modules;
        };
        if (me.modules) {
            me.initModules(me.modules);
        }

        desktopCfg = me.getDesktopConfig();
        me.desktop = new Ext.ux.desktop.Desktop(desktopCfg);

        me.viewport = new Ext.net.Viewport({
            layout: 'fit',
            items: [ me.desktop ]
        });

        Ext.EventManager.on(window, 'beforeunload', me.onUnload, me);

        Ext.each(me.modules, function(module){
            if(module.autoRun){
                module.autoRunHandler ? module.autoRunHandler() : module.createWindow();
            }
        });

        me.isReady = true;
        me.fireEvent('ready', me);        
    },

    
    getDesktopConfig: function () {
        var me = this, cfg = {
            app: me,
            taskbarConfig: me.getTaskbarConfig()
        };

        Ext.apply(cfg, me.desktopConfig);
        return cfg;
    },

    getModules: Ext.emptyFn,

    
    getStartConfig: function () {
        var me = this, cfg = {
            app: me,
            menu: []
        };

        Ext.apply(cfg, me.startConfig);

        Ext.each(me.modules, function (module) {
            if (module.launcher) {
                if(!(module.launcher.handler || module.launcher.listeners && module.launcher.listeners.click)){
                    module.launcher.handler = function() {
                        this.createWindow();
                    };
                    module.launcher.scope = module;
                }
                module.launcher.moduleId = module.id;
                cfg.menu.push(module.launcher);
            }
        });

        return cfg;
    },

    
    getTaskbarConfig: function () {
        var me = this, cfg = {
            app: me,
            startConfig: me.getStartConfig()
        };

        Ext.apply(cfg, me.taskbarConfig);
        return cfg;
    },

    initModules : function(modules) {
        var me = this,
            m,
            _modules = [],
            i = 0,
            len = (modules || []).length;        

        for (; i < len; i++ ) {
            m = modules[i];
            if (m) {
                m.app = me;
                _modules.push(m)
            }
        }

        me.modules = _modules;
    },

    getModule : function(name) {
    	var ms = this.modules;
        for (var i = 0, len = ms.length; i < len; i++) {
            var m = ms[i];
            if (m.id == name || m.appType == name) {
                return m;
            }
        }
        return null;
    },

    onReady : function(fn, scope) {
        if (this.isReady) {
            fn.call(scope, this);
        } else {
            this.on({
                ready: fn,
                scope: scope,
                single: true
            });
        }
    },

    getDesktop : function() {
        return this.desktop;
    },

    onUnload : function(e) {
        if (this.fireEvent('beforeunload', this) === false) {
            e.stopEvent();
        }
    },

    addModule : function (module){
        this.removeModule(module.id);
        this.modules.push(module);        
         
         module.app = this;

         if(module.shortcut){            
            var s = this.desktop.shortcutDefaults ? Ext.applyIf(module.shortcut, this.desktop.shortcutDefaults) : module.shortcut,
                xy;
            if(Ext.isEmpty(s.x) || Ext.isEmpty(s.y)){
                xy = this.desktop.getFreeCell();
                s.tempX = xy[0];
                s.tempY = xy[1];
            }

            this.desktop.shortcuts.add(s);
            
            //this.desktop.arrangeShortcuts(false, true);
         }

         if(module.launcher){
            if(!(module.launcher.handler || module.launcher.listeners && module.launcher.listeners.click)){
                module.launcher.handler = function() {
                    this.createWindow();
                };
                module.launcher.scope = module;                
            }
            module.launcher.moduleId = module.id;
            this.desktop.taskbar.startMenu.menu.add(module.launcher);
         }

         if(module.autoRun){
            module.autoRunHandler ? module.autoRunHandler() : module.createWindow();
         }
    },

    removeModule : function (id){
        var module = this.getModule(id);
        if(module){
            module.app = null;
            Ext.Array.remove(this.modules, module);
            var r = this.desktop.shortcuts.getById(id);
            if(r){
                this.desktop.shortcuts.remove(r);
            }

            var launcher = this.desktop.taskbar.startMenu.menu.child('[moduleId="'+id+'"]');
            if(launcher){
                this.desktop.taskbar.startMenu.menu.remove(launcher, true);
            }

            var window = this.desktop.getModuleWindow(id);
            if(window){
                window.destroy();
            }
        }
    }
});

Ext.ux.desktop.App.override(Ext.util.DirectObservable);
