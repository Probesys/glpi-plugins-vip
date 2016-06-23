/*
 -------------------------------------------------------------------------
 VIP plugin for GLPI
 Copyright (C) 2014 by the VIP Development Team.
 -------------------------------------------------------------------------

 LICENSE

 This file is part of VIP.

 VIP is free software; you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation; either version 2 of the License, or
 (at your option) any later version.

 VIP is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with VIP. If not, see <http://www.gnu.org/licenses/>.
 --------------------------------------------------------------------------  */

/** 
*  VIP jquery
*/
(function ($) {
    $.fn.initVipPlugin = function (options) {

        var object = this;
        init();

        // Start the plugin
        function init() {
            object.params = new Array();
            object.params['entities_id'] = 0;
            object.params['page_limit'] = 0;
            object.params['minimumResultsForSearch'] = 0;
            object.params['root_doc'] = null;
            object.params['emptyValue'] = null;

            if (options != undefined) {
                $.each(options, function (index, val) {
                    if (val != undefined && val != null) {
                        object.params[index] = val;
                    }
                });
            }
        }
        
        this.changeRequesterColor = function (vip) {
            $(document).ready(function () {
                // only in ticket form
                if (location.pathname.indexOf('ticket.form.php') > 0) {
                    $.urlParam = function (url, name) {
                        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(url);
                        if (results != null) {
                            return results[1] || 0;
                        }
                    }

                    // get item id
                    var items_id = $.urlParam(window.location.href, 'id');

                    // Launched on each complete Ajax load 
                    $(document).ajaxComplete(function (event, xhr, option) {
                        var alreadyVip = false;
                        if ($('#vip_img').length > 0){
                            alreadyVip = true;
                        }
                        
                        // Get the right tab
                        var tab, inputName;
                        if (items_id > 0) {
                            tab = 'dropdownItilActors';
                            inputName = '_itil_requester[users_id]';
                        } else {
                            tab = 'uemailUpdate.php';
                            inputName = '_users_id_requester';
                        }

                        // We execute the code only if the ticket form display request is done 
                        if (option.url !== undefined 
                                && option.url.indexOf("ajax/" + tab) > 0 
                                && ((option.data !== undefined
                                        && option.data.indexOf("user") > 0 
                                        && option.data.indexOf("requester") > 0)
                                    || option.data === undefined)) {

                            // Get ticket informations
                            $.ajax({
                                url: object.params['root_doc'] + '/plugins/vip/ajax/ticket.php',
                                type: "POST",
                                dataType: "json",
                                data: {
                                    'items_id': items_id,
                                    'action': 'getTicket'
                                },
                                success: function (response, opts) {
                                    // Replace requester dropdown select2
                                    $("input[name='" + inputName + "']").select2({
                                        width: '80%',
                                        closeOnSelect: false,
                                        minimumInputLength: 0,
                                        quietMillis: 100,
                                        minimumResultsForSearch: object.params['minimumResultsForSearch'],
                                        ajax: {
                                            url: object.params['root_doc'] + '/ajax/getDropdownUsers.php',
                                            dataType: 'json',
                                            data: function (term, page) {
                                                return {all: 0,
                                                        right: 'all',
                                                        used: response.used,
                                                        entity_restrict: response.entities_id,
                                                        searchText: term,
                                                        page_limit: object.params['page_limit'], // page size
                                                        page: page, // page number
                                                };
                                            },
                                            results: function (data, page) {
                                                var more = (data.count >= object.params['page_limit']);
                                                return {results: data.results, more: more};
                                            }
                                        },
                                        initSelection: function (element, callback) {
                                            var id = $(element).val();
                                            var defaultid = '0';
                                            if (id !== '') {
                                                // No ajax call for first item
                                                if (id === defaultid) {
                                                    var data = {id: 0,
                                                        text: object.params['emptyValue']};
                                                    callback(data);
                                                } else {
                                                    $.ajax(object.params['root_doc'] + '/ajax/getDropdownUsers.php', {
                                                        data: {all: 0,
                                                               right: "all",
                                                               used: [],
                                                               entity_restrict: response.entities_id,
                                                               _one_id: id},
                                                               dataType: 'json',
                                                    }).done(function (data) {
                                                        callback(data);
                                                    });
                                                }
                                            }

                                        },
                                        formatResult: function (result, container, query, escapeMarkup) {
                                            // Red if VIP
                                            $.each(vip, function (index2, val2) {
                                                if (result.id == val2.id) {
                                                    $(container).css({'color': 'red'});
                                                }
                                            });

                                            var markup = [];
                                            window.Select2.util.markMatch(result.text, query.term, markup, escapeMarkup);
                                            if (result.level) {
                                                var a = '';
                                                var i = result.level;
                                                while (i > 1) {
                                                    a = a + '&nbsp;&nbsp;&nbsp;';
                                                    i = i - 1;
                                                }
                                                return a + '&raquo;' + markup.join('');
                                            }
                                            return markup.join('');
                                        },
                                        formatSelection: function(result, container){
                                            $(container).css({'color': ''});
                                            // Red if VIP
                                            var ticketVip = false;
                                            $.each(vip, function (index2, val2) {
                                                if (result.id == val2.id) {
                                                    $(container).css({'color': 'red'});
                                                    ticketVip = true;
                                                }
                                            });
                                            
                                            if (ticketVip && $('#vip_img').length == 0) {
                                                $("table[id='mainformtable5'] tr:first-child th:first-child").append("&nbsp;<img id='vip_img' src='"+object.params['root_doc'] + "/plugins/vip/pics/vip.png'>");
                                            } else if(!alreadyVip) {
                                                $("#vip_img").remove();
                                            }
                                            
                                            return result.text;
                                        },
                                    });
                                }
                            });
                        }

                        // Color requesters already added 
                        if (option.url !== undefined 
                                && items_id > 0 
                                && (option.url.indexOf('vip/ajax/loadscripts.php') > 0 || option.url.indexOf('common.tabs.php') > 0)) {

                            setTimeout( function () {
                                var item_bloc = $("table[id='mainformtable5'] tr:last-child td:first-child img[src*='users.png']");
                                if (item_bloc.length != 0 && item_bloc[0].nextSibling.nodeValue != null && $("span[id*='vip_requester']").length == 0){
                                    $.ajax({
                                        url: object.params['root_doc'] + '/plugins/vip/ajax/ticket.php',
                                        type: "POST",
                                        dataType: "json",
                                        data: {
                                            'items_id': items_id,
                                            'action': 'getTicket'
                                        },
                                        success: function (response, opts) {
                                            var ticketVip = false;
                                            $.each(vip, function (index, val) {
                                                $.each(response.used, function (index2, val2) {
                                                    var requesterText = item_bloc[index2].nextSibling;
                                                    if (val.id == val2 && requesterText.nodeValue != null) {
                                                        $("<span id='vip_requester"+index2+"' class='red'>"+requesterText.nodeValue+"</span>").insertAfter(requesterText);
                                                        $(requesterText).remove();
                                                        ticketVip = true;
                                                    }
                                                });
                                            });

                                            if (ticketVip && $('#vip_img').length == 0) {
                                                $("table[id='mainformtable5'] tr:first-child th:first-child").append("&nbsp;<img id='vip_img' src='"+object.params['root_doc'] + "/plugins/vip/pics/vip.png'>");
                                            }
                                        }
                                    });
                                }
                            }, 500);
                        }
                    }, this);
                }
            });
        }
        
        return this;
    }
}(jQuery));