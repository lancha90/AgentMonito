#!/bin/sh
name=backup_$(date +"%m_%d_%Y")
mongodump -d log -o $name
tar -zcvf $(date +"%m_%d_%Y").tar.gz `echo $name`
#tar -zcvf $(date +"%m_%d_%Y").tar.gz $name
