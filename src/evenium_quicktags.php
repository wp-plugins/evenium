<?php
/*
 * Plugin : Evenium for Wordpress
 * Author : Eyal Hadida
*/
class Evenium_Quicktags
{
	public function __construct()
	{
		add_shortcode('evenium_all_events', array($this, 'evenium_list_events'));
		add_shortcode('evenium_single_event', array($this, 'evenium_single_event'));
		add_shortcode('evenium_event_agenda', array($this,'evenium_event_agenda'));
	}

	public function evenium_list_events($atts, $content)
	{
        $a = shortcode_atts(array('id' => 0), $atts);
        $html = '<script type="text/javascript" src="https://evenium.net/ng/js/widgets/eventsList.js#' . $a['id'];
        //$html = evenium_add_params_widget_url($html);
        $html .= '"></script>';
        return $html;
	}

	public function evenium_single_event($atts, $content)
	{
		$a = shortcode_atts(array('id' => 0), $atts);

        $html = '<script type="text/javascript" src="https://evenium.net/ng/js/widgets/ticketing.js#' . $a['id'];
        $html = evenium_add_params_widget_url($html);
        $html .= '"></script>';
		return $html;
	}

	public function evenium_event_agenda($atts, $content)
	{
		$a = shortcode_atts(array('id' => 0), $atts);
        $html = '<script src="https://evenium.net/ng/js/widgets/agenda.js#' . $a['id'];
        $html = evenium_add_params_widget_url($html);
        $html .= '"></script>';
		return $html;
	}
}

function grabCurrentURL(){
    if (isset($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] == "on") {
        $url = "https://";
    }else{
        $url = "http://";
    }
    $url .= $_SERVER['SERVER_NAME'];
    if($_SERVER['SERVER_PORT'] != 80){
        $url .= ":".$_SERVER["SERVER_PORT"].$_SERVER["REQUEST_URI"];
    }else{
        $url .= $_SERVER["REQUEST_URI"];
    }
    return $url;
}

function evenium_add_params_widget_url($url)
{
    $add_params = false;
    $token = '';
    $loc = '';
    $ref = '';
    $source = '';
    if (isset($_SESSION['evenium_token']) && $_SESSION['evenium_token'] != '')
    {
        $token = 'token=' . $_SESSION['evenium_token'] . '&';
        $add_params = true;
    }
    if (isset($_SESSION['evenium_loc']) && $_SESSION['evenium_loc'] != '')
    {
        $loc = 'loc=' . $_SESSION['evenium_loc'] . '&';
        $add_params = true;
    }
    if (grabCurrentURL() != null && grabCurrentURL() != '')
    {
        $source = 'utm_source=' . urlencode(grabCurrentURL()) . '&utm_medium=pwp&';
        $add_params = true;
    }
    if (isset($_SESSION['evenium_ref']) && $_SESSION['evenium_ref'] != '')
    {
        $ref = 'referer=' . urlencode($_SESSION['evenium_ref']) . '&';
        $add_params = true;
    }

    if($add_params == true)
    {
        //Do not add ? if there is no param, unknown results on some widgets
        $url .= '?';
        $url .= $token . $loc . $source . $ref;
        //Removing the last amp
        $url = substr($url, 0, -1);
    }
    return $url;
}