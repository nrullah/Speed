/*
 * @version   : 3.0.0 - Ext.NET Pro License
 * @author    : Object.NET, Inc. http://object.net/
 * @date      : 2014-12-17
 * @copyright : Copyright (c) 2008-2014, Object.NET, Inc. (http://object.net/). All rights reserved.
 * @license   : See license.txt and http://ext.net/license/
 */


Ext.define("Ext.ux.TabFx",{extend:"Ext.plugin.Abstract",alias:"plugin.tabfx",name:"frame",init:function(tb){var plugin=this;if(tb.tabBar){if(tb.activeTab){tb.activeTab.on("activate",function(){if(!plugin.disabled){plugin.doFx(this.tab);}},tb.activeTab,{single:true})}
tb=tb.tabBar;}
tb.on("change",function(tb,newTab){if(!this.disabled){this.doFx(newTab);}},plugin);},doFx:function(tab){var plugin=this,tabEl=tab.getEl();tabEl[plugin.name].apply(tabEl,Ext.isArray(plugin.args)?plugin.args:[]);}});
