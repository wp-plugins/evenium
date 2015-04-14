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
            document.getElementById("evenium_member_id").value = member_id;
            jQuery("#ev_event_ids").submit();
        }
        if (xmlhttp.readyState==4 && xmlhttp.status==401)
        {
            jQuery("#evenium_login_result").html(objectL10n.wrongCredentials);
        }
    };
    login=document.getElementById("evenium_login").value;
    password=document.getElementById("evenium_password").value;
    xmlhttp.open("POST","https://secure.evenium.com/api/1/loginOAuth?login=" + login,true);
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

            var eventNodes = xmlDoc.getElementsByTagName("event");
            var count = 0;

            for( var i = 0; i < eventNodes.length; i++ )
            {
                // Each event
                var eventNod = jQuery(eventNodes[i]);

                var evStatus = eventNod.children("status");
                if ( !evStatus || (evStatus.text() != 'FUTURE' && evStatus.text() != 'OPEN' ) )
                    continue;

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

            eventIds   = JSON.stringify(eventIds);
            eventNames = JSON.stringify(eventNames);
            eventsUrl  = JSON.stringify(eventsUrl);
            document.getElementById("evenium_events_ids").value = eventIds;
            document.getElementById("evenium_events_names").value = eventNames;
            document.getElementById("evenium_events_urls").value = eventsUrl;
            send_new_events(JSON.parse(eventNames), JSON.parse(eventsUrl));
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

function send_new_events(a, b)
{
    jQuery.post( "options.php", jQuery( "#ev_event_ids" ).serialize(), refresh_html_events_list(a,b));
}

function refresh_html_events_list(a,b)
{
    var eventsList = a;
    var urlsList = b;
    var myHtmlTab = "<ul>";
    var i =0;
    for(var key in eventsList)
    {
        myHtmlTab += "<li><a class=\"event_link\" href=\"" + urlsList[i] + "\" target=\"_blank\">" /*+ key*/ + eventsList[key] + "</a></li>";
        i++;
    }
    myHtmlTab += "</ul>";
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
    jQuery("#evenium_member_id").val("");
    jQuery("#ev_event_ids").submit();
}