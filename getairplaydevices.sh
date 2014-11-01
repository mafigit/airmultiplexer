#!/bin/sh
avahi-browse -at | grep 'AirTunes Remote Audio' | perl -ne '/\@(\w*(\s\(\w+\))?)/ && print "$1\n"'
