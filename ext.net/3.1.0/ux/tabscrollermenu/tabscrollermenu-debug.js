/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.ns('Ext.ux');
/**
 * @class Ext.ux.TabScrollerMenu
 * @extends Object
 * Plugin (ptype = 'tabscrollermenu') for adding a tab menu to a TabBar is the Tabs overflow.
 * @constructor
 * @param {Object} config Configuration options
 * @ptype tabscrollermenu
 */
Ext.define('Ext.ux.TabScrollerMenu', {
    alias: 'plugin.tabscrollermenu',

    requires: ['Ext.menu.Menu'],

    /**
     * @cfg {Number} pageSize How many items to allow per submenu.
     */
    pageSize: 10,
    /**
     * @cfg {Number} maxText How long should the title of each {@link Ext.menu.Item} be.
     */
    maxText: 15,
    /**
     * @cfg {String} menuPrefixText Text to prefix the submenus.
     */
    menuPrefixText: 'Items',

    constructor: function (config) {
        Ext.apply(this, config);
    },

    //private
    init: function (tabPanel) {
        var me = this;

        me.tabPanel = tabPanel;

        if (!me.tabPanel.tabBar) {
            me.tabPanel.tabBar = me.tabPanel;
        }

        tabPanel.on({
            render: function () {
                me.tabBar = me.tabPanel.tabBar;
                me.layout = me.tabBar.layout;
                me.layout.overflowHandler.handleOverflow = Ext.Function.bind(me.showButton, me);
                me.layout.overflowHandler.clearOverflow = Ext.Function.createSequence(me.layout.overflowHandler.clearOverflow, me.hideButton, me);
            },
            destroy: me.destroy,
            scope: me,
            single: true
        });
    },

    showButton: function () {
        var me = this,
            result = Ext.getClass(me.layout.overflowHandler).prototype.handleOverflow.apply(me.layout.overflowHandler, arguments),
            button = me.menuButton,
            scroller;

        if (me.tabPanel.items.getCount() > 1) {
            if (!button) {
                button = me.menuButton = me.tabBar.body.createChild({
                    cls: Ext.baseCSSPrefix + 'tab-tabmenu-right'
                });
                scroller = me.tabBar.body.child('.' + Ext.baseCSSPrefix + 'box-scroller-right');
                scroller.addCls(Ext.baseCSSPrefix + "tab-tabmenu-scroller-right");
                button.addClsOnOver(Ext.baseCSSPrefix + 'tab-tabmenu-over');
                button.on('click', me.showTabsMenu, me);
            }
            button.setVisibilityMode(Ext.dom.Element.DISPLAY);
            button.show();
            result.reservedSpace += button.getWidth();
        } else {
            me.hideButton();
        }

        return result;
    },

    hideButton: function () {
        var me = this;
        if (me.menuButton) {
            me.menuButton.hide();
        }
    },

    /**
     * Returns an the current page size (this.pageSize);
     * @return {Number} this.pageSize The current page size.
     */
    getPageSize: function () {
        return this.pageSize;
    },

    /**
     * Sets the number of menu items per submenu "page size".
     * @param {Number} pageSize The page size
     */
    setPageSize: function (pageSize) {
        this.pageSize = pageSize;
    },

    /**
     * Returns the current maxText length;
     * @return {Number} this.maxText The current max text length.
     */
    getMaxText: function () {
        return this.maxText;
    },

    /**
     * Sets the maximum text size for each menu item.
     * @param {Number} t The max text per each menu item.
     */
    setMaxText: function (t) {
        this.maxText = t;
    },

    /**
     * Returns the current menu prefix text String.;
     * @return {String} this.menuPrefixText The current menu prefix text.
     */
    getMenuPrefixText: function () {
        return this.menuPrefixText;
    },

    /**
     * Sets the menu prefix text String.
     * @param {String} t The menu prefix text.
     */
    setMenuPrefixText: function (t) {
        this.menuPrefixText = t;
    },

    showTabsMenu: function (e) {
        var me = this;

        if (me.tabsMenu) {
            me.tabsMenu.removeAll();
        } else {
            me.tabsMenu = new Ext.menu.Menu();
        }

        me.generateTabMenuItems();

        var target = Ext.get(e.getTarget()),
            xy = target.getXY();

        //Y param + 24 pixels
        xy[1] += 24;

        me.tabsMenu.showAt(xy);
    },

    // private
    generateTabMenuItems: function () {
        var me = this,
            tabPanel = me.tabPanel,
            curActive = tabPanel.getActiveTab(),
            allItems = tabPanel.items.getRange(),
            pageSize = me.getPageSize(),
            tabsMenu = me.tabsMenu,
            totalItems, numSubMenus, remainder,
            i, curPage, menuItems, x, item, start, index;

        tabsMenu.suspendLayouts();
        allItems = Ext.Array.filter(allItems, function (item) {
            if (item.id == curActive.id) {
                return false;
            }
            return item.hidden ? !!item.hiddenByLayout : true;
        });
        totalItems = allItems.length;
        numSubMenus = Math.floor(totalItems / pageSize);
        remainder = totalItems % pageSize;

        if (totalItems > pageSize) {

            // Loop through all of the items and create submenus in chunks of 10
            for (i = 0; i < numSubMenus; i++) {
                curPage = (i + 1) * pageSize;
                menuItems = [];

                for (x = 0; x < pageSize; x++) {
                    index = x + curPage - pageSize;
                    item = allItems[index];
                    menuItems.push(me.autoGenMenuItem(item));
                }

                tabsMenu.add({
                    text: me.getMenuPrefixText() + ' ' + (curPage - pageSize + 1) + ' - ' + curPage,
                    menu: menuItems
                });
            }
            // remaining items
            if (remainder > 0) {
                start = numSubMenus * pageSize;
                menuItems = [];
                for (i = start; i < totalItems; i++) {
                    item = allItems[i];
                    menuItems.push(me.autoGenMenuItem(item));
                }

                me.tabsMenu.add({
                    text: me.menuPrefixText + ' ' + (start + 1) + ' - ' + (start + menuItems.length),
                    menu: menuItems
                });

            }
        } else {
            for (i = 0; i < totalItems; ++i) {
                tabsMenu.add(me.autoGenMenuItem(allItems[i]));
            }
        }
        tabsMenu.resumeLayouts(true);
    },

    // private
    autoGenMenuItem: function (item) {
        var maxText = this.getMaxText(),
            text = Ext.util.Format.ellipsis(item.title || item.text, maxText);

        return {
            text      : text,
            handler   : this.showTabFromMenu,
            scope     : this,
            disabled  : item.disabled,
            tabToShow : item,
            iconCls   : item.iconCls
        };
    },

    // private
    showTabFromMenu: function (menuItem) {
        this.tabPanel.setActiveTab(menuItem.tabToShow);
    },

    destroy: function () {
        Ext.destroy(this.tabsMenu, this.menuButton);
    }
});

