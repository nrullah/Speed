/*
 * @version   : 2.5.2 - Ext.NET Pro License
 * @author    : Ext.NET, Inc. http://www.ext.net/
 * @date      : 2014-05-22
 * @copyright : Copyright (c) 2008-2014, Ext.NET, Inc. (http://www.ext.net/). All rights reserved.
 * @license   : See license.txt and http://www.ext.net/license/.
 */


Ext.define('Ext.ux.ToolbarDroppable',{extend:'Ext.util.Observable',constructor:function(config){Ext.apply(this,config);this.addEvents("beforeremotecreate","remotecreate","drop");this.callParent(arguments);},init:function(toolbar){this.toolbar=toolbar;this.toolbar.on({scope:this,render:this.createDropTarget});},createDropTarget:function(){this.dropTarget=Ext.create('Ext.dd.DropTarget',this.toolbar.getEl(),{notifyOver:Ext.Function.bind(this.notifyOver,this),notifyDrop:Ext.Function.bind(this.notifyDrop,this)});},addDDGroup:function(ddGroup){this.dropTarget.addToGroup(ddGroup);},calculateEntryIndex:function(e){var entryIndex=0,toolbar=this.toolbar,items=toolbar.items.items,count=items.length,xHover=e.getXY()[0],index=0,el,xTotal,width,midpoint;for(;index<count;index++){el=items[index].getEl();xTotal=el.getXY()[0];width=el.getWidth();midpoint=xTotal+width/2;if(xHover<midpoint){entryIndex=index;break;}else{entryIndex=index+1;}}
return entryIndex;},canDrop:function(data){return true;},notifyOver:function(dragSource,event,data){return this.canDrop.apply(this,arguments)?this.dropTarget.dropAllowed:this.dropTarget.dropNotAllowed;},notifyDrop:function(dragSource,event,data){var canAdd=this.canDrop(dragSource,event,data),item,tbar=this.toolbar;if(canAdd){var entryIndex=this.calculateEntryIndex(event);if(this.remote){var remoteOptions={index:entryIndex},dc=this.directEventConfig||{},loadingItem;if(this.fireEvent("beforeremotecreate",this,data,remoteOptions,dragSource,event)===false){return false;}
loadingItem=new Ext.toolbar.TextItem({text:"<div class='x-loading-indicator' style='width:16px;'>&nbsp;</div>"});tbar.insert(entryIndex,loadingItem);dc.userSuccess=Ext.Function.bind(this.remoteCreateSuccess,this);dc.userFailure=Ext.Function.bind(this.remoteCreateFailure,this);dc.extraParams=remoteOptions;dc.control=this;dc.entryIndex=entryIndex;dc._data=data;dc.loadingItem=loadingItem;dc.eventType="postback";dc.action="create";Ext.net.DirectEvent.request(dc);}
else{item=this.createItem(data);tbar.insert(entryIndex,item);this.fireEvent("drop",this,item,entryIndex,data);}
tbar.doLayout();this.afterLayout();}
return canAdd;},remoteCreateSuccess:function(response,result,context,type,action,extraParams,o){this.toolbar.remove(o.loadingItem);var rParams,entryIndex,item;try{rParams=result.extraParamsResponse||{};var responseObj=result.serviceResponse;result={success:responseObj.success,msg:responseObj.message};}catch(ex){result.success=false;result.msg=ex.message;}
this.on("remotecreate",this,!!result.success,result.msg,response,o);entryIndex=Ext.isDefined(rParams.ra_index)?rParams.ra_index:o.entryIndex;item=Ext.decode(rParams.ra_item);this.toolbar.insert(entryIndex,item);this.fireEvent("drop",this,item,entryIndex,o._data);this.toolbar.doLayout();this.afterLayout();},remoteCreateFailure:function(response,result,context,type,action,extraParams,o){this.toolbar.remove(o.loadingItem);this.on("remotecreate",this,!false,response.responseText,response,o);this.toolbar.doLayout();this.afterLayout();},createItem:function(data){Ext.Error.raise("The createItem method must be implemented in the ToolbarDroppable plugin");},afterLayout:Ext.emptyFn,destroy:function(){if(this.dropTarget){this.dropTarget.destroy();}}});
