/*
 * @version   : 2.3.1 - Ext.NET Pro License
 * @author    : Ext.NET, Inc. http://www.ext.net/
 * @date      : 2013-10-17
 * @copyright : Copyright (c) 2007-2013, Ext.NET, Inc. (http://www.ext.net/). All rights reserved.
 * @license   : See license.txt and http://www.ext.net/license/. 
 * @website   : http://www.ext.net/
 */


Ext.define('Ext.ux.DataView.LabelEditor',{extend:'Ext.Editor',alignment:'tl-tl',completeOnEnter:true,cancelOnEsc:true,shim:false,autoSize:{width:'boundEl',height:'field'},labelSelector:'x-editable',requires:['Ext.form.field.Text'],constructor:function(config){config.field=config.field||Ext.create('Ext.form.field.Text',{allowOnlyWhitespace:false,selectOnFocus:true});this.callParent([config]);},init:function(view){this.view=view;this.mon(view,'render',this.bindEvents,this);this.on('complete',this.onSave,this);},bindEvents:function(){this.mon(this.view.getEl(),{click:{fn:this.onClick,scope:this}});},onClick:function(e,target){var me=this,item,record;if(Ext.fly(target).hasCls(me.labelSelector)&&!me.editing&&!e.ctrlKey&&!e.shiftKey){e.stopEvent();item=me.view.findItemByChild(target);record=me.view.store.getAt(me.view.indexOf(item));me.startEdit(target,record.data[me.dataIndex]);me.activeRecord=record;}else if(me.editing){me.field.blur();e.preventDefault();}},onSave:function(ed,value){this.activeRecord.set(this.dataIndex,value);}});
