<?php
/*
 * Plugin : Evenium for Wordpress
 * Author : Eyal Hadida
*/
class Evenium_Popup
{
    public function __construct()
	{
        add_action('admin_enqueue_scripts', array($this, 'register_scripts_styles'));
        add_action('admin_print_scripts', array($this, 'add_evenium_scripts'));
        add_action('admin_print_footer_scripts', array($this, 'add_evenium_quicktags'),55);
        add_action('admin_footer', array($this, 'add_evenium_popup'), 10);
        add_action('admin_head', array($this, 'evenium_add_tc_button'));
    }

    public function add_evenium_quicktags()
    {
        global $pagenow;
        if(($pagenow == 'post.php'||$pagenow=='post-new.php'))
        {
            echo "\n\n";
            ?>
            <script type="text/javascript">
                var tokenus = '<?php echo get_option('evenium_token');?>';
                var tid = setInterval(function ()
                {
                    if (document.readyState !== 'complete') return;
                    clearInterval(tid);
                    var tempStr = '<a class="eveniumBtn" onclick="popup_refresh_events(tokenus);retrieve_entities(tokenus);" href="#openModal"><img src="<?php echo plugins_url('../img/evenium_icon.png', __FILE__) ?>" /><span style="vertical-align:top;">Evenium</span></a>';
                    document.getElementById("ed_toolbar").innerHTML = document.getElementById("ed_toolbar").innerHTML + tempStr;
                    edButtons[edButtons.length + 1] = new QTags.Button();
                }, 100);
            </script>
            <?php
		}
	}

    public function add_evenium_popup()
    {
        global $pagenow;
        $tokenus = get_option('evenium_token');
        if(($pagenow == 'post.php'|| $pagenow=='post-new.php'))
        {
            ?>
            <script>
                var tokenus = '<?php echo get_option('evenium_token');?>';
            </script>
            <div><a id="evenium_te_btn" class="eveniumBtn" onclick="popup_refresh_events(tokenus);retrieve_entities(tokenus);" href="#openModal"></a></div>
            <div id="openModal" class="modalDialog">
                <div id="modalSubDiv">
                    <a id="evenium_popup_close" href="#close" title="Close" class="close">X</a>
                    <?php
                    if(isset($tokenus) && $tokenus != '')
                    {
                    ?>
                        <h2 class="popupText" id="insertTitle"><?php _e('Insert', 'evenium')?></h2>
                        <div id="evenium_action_choice">
                            <form action="">
                                <input type="radio" name="evenium_insert_action" value="registration"><label onclick="jQuery(this).prev().click()" class="radioText"><?php _e('Registration', 'evenium') ?></label><br>
                                <input type="radio" name="evenium_insert_action" value="agenda"><label onclick="jQuery(this).prev().click()" class="radioText"><?php _e('Agenda', 'evenium') ?></label><br>
                                <input type="radio" name="evenium_insert_action" value="listofevents" ><label onclick="jQuery(this).prev().click()" class="radioText"><?php _e('List of events', 'evenium') ?></label>
                            </form>
                        </div>
                        <div id="evenium_event_choice" style="display:none;">
                            <p class="popupText"><?php _e('for Event :', 'evenium')?></p>
                            <div style="font-style: italic; color:#ff0000; display: block" id="draft_error"></div>
                            <form action="" id="evenium_events_list" class="evenium_events_list"></form>
                        </div>
                        <div id="evenium_entity_choice" style="display:none;">
                            <p class="popupText"><?php _e('from :', 'evenium')?></p>
                            <form action="" id="evenium_entities_list" class="evenium_entities_list"></form>
                        </div><br>
                        <input type="button" class="button button-primary button-large" id="insertQt" value="<?php _e('Insert', 'evenium')?>" onclick="insert_quicktag();">
                    <?php
                    }
                    else
                    {
                        ?>
                        <div>
                            <h2 style="margin-bottom: 30px; font-weight: bold; text-align: center; color: #69AADE; font-family:'Open Sans', sans-serif;"><?php _e('Please login first','evenium') ?></h2>
                            <p style="text-align: justify;font-family: 'Open Sans', sans-serif;">
                                <?php $noTokenMess = sprintf(wp_kses(__('You need to <a class="popupLink" href="%s">login to your Evenium account here</a> before adding events to your page or posts.
                                <br> Look for the Evenium Plugin option in the admin sidebar.', 'evenium'), array('a' => array('href' => array()))), menu_page_url('evenium',0));
                                echo $noTokenMess;
                                ?>
                            </p>
                        </div>
                        <?php
                    }
                    ?>
                </div>
            </div>
            <?php
        }
    }

    public function add_evenium_scripts()
    {
        global $pagenow;
        if($pagenow == 'post.php'|| $pagenow=='post-new.php')
        {
            wp_enqueue_script('evenium_popup_script');
            wp_enqueue_script('evenium_script');
            wp_localize_script('evenium_script', 'objectL10n', array(
                'draft' => __('Draft', 'evenium'),
                'draft_error' => __('You need to open the registration for the event first', 'evenium'),
            ));
        }
    }

    public function register_scripts_styles()
    {
        global $pagenow;
        if($pagenow == 'post.php'|| $pagenow=='post-new.php')
        {
            wp_register_script('evenium_popup_script', plugins_url('/js/' . $GLOBALS['evenium_version'] . '/evenium_popup.js', __FILE__));
            wp_register_style('evenium_popup_style', plugins_url('/css/' . $GLOBALS['evenium_version'] . '/evenium_popup.css', __FILE__));
            wp_enqueue_style('evenium_popup_style');
        }
    }

    public function evenium_add_tc_button()
    {
        global $typenow;
        if (!current_user_can('edit_posts') && !current_user_can('edit_pages'))
        {
            return;
        }
        if( ! in_array($typenow, array( 'post', 'page' ) ) )
            return;
        //Check if WYSIWYG is enabled
        if ( get_user_option('rich_editing') == 'true')
        {
            add_filter('mce_external_plugins', array($this,"evenium_add_tinymce_plugin"));
            add_filter('mce_buttons', array($this,'evenium_register_tc_button'));
        }
    }

    public function evenium_add_tinymce_plugin($plugin_array)
    {
        $plugin_array['evenium'] = plugins_url('/js/' . $GLOBALS['evenium_version'] . '/evenium_popup.js', __FILE__);
        return $plugin_array;
    }

    public function evenium_register_tc_button($buttons)
    {
        array_push($buttons, "evenium_tc_button");
        return $buttons;
    }
}