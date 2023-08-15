#!/bin/bash

SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE" # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done
DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"

if [[ "$1" == "help" || "$1" == "-h" || "$1" == "--help" ]]; then
  echo "$0 help  --> display this page" 
  echo "$0 clean --> run the site but clean the build first" 
  echo "$0 slow  --> avoid incremental builds // rebuild is slower" 
  echo "$0       --> just run the site in default incremental mode" 
  exit 0
fi

if [[ "$1" == "clean" ]]; then
  (cd $DIR/.. && rm -rf ./_site .jekyll-metadata) 
fi

flags="--incremental" #normal mode
if [[ "$1" == "slow" ]]; then
  flags="--watch"  
fi

echo "flags == ${flags}"
(cd $DIR/.. && bundle exec jekyll serve --port 4444 --livereload --livereload-port 40044 ${flags})
