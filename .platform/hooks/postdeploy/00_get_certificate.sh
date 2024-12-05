#!/usr/bin/env bash
# Place in .platform/hooks/postdeploy directory
sudo certbot -n -d turtle-shell.us-east-1.elasticbeanstalk.com/ --nginx --agree-tos --email loni2020@byu.edu
sudo certbot -n -d tsp26.is404.net/ --nginx --agree-tos --email loni2020@byu.edu
