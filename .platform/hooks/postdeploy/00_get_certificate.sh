#!/usr/bin/env bash
# Place in .platform/hooks/postdeploy directory
sudo certbot -n -d 26turtle.us-east-1.elasticbeanstalk.com --nginx --agree-tos --email loni2020@byu.edu
sudo certbot -n -d turtleproject-group2-6.is404.net --nginx --agree-tos --email loni2020@byu.edu
