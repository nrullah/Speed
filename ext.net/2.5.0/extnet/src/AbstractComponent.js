
// @source core/AbstractComponent.js

Ext.override(Ext.AbstractComponent, {
    selectable      : true,    
    autoFocusDelay  : 10,
    styleHtmlCls: 'x-html',

    onRender : function () {                
        this.callParent(arguments);

        if (this.callouts) {
            var callouts = this.callouts,
                callout,
                i;
            delete this.callouts;

            for (i = 0; i < callouts.length; i++ ) {
                callout = callouts[i];
                callout.target = this;
                Ext.create("Ext.net.Callout", callout);
            }
        }

        if (this.tooltips) {        
            var tooltips = [],
                tooltip,
                i;

            for (i = 0; i < this.tooltips.length; i++ ) {
                tooltip = this.tooltips[i];
                if (!tooltip.target) {
                    tooltip.target = this.el;
                }

                tooltips.push(Ext.ComponentManager.create(tooltip,"tooltip"));
            }

            this.tooltips = tooltips;
        }
    },

    afterRender : function () {
        this.callParent(arguments);

        if (this.styleHtmlContent) {
            this.getTargetEl().addCls(this.styleHtmlCls);
        }
    },

    initComponent : function () {
        var cmp, i, len;

        if (this.hasId()) {
            cmp = Ext.getCmp(this.id);
            
            if (cmp) {
                cmp.destroy();
            }
        }
        
        if (this.contentHtml && Ext.isFunction(this.contentHtml)) {
            this.contentHtml.call(window);
        }
        
        if (this.preinitFn) {
            this.preinitFn.call(this.preinitScope || this, this);
        }

        if (this.tag) {
            this.setTag(this.tag);
        }
        
        Ext.net.ComponentManager.registerId(this);
        
        if (this.bin) {
            for (i = 0, len = this.bin.length; i < len; i++) {
                this.bin[i].binOwner = this;
            }
        }
        
        this.callParent(arguments);
    },

    hasId : function () {
        return !!(this.initialConfig && this.initialConfig.id);
    },

    isNonContentable : function () {
        return this.isXType("tablepanel") 
                || this.isXType("dataview") 
                || this.isXType("field")
                || this.isXType("draw")
                || this.isXType("chart")
                || this.isXType("button");
    },

    destroyContentWidgets : function (checkFlag) {
        if ((this.destroyContent || !checkFlag) && !this.isNonContentable()) {
            var contentEl = this.getContentTarget();
            if(contentEl && contentEl.dom) {
                this.destroyFromDom(contentEl.dom);
            }
        }
    },

    beforeDestroy : function () {
        this.destroyContentWidgets(true);
    },

    destroyFromDom : function (dom) {
        if (!dom) {
            return;
        }
        var children = dom.children,
            child,
            cmp,
            id,
            len,
            i;

        for (i = 0, len = children.length; i < len;i++) {
            child = children[i];
            if (child) {
                id = child.id;
                if (!Ext.isEmpty(id)) {
                    cmp = Ext.getCmp(id);
                    if(cmp) {
                        cmp.destroyContent = true;
                        if (!cmp.isDescendantOf(this)) {                                    
                            cmp.destroy();
                        }
                        else {
                            cmp.destroyContentWidgets(true);
                        }
                    }
                    else {
                        this.destroyFromDom(child);
                    }
                }
                else {
                    this.destroyFromDom(child);
                }
            }
        }
    },
    
    destroy : function () {        
        this.destroyBin();
        this.destroyTooltips();
        this.destroyCallouts();
        this.callParent(arguments);
    },

    destroyCallouts : function () {
        if (this.callouts) {
            for (i = 0; i < this.callouts.length; i++ ) {
                var callout = this.callouts[i];
                if (!callout.isDestroyed) {
                    callout.destroyFromCmp = true;
                    callout.destroy();
                }
            }

            delete this.callouts;
        }
    },

    destroyTooltips : function () {
        if (this.tooltips) {
            for (i = 0; i < this.tooltips.length; i++ ) {
                var tooltip = this.tooltips[i];
                if (!tooltip.isDestroyed) {
                    tooltip.destroy();
                }
            }

            delete this.tooltips;
        }
    },
    
    destroyBin : function () {
		if (this.bin) {
		    Ext.destroy(this.bin);
		}

		delete this.bin;
	},    
    
    setSelectable : function (selectable) {
        if (selectable === false) {
            this.setDisabled(true).el.removeCls("x-item-disabled").applyStyles("color:black;");
        } else if (selectable === true) {
            this.setDisabled(false);
        }
        
        this.selectable = false;
        
        return this;
    },
    
    addPlugins : function (plugins) {
        if (Ext.isEmpty(this.plugins)) {
            this.plugins = [];
        } else if (!Ext.isArray(this.plugins)) {
            this.plugins = [ this.plugins ];
        }
        
        if (Ext.isArray(plugins)) {
            for (var i = 0; i < plugins.length; i++) {
                this.plugins.push(this.initPlugin(plugins[i]));
            }
        } else {
            this.plugins.push(this.initPlugin(plugins));
        }
    },
    
    getForm : function (id) {
        var form = Ext.isEmpty(id) ? this.el.up("form") : Ext.get(id);
        
        if (!Ext.isEmpty(form)) {
            Ext.apply(form, form.dom);
            
            form.submit = function () {
                form.dom.submit();
            };
        }
        
        return form;
    },
    
    setAnchor : function (anchor, doLayout) {
        this.anchor = anchor;
        delete this.anchorSpec;
        
        if (doLayout && this.ownerCt) {
            this.ownerCt.doLayout();
        }
    },
    
    getLoader : function () {
        var me = this,
            autoLoad = me.autoLoad ? (Ext.isObject(me.autoLoad) ? me.autoLoad : {url: me.autoLoad}) : null,
            loader = me.loader || autoLoad;

        if (loader) {
            if (!loader.isLoader) {
                me.loader = Ext.create('Ext.net.ComponentLoader', Ext.apply({
                    target: me,
                    autoLoad: autoLoad
                }, loader));
            } else {
                loader.setTarget(me);
            }

            return me.loader;

        }

        return null;
    },
    
    getTagHiddenField : function () {
         if (!this.tagHiddenField && (this.hasId() || this.tagHiddenName)) {
            this.tagHiddenField = new Ext.form.Hidden({ 
                name : this.tagHiddenName || (this.id + "_tag") 
            });

			this.on("beforedestroy", function () { 
                this.destroy();
            }, this.tagHiddenField);

            this.on("afterrender", function () {
                this.tagHiddenField.render(this.el.parent() || this.el);
            }, this, { single: true });
        }

        return this.tagHiddenField;
    },

    setTag : function (tag) {
        var field = this.getTagHiddenField();

        if (field) {
            field.setValue(escape(Ext.encode(tag)));
        }
        this.tag = tag;
    },

    getTag : function () {
        return this.tag;
    },

    replace : function (cmp) {
        if (this.ownerCt) {
            var index = this.ownerCt.items.indexOf(this),
                ct = this.ownerCt;

            ct.remove(this, true);
            
            if (Ext.isFunction(cmp)) {
                cmp({ mode : "item", index : index, ct : ct });
            } else {
                ct.insert(index, cmp);
            }
        } else { 

            var container = this.el.dom.parentNode,
                position = this.el.next();

            this.destroy();

            if(!position || !position.dom) 
            {
                position = undefined;
            }

            if (Ext.isFunction(cmp)) {
                cmp({mode : "el", position : position, ct : container });
            } else {
                cmp = Ext.ComponentManager.create(cmp);
                cmp.render(container, position);
            }            
        }
    },

    /**
     * Retrieves this component's bin component.
     *
     * @param {String/Number} comp 
     * 
     * This parameter may be any of the following:
     *
     * - a String : representing itemId or id of the bin component.
     * - a Number : representing the position of the bin component
     *   within the bin property.
     *
     *
     * @return {Ext.Component} The component (if found) or null.
     */
    getBinComponent : function (comp) {
        var me = this,
            item = null;

        if (me.bin) {
            if (Ext.isNumber(comp)) {
                item = me.bin[comp];
            } else if (Ext.isString(comp)) {
                Ext.each(me.bin, function (binItem) {
                    if (binItem.itemId === comp || binItem.id === comp || binItem.storeId === comp || binItem.proxyId === comp) {
                        item = binItem;
                        return false;
                    }
                });
            }
        }

        return item;
    }
});