<?php
/*
 -------------------------------------------------------------------------
 VIP plugin for GLPI
 Copyright (C) 2014 by the VIP Development Team.
 -------------------------------------------------------------------------

 LICENSE

 This file is part of VIP.

 VIP is free software; you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation; either version 2 of the License, or
 (at your option) any later version.

 VIP is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with VIP. If not, see <http://www.gnu.org/licenses/>.
 --------------------------------------------------------------------------  */

define('GLPI_ROOT', '../../..');

include (GLPI_ROOT."/inc/includes.php");

Session::checkLoginUser();
//Html::header_nocache();

switch($_POST['action']){
   case 'getTicket':
      header('Content-Type: application/json; charset=UTF-8"');
      
      $params = array('entities_id' => $_SESSION['glpiactiveentities'], 
                      'used'        => array());
      
      if (isset($_POST['items_id'])) {
         $ticket = new Ticket();
         $actor  = new Ticket_User();
         $ticket->getFromDB($_POST['items_id']);
         $actors = $actor->getActors($_POST['items_id']);

         $used = array();
         if (isset($actors[CommonITILActor::REQUESTER])) {
            foreach ($actors[CommonITILActor::REQUESTER] as $requesters) {
               $used[] = $requesters['users_id'];
            }
         }

         $params = array('used'        => $used,
                         'entities_id' => $ticket->fields['entities_id']);
      }

      echo json_encode($params);
}
