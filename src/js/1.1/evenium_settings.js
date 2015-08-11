/*
 * Plugin : Evenium for Wordpress
 * Author : Eyal Hadida
 */
function evenium_connect()
{
    var xmlhttp;
    xmlhttp=new XMLHttpRequest();
    xmlhttp.onreadystatechange=function()
    {
        if (xmlhttp.readyState==4 && xmlhttp.status==200)
        {
            xmlDoc=xmlhttp.responseXML;
            token_id="";
            member_id="";
            member_id_node=xmlDoc.getElementsByTagName("memberId");
            for (i=0;i<member_id_node.length;i++)
            {
                member_id= member_id + member_id_node[i].childNodes[0].nodeValue ;
            }
            token_id_node=xmlDoc.getElementsByTagName("accessToken");
            for (i=0;i<token_id_node.length;i++)
            {
                token_id= token_id + token_id_node[i].childNodes[0].nodeValue ;
            }
            document.getElementById("evenium_token").value = token_id;
            jQuery("#ev_event_ids").submit();
        }
        if (xmlhttp.readyState==4 && xmlhttp.status==401)
        {
            jQuery("#evenium_login_result").html(objectL10n.wrongCredentials);
        }
    };
    login=document.getElementById("evenium_login").value;
    password=document.getElementById("evenium_password").value;
    xmlhttp.open("POST","https://secure.evenium.com/api/1/person/loginOAuth?rememberMe=true&login=" + login,true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.send("pwd=" + password);
}

function evenium_refresh_events()
{
    var xmlhttp;
    xmlhttp=new XMLHttpRequest();
    xmlhttp.onreadystatechange=function()
    {
        if (xmlhttp.readyState==4 && xmlhttp.status==200)
        {
            xmlDoc = xmlhttp.responseXML;

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

                if(!evStatus)
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
                    console.log("ERROR in parse_response: ID NULL for node=" + eventNod);
                    continue;
                }

                eventIds[count] = eventId;
                eventsUrl[count] = eventUrlElm.text();
                eventNames[eventId] = eventNameElm.text();
                count++;
            }

            eventIds     = JSON.stringify(eventIds);
            eventNames   = JSON.stringify(eventNames);
            eventsUrl    = JSON.stringify(eventsUrl);
            eventIsDraft = JSON.stringify(eventIsDraft);
            document.getElementById("evenium_events_ids").value    = eventIds;
            document.getElementById("evenium_events_names").value  = eventNames;
            document.getElementById("evenium_events_urls").value   = eventsUrl;
            document.getElementById("evenium_event_isDraft").value = eventIsDraft;
            send_new_events(JSON.parse(eventNames), JSON.parse(eventsUrl), JSON.parse(eventIsDraft), accessToken);
        }
        else if(xmlhttp.readyState==4 && xmlhttp.status==401)
        {
            evenium_logout();
        }
    };
    var d = new Date();
    var n = d.toISOString();
    accessToken=document.getElementById("evenium_token").value;
    xmlhttp.open("GET","https://secure.evenium.com/api/1/events?endsAfter="+n+"&accessToken=" + accessToken,true);
    xmlhttp.send();
}

function send_new_events(a, b, c, d)
{
    jQuery.post( "options.php", jQuery( "#ev_event_ids" ).serialize(), refresh_html_events_list(a,b,c,d));
}

function refresh_html_events_list(a,b,c,d)
{
    console.log("token " + d);
    var eventsList = a;
    var urlsList = b;
    var eventIsDraft = c;
    var myHtmlTab = "<table style=\"margin-left: 20px;\">";
    var i =0;
    for(var key in eventsList)
    {
        myHtmlTab += "<tr>";
        if(eventIsDraft[i] == 0)
        {
            myHtmlTab += "<td>" +
            "<a class=\"event_link\" href=\"" + urlsList[i] + "\" target=\"_blank\">" /*+ key*/ + eventsList[key] + "</a></td>" +
            "<td><a class=\"manage_link\" href=\"https://evenium.net/ng/person/login.jsf?token=" + d + "&target=/person/organizer/configuration/eventConfiguration.jsf?eventId=" + key + "%26_mn=5%26loc=en_US\" target=\"_blank\">" + objectL10n.manage +
            "</a></td>";
        }
        else
        {
            myHtmlTab += "<td>" +
            "<a class=\"event_link\" onclick=\"display_draft_error_msg();return false;\" href=\"\">" /*+ key*/ + eventsList[key] + "</a><div style=\"font-style: italic; display:inline; color:grey;\"> ("+ objectL10n.draft + ")</div></td>" +
            "<td><a class=\"manage_link\" href=\"https://evenium.net/ng/person/login.jsf?token=" + d + "&target=/person/organizer/configuration/eventConfiguration.jsf?eventId=" + key + "%26_mn=5%26loc=en_US\" target=\"_blank\">" + objectL10n.manage +
            "</a></td>";

        }
        myHtmlTab += "</tr>"
        i++;
    }
    myHtmlTab += "</table>";
    if(jQuery.isEmptyObject(a))
    {
        jQuery("#evenium_events_list_label").html(objectL10n.noEventMess);

    }
    else
    {
        jQuery("#evenium_events_list_label").html(objectL10n.listEventsLabel);

    }
    jQuery("#evenium_events_list").html(myHtmlTab);
}

function evenium_get_account_name(token)
{
    function parse_response(resp){
        var node = resp.getElementsByTagName("firstName");
        var firstName = "";
        for(i=0;i<node.length;i++)
        {
            firstName = node[i].childNodes[0].nodeValue;
        }
        jQuery("#evenium_user_name").prepend(objectL10n.welcome + " " + firstName + "! ");
    }
    jQuery.get("https://secure.evenium.com/api/1/person/me?&accessToken=" + token, parse_response);
}

function evenium_logout()
{
    jQuery("#evenium_token").val("");
    jQuery("#evenium_events_ids").val("");
    jQuery("#evenium_events_names").val("");
    jQuery("#evenium_events_urls").val("");
    jQuery("#ev_event_ids").submit();
}

function display_draft_error_msg()
{
    jQuery("#evenium_draft_error_label").html(objectL10n.draft_error);
}