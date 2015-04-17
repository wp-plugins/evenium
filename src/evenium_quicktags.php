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
        $html = '<script type="text/javascript" src="https://evenium.net/ng/js/widgets/eventsList.js#' . $a['id'] . '"></script>';
        return $html;
	}

	public function evenium_single_event($atts, $content)
	{
		$a = shortcode_atts(array('id' => 0), $atts);
        if (isset($_SESSION['evenium_token']) && $_SESSION['evenium_token'] != '')
        {
            $html = '<script type="text/javascript" src="https://evenium.net/ng/js/widgets/ticketing.js#' . $a['id'] . '?token=' . $_SESSION['evenium_token'] . '"></script>';
        }
        else
        {
            $html = '<script type="text/javascript" src="https://evenium.net/ng/js/widgets/ticketing.js#' . $a['id'] . '"></script>';
        }
		return $html;
	}

	public function evenium_event_agenda($atts, $content)
	{
		$a = shortcode_atts(array('id' => 0), $atts);
        if (isset($_SESSION['evenium_token']) && $_SESSION['evenium_token'] != '')
        {
            $html = '<script src="https://evenium.net/ng/js/widgets/agenda.js#' . $a['id'] . '?token=' . $_SESSION['evenium_token'] . '"></script>';
        }
        else
        {
            $html = '<script src="https://evenium.net/ng/js/widgets/agenda.js#' . $a['id'] . '"></script>';
        }
		return $html;
	}
}