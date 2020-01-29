define([
    "jquery"
], function($){

    var fieldConfig = {
        credit_memo_container_selector: '#creditmemo_item_container',
        refund_col_header_selector: 'th.col-refund',
        refund_all_checkbox_id: 'refund-all'
    };

    return {
        init: function() {
            this.container = $(fieldConfig.credit_memo_container_selector);

            if (this.container.length === 0) {
                return;
            }

            if (typeof window.itemInfo === "undefined") {
                window.itemInfo = this.getItemInfo();

            }

            this.initCheckboxRefundAll();
            this.initCheckboxRefundOnRows();
            this.addObserverToContainer();
            this.addListenerToQtyInputs();

        },
        setZeroRefundQtys: function() {
            this.container.find('input.qty-input').each(function(){
                $(this).val(0);
            });
            this.triggerChangeListener();
        },
        setRefundAllQtys: function() {
            Object.keys(window.itemInfo).forEach(keySelector => {
                this.updateInputValueByName(keySelector, window.itemInfo[keySelector]);
            });
        },
        triggerChangeListener: function() {
            checkButtonsRelation();
        },
        updateInputValueByName: function (selector, value) {
            let element = $('input[name="'+selector+'"]');

            if (element.length === 0) {
                return;
            }

            element.val(value);
            this.triggerChangeListener();
        },
        disableInputByName: function (selector, disabled = true) {
            let element = $('input[name="'+selector+'"]');

            if (element.length === 0) {
                return;x
            }

            element.attr('disabled', disabled);
        },
        disableQtyInputs: function(disabled = true) {
            let self = this;
            this.container.find('input.qty-input').each(function(){

                let value = self.getItemInfoByName($(this).attr('name'));
                $(this).attr('disabled', value <= 0);

            });
        },
        getItemInfo: function() {

            let itemInfo = {};

            this.container.find('input.qty-input').each(function(){
                let key = $(this).attr('name');
                itemInfo[key] = $(this).val();
            });

            return itemInfo;
        },
        initCheckboxRefundAll: function() {

            let refundCheckbox = $(document.createElement('input')).attr({
                type:  'checkbox',
                id: fieldConfig.refund_all_checkbox_id,
                checked: false,
                class: 'refund-all-checkbox'
            });

            refundCheckbox.change(function(event){
                this.onRefundAllChecked(event);
            }.bind(this));

            $(fieldConfig.refund_col_header_selector).prepend(refundCheckbox);
        },
        initCheckboxRefundOnRows: function() {

            var self = this;

            this.container.find('input.qty-input').each(function(){

                let checkbox = $(document.createElement('input')).attr({
                    type:  'checkbox',
                    'data-name': $(this).attr('name'),
                    class: 'refund-item-checkbox',
                    checked: $(this).val() > 0,
                    disabled: self.getItemInfoByName($(this).attr('name')) <= 0
                });

                $(this).attr('disabled', self.getItemInfoByName($(this).attr('name')) <= 0);

                $(this).before(checkbox);

            });

            this.addItemRefundListeners();
        },
        addItemRefundListeners: function() {
          $('.refund-item-checkbox').change(function(event) {
              this.onRefundItemChecked(event);
          }.bind(this));
        },
        onRefundAllChecked: function(event) {

            if ($(event.target).is(':checked')) {
                this.setRefundAllQtys();
                this.disableQtyInputs(false);
                this.checkAllItems();
                return;
            }
            this.setZeroRefundQtys();
            this.disableQtyInputs();
            this.checkAllItems(false);

        },
        onRefundItemChecked: function(event) {

            let checkbox = $(event.target);
            let name = checkbox.attr('data-name');
            let qtyValue = this.getItemInfoByName(name);

            if (checkbox.is(':checked')) {
                this.updateInputValueByName(name, qtyValue);
                this.disableInputByName(name, false);
                this.uncheckRefundAll();
                return;
            }
            this.updateInputValueByName(name, 0);
            this.disableInputByName(name);
            this.uncheckRefundAll();
        },
        getItemInfoByName: function(keyName) {
            return window.itemInfo[keyName];
        },
        addObserverToContainer: function() {
            //reInit the script after ajax refreshes container
            let targetNode = this.container.get(0);

            let observerWhat = {
                childList: true
            };

            const observer = new MutationObserver(this.observerCallback.bind(this));

            observer.observe(targetNode, observerWhat);

        },
        observerCallback: function(mutationsList, observer) {
            for(let mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    this.init();
                    observer.disconnect();
                }
            }
        },
        addListenerToQtyInputs: function() {
            let self = this;
            this.container.find('input.qty-input').change(function(){
                self.uncheckRefundAll();

                if ($(this).val() == 0) {
                    let checkboxSelector = 'input[data-name="'+$(this).attr('name')+'"]';
                    self.checkItem(checkboxSelector, false);
                    $(this).attr('disabled', true);
                }
            });
        },
        uncheckRefundAll: function() {
            this.container.find('#'+fieldConfig.refund_all_checkbox_id).attr('checked', false);
        },
        checkAllItems: function(checked = true) {
            $('.refund-item-checkbox').each(function(event) {
                if (! $(this).attr('disabled')) {
                    $(this).attr('checked', checked);
                }
            });
        },
        checkItem: function(checkboxSelector, checked = true) {
            let checkbox = $(checkboxSelector);
            checkbox.attr('checked', checked);
        }
    };

});