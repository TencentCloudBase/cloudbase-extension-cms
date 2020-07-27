#!/bin/bash
FUNCTION_NAME='tcb-ext-cms-'$1
echo 'zip '$FUNCTION_NAME 
cd packages/${FUNCTION_NAME}
DEST_FILE=../../build/${FUNCTION_NAME}.zip 
rm -rf $DEST_FILE
zip -r $DEST_FILE .  -x 'node_modules/*' -x '.DS_Store'
# zip -r $DEST_FILE .  -x '.DS_Store'