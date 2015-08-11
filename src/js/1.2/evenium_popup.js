/*
 * Plugin : Evenium for Wordpress
 * Author : Eyal Hadida
 */

function popup_refresh_events(token)
{
    function parse_response( xmlDoc )
    {
        var eventIds   = [];
        var eventsUrl  = [];
        var eventNames = {};
        var eventIsDraft = [];

        var eventNodes = xmlDoc.getElementsByTagName("event");
        var count = 0;

        for( var i = 0; i < eventNodes.length; i++ )
        {
            // Each event
            var eventNod = jQuery(eventNodes[i]);

            var evStatus = eventNod.children("status");
            if (!evStatus)
                continue;
            if(evStatus.text() == 'DRAFT')
            {
                eventIsDraft[count] = 1;
            }
            else
            {
                eventIsDraft[count] = 0;
            }

            var eventIdElm   = eventNod.children("id");
            var eventUrlElm  = eventNod.children("webSite");
            var eventNameElm = eventNod.children("title");
            if ( !eventIdElm || !eventUrlElm || !eventNameElm )
            {
                console.log( "ERROR in parse_response: Parse error for <event> node id=["+ eventIdElm +"] and node=" + eventNod);
                continue;
            }

            var eventId = eventIdElm.text();
            if ( !eventId )
            {
                console.log( "ERROR in parse_response: ID NULL for node=" + eventNod);
                continue;
            }

            eventIds[count] = eventId;
            eventsUrl[count] = eventUrlElm.text();
            eventNames[eventId] = eventNameElm.text();
            count++;
        }

        var myHtmlRadioSelect = '';
        var k = 0;
        for (var key in eventNames)
        {
            if(eventIsDraft[k] == 0)
            {
                myHtmlRadioSelect += '<input type="radio" class="evenium_radio" name="evenium_event_choice" value=\'' + key + '\'><label onclick="jQuery(this).prev().click(); display_draft_error(false)" class="radioText">' + eventNames[key] + '</label><br>';
            }
            else
            {
                myHtmlRadioSelect += '<input disabled="true" type="radio" class="evenium_radio" name="evenium_event_choice" value=\'' + key + '\'><label onclick="display_draft_error(true)" class="radioText">' + eventNames[key] + '<div style=\"font-style: italic; display:inline;color:grey;\"> (' + objectL10n.draft + ')</div></label><br>';
            }
            k++;
        }

        jQuery('#evenium_events_list').html(myHtmlRadioSelect);
    }
    if(token != '')
    {
        var d = new Date();
        var n = d.toISOString();
        jQuery.ajax({
            url: "https://secure.evenium.com/api/1/events",
            data: {endsAfter: n,accessToken: token},
            success: parse_response
        });
    }
    else
    {
        //Nothing happens, we don't have a token
    }

}

