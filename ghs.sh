#!/bin/bash

function print_usage
{
echo Usage:
echo "  ghs.sh user token-file repo [info-type]"
echo Where info-type can be a digit, one of:
echo -e "\t1 - views (default); 2 - clones;"
echo -e "\t3 - popular paths; 4 - referrers"
echo or other string of repo info type.
}

if [ -z "$1" ]
then
echo -n "Get github info via REST API. "
print_usage
exit 0
fi

if [ -z "$2" -o -z "$3" ]
then
echo ghs.sh: error: required arguments are not set
print_usage
exit 255
fi

if [ -z "$4" ]
then
infot=views
else
case "$4" in
1) infot=views;;
v) infot=views;;
2) infot=clones;;
c) infot=clones;;
3) infot=popular/paths;;
p) infot=popular/paths;;
4) infot=popular/referrers;;
r) infot=popular/referrers;;
*) infot=$4;;
esac
fi

if [ -r "$2" ]
then
  if [ ! -s "$2" ]
  then
    echo ghs.sh: warning: token file \`$2\` is empty
  fi
  size="`stat -c%s $2 2> /dev/null`"
  if [ $? -ne 0 ]
  then
    size=`wc -c "$2"`
    if [ $? -eq 0 ]
    then
      size=`echo "$size" | awk '{print $1}'`
    fi
  fi
  if [ $? -eq 0 ] && [ "$size" -gt 8192 ]
  then
    echo ghs.sh: error: token length is too big in file \`$2\` \($size\)
    exit 10
  fi
else
echo ghs.sh: error: token file \`$2\` is not exist or cannot be accessed
exit 10
fi

curl -s -H "Accept: application/vnd.github+json" -H "Authorization: token `cat $2`" https://api.github.com/repos/$1/$3/traffic/$infot