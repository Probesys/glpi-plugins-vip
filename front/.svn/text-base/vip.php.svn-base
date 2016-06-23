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

include ("../../../inc/includes.php");

if ($_SESSION["glpiactiveprofile"]["interface"] == "central") {
   Html::header("TITRE", $_SERVER['PHP_SELF'], "plugins", "vip", "optionname");
} else {
   Html::helpHeader("TITRE", $_SERVER['PHP_SELF']);
}
$pluginvip = new PluginVipTicket();

$test = $pluginvip->find();
sort($test);
Search::show('PluginVipTicket');

Html::footer();
?>
