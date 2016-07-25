export ORACLE_BASE=/data/app/oracle
export ORACLE_HOME=$ORACLE_BASE/product/11.2.0/dbtagtrig
export ORACLE_SID=neodllo

TRANSACTION=`/data/app/oracle/product/11.2.0/dbtagtrig/bin/sqlplus -silent system/ingesysneo12@"(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=192.168.0.174)(PORT=1521))(CONNECT_DATA=(SID=neodllo)))" <<EOF
SET PAGESIZE 0 FEEDBACK OFF VERIFY OFF HEADING OFF ECHO OFF
SELECT COUNT(1) NUM, STATUS
FROM V\\$TRANSACTION
GROUP BY STATUS
ORDER BY STATUS;
EXIT;
EOF`

CONTROL=`/data/app/oracle/product/11.2.0/dbtagtrig/bin/sqlplus -silent system/ingesysneo12@"(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=192.168.0.174)(PORT=1521))(CONNECT_DATA=(SID=neodllo)))" <<EOF
SET PAGESIZE 0 FEEDBACK OFF VERIFY OFF HEADING OFF ECHO OFF
SELECT VALUE FROM V\\$PARAMETER
WHERE NAME = 'transactions';
EXIT;
EOF`

echo "$TRANSACTION $CONTROL"
