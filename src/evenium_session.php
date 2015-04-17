<?php
/*
 * Plugin : Evenium for Wordpress
 * Author : Eyal Hadida
*/

class Evenium_Session
{
	public function __construct()
	{
        add_action('init', array($this,'evenium_start_session'), 1);
        add_action('wp_logout', array($this,'evenium_end_session'));
        add_action('wp_login', array($this, 'evenium_end_session'));
        add_action('wp_head', array($this, 'evenium_inject_token_checker'),20);
	}
    public function evenium_inject_token_checker()
    {
        if (isset($_GET['token']) && $_GET['token'] != '' && preg_match('/[<>\'\"]/', $_GET['token']) == 0)
        {
            $_SESSION['evenium_token'] = $_GET['token'];
        }
    }
    function evenium_start_session()
    {
        if(!session_id())
        {
            session_start();
        }
    }
    function evenium_end_session()
    {
        session_destroy ();
    }
}