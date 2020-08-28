<?php

// Version of the plugin
define('PLUGIN_VIP_VERSION', "1.4.0");
// Minimal GLPI version, inclusive
define ("PLUGIN_VIP_GLPI_MIN_VERSION", "9.4");
// Maximum GLPI version, exclusive
define ("PLUGIN_VIP_GLPI_MAX_VERSION", "9.6");
if (!defined("PLUGIN_VIP_DIR")) {
   define("PLUGIN_VIP_DIR", Plugin::getPhpDir("vip"));
}
if (!defined("PLUGIN_VIP_WEB_DIR")) {
   define("PLUGIN_VIP_WEB_DIR", Plugin::getWebDir("vip"));
}

function plugin_version_vip() {

   return array('name'           => "VIP",
                'version'        => PLUGIN_VIP_VERSION,
                'author'         => '<a href="http://www.probesys.com">PROBESYS</a>',
                'license'        => 'GPLv3+',
                'homepage'       => 'https://github.com/Probesys/glpi-plugins-vip',
                'minGlpiVersion' => PLUGIN_VIP_GLPI_MIN_VERSION); 
}

function plugin_vip_check_prerequisites() {

   $success = true;
    if (version_compare(GLPI_VERSION, PLUGIN_VIP_GLPI_MIN_VERSION, 'lt')) {
       echo 'This plugin requires GLPI >= ' . PLUGIN_VIP_GLPI_MIN_VERSION . '<br>';
       $success = false;
    }
    return $success;
}

// Uninstall process for plugin : need to return true if succeeded
//may display messages or add to message after redirect
function plugin_vip_check_config() {
   return true;
}

function plugin_init_vip() {

   global $PLUGIN_HOOKS;

   $PLUGIN_HOOKS['csrf_compliant']['vip'] = true;

   Plugin::registerClass('PluginVipProfile', array('addtabon' => array('Profile')));
   $PLUGIN_HOOKS['change_profile']['vip'] = array('PluginVipProfile', 'changeProfile');

   if (Session::haveRight('plugin_vip', UPDATE)) {
      Plugin::registerClass('PluginVipGroup', array('addtabon' => array('Group')));
      $PLUGIN_HOOKS['use_massive_action']['vip'] = 1;
      Plugin::registerClass('PluginVipTicket');
   }

   if (Session::haveRight('plugin_vip', READ)) {
      $PLUGIN_HOOKS['add_javascript']['vip'][] = 'vip.js';

      if (class_exists('PluginVipTicket')) {
         foreach (PluginVipTicket::$types as $item) {
            if (isset($_SERVER['REQUEST_URI']) && strpos($_SERVER['REQUEST_URI'], strtolower($item).".form.php") !== false) {
               $PLUGIN_HOOKS['add_javascript']['vip'][] = 'vip_load_scripts.js';
            }
         }
      }
   }
}

