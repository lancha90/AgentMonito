export ORACLE_BASE=/data/app/oracle
export ORACLE_HOME=$ORACLE_BASE/product/11.2.0/dbtagtrig
export ORACLE_SID=neodllo

STARTTIME=`date +"%s.%N"`

RESPONSE=`/data/app/oracle/product/11.2.0/dbtagtrig/bin/sqlplus -silent TAGTRIGGERADMON/TAGTRIGGERADMON@"(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=192.168.0.174)(PORT=1521))(CONNECT_DATA=(SID=neodllo)))" <<EOF
SET PAGESIZE 0 FEEDBACK OFF VERIFY OFF HEADING OFF ECHO OFF
SELECT * FROM DUAL;
EXIT;
EOF`

ENDTIME=`date +"%s.%N"`

TIME=`echo "$ENDTIME - $STARTTIME" | bc | awk -F"." '{print $1"."substr($2,1,3)}'`

if [ "$RESPONSE" == "X" ]; then
	echo "$RESPONSE $TIME"
else
	echo "Y $TIME"
fi
