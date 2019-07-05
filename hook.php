<?php

function plugin_vip_install() {
   global $DB;
   // Création de la table uniquement lors de la première installation
   if (!$DB->tableExists("glpi_plugin_vip_groups")) {
      $DB->runFile(GLPI_ROOT . "/plugins/vip/install/sql/empty-1.1.2.sql");
   }

   if ($DB->tableExists('glpi_plugin_vip_tickets')) {
      $tables = array("glpi_plugin_vip_tickets");

      foreach ($tables as $table) {
         $DB->query("DROP TABLE IF EXISTS `$table`;");
      }
   }
   include_once(GLPI_ROOT."/plugins/vip/inc/profile.class.php");
   PluginVipProfile::initProfile();
   PluginVipProfile::createFirstAccess($_SESSION['glpiactiveprofile']['id']);

   return true;
}

function plugin_vip_uninstall() {
   global $DB;

   $tables = ["glpi_plugin_vip_profiles", 
                   "glpi_plugin_vip_groups", 
                   "glpi_plugin_vip_tickets"];

   foreach ($tables as $table) {
      $DB->query("DROP TABLE IF EXISTS `$table`;");
   }
   return true;
}

function plugin_vip_getPluginsDatabaseRelations() {

   $plugin = new Plugin();
   if ($plugin->isActivated("vip"))
      return array(
         "glpi_groups"   => array("glpi_plugin_vip_groups"   => "id")
      );
   else
      return array();
}

function plugin_vip_getAddSearchOptions($itemtype) {
   
   $options = [];
   
   if ($_SESSION['glpiactiveprofile']['interface'] == 'central' 
         && Session::haveRight('plugin_vip', READ)) {
      switch ($itemtype) {
          
         case 'Ticket':
             $options[] = [
                'id'            => 10100,
                'name'          => 'VIP',
                'table'         => 'glpi_plugin_vip_groups',             
                'field'         => 'isvip',              
                'massiveaction' => false,
                'datatype' => 'bool'
            ];
            
            
            break;
         case 'Group':
             $options[] = [
              'id'            => 150,
              'name'          => 'VIP',                        
              'table'         => 'glpi_plugin_vip_groups',             
              'field'         => 'isvip',              
              'massiveaction' => false,
              'datatype' => 'bool'
            ]; 
            
            break;
      }
   }
   
   return $options;
}

function plugin_vip_MassiveActions($type) {	
   if ($type == 'Group') {
      $vip = new PluginVipGroup();
      return $vip->massiveActions();
   }
   return array();
}

function plugin_vip_addLeftJoin($type,$ref_table,$new_table,$linkfield,&$already_link_tables) {
   if ($ref_table == 'glpi_tickets') {
      switch ($new_table) {
         case "glpi_plugin_vip_groups" :
            $out = " LEFT JOIN `glpi_tickets_users` ON (`glpi_tickets`.`id` = `glpi_tickets_users`.`tickets_id` AND `glpi_tickets_users`.`type` = ".CommonITILActor::REQUESTER.") ";
            $out .= " LEFT JOIN `glpi_groups_users` ON (`glpi_tickets_users`.`users_id` = `glpi_groups_users`.`users_id`)";
            $out .= " LEFT JOIN `glpi_plugin_vip_groups` ON (`glpi_groups_users`.`groups_id` = `glpi_plugin_vip_groups`.`id`)";

            return $out;            
      }
   }
   if ($ref_table == 'glpi_groups') {
       switch ($new_table) {
         case "glpi_plugin_vip_groups" :
            $out = " LEFT JOIN `glpi_plugin_vip_groups` ON (`glpi_groups`.`id` = `glpi_plugin_vip_groups`.`id`)"; 
            return $out;
      } 
   }

   return "";
}

function plugin_vip_giveItem($type, $ID, $data, $num) {
   global $CFG_GLPI, $DB;

   $searchopt = &Search::getOptions($type);
   $table     = $searchopt[$ID]["table"];
   $field     = $searchopt[$ID]["field"];

   switch ($type) {
      case 'Ticket':
         switch ($table.'.'.$field) {
            case "glpi_plugin_vip_groups.isvip" :
               //if (PluginVipTicket::isTicketVip($data[0][0]['name'])) {
               if (PluginVipTicket::isTicketVip($data['id'])) {    
                  return "<img src=\"".$CFG_GLPI['root_doc']."/plugins/vip/pics/vip.png\" alt='vip' >";
               }
               break;
         }
         break;
      case 'Group':
         switch ($table.'.'.$field) {
            case "glpi_plugin_vip_groups.isvip" :
               if ($data[$num][0]['name']) {
                  return "<img src=\"".$CFG_GLPI['root_doc']."/plugins/vip/pics/vip.png\" alt='vip' >";
               }
               break;
         }
         break;
   }

   return " ";
}

