<?php
/*
Plugin Name: Evenium
Plugin URI: http://www.evenium.net
Description: Evenium Plugin for WordPress
Version: 1.0
Author: Evenium
Text Domain: evenium
License: GPL2
*/


class Evenium_Plugin
{
	public function __construct()
	{
		include_once plugin_dir_path( __FILE__ ).'/src/evenium_session.php';
		new Evenium_Session();
		include_once plugin_dir_path( __FILE__ ).'/src/evenium_settings.php';
		new Evenium_Settings();
		include_once plugin_dir_path( __FILE__ ).'/src/evenium_quicktags.php';
		new Evenium_Quicktags();
		include_once plugin_dir_path( __FILE__ ).'/src/evenium_popup.php';
		new Evenium_Popup();
    }
}
new Evenium_Plugin();

register_activation_hook(__FILE__, function() {
    add_option('Evenium_Activated', 'evenium');
});

add_action('admin_init', 'load_evenium_plugin');
add_action('plugins_loaded', 'load_evenium_translations');

function load_evenium_plugin()
{
    if(is_admin()&&get_option('Evenium_Activated')=='evenium')
    {
        delete_option('Evenium_Activated');
        wp_redirect(menu_page_url('evenium'));
        exit;

    }
}

function load_evenium_translations()
{
    $plugin_dir = basename(dirname(__FILE__)) . '/languages';
    load_plugin_textdomain('evenium', false, $plugin_dir);
}