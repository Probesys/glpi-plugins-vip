<?php
/*
 -------------------------------------------------------------------------
 Vip plugin for GLPI
 Copyright (C) 2014 by the Vip Development Team.
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
 --------------------------------------------------------------------------  */

include("../../../inc/includes.php");

Session::checkRight("plugin_vip", UPDATE);

$grp = new PluginVipGroup();

if (isset($_POST['update_vip_group'])) {
    $grp->update($_POST);
    Html::back();
}
