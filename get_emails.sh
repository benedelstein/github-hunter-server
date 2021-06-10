#!/bin/sh
# 1 = repo url
# 2 = temp directory
git clone "$1" "$2/emails"
cd "$2/emails"
git log --format="%aE" > temp.txt
sort -u temp.txt > emails.txt
cat emails.txt
rm -rf "$2/emails"