#!/bin/bash

COLOR='\033[0;32m'
publish(){
  declare -a packages=("${!1}")
  for path in "${packages[@]}"
  do
    echo -e "${COLOR} ✨🧙✨ Doing some magic to publish $(basename "$path") $(tput sgr0)"
    cd $path || exit
    npm unpublish --force --silent @boostercloud/$(basename "$path")
    npm publish --registry http://localhost:4873 --no-git-tag-version --canary --non-interactive
    cd ../..
  done
}
STARTTIME=$(date +%s)
lerna run clean
lerna clean -y
lerna bootstrap
lerna run compile
PACKAGES+=(./packages/docker-rocket-types)
PACKAGES+=(./packages/docker-rocket-core)
PACKAGES+=(./packages/docker-rocket-provider-aws-infrastructure)
publish PACKAGES[@]
ENDTIME=$(date +%s)

echo -e "${COLOR} -----------------------"
echo -e "| 🧙 Deploy time: $(($ENDTIME - $STARTTIME)) s |"
echo -e " ----------------------- $(tput sgr0)"