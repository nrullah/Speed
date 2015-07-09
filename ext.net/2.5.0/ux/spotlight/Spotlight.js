/*
 * @version   : 2.5.0 - Ext.NET Pro License
 * @author    : Ext.NET, Inc. http://www.ext.net/
 * @date      : 2014-03-04
 * @copyright : Copyright (c) 2008-2014, Ext.NET, Inc. (http://www.ext.net/). All rights reserved.
 * @license   : See license.txt and http://www.ext.net/license/. 
 * @website   : http://www.ext.net/
 */


Ext.define('Ext.ux.Spotlight',{baseCls:'x-spotlight',animate:true,duration:250,easing:null,active:false,constructor:function(config){Ext.apply(this,config);},createElements:function(){var me=this,baseCls=me.baseCls,body=Ext.getBody();me.right=body.createChild({cls:baseCls});me.left=body.createChild({cls:baseCls});me.top=body.createChild({cls:baseCls});me.bottom=body.createChild({cls:baseCls});me.all=Ext.create('Ext.CompositeElement',[me.right,me.left,me.top,me.bottom]);},show:function(el,callback,scope){var me=this;me.el=Ext.net.getEl(el);if(!me.right){me.createElements();}
if(!me.active){me.all.setDisplayed('');me.active=true;Ext.EventManager.onWindowResize(me.syncSize,me);me.applyBounds(me.animate,false);}else{me.applyBounds(false,false);}},hide:function(callback,scope){var me=this;Ext.EventManager.removeResizeListener(me.syncSize,me);me.applyBounds(me.animate,true);me.active=false;},syncSize:function(){this.applyBounds(false,false);},applyBounds:function(animate,reverse){var me=this,box=me.el.getBox(),viewWidth=Ext.Element.getViewWidth(true),viewHeight=Ext.Element.getViewHeight(true),i=0,config=false,from,to,clone;from={right:{x:box.right,y:viewHeight,width:(viewWidth-box.right),height:0},left:{x:0,y:0,width:box.x,height:0},top:{x:viewWidth,y:0,width:0,height:box.y},bottom:{x:0,y:(box.y+box.height),width:0,height:(viewHeight-(box.y+box.height))+'px'}};to={right:{x:box.right,y:box.y,width:(viewWidth-box.right)+'px',height:(viewHeight-box.y)+'px'},left:{x:0,y:0,width:box.x+'px',height:(box.y+box.height)+'px'},top:{x:box.x,y:0,width:(viewWidth-box.x)+'px',height:box.y+'px'},bottom:{x:0,y:(box.y+box.height),width:(box.x+box.width)+'px',height:(viewHeight-(box.y+box.height))+'px'}};if(reverse){clone=Ext.clone(from);from=to;to=clone;}
if(animate){Ext.Array.forEach(['right','left','top','bottom'],function(side){me[side].setBox(from[side]);me[side].animate({duration:me.duration,easing:me.easing,to:to[side]});},this);}else{Ext.Array.forEach(['right','left','top','bottom'],function(side){me[side].setBox(Ext.apply(from[side],to[side]));me[side].repaint();},this);}},destroy:function(){var me=this;Ext.destroy(me.right,me.left,me.top,me.bottom);delete me.el;delete me.all;}});
