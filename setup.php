<?php

function plugin_version_vip() {

   return array('name'           => "VIP",
                'version'        => '1.2.0',
                'author'         => 'Probesys',
                'license'        => 'GPLv3+',
                'homepage'       => 'http://www.probesys.com',
                'minGlpiVersion' => '0.90'); // For compatibility / no install in version < 0.85
}

function plugin_vip_check_prerequisites() {

   if (version_compare(GLPI_VERSION, '0.90', 'lt')) {
      echo "This plugin requires GLPI >= 0.90";
      return false;
   }
   return true;
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

?>
