<?php

/*
  -------------------------------------------------------------------------
  Vip plugin for GLPI
  Copyright (C) 2013 by the Vip Development Team.
  -------------------------------------------------------------------------

  LICENSE

  This file is part of Vip.

  Vip is free software; you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation; either version 2 of the License, or
  (at your option) any later version.

  Vip is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with Vip. If not, see <http://www.gnu.org/licenses/>.
  --------------------------------------------------------------------------
 */

include('../../../inc/includes.php');

Html::header_nocache();
Session::checkLoginUser();
header("Content-Type: text/html; charset=UTF-8");

switch ($_POST['action']) {
   case "load":
      foreach (PluginVipTicket::$types as $item) {
          if (isset($_SERVER['HTTP_REFERER'])
               && strpos($_SERVER['HTTP_REFERER'], strtolower($item).".form.php") !== false) {
              $vip_group = new PluginVipGroup();
              $vip = $vip_group->getVipUsers();

              $params                            = [];
              $params['page_limit']              = $CFG_GLPI['dropdown_max'];
              $params['root_doc']                = $CFG_GLPI['root_doc'];
              $params['minimumResultsForSearch'] = $CFG_GLPI['ajax_limit_count'];
              $params['emptyValue']              = Dropdown::EMPTY_VALUE;
              $params['plugin_dir']              = PLUGIN_VIP_WEB_DIR;
              $params['_idor_token']            = Session::getNewIDORToken('User');
            
              echo "<script type='text/javascript'>";
              echo "var viptest = $(document).initVipPlugin(".json_encode($params).");";
              echo "viptest.changeRequesterColor(".json_encode($vip).");";
              echo "</script>";
          }
      }
      break;
}
