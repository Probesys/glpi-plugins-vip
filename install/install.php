<?php

/*
  -------------------------------------------------------------------------
  vip plugin for GLPI
  Copyright (C) 2003-2012 by the vip Development Team.

  https://forge.indepnet.net/projects/vip
  -------------------------------------------------------------------------

  LICENSE

  This file is part of vip.

  vip is free software; you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation; either version 2 of the License, or
  (at your option) any later version.

  vip is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with vip. If not, see <http://www.gnu.org/licenses/>.
  --------------------------------------------------------------------------
 */

/**
 * Install
 *
 * @return bool for success (will die for most error)
 * */
function install()
{
    global $DB;

    $migration = new Migration(100);

    // Install script
    $DB->runFile(PLUGIN_VIP_DIR."/install/sql/empty-1.0.0.sql");

    $query = "INSERT INTO glpi_plugin_vip_tickets
                        SELECT id, '0'
                            FROM glpi_tickets
                  ON DUPLICATE KEY
                                UPDATE isvip = '0'";

    $DB->query($query) or die("Error inserting ticket in vip Tickets table");

    $migration->executeMigration();

    return true;
}
