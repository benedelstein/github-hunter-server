#!/bin/sh
# 1 = repo url
# 2 = temp directory (usually /tmp)
git clone "$1" "$2/emails"
cd "$2/emails"
git log -50 --format="%aE" > temp.txt
sort -u temp.txt > emails.txt # only unique rows
cat emails.txt
rm -rf "$2/emails"