Ext.define("Ext.ux.GroupTabPanel",{extend:"Ext.Container",alias:"widget.grouptabpanel",requires:["Ext.data.*","Ext.tree.*","Ext.layout.*"],baseCls:Ext.baseCSSPrefix+"grouptabpanel",activeGroup:0,activeTab:0,initComponent:function(t){var e=this;if(Ext.apply(e,t),e.store=e.createTreeStore(),e.layout={type:"hbox",align:"stretch"},e.defaults={border:!1},e.items=[{xtype:"treepanel",cls:"x-tree-panel x-grouptabbar",width:e.tabWidth||150,rootVisible:!1,store:e.store,hideHeaders:!0,animate:!1,processEvent:Ext.emptyFn,border:!1,plugins:[{ptype:"grouptabrenderer"}],viewConfig:{overItemCls:"",getRowClass:e.getRowClass},columns:[{xtype:"treecolumn",sortable:!1,dataIndex:"text",flex:1,renderer:function(t,e,i){var a="";return i.parentNode&&null===i.parentNode.parentNode?(a+=" x-grouptab-first",i.previousSibling&&(a+=" x-grouptab-prev"),i.get("expanded")&&null!=i.firstChild||(a+=" x-grouptab-last")):a+=null===i.nextSibling?" x-grouptab-last":" x-grouptab-center",i.data.activeTab&&(a+=" x-active-tab"),e.tdCls="x-grouptab"+a,t}}]},{xtype:"container",flex:1,layout:"card",deferredRender:e.deferredRender,baseCls:Ext.baseCSSPrefix+"grouptabcontainer",items:e.cards}],"right"==e.tabPosition){var i=e.items[0];e.items[0]=e.items[1],e.items[1]=i}e.addEvents("beforetabchange","tabchange","beforegroupchange","groupchange"),e.callParent(arguments),e.setActiveGroup(e.activeGroup),e.setActiveTab(e.activeTab),e.mon(e.down("treepanel").getSelectionModel(),"select",e.onNodeSelect,e),this.hasId()&&this.on("render",function(){this.getActiveTabField().render(this.el.parent()||this.el),this.getActiveGroupField().render(this.el.parent()||this.el)},this)},getRowClass:function(t){var e="";return t.data.activeGroup&&(e+=" x-active-group"),e},onNodeSelect:function(t,e){var i,a=this;return i=e.parentNode&&null===e.parentNode.parentNode?e:e.parentNode,a.setActiveGroup(i.get("groupId"))===!1||a.setActiveTab(e.get("id"))===!1?!1:(this.refreshView(),void 0)},refreshView:function(){var t,e=this,i=e.store.getRootNode();if(!e.rendered)return!1;if(e.activeGroup){for(Ext.each(i.childNodes,function(i){return i.get("groupId")==e.activeGroup.id?(t=i,!1):void 0});i;)i.set("activeTab",!1),i.set("activeGroup",!1),i=i.firstChild||i.nextSibling||i.parentNode.nextSibling;t.set("activeGroup",!0),t.eachChild(function(t){t.set("activeGroup",!0)}),e.activeTab&&Ext.each(t.childNodes,function(t){return t.get("id")==e.activeTab.id?(t.set("activeTab",!0),!1):void 0}),e.down("treepanel").getView().refresh()}},setActiveTab:function(t){var e,i,a=this,n=t;return Ext.isNumber(t)&&a.activeGroup&&Ext.each(a.groups,function(e){return e.id==a.activeGroup.id?(t=e.tabs[t],!1):void 0}),Ext.isString(t)&&(n=Ext.getCmp(t)),n===a.activeTab?!1:(i=a.activeTab,a.fireEvent("beforetabchange",a,n,i)!==!1&&(a.activeTab=n,a.rendered?a.down("container[baseCls="+Ext.baseCSSPrefix+"grouptabcontainer"+"]").getLayout().setActiveItem(n):this.items.get(1).activeItem=n,e=0,Ext.each(a.groups,function(t){return t.id==a.activeGroup.id?(Ext.each(t.tabs,function(t,i){n.id==t&&(e=i)}),!1):void 0}),this.getActiveTabField().setValue(n.id+":"+e),a.fireEvent("tabchange",a,n,i)),this.refreshView(),!0)},setActiveGroup:function(t,e){var i,a,n=this,s=t;return Ext.isNumber(t)&&(t=n.groups[t].id),Ext.isString(t)&&(s=Ext.getCmp(t)),s===n.activeGroup?!0:(a=n.activeGroup,n.fireEvent("beforegroupchange",n,s,a)===!1?!1:(n.activeGroup=s,i=0,Ext.each(n.groups,function(t,e){return t.id==n.activeGroup.id?(i=e,!1):void 0}),this.getActiveGroupField().setValue(s.id+":"+i),n.fireEvent("groupchange",n,s,a),e&&n.refreshView(),!0))},createTreeStore:function(){var t=this,e=t.prepareItems(t.items),i={text:".",children:[]},a=t.cards=[];return t.activeGroup=t.activeGroup||0,t.groups=[],Ext.each(e,function(e,n){t.groups[n]={id:e.id,tabs:[]};var s=e.items.items,r=s[e.mainItem]||s[0],o={children:[]};o.id=r.id,o.groupId=e.id,o.text=r.title,o.iconCls=r.iconCls,o.expanded=!e.collapsed,o.activeGroup=t.activeGroup===n,o.activeTab=o.activeGroup?!0:!1,Ext.each(s,function(i){if(t.groups[n].tabs.push(i.id),i.id!==o.id){var s={id:i.id,groupId:e.id,leaf:!0,text:i.title,iconCls:i.iconCls,activeGroup:o.activeGroup,activeTab:!1};o.children.push(s)}delete i.title,delete i.iconCls,a.push(i)}),i.children.push(o)}),Ext.create("Ext.data.TreeStore",{fields:["id","text","activeGroup","activeTab","groupId"],root:{expanded:!0},proxy:{type:"memory",data:i}})},getActiveTab:function(){return this.activeTab},getActiveGroup:function(){return this.activeGroup},getActiveTabField:function(){return this.activeTabField||(this.activeTabField=new Ext.form.field.Hidden({name:this.id+"_ActiveTab"}),this.on("beforedestroy",function(){this.rendered&&this.destroy()},this.activeTabField)),this.activeTabField},getActiveGroupField:function(){return this.activeGroupField||(this.activeGroupField=new Ext.form.field.Hidden({name:this.id+"_ActiveGroup"}),this.on("beforedestroy",function(){this.rendered&&this.destroy()},this.activeGroupField)),this.activeGroupField}}),Ext.define("Ext.ux.GroupTabRenderer",{alias:"plugin.grouptabrenderer",extend:"Ext.AbstractPlugin",tableTpl:new Ext.XTemplate('<div id="{view.id}-body" class="'+Ext.baseCSSPrefix+"{view.id}-table "+Ext.baseCSSPrefix+'grid-table-resizer" style="{tableStyle}">',"{%","values.view.renderRows(values.rows, values.viewStartIndex, out);","%}","</div>",{priority:5}),rowTpl:new Ext.XTemplate("{%",'Ext.Array.remove(values.itemClasses, "',Ext.baseCSSPrefix+'grid-row");','var dataRowCls = values.recordIndex === -1 ? "" : " '+Ext.baseCSSPrefix+'grid-data-row";',"%}",'<div {[values.rowId ? ("id=\\"" + values.rowId + "\\"") : ""]} ','data-boundView="{view.id}" ','data-recordId="{record.internalId}" ','data-recordIndex="{recordIndex}" ','class="'+Ext.baseCSSPrefix+'grouptab-row {[values.itemClasses.join(" ")]} {[values.rowClasses.join(" ")]}{[dataRowCls]}" ',"{rowAttr:attributes}>",'<tpl for="columns">{%',"parent.view.renderCell(values, parent.record, parent.recordIndex, xindex - 1, out, parent)","%}","</tpl>","</div>",{priority:5}),cellTpl:new Ext.XTemplate('{%values.tdCls = values.tdCls.replace(" '+Ext.baseCSSPrefix+'grid-cell "," ");%}','<div class="'+Ext.baseCSSPrefix+'grouptab-cell {tdCls}" {tdAttr}>','<div {unselectableAttr} class="'+Ext.baseCSSPrefix+'grid-cell-inner" style="text-align: {align}; {style};">{value}</div>','<div class="x-grouptabs-corner x-grouptabs-corner-top-left"></div>','<div class="x-grouptabs-corner x-grouptabs-corner-bottom-left"></div>',"</div>",{priority:5}),selectors:{bodySelector:"div."+Ext.baseCSSPrefix+"grid-table-resizer",nodeContainerSelector:"div."+Ext.baseCSSPrefix+"grid-table-resizer",itemSelector:"div."+Ext.baseCSSPrefix+"grouptab-row",dataRowSelector:"div."+Ext.baseCSSPrefix+"grouptab-row",cellSelector:"div."+Ext.baseCSSPrefix+"grouptab-cell",getCellSelector:function(t){var e="div."+Ext.baseCSSPrefix+"grid-cell";return t&&(e+="-"+t.getItemId()),e}},init:function(t){var e=t.getView(),i=this;e.addTableTpl(i.tableTpl),e.addRowTpl(i.rowTpl),e.addCellTpl(i.cellTpl),Ext.apply(e,i.selectors)}});