function retrieve_entities(token)
{
    function parse_response(resp)
    {
        var entities={};
        entitiesNodes=resp.getElementsByTagName("member");
        for(i=0;i<entitiesNodes.length;i++)
        {
            //Each member
            entityId = "";
            entityName = "";
            entityFirstName = "";
            entityLastName = "";
            for(j=0;j<entitiesNodes[i].childNodes.length;j++)
            {
                //Each node inside member
                childNode = entitiesNodes[i].children[j];
                if(childNode !== undefined)
                {
                    if (childNode.tagName == 'id')
                    {
                        entityId = childNode.textContent;
                    }
                    else if (childNode.tagName == 'firstName')
                    {
                        entityFirstName = childNode.textContent;
                    }
                    else if (childNode.tagName == 'lastName')
                    {
                        entityLastName = childNode.textContent;
                    }
                }
            }
            if(entityFirstName == '')
            {
                entityName = entityLastName;
            }
            else
            {
                entityName = entityFirstName + ' ' + entityLastName;
            }
            entities[entityId] = entityName;
        }
        var myHtmlRadioSelect = '';
        if(entitiesNodes.length == 1)
        {
            for (var key in entities)
            {
                myHtmlRadioSelect += '<input checked="checked" type="radio" class="evenium_radio" name="evenium_entity_choice" value=\'' + key + '\'><label onclick="jQuery(this).prev().click()" class="radioText">' + entities[key] + '</label><br>';
            }
        }
        else
        {
            for (var key in entities)
            {
                myHtmlRadioSelect += '<input type="radio" class="evenium_radio" name="evenium_entity_choice" value=\'' + key + '\'><label onclick="jQuery(this).prev().click()" class="radioText">' + entities[key] + '</label><br>';
            }
        }
        jQuery('#evenium_entities_list').html(myHtmlRadioSelect);
    }
    if(token != '')
    {
        jQuery.ajax({
            url: "https://secure.evenium.com/api/1/member/entities",
            data:{accessToken: token},
            success: parse_response
        });
    }
}
function insert_quicktag()
{
    var action ='';
    jQuery('[name=evenium_insert_action]').each(function()
    {
        if (jQuery(this).attr("checked")=="checked")
        {
            action = jQuery(this).val();
        }
    });

    var eventId = '';
    jQuery('[name=evenium_event_choice]').each(function()
    {
        if (jQuery(this).attr("checked")=="checked")
        {
            eventId = jQuery(this).val();
        }
    });

    var memberId = '';
    jQuery('[name=evenium_entity_choice]').each(function()
    {
        if (jQuery(this).attr("checked")=="checked")
        {
            memberId = jQuery(this).val();
        }
    });

    if (action == 'agenda' && eventId != '')
    {
        var singleEventAgendaShortcode = '[evenium_event_agenda id=' + eventId + ']';
        if (eventId != '0' && eventId != '-1')
        {
            if(typeof(tinymce) != 'undefined')
            {
                if(tinymce.activeEditor == null || tinyMCE.activeEditor.isHidden() != false)
                {
                    edInsertContent(edCanvas, singleEventAgendaShortcode);
                }
                else
                {
                    tinymce.EditorManager.activeEditor.insertContent(singleEventAgendaShortcode);
                }
            }
            else
            {
                edInsertContent(edCanvas, singleEventAgendaShortcode);
            }
            jQuery('#evenium_popup_close')[0].click();
        }
    }
    else if (action == 'registration' && eventId != '')
    {
        var singleEventShortcode = '[evenium_single_event id=' + eventId + ']';
        if (eventId != '0' && eventId != '-1')
        {
            if(typeof(tinymce) != 'undefined')
            {
                if(tinymce.activeEditor == null || tinyMCE.activeEditor.isHidden() != false)
                {
                    edInsertContent(edCanvas, singleEventShortcode);
                }
                else
                {
                    tinymce.EditorManager.activeEditor.insertContent(singleEventShortcode);
                }
            }
            else
            {
                edInsertContent(edCanvas, singleEventShortcode);
            }
            jQuery('#evenium_popup_close')[0].click();
        }
    }
    else if (action == 'listofevents' && memberId != '')
    {
        var allEventsShortcode = '[evenium_all_events id=' + memberId + ']';
        if (memberId != '0' && memberId != '-1')
        {
            if(typeof(tinymce) != 'undefined')
            {
                if(tinymce.activeEditor == null || tinyMCE.activeEditor.isHidden() != false)
                {
                    edInsertContent(edCanvas, allEventsShortcode);
                }
                else
                {
                    tinymce.EditorManager.activeEditor.insertContent(allEventsShortcode);
                }
            }
            else
            {
                edInsertContent(edCanvas, allEventsShortcode);
            }
            jQuery('#evenium_popup_close')[0].click();
        }
    }
}

function display_draft_error(bool)
{
    if(bool)
    {
        jQuery('#draft_error').html(objectL10n.draft_error + "</br>");
        jQuery('#draft_error').show();

    }
    else
    {
        jQuery('#draft_error').hide();
    }
}

jQuery(function()
{
   jQuery('input[name="evenium_insert_action"]:radio').change(
       function(){
           var action ='';
           jQuery('[name=evenium_insert_action]').each(function()
           {
               if (jQuery(this).attr("checked")=="checked")
               {
                   action = jQuery(this).val();
               }
               if (action == 'listofevents')
               {
                   //hide events
                   jQuery('#evenium_event_choice').hide();
                   jQuery('#evenium_entity_choice').show();
               }
               else
               {
                   //show events
                   jQuery('#evenium_event_choice').show();
                   jQuery('#evenium_entity_choice').hide();

               }
           });
       }
   );
});

jQuery(function()
{
    jQuery(document).on("keypress", function (e)
    {
        if(e.which == 13 && jQuery('#openModal').css('opacity') != 0)
        {
            jQuery('#insertQt').click();
        }
    });
});

jQuery(document).ready(
    function() {
    tinymce.PluginManager.add('evenium', function( editor, url ) {
        editor.addButton( 'evenium_tc_button', {
            text: 'Evenium',
            icon: 'icon evenium-own-icon',
            onclick: function() {
                document.getElementById('evenium_te_btn').click();
            }
        });
    });
});