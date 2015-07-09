/*
 * @version   : 2.5.1 - Ext.NET Pro License
 * @author    : Ext.NET, Inc. http://www.ext.net/
 * @date      : 2014-04-07
 * @copyright : Copyright (c) 2008-2014, Ext.NET, Inc. (http://www.ext.net/). All rights reserved.
 * @license   : See license.txt and http://www.ext.net/license/.
 */


Ext.define('Ext.ux.BoxReorderer',{mixins:{observable:'Ext.util.Observable'},boxItemSelector:'.x-box-item',animate:100,constructor:function(){this.addEvents('StartDrag','Drag','ChangeIndex','Drop');this.mixins.observable.constructor.apply(this,arguments);},init:function(container){var me=this;me.container=container;me.animatePolicy={};me.animatePolicy[container.getLayout().names.x]=true;me.container.on({scope:me,boxready:me.afterFirstLayout,beforedestroy:me.onContainerDestroy});},onContainerDestroy:function(){var dd=this.dd;if(dd){dd.unreg();this.dd=null;}},afterFirstLayout:function(){var me=this,layout=me.container.getLayout(),names=layout.names,dd;dd=me.dd=Ext.create('Ext.dd.DD',layout.innerCt,me.container.id+'-reorderer');Ext.apply(dd,{animate:me.animate,reorderer:me,container:me.container,getDragCmp:this.getDragCmp,clickValidator:Ext.Function.createInterceptor(dd.clickValidator,me.clickValidator,me,false),onMouseDown:me.onMouseDown,startDrag:me.startDrag,onDrag:me.onDrag,endDrag:me.endDrag,getNewIndex:me.getNewIndex,doSwap:me.doSwap,findReorderable:me.findReorderable});dd.dim=names.width;dd.startAttr=names.beforeX;dd.endAttr=names.afterX;},getDragCmp:function(e){return this.container.getChildByElement(e.getTarget(this.itemSelector||this.boxItemSelector,10));},clickValidator:function(e){var cmp=this.getDragCmp(e);return!!(cmp&&cmp.reorderable!==false);},onMouseDown:function(e){var me=this,container=me.container,containerBox,cmpEl,cmpBox;me.dragCmp=me.getDragCmp(e);if(me.dragCmp){cmpEl=me.dragCmp.getEl();me.startIndex=me.curIndex=container.items.indexOf(me.dragCmp);cmpBox=cmpEl.getBox();me.lastPos=cmpBox[this.startAttr];containerBox=container.el.getBox();if(me.dim==='width'){me.minX=containerBox.left;me.maxX=containerBox.right-cmpBox.width;me.minY=me.maxY=cmpBox.top;me.deltaX=e.getPageX()-cmpBox.left;}else{me.minY=containerBox.top;me.maxY=containerBox.bottom-cmpBox.height;me.minX=me.maxX=cmpBox.left;me.deltaY=e.getPageY()-cmpBox.top;}
me.constrainY=me.constrainX=true;}},startDrag:function(){var me=this,dragCmp=me.dragCmp;if(dragCmp){dragCmp.setPosition=Ext.emptyFn;dragCmp.animate=false;if(me.animate){me.container.getLayout().animatePolicy=me.reorderer.animatePolicy;}
me.dragElId=dragCmp.getEl().id;me.reorderer.fireEvent('StartDrag',me,me.container,dragCmp,me.curIndex);dragCmp.suspendEvents();dragCmp.disabled=true;dragCmp.el.setStyle('zIndex',100);}else{me.dragElId=null;}},findReorderable:function(newIndex){var me=this,items=me.container.items,newItem;if(items.getAt(newIndex).reorderable===false){newItem=items.getAt(newIndex);if(newIndex>me.startIndex){while(newItem&&newItem.reorderable===false){newIndex++;newItem=items.getAt(newIndex);}}else{while(newItem&&newItem.reorderable===false){newIndex--;newItem=items.getAt(newIndex);}}}
newIndex=Math.min(Math.max(newIndex,0),items.getCount()-1);if(items.getAt(newIndex).reorderable===false){return-1;}
return newIndex;},doSwap:function(newIndex){var me=this,items=me.container.items,container=me.container,wasRoot=me.container._isLayoutRoot,orig,dest,tmpIndex,temp;newIndex=me.findReorderable(newIndex);if(newIndex===-1){return;}
me.reorderer.fireEvent('ChangeIndex',me,container,me.dragCmp,me.startIndex,newIndex);orig=items.getAt(me.curIndex);dest=items.getAt(newIndex);items.remove(orig);tmpIndex=Math.min(Math.max(newIndex,0),items.getCount()-1);items.insert(tmpIndex,orig);items.remove(dest);items.insert(me.curIndex,dest);container._isLayoutRoot=true;container.updateLayout();container._isLayoutRoot=wasRoot;me.curIndex=newIndex;},onDrag:function(e){var me=this,newIndex;newIndex=me.getNewIndex(e.getPoint());if((newIndex!==undefined)){me.reorderer.fireEvent('Drag',me,me.container,me.dragCmp,me.startIndex,me.curIndex);me.doSwap(newIndex);}},endDrag:function(e){if(e){e.stopEvent();}
var me=this,layout=me.container.getLayout(),temp;if(me.dragCmp){delete me.dragElId;delete me.dragCmp.setPosition;me.dragCmp.animate=true;me.dragCmp.lastBox[layout.names.x]=me.dragCmp.getPosition(true)[layout.names.widthIndex];me.container._isLayoutRoot=true;me.container.updateLayout();me.container._isLayoutRoot=undefined;temp=Ext.fx.Manager.getFxQueue(me.dragCmp.el.id)[0];if(temp){temp.on({afteranimate:me.reorderer.afterBoxReflow,scope:me});}
else{Ext.Function.defer(me.reorderer.afterBoxReflow,1,me);}
if(me.animate){delete layout.animatePolicy;}
me.reorderer.fireEvent('drop',me,me.container,me.dragCmp,me.startIndex,me.curIndex);}},afterBoxReflow:function(){var me=this;me.dragCmp.el.setStyle('zIndex','');me.dragCmp.disabled=false;me.dragCmp.resumeEvents();},getNewIndex:function(pointerPos){var me=this,dragEl=me.getDragEl(),dragBox=Ext.fly(dragEl).getBox(),targetEl,targetBox,targetMidpoint,i=0,it=me.container.items.items,ln=it.length,lastPos=me.lastPos;me.lastPos=dragBox[me.startAttr];for(;i<ln;i++){targetEl=it[i].getEl();if(targetEl.is(me.reorderer.boxItemSelector)){targetBox=targetEl.getBox();targetMidpoint=targetBox[me.startAttr]+(targetBox[me.dim]>>1);if(i<me.curIndex){if((dragBox[me.startAttr]<lastPos)&&(dragBox[me.startAttr]<(targetMidpoint-5))){return i;}}else if(i>me.curIndex){if((dragBox[me.startAttr]>lastPos)&&(dragBox[me.endAttr]>(targetMidpoint+5))){return i;}}}}}});Ext.ux.BoxReorderer.override(Ext.util.DirectObservable);Ext.define('Ext.ux.TabReorderer',{extend:'Ext.ux.BoxReorderer',boxItemSelector:'.x-tab',init:function(tabPanel){var me=this;me.isTabStrip=!tabPanel.getTabBar;me.callParent([!me.isTabStrip?tabPanel.getTabBar():tabPanel]);if(!me.isTabStrip){tabPanel.onAdd=Ext.Function.createSequence(tabPanel.onAdd,me.onAdd);}},afterFirstLayout:function(){var tabs,me=this,len,i=0,tab;this.callParent(arguments);if(!me.isTabStrip){for(tabs=me.container.items.items,len=tabs.length;i<len;i++){tab=tabs[i];if(tab.card){tab.reorderable=tab.card.reorderable;}}}},onAdd:function(card,index){card.tab.reorderable=card.reorderable;},afterBoxReflow:function(){var me=this;Ext.ux.BoxReorderer.prototype.afterBoxReflow.apply(me,arguments);if(me.dragCmp){if(!me.container.tabPanel){me.container.setActiveTab(me.dragCmp);}
else{me.container.tabPanel.setActiveTab(me.dragCmp.card);me.container.tabPanel.move(me.startIndex,me.curIndex);}}}});
