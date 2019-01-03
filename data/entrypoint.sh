#!/bin/bash

if [ -n "$authorized_keys" ] && [ ! -f /root/.ssh/authorized_keys ]; then mkdir /root/.ssh;  printenv authorized_keys > /root/.ssh/authorized_keys; chmod 600 /root/.ssh/authorized_keys; fi
if [ -n "$password" ] && passwd --status | grep -q 'L'; then echo "root:$password" | chpasswd ; fi
unset authorized_keys
unset password
if [ -s /root/.pm2/dump.pm2 ]; then pm2 resurrect; fi
/usr/sbin/sshd -D
