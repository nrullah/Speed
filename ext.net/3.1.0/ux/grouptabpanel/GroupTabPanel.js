/*
 * @version   : 3.1.0 - Ext.NET License
 * @author    : Object.NET, Inc. http://object.net/
 * @date      : 2015-02-17
 * @copyright : Copyright (c) 2008-2015, Object.NET, Inc. (http://object.net/). All rights reserved.
 * @license   : See license.txt and http://ext.net/license/
 */


Ext.define('Ext.ux.GroupTabPanel',{extend:'Ext.Container',alias:'widget.grouptabpanel',requires:['Ext.data.*','Ext.tree.*','Ext.layout.*'],baseCls:Ext.baseCSSPrefix+'grouptabpanel',activeGroup:0,activeTab:0,initComponent:function(config){var me=this;Ext.apply(me,config);me.store=me.createTreeStore();me.layout={type:'hbox',align:'stretch'};me.defaults={border:false};me.items=[{xtype:'treepanel',cls:'x-tree-panel x-grouptabbar',width:me.tabWidth||150,rootVisible:false,store:me.store,hideHeaders:true,animate:false,processEvent:Ext.emptyFn,border:false,plugins:[{ptype:'grouptabrenderer'}],viewConfig:{overItemCls:'',getRowClass:me.getRowClass},columns:[{xtype:'treecolumn',sortable:false,dataIndex:'text',flex:1,renderer:function(value,cell,node,idx1,idx2,store,tree){var cls='';if(node.parentNode&&node.parentNode.parentNode===null){cls+=' x-grouptab-first';if(node.previousSibling){cls+=' x-grouptab-prev';}
if(!node.get('expanded')||node.firstChild==null){cls+=' x-grouptab-last';}}else if(node.nextSibling===null){cls+=' x-grouptab-last';}else{cls+=' x-grouptab-center';}
if(node.data.activeTab){cls+=' x-active-tab';}
cell.tdCls='x-grouptab'+cls;return value;}}]},{xtype:'container',flex:1,layout:'card',deferredRender:me.deferredRender,baseCls:Ext.baseCSSPrefix+'grouptabcontainer',items:me.cards}];if(me.tabPosition=="right"){var tmp=me.items[0];me.items[0]=me.items[1];me.items[1]=tmp;}
me.callParent(arguments);me.setActiveGroup(me.activeGroup);me.setActiveTab(me.activeTab);me.mon(me.down('treepanel').getSelectionModel(),'select',me.onNodeSelect,me);if(this.hasId()){this.on("render",function(){this.getActiveTabField().render(this.el.parent()||this.el);this.getActiveGroupField().render(this.el.parent()||this.el);},this);}},getRowClass:function(node,rowIndex,rowParams,store){var cls='';if(node.data.activeGroup){cls+=' x-active-group';}
return cls;},onNodeSelect:function(selModel,node){var me=this,parent;if(node.parentNode&&node.parentNode.parentNode===null){parent=node;}else{parent=node.parentNode;}
if(me.setActiveGroup(parent.get('groupId'))===false||me.setActiveTab(node.get('id'))===false){return false;}
this.refreshView();},refreshView:function(){var me=this,currentNode=me.store.getRootNode(),parent;if(!me.rendered){return false;}
if(!me.activeGroup){return;}
Ext.each(currentNode.childNodes,function(node){if(node.get("groupId")==me.activeGroup.id){parent=node;return false;}});while(currentNode){currentNode.set('activeTab',false);currentNode.set('activeGroup',false);currentNode=currentNode.firstChild||currentNode.nextSibling||currentNode.parentNode.nextSibling;}
parent.set('activeGroup',true);parent.eachChild(function(child){child.set('activeGroup',true);});if(me.activeTab){Ext.each(parent.childNodes,function(node){if(node.get("id")==me.activeTab.id){node.set('activeTab',true);return false;}});}
me.down('treepanel').getView().refresh();},setActiveTab:function(cmp){var me=this,newTab=cmp,index,oldTab;if(Ext.isNumber(cmp)&&me.activeGroup){Ext.each(me.groups,function(group){if(group.id==me.activeGroup.id){cmp=group.tabs[cmp];return false;}});}
if(Ext.isString(cmp)){newTab=Ext.getCmp(cmp);}
if(newTab===me.activeTab){return false;}
oldTab=me.activeTab;if(me.fireEvent('beforetabchange',me,newTab,oldTab)!==false){me.activeTab=newTab;if(me.rendered){me.down('container[baseCls='+Ext.baseCSSPrefix+'grouptabcontainer'+']').getLayout().setActiveItem(newTab);}
else{this.items.get(1).activeItem=newTab;}
index=0;Ext.each(me.groups,function(group){if(group.id==me.activeGroup.id){Ext.each(group.tabs,function(tab,idx){if(newTab.id==tab){index=idx;}});return false;}});this.getActiveTabField().setValue(newTab.id+':'+index);me.fireEvent('tabchange',me,newTab,oldTab);}
this.refreshView();return true;},setActiveGroup:function(cmp,refresh){var me=this,newGroup=cmp,index,oldGroup;if(Ext.isNumber(cmp)){cmp=me.groups[cmp].id;}
if(Ext.isString(cmp)){newGroup=Ext.getCmp(cmp);}
if(newGroup===me.activeGroup){return true;}
oldGroup=me.activeGroup;if(me.fireEvent('beforegroupchange',me,newGroup,oldGroup)!==false){me.activeGroup=newGroup;index=0;Ext.each(me.groups,function(group,idx){if(group.id==me.activeGroup.id){index=idx;return false;}});this.getActiveGroupField().setValue(newGroup.id+':'+index);me.fireEvent('groupchange',me,newGroup,oldGroup);}else{return false;}
if(refresh){me.refreshView();}
return true;},createTreeStore:function(){var me=this,groups=me.prepareItems(me.items),data={text:'.',children:[]},cards=me.cards=[];me.activeGroup=me.activeGroup||0;me.groups=[];Ext.each(groups,function(groupItem,idx){me.groups[idx]={id:groupItem.id,tabs:[]};var leafItems=groupItem.items.items,rootItem=(leafItems[groupItem.mainItem]||leafItems[0]),groupRoot={children:[]};groupRoot.id=rootItem.id;groupRoot.groupId=groupItem.id;groupRoot.text=rootItem.title;groupRoot.iconCls=rootItem.iconCls;groupRoot.expanded=!groupItem.collapsed;groupRoot.activeGroup=(me.activeGroup===idx);groupRoot.activeTab=groupRoot.activeGroup?true:false;Ext.each(leafItems,function(leafItem){me.groups[idx].tabs.push(leafItem.id);if(leafItem.id!==groupRoot.id){var child={id:leafItem.id,groupId:groupItem.id,leaf:true,text:leafItem.title,iconCls:leafItem.iconCls,activeGroup:groupRoot.activeGroup,activeTab:false};groupRoot.children.push(child);}
delete leafItem.title;delete leafItem.iconCls;cards.push(leafItem);});data.children.push(groupRoot);});return Ext.create('Ext.data.TreeStore',{fields:['id','text','activeGroup','activeTab','groupId'],root:{expanded:true},proxy:{type:'memory',data:data}});},getActiveTab:function(){return this.activeTab;},getActiveGroup:function(){return this.activeGroup;},getActiveTabField:function(){if(!this.activeTabField){this.activeTabField=new Ext.form.field.Hidden({name:this.id+"_ActiveTab"});this.on("beforedestroy",function(){if(this.rendered){this.destroy();}},this.activeTabField);}
return this.activeTabField;},getActiveGroupField:function(){if(!this.activeGroupField){this.activeGroupField=new Ext.form.field.Hidden({name:this.id+"_ActiveGroup"});this.on("beforedestroy",function(){if(this.rendered){this.destroy();}},this.activeGroupField);}
return this.activeGroupField;}});Ext.define('Ext.ux.GroupTabRenderer',{extend:'Ext.AbstractPlugin',alias:'plugin.grouptabrenderer',tableTpl:new Ext.XTemplate('<div id="{view.id}-body" class="'+Ext.baseCSSPrefix+'{view.id}-table '+Ext.baseCSSPrefix+'grid-table-resizer" style="{tableStyle}">','{%','values.view.renderRows(values.rows, values.viewStartIndex, out);','%}','</div>',{priority:5}),rowTpl:new Ext.XTemplate('{%','Ext.Array.remove(values.itemClasses, "',Ext.baseCSSPrefix+'grid-row");','var dataRowCls = values.recordIndex === -1 ? "" : " '+Ext.baseCSSPrefix+'grid-data-row";','%}','<div {[values.rowId ? ("id=\\"" + values.rowId + "\\"") : ""]} ','data-boundView="{view.id}" ','data-recordId="{record.internalId}" ','data-recordIndex="{recordIndex}" ','class="'+Ext.baseCSSPrefix+'grouptab-row {[values.itemClasses.join(" ")]} {[values.rowClasses.join(" ")]}{[dataRowCls]}" ','{rowAttr:attributes}>','<tpl for="columns">'+'{%','parent.view.renderCell(values, parent.record, parent.recordIndex, parent.rowIndex, xindex - 1, out, parent)','%}','</tpl>','</div>',{priority:5}),cellTpl:new Ext.XTemplate('{%values.tdCls = values.tdCls.replace(" '+Ext.baseCSSPrefix+'grid-cell "," ");%}','<div class="'+Ext.baseCSSPrefix+'grouptab-cell {tdCls}" {tdAttr}>','<div {unselectableAttr} class="'+Ext.baseCSSPrefix+'grid-cell-inner" style="text-align: {align}; {style};">{value}</div>','<div class="x-grouptabs-corner x-grouptabs-corner-top-left"></div>','<div class="x-grouptabs-corner x-grouptabs-corner-bottom-left"></div>','</div>',{priority:5}),selectors:{bodySelector:'div.'+Ext.baseCSSPrefix+'grid-table-resizer',nodeContainerSelector:'div.'+Ext.baseCSSPrefix+'grid-table-resizer',itemSelector:'div.'+Ext.baseCSSPrefix+'grouptab-row',rowSelector:'div.'+Ext.baseCSSPrefix+'grouptab-row',cellSelector:'div.'+Ext.baseCSSPrefix+'grouptab-cell',getCellSelector:function(header){return header?header.getCellSelector():this.cellSelector;}},init:function(grid){var view=grid.getView(),me=this;view.addTpl(me.tableTpl);view.addRowTpl(me.rowTpl);view.addCellTpl(me.cellTpl);Ext.apply(view,me.selectors);}});
