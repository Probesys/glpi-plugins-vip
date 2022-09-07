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
            // get plugin_path
            //console.log(GLPI_PLUGINS_PATH);
            if (GLPI_PLUGINS_PATH !== 'undefined' && 'vip' in GLPI_PLUGINS_PATH) {
                object.params['plugin_dir'] = '/' + GLPI_PLUGINS_PATH['vip'];
            }
        }

        this.changeRequesterColor = function (vip) {
            // launch on loading of the page
            $(document).ready(function (event, xhr, option) {
                changeRequesterColor(event, xhr, option);
            });

            // Launched on each complete Ajax load
            $(document).ajaxComplete(function (event, xhr, option) {
                changeRequesterColor(event, xhr, option);
            }, this);

            // function to color vip item on the ticket tab form + on the user selector
            function changeRequesterColor(event, xhr, option) {
                //debugger;
                // only in ticket form
                if (location.pathname.indexOf('ticket.form.php') > 0 && option !== undefined) {
                    $.urlParam = function (url, name) {
                        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(url);
                        if (results != null) {
                            return results[1] || 0;
                        }
                    };

                    // get item id
                    var items_id = $.urlParam(window.location.href, 'id');

                    //debugger;
                    var alreadyVip = false;
                    if ($('#vip_img').length > 0) {
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
//                        console.log('option.url = ' + option.url);
//                        console.log('option.data = ' + option.data);
//                        console.log('------');
                    if (option.url !== undefined
                            && (
                                    option.url.indexOf("ajax/" + tab) > 0
                                    || option.url.indexOf("ajax/dropdownItilActors.php") > 0
                                    )
                            && option.data !== undefined
                            ) {
                        //debugger;
                        //console.log('tab = ' + tab);
                        //console.log('option.url = ' + option.url);
                        //console.log('option.data = ' + option.data);
                        //console.log('inputName = ' + inputName);
                        idSelect = $("select[name='" + inputName + "']").attr('id');
                        //console.log('id = ' + idSelect);
                        // Get ticket informations
                        $.ajax({
                            url: object.params['root_doc'] + object.params['plugin_dir'] + '/ajax/ticket.php',
                            type: "POST",
                            dataType: "json",
                            data: {
                                'items_id': items_id,
                                'action': 'getTicket'
                            },
                            success: function (response, opts) {
                                // Replace requester dropdown select2
                                var params_dropdown__users_id_requester = {
                                    itemtype: 'User',
                                    _idor_token: object.params['_idor_token'],
                                    all: 0,
                                    display_emptychoice: 1,
                                    right: "all",
                                    used: [],
                                    inactive_deleted: 0,
                                    with_no_right: 0,
                                    entity_restrict: "0",
                                    specific_tags: []
                                };

                                $('#' + idSelect).attr('id', inputName);
                                $('select[name="' + inputName + '"]').select2({
                                    width: '80%',
                                    minimumInputLength: 0,
                                    quietMillis: 100,
                                    dropdownAutoWidth: true,
                                    minimumResultsForSearch: 10,
                                    ajax: {
                                        url: object.params['root_doc'] + '/ajax/getDropdownUsers.php',
                                        dataType: 'json',
                                        type: 'POST',
                                        data: function (params) {
                                            query = params;
                                            return $.extend({}, params_dropdown__users_id_requester, {
                                                searchText: params.term,
                                                page_limit: 100, // page size
                                                page: params.page || 1 // page number
                                            });
                                        },
                                        processResults: function (data, params) {
                                            params.page = params.page || 1;
                                            var more = (data.count >= 100);
                                            return {
                                                results: data.results,
                                                pagination: {
                                                    more: more
                                                }
                                            };
                                        }
                                    },
                                    templateResult: function (result) {
                                        var _elt = $('<span></span>');
                                        _elt.attr('title', result.title);
                                        if (typeof query.term !== 'undefined' && typeof result.rendered_text !== 'undefined') {
                                            _elt.html(result.rendered_text);
                                        } else {
                                            if (!result.text) {
                                                return null;
                                            }

                                            var text = result.text;

                                            if (text.indexOf('>') !== -1 || text.indexOf('<') !== -1) {
                                                // escape text, if it contains chevrons (can already be escaped prior to this point :/)
                                                text = jQuery.fn.select2.defaults.defaults.escapeMarkup(text);
                                            }

                                            // Red if VIP
                                            $.each(vip, function (index2, val2) {
                                                if (result.id == val2.id) {
                                                    text = '<div class="vip red">' + text + '</div>';
                                                }
                                            });

                                            if (!result.id) {
                                                // If result has no id, then it is used as an optgroup and is not used for matches
                                                _elt.html(text);
                                                return _elt;
                                            }

                                            var _term = query.term || '';
                                            var markup = markMatch(text, _term);
                                            if (result.level) {
                                                var a = '';
                                                var i = result.level;
                                                while (i > 1) {
                                                    a = a + '&nbsp;&nbsp;&nbsp;';
                                                    i = i - 1;
                                                }
                                                _elt.html(a + '&raquo;' + markup);

                                            } else {

                                                if (markup.indexOf('vip red') > 0) {
                                                    markup = markup.replace('&lt;div class="vip red"&gt;', '');
                                                    markup = markup.replace('&lt;/div&gt;', '');
                                                    markup = markup.replace(jQuery.fn.select2.defaults.defaults.escapeMarkup('</div>'), '');
                                                    _elt.addClass('vip red');
                                                }
                                                _elt.html(markup);

                                            }
                                        }

                                        return _elt;
                                    },
                                    templateSelection: function (result) {
                                        //debugger;
                                        var text = result.text;
                                        // Red if VIP
                                        var ticketVip = false;
                                        $.each(vip, function (index2, val2) {
                                            if (result.id == val2.id) {
                                                //var text = '<span style="color:red;">' + text + '</span>';
                                                var text = '<div class="vip red">' + text + '</div>';
                                                ticketVip = true;
                                            }
                                        });
                                        //debugger;
                                        if (ticketVip && $('#vip_img').length == 0) {
                                            $("div[id='mainformtable5'] div.actor_row:first .fas.fa-user").append("&nbsp;<img id='vip_img' src='" + object.params['plugin_dir'] + "/pics/vip.png'>");
                                        } else if (alreadyVip) {
                                            $("#vip_img").remove();
                                        }

                                        return text;
                                    }
                                });

                            }
                        });
                    }

                    // Color requesters already added
                    if (option.url !== undefined
                            && items_id > 0
                            && (option.url.indexOf('vip/ajax/loadscripts.php') > 0 || option.url.indexOf('updatecurrenttab') > 0)) {
                        //console.log('vip plugin : updatecurrenttab');
                        setTimeout(function () {
                            var item_bloc = $("div[id='mainformtable5'] div.actor_row:first .fas.fa-user");

                            if (item_bloc.length !== 0 && $("span[id*='vip_requester']").length === 0) {
                                //debugger;
                                $.ajax({
                                    url: object.params['plugin_dir'] + '/ajax/ticket.php',
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
                                                var searchUrl = object.params['root_doc'] + '/front/user.form.php?id=' + val.id;
                                                //console.log('searchUrl = ' + searchUrl);
                                                // recherche link avec cet url
                                                var linkActor = $('a[href="' + searchUrl + '"]');
                                                if (linkActor.length !== 0 && !linkActor.hasClass('vipActor')) {
                                                    linkActor.addClass('vipActor');
                                                    linkActor.prepend("&nbsp;<img id='vip_img' src='" + object.params['plugin_dir'] + "/pics/vip.png'>&nbsp;");
                                                    ticketVip = true;
                                                    var previousUserIncon = linkActor.closest('.actor_row');
                                                    previousUserIncon.addClass('red');
                                                }
                                                /*var requesterText = item_bloc[index2].nextSibling;
                                                 if (val.id == val2 && requesterText.nodeValue != null) {
                                                 $("<span id='vip_requester" + index2 + "' class='red'>" + requesterText.nodeValue + "</span>").insertAfter(requesterText);
                                                 $(requesterText).remove();
                                                 ticketVip = true;
                                                 }*/
                                            });
                                        });
                                        if (ticketVip && $('#vip_img').length === 0) {
                                            $("div[id='mainformtable5'] div.actor_row:first .fas.fa-user").append("&nbsp;<img id='vip_img' src='" + object.params['plugin_dir'] + "/pics/vip.png'>");
                                        }
                                    }
                                });
                            }
                        }, 2000);
                    }
                }
            }
        };

        return this;
    };
}
(jQuery)
);

