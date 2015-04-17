<?php
/*
 * Plugin : Evenium for Wordpress
 * Author : Eyal Hadida
*/

class Evenium_Settings
{
	public function __construct()
	{
		add_action('admin_menu', array($this, 'add_evenium_menu'),10);
		add_action('admin_init', array($this, 'register_settings'));
        add_action('admin_enqueue_scripts', array($this, 'evenium_register_script'));

    }

	public function add_evenium_menu()
	{
		$page_hook_suffix = add_menu_page(__('Evenium Plugin for Wordpress', 'evenium'), 'Evenium', 'manage_options', 'evenium', array($this, 'evenium_menu_page'));
		add_action('admin_print_scripts-' . $page_hook_suffix, array($this, 'evenium_enqueue_script'));
		add_action('admin_footer-' . $page_hook_suffix, array($this, 'evenium_refresh_events'));
        add_action('admin_head-' . $page_hook_suffix, array($this, 'evenium_add_css'));
	}

	public function evenium_menu_page()
	{
		echo '<h1>'.get_admin_page_title().'</h1>';
        ?>
        <form id="ev_event_ids" method="post" action="options.php">
            <?php settings_fields('evenium_settings'); ?>
            <input type="hidden" name="evenium_token" id="evenium_token" value="<?php echo htmlspecialchars(get_option('evenium_token'))?>"/>
            <input type="hidden" name="evenium_member_id" id="evenium_member_id" value="<?php echo htmlspecialchars(get_option('evenium_member_id'))?>"/>
            <input type="hidden" name="evenium_events_ids" id="evenium_events_ids" value="<?php echo htmlspecialchars(get_option('evenium_events_ids'))?>"/>
            <input type="hidden" name="evenium_events_names" id="evenium_events_names" value="<?php echo htmlspecialchars(get_option('evenium_events_names'))?>" >
            <input type="hidden" name="evenium_events_urls" id="evenium_events_urls" value="<?php echo htmlspecialchars(get_option('evenium_events_urls'))?>">
        </form>

        <?php
        $token = get_option('evenium_token');
        if(isset($token))
        {
            if($token != '')
            {
                ?>
                <script>evenium_get_account_name("<?php echo $token?>")</script>
                <p id="evenium_user_name" style="font-weight: bold"><a onclick="evenium_logout()"><?php _e('(Not you? Logout)', 'evenium') ?></a></p>
                <p style="font-style: italic;font-weight: bold" id="evenium_events_list_label"></p>
                <p id="evenium_events_list"></p><br/>
                <label style="font-weight: bold" for="evenium_create_event_bt"><?php _e('Or', 'evenium') ?></label>
                <input class="button button-secondary" type="button" id="evenium_create_event_bt" value="<?php _e('Create your event','evenium') ?>" onclick="window.open('https://evenium.net/ng/create-event')">
                <br/>
                <p>
	                <?php _e('You can add <strong>single event ticket shop, agenda or list all of your events</strong> on any post or page of your choice.','evenium') ?><br/>
	                <?php _e('To do so, simply go to any page or post edit page, or create a new one.', 'evenium')?><br/>
                    <?php _e('Then simply click on the "Evenium" button as shown below, and follow simple steps!', 'evenium')?><br/>
                    <img src="<?php echo plugins_url('../img/evenium_btn_ve_example.png', __FILE__) ?>"><br/>
                    <img src="<?php echo plugins_url('../img/evenium_btn_te_example.png', __FILE__) ?>"><br/>
                </p>
                <?php
            }
            else
            {
                //Token not here but parameter set - Never logged or Not logged in
                ?>
                <h3><?php _e('Connect your Evenium account', 'evenium') ?></h3><br/>
                <form id="ev_events_ids" method="post" class="authform" action="option.php">
                    <p class="authform">
                        <label class="authform" for="evenium_login"><?php _e('Login', 'evenium') ?></label>
                        <input class="authform" type="input" id="evenium_login" name="evenium_login" placeholder="Login" value=""/>
                    <p/>
                    <p class="authform">
                        <label class="authform" for="evenium_password"><?php _e('Password', 'evenium') ?></label>
                        <input class="authform" type="password" id="evenium_password" name="evenium_password" placeholder="Password" value=""/>
                    <p/>
                    <input type="button" class="button button-primary" onclick="evenium_connect()" value="<?php _e('Sign in', 'evenium') ?>"><br/>
                </form>
                    <p style="color:#ff0000" id="evenium_login_result"></p>
                    <label for="evenium_create_event_bt"><?php _e('Or', 'evenium') ?></label>
                    <input  class="button button-secondary" type="button" id="evenium_create_event_bt" value="<?php _e('Create your event', 'evenium') ?>" onclick="window.open('https://evenium.net/ng/create-event')">
                <script>
                    jQuery(document).on("keypress", function (e)
                    {
                        if(e.which == 13)
                        {
                            evenium_connect();
                        }
                    });
                </script>
                <?php
            }
        }
	}

	public function register_settings()
	{
		register_setting('evenium_settings', 'evenium_token');
		register_setting('evenium_settings', 'evenium_member_id');
		register_setting('evenium_settings', 'evenium_events_ids');
		register_setting('evenium_settings', 'evenium_events_names');
		register_setting('evenium_settings', 'evenium_events_urls');
	}

	public function evenium_refresh_events()
	{
		$a = get_option('evenium_member_id');
		if(isset($a))
        {
            if ($a != '')
            {
                ?>
                <script>evenium_refresh_events();</script>
                <?php
            }
        }
	}

	public function evenium_enqueue_script()
	{
        wp_enqueue_script('evenium_script');
        wp_localize_script('evenium_script', 'objectL10n', array(
            'wrongCredentials' => __('Wrong credentials, please try again', 'evenium'),
            'noEventMess' => __('There are no current or upcoming events associated with this account', 'evenium'),
            'listEventsLabel' => __('List of all your active or upcoming events', 'evenium'),
            'welcome' => __('Welcome', 'evenium'),
        ));
    }
	public function evenium_register_script()
	{
        wp_register_script('evenium_script', plugins_url('/js/evenium_settings.js', __FILE__));
	}
    public function evenium_add_css()
    {
        ?>
        <style>
            a.event_link{text-decoration: none;}
            a.event_link:hover{color:lightsteelblue;}
            form.authform{display: table;}
            p.authform{display: table-row;}
            label.authform{display:table-cell;}
            input.authform{display:table-cell;}
        </style>
        <?php
    }
